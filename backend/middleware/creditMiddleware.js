const pool = require('../config/db');

const checkAICredits = async (req, res, next) => {
    // Some routes might use req.user.id, others might pass userId in body.
    let userId = req.user?.id || req.body?.userId;
    
    if (!userId) {
        // If we can't determine the user, we can either block or let it pass.
        // It's safer to block since AI generation costs money.
        return res.status(401).json({ error: 'Unauthorized: User ID is required for AI generation.' });
    }

    try {
        const userRes = await pool.query('SELECT ai_credits, last_credit_reset FROM users WHERE id = $1', [userId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        let ai_credits = userRes.rows[0].ai_credits;
        if (ai_credits == null) ai_credits = 20; // Default if null
        
        let last_credit_reset = userRes.rows[0].last_credit_reset;
        if (!last_credit_reset) last_credit_reset = new Date();
        
        const now = new Date();
        const resetTime = new Date(last_credit_reset);
        const hoursPassed = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);

        // Every 4 hours they get a free reset back to 20 credits maximum
        if (hoursPassed >= 4 && ai_credits < 20) {
            // Give them 20 max
            await pool.query('UPDATE users SET ai_credits = 20, last_credit_reset = CURRENT_TIMESTAMP WHERE id = $1', [userId]);
            ai_credits = 20;
        } 

        if (ai_credits <= 0) {
            const nextResetTime = new Date(resetTime.getTime() + 4 * 60 * 60 * 1000);
            const msRemaining = nextResetTime.getTime() - now.getTime();
            const hoursRemaining = Math.max(0, Math.floor(msRemaining / (1000 * 60 * 60)));
            const minutesRemaining = Math.max(0, Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60)));
            
            return res.status(429).json({ 
                error: 'Out of credits', 
                message: `You are out of AI Credits! Please wait ${hoursRemaining}h ${minutesRemaining}m for your free refill, or exchange your XP for more credits in the Rewards Store.` 
            });
        }

        // Deduct 1 credit
        await pool.query('UPDATE users SET ai_credits = ai_credits - 1 WHERE id = $1', [userId]);
        req.ai_credits = ai_credits - 1; // pass down to route
        
        next();
    } catch (err) {
        console.error('Credit check error:', err);
        return res.status(500).json({ error: 'Failed to verify AI credits' });
    }
};

module.exports = { checkAICredits };
