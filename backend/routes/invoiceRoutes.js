const express = require('express');
const pool = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const crypto = require('crypto');
const { sendPaymentLinkEmail } = require('../utils/email');

const adminRouter = express.Router();
const publicRouter = express.Router();

// Generate a random 6-character string for invoice codes
const generateCode = () => crypto.randomBytes(3).toString('hex');

// ================= ADMIN ROUTER =================

// GET /api/admin/invoices
adminRouter.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM invoices ORDER BY created_at DESC');
        res.json({ success: true, invoices: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/admin/invoices
adminRouter.post('/', async (req, res) => {
    const client = await pool.connect();
    try {
        const { customerId, courseIds, notes } = req.body;
        
        await client.query('BEGIN');
        
        // 1. Get customer
        const custRes = await client.query('SELECT * FROM customers WHERE id = $1', [customerId]);
        if (custRes.rows.length === 0) throw new Error('Customer not found');
        const customer = custRes.rows[0];
        
        // 2. Get courses
        const courseRes = await client.query('SELECT * FROM courses WHERE id = ANY($1::int[])', [courseIds]);
        const courses = courseRes.rows;
        if (courses.length !== courseIds.length) throw new Error('Some courses not found');
        
        // 3. Calculate total
        const totalAmount = courses.reduce((sum, c) => sum + parseFloat(c.price), 0);
        
        // 4. Create Invoice
        const invoiceCode = generateCode();
        const invRes = await client.query(`
            INSERT INTO invoices (
                invoice_code, customer_id, customer_name, customer_email, 
                customer_phone, total_amount, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
        `, [
            invoiceCode, customer.id, customer.full_name, customer.email,
            customer.phone, totalAmount, notes, req.user.id
        ]);
        const invoice = invRes.rows[0];
        
        // 5. Create Invoice Items
        for (const course of courses) {
            await client.query(`
                INSERT INTO invoice_items (invoice_id, course_id, course_title, price)
                VALUES ($1, $2, $3, $4)
            `, [invoice.id, course.id, course.title, course.price]);
        }
        
        await client.query('COMMIT');
        
        // Optional: send email here if we want
        if (customer.email) {
            await sendPaymentLinkEmail(customer.email, customer.full_name, invoice.invoice_code, invoice.total_amount).catch(console.error);
        }
        
        res.status(201).json({ success: true, invoice });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: err.message || 'Server error' });
    } finally {
        client.release();
    }
});

// PUT /api/admin/invoices/:id/confirm
adminRouter.put('/:id/confirm', async (req, res) => {
    try {
        const result = await pool.query(`
            UPDATE invoices 
            SET payment_status = 'paid', payment_method = 'bank_transfer', paid_at = NOW() 
            WHERE id = $1 AND payment_status = 'pending' 
            RETURNING *
        `, [req.params.id]);
        res.json({ success: true, invoice: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/admin/invoices/:id/cancel
adminRouter.put('/:id/cancel', async (req, res) => {
    try {
        const result = await pool.query(`
            UPDATE invoices 
            SET payment_status = 'cancelled' 
            WHERE id = $1 AND payment_status = 'pending' 
            RETURNING *
        `, [req.params.id]);
        res.json({ success: true, invoice: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/admin/invoices/:id
adminRouter.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM invoices WHERE id = $1', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ================= PUBLIC ROUTER =================

// GET /api/pay/:code
publicRouter.get('/:code', async (req, res) => {
    try {
        const result = await pool.query('SELECT invoice_code, total_amount, payment_status FROM invoices WHERE invoice_code = $1', [req.params.code]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
        res.json({ success: true, invoice: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/pay/:code/stripe
publicRouter.post('/:code/stripe', async (req, res) => {
    try {
        if (!process.env.STRIPE_SECRET_KEY) {
             return res.status(500).json({ error: 'Stripe is not configured on the server.' });
        }
        const invRes = await pool.query('SELECT * FROM invoices WHERE invoice_code = $1', [req.params.code]);
        if (invRes.rows.length === 0) return res.status(404).json({ error: 'Invoice not found' });
        
        const invoice = invRes.rows[0];
        if (invoice.payment_status !== 'pending') return res.status(400).json({ error: 'Invoice already paid or cancelled' });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: 'FindStreak Courses',
                            description: `Invoice ${invoice.invoice_code}`
                        },
                        unit_amount: Math.round(invoice.total_amount * 100), // Stripe expects cents
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${invoice.invoice_code}/success`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${invoice.invoice_code}`,
            client_reference_id: invoice.invoice_code,
            customer_email: invoice.customer_email || undefined,
        });

        await pool.query('UPDATE invoices SET stripe_session_id = $1 WHERE id = $2', [session.id, invoice.id]);

        res.json({ success: true, url: session.url });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// We need a separate raw body parser for the webhook, which will be handled in server.js
// Export the webhook handler function to be used there
const stripeWebhookHandler = async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    
    let event;
    
    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("Stripe webhook secret not configured");
        }
        event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error('Webhook Error:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const invoiceCode = session.client_reference_id;
        
        if (invoiceCode) {
            await pool.query(`
                UPDATE invoices 
                SET payment_status = 'paid', payment_method = 'stripe', paid_at = NOW() 
                WHERE invoice_code = $1
            `, [invoiceCode]);
            console.log(`Invoice ${invoiceCode} marked as paid via Stripe.`);
        }
    }
    
    res.json({ received: true });
};

module.exports = { adminRouter, publicRouter, stripeWebhookHandler };
