const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Ensure missions table exists
const ensureMissionsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS missions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(50) NOT NULL,
        xp_reward INTEGER NOT NULL DEFAULT 100,
        difficulty VARCHAR(20) NOT NULL DEFAULT 'Easy',
        estimated_time VARCHAR(50),
        steps JSONB DEFAULT '[]',
        ai_powered BOOLEAN DEFAULT FALSE,
        icon VARCHAR(50),
        role VARCHAR(100),
        action_route VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_missions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        mission_id INTEGER REFERENCES missions(id) ON DELETE CASCADE,
        status VARCHAR(20) DEFAULT 'available',
        progress INTEGER DEFAULT 0,
        xp_earned INTEGER DEFAULT 0,
        started_at TIMESTAMP WITH TIME ZONE,
        completed_at TIMESTAMP WITH TIME ZONE,
        UNIQUE(user_id, mission_id)
      );

      CREATE TABLE IF NOT EXISTS rewards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        xp_cost INTEGER NOT NULL,
        reward_type VARCHAR(50) NOT NULL,
        available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_rewards (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reward_id INTEGER REFERENCES rewards(id) ON DELETE CASCADE,
        redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (e) {
    console.error('Error creating missions tables:', e.message);
  }
};

ensureMissionsTable();

// Seed missions with AI if empty
const seedMissionsWithAI = async (role) => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM missions WHERE role = $1', [role]);
    if (parseInt(countResult.rows[0].count) > 0) return;

    console.log(`Seeding missions for role: ${role}`);
    
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career gamification expert. Create engaging, achievable missions for learners pursuing tech careers. Each mission should be specific, actionable, and help users build real skills.'
          },
          {
            role: 'user',
            content: `Search the web and create 10 personalized learning missions for someone pursuing a career as a "${role}". 
            
            Include a MIX of:
            - 3 Learning missions (completing courses, tutorials, roadmaps)
            - 3 Project missions (building real projects, portfolios)
            - 2 Skill missions (resume building, role analysis, interview prep)
            - 2 Community missions (streaks, sharing, helping others)
            
            Each mission should have REAL, current steps relevant to 2024/2025 tools and frameworks.
            
            Return ONLY a valid JSON array:
            [{
              "title": "Mission title",
              "description": "2-3 sentences describing the mission and why it matters for career growth",
              "category": "learning/project/skill/community",
              "xp_reward": 100-2000 (based on difficulty),
              "difficulty": "Easy/Medium/Hard/Epic",
              "estimated_time": "e.g. 30 min / 2 hours / 1 week",
              "steps": ["Step 1 (specific action)", "Step 2", "Step 3", "Step 4"],
              "ai_powered": true/false,
              "icon": "roadmap/project/resume/resources/analysis/streak/course/fullstack/interview/community",
              "action_route": "/roadmap or /dashboard or /resources or /profile or /onboarding"
            }]`
          }
        ],
        temperature: 0.8
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : '[]';
    const missions = JSON.parse(jsonStr);

    for (const m of missions) {
      await pool.query(`
        INSERT INTO missions (title, description, category, xp_reward, difficulty, estimated_time, steps, ai_powered, icon, role, action_route)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [m.title, m.description, m.category, m.xp_reward, m.difficulty, m.estimated_time, JSON.stringify(m.steps), m.ai_powered, m.icon, role, m.action_route]);
    }

    console.log(`Seeded ${missions.length} missions for ${role}`);
  } catch (e) {
    console.error('Error seeding missions:', e);
  }
};

// Seed rewards if empty
const seedRewards = async () => {
  try {
    const countResult = await pool.query('SELECT COUNT(*) FROM rewards');
    if (parseInt(countResult.rows[0].count) > 0) return;

    const defaultRewards = [
      { title: 'Completion Certificate', description: 'Get a personalized PDF certificate for completing your learning path. Share on LinkedIn and boost your profile.', xp_cost: 500, reward_type: 'certification' },
      { title: '50% Off Udemy Coupon', description: 'Redeem a promo code for 50% off any Udemy course of your choice. Learn from top instructors.', xp_cost: 1000, reward_type: 'promocode' },
      { title: 'Pro Learner Badge', description: 'Unlock the exclusive Pro Learner badge on your profile. Show the world your dedication!', xp_cost: 300, reward_type: 'badge' },
      { title: 'AI Resume Review', description: 'Get an in-depth AI-powered review of your resume with actionable feedback and improvement suggestions.', xp_cost: 200, reward_type: 'feature' },
      { title: 'Coursera Plus Trial', description: 'Earn a 7-day Coursera Plus trial to access thousands of professional courses for free.', xp_cost: 2000, reward_type: 'promocode' },
      { title: 'Career Mastery Certificate', description: 'The ultimate achievement. Complete all missions to earn this prestigious career mastery certificate.', xp_cost: 5000, reward_type: 'certification' }
    ];

    for (const r of defaultRewards) {
      await pool.query(
        'INSERT INTO rewards (title, description, xp_cost, reward_type) VALUES ($1, $2, $3, $4)',
        [r.title, r.description, r.xp_cost, r.reward_type]
      );
    }
    console.log('Seeded default rewards');
  } catch (e) {
    console.error('Error seeding rewards:', e.message);
  }
};

seedRewards();

// GET /api/missions - Get all missions for a role (with auto AI seed)
router.get('/', async (req, res) => {
  const { role, userId } = req.query;

  try {
    await seedMissionsWithAI(role || 'Software Engineer');

    // Get all missions for this role
    const missionsResult = await pool.query(
      'SELECT * FROM missions WHERE role = $1 ORDER BY difficulty, xp_reward',
      [role || 'Software Engineer']
    );

    // Get user's mission progress
    let userProgress = [];
    if (userId) {
      const progressResult = await pool.query(
        'SELECT * FROM user_missions WHERE user_id = $1',
        [userId]
      );
      userProgress = progressResult.rows;
    }

    // Merge mission data with user progress
    const missions = missionsResult.rows.map(m => {
      const progress = userProgress.find(p => p.mission_id === m.id);
      return {
        ...m,
        steps: typeof m.steps === 'string' ? JSON.parse(m.steps) : m.steps,
        status: progress?.status || 'available',
        progress: progress?.progress || 0,
        xp_earned: progress?.xp_earned || 0
      };
    });

    // Get user XP total
    let totalXp = 0;
    if (userId) {
      const xpResult = await pool.query(
        'SELECT COALESCE(SUM(xp_earned), 0) as total_xp FROM user_missions WHERE user_id = $1 AND status = $2',
        [userId, 'completed']
      );
      totalXp = parseInt(xpResult.rows[0].total_xp);
    }

    res.json({ 
      success: true, 
      missions, 
      totalXp,
      completedCount: missions.filter(m => m.status === 'completed').length,
      totalCount: missions.length
    });
  } catch (e) {
    console.error('Error fetching missions:', e);
    res.status(500).json({ error: 'Failed to fetch missions' });
  }
});

// GET /api/missions/rewards - Get all available rewards
router.get('/rewards', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rewards WHERE available = true ORDER BY xp_cost');
    res.json({ success: true, rewards: result.rows });
  } catch (e) {
    console.error('Error fetching rewards:', e);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

// POST /api/missions/start - Start a mission
router.post('/start', async (req, res) => {
  const { userId, missionId } = req.body;
  
  try {
    await pool.query(`
      INSERT INTO user_missions (user_id, mission_id, status, started_at)
      VALUES ($1, $2, 'in_progress', NOW())
      ON CONFLICT (user_id, mission_id) DO UPDATE SET status = 'in_progress', started_at = NOW()
    `, [userId, missionId]);

    res.json({ success: true });
  } catch (e) {
    console.error('Error starting mission:', e);
    res.status(500).json({ error: 'Failed to start mission' });
  }
});

// POST /api/missions/complete - Complete a mission
router.post('/complete', async (req, res) => {
  const { userId, missionId } = req.body;

  try {
    // Get mission XP reward
    const missionResult = await pool.query('SELECT xp_reward FROM missions WHERE id = $1', [missionId]);
    if (missionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    const xpReward = missionResult.rows[0].xp_reward;

    await pool.query(`
      INSERT INTO user_missions (user_id, mission_id, status, xp_earned, completed_at)
      VALUES ($1, $2, 'completed', $3, NOW())
      ON CONFLICT (user_id, mission_id) DO UPDATE SET status = 'completed', xp_earned = $3, completed_at = NOW()
    `, [userId, missionId, xpReward]);

    // Return total XP
    const xpResult = await pool.query(
      'SELECT COALESCE(SUM(xp_earned), 0) as total_xp FROM user_missions WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );

    res.json({ success: true, xpEarned: xpReward, totalXp: parseInt(xpResult.rows[0].total_xp) });
  } catch (e) {
    console.error('Error completing mission:', e);
    res.status(500).json({ error: 'Failed to complete mission' });
  }
});

// POST /api/missions/redeem - Redeem a reward
router.post('/redeem', async (req, res) => {
  const { userId, rewardId } = req.body;

  try {
    // Check user XP
    const xpResult = await pool.query(
      'SELECT COALESCE(SUM(xp_earned), 0) as total_xp FROM user_missions WHERE user_id = $1 AND status = $2',
      [userId, 'completed']
    );
    const totalXp = parseInt(xpResult.rows[0].total_xp);

    // Check already redeemed XP
    const redeemedResult = await pool.query(`
      SELECT COALESCE(SUM(r.xp_cost), 0) as spent_xp
      FROM user_rewards ur JOIN rewards r ON ur.reward_id = r.id
      WHERE ur.user_id = $1
    `, [userId]);
    const spentXp = parseInt(redeemedResult.rows[0].spent_xp);
    const availableXp = totalXp - spentXp;

    // Check reward cost
    const rewardResult = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId]);
    if (rewardResult.rows.length === 0) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    const reward = rewardResult.rows[0];

    if (availableXp < reward.xp_cost) {
      return res.status(400).json({ error: 'Not enough XP', needed: reward.xp_cost - availableXp });
    }

    // Redeem
    await pool.query(
      'INSERT INTO user_rewards (user_id, reward_id) VALUES ($1, $2)',
      [userId, rewardId]
    );

    res.json({ success: true, reward: reward.title, remainingXp: availableXp - reward.xp_cost });
  } catch (e) {
    console.error('Error redeeming reward:', e);
    res.status(500).json({ error: 'Failed to redeem reward' });
  }
});

// POST /api/missions/generate-more - Generate more missions with AI
router.post('/generate-more', async (req, res) => {
  const { role, category } = req.body;

  try {
    const fetch = (await import('node-fetch')).default;
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API key missing' });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a career gamification expert. Create engaging, fresh missions for tech learners.'
          },
          {
            role: 'user',
            content: `Search the web for the latest trends in "${role}" and create 3 NEW ${category || 'mixed'} missions that are timely and relevant for 2024/2025.
            
            Return ONLY a valid JSON array:
            [{
              "title": "Mission title",
              "description": "Why this mission matters right now",
              "category": "${category || 'learning'}",
              "xp_reward": 200-800,
              "difficulty": "Easy/Medium/Hard",
              "estimated_time": "Duration",
              "steps": ["Step 1", "Step 2", "Step 3", "Step 4"],
              "ai_powered": true/false,
              "icon": "roadmap/project/resume/resources/analysis/streak/course",
              "action_route": "/roadmap or /dashboard or /resources or /profile"
            }]`
          }
        ],
        temperature: 0.9
      })
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonMatch = content.match(/\[[\s\S]*\]/) || content.match(/```json\n([\s\S]*?)\n```/);
    const jsonStr = jsonMatch ? jsonMatch[0].replace(/```json|```/g, '') : '[]';
    const missions = JSON.parse(jsonStr);

    const saved = [];
    for (const m of missions) {
      const result = await pool.query(`
        INSERT INTO missions (title, description, category, xp_reward, difficulty, estimated_time, steps, ai_powered, icon, role, action_route)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `, [m.title, m.description, m.category, m.xp_reward, m.difficulty, m.estimated_time, JSON.stringify(m.steps), m.ai_powered, m.icon, role, m.action_route]);
      saved.push({ ...result.rows[0], steps: m.steps, status: 'available' });
    }

    res.json({ success: true, missions: saved });
  } catch (e) {
    console.error('Error generating missions:', e);
    res.status(500).json({ error: 'Failed to generate missions' });
  }
});

module.exports = router;
