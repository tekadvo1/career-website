const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { protect: authenticateToken } = require('../middleware/authMiddleware');

// ─── Default Achievements Catalog ───
// These are the base definitions. Progress is calculated from DB data.
const ACHIEVEMENTS_CATALOG = [
  { id: 'first_steps',        icon: '🎯', title: 'First Steps',         description: 'Complete your first project',                        category: 'Projects',    rarity: 'Common',    points: 10,  total: 1,   reward: 'Unlocked project tracking' },
  { id: 'week_warrior',       icon: '🔥', title: 'Week Warrior',        description: 'Maintain a 7-day learning streak',                   category: 'Streaks',     rarity: 'Rare',      points: 25,  total: 7,   reward: 'Streak multiplier bonus' },
  { id: 'five_star',          icon: '⭐', title: 'Five Star',            description: 'Complete 5 projects successfully',                   category: 'Projects',    rarity: 'Epic',      points: 50,  total: 5,   reward: 'Advanced projects unlocked' },
  { id: 'streak_master',      icon: '💪', title: 'Streak Master',        description: 'Maintain a 14-day learning streak',                  category: 'Streaks',     rarity: 'Epic',      points: 50,  total: 14,  reward: 'Will unlock premium features' },
  { id: 'perfect_ten',        icon: '🏆', title: 'Perfect Ten',          description: 'Complete 10 projects',                               category: 'Projects',    rarity: 'Legendary', points: 100, total: 10,  reward: 'Will unlock expert mentor access' },
  { id: 'advanced_learner',   icon: '🚀', title: 'Advanced Learner',     description: 'Complete your first advanced difficulty project',     category: 'Projects',    rarity: 'Rare',      points: 40,  total: 1,   reward: 'Will unlock advanced challenges' },
  { id: 'speed_demon',        icon: '⚡', title: 'Speed Demon',          description: 'Complete a project in under half the estimated time', category: 'Speed',       rarity: 'Epic',      points: 60,  total: 1,   reward: 'Will unlock time trial mode' },
  { id: 'design_master',      icon: '🎨', title: 'Design Master',        description: 'Complete 3 design-focused projects',                 category: 'Skills',      rarity: 'Rare',      points: 35,  total: 3,   reward: 'Will unlock design resources' },
  { id: 'code_ninja',         icon: '👨‍💻', title: 'Code Ninja',          description: 'Complete 10 projects across all categories',         category: 'Skills',      rarity: 'Epic',      points: 75,  total: 10,  reward: 'Will unlock code review sessions' },
  { id: 'perfectionist',      icon: '💯', title: 'Perfectionist',        description: 'Complete all tasks in a project without skipping',   category: 'Quality',     rarity: 'Rare',      points: 40,  total: 1,   reward: 'Quality assurance badge' },
  { id: 'knowledge_seeker',   icon: '📚', title: 'Knowledge Seeker',     description: 'Complete projects in 5 different categories',        category: 'Variety',     rarity: 'Epic',      points: 55,  total: 5,   reward: 'Will unlock category mastery' },
  { id: 'first_week',         icon: '🎁', title: 'First Week',           description: 'Complete your first week on the platform',           category: 'Milestones',  rarity: 'Common',    points: 5,   total: 1,   reward: 'Welcome bonus points' },
  { id: 'consistency_king',   icon: '⏰', title: 'Consistency King',     description: 'Work on projects for 30 consecutive days',           category: 'Streaks',     rarity: 'Legendary', points: 200, total: 30,  reward: 'Will unlock lifetime premium' },
  { id: 'team_player',        icon: '👥', title: 'Team Player',          description: 'Share 5 resources with the community',               category: 'Community',   rarity: 'Rare',      points: 30,  total: 5,   reward: 'Will unlock community features' },
  { id: 'graduate',           icon: '🎓', title: 'Graduate',             description: 'Complete beginner, intermediate, and advanced projects', category: 'Progression', rarity: 'Legendary', points: 150, total: 3,   reward: 'Will unlock certification' },
];

/**
 * GET /api/achievements
 * Returns the full achievement catalog with user's progress/earned status.
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch completed projects from DB for progress calculation
    const projectsResult = await pool.query(
      `SELECT status, project_data->>'difficulty' AS difficulty, project_data->>'category' AS category,
              created_at
       FROM user_projects
       WHERE user_id = $1`,
      [userId]
    );
    const projects = projectsResult.rows;

    const completedProjects = projects.filter((p) => p.status === 'completed');
    const totalCompleted = completedProjects.length;

    // Fetch user's earned achievements from DB
    const earnedResult = await pool.query(
      `SELECT achievement_id, earned_at FROM user_achievements WHERE user_id = $1`,
      [userId]
    );
    const earnedMap = new Map(
      earnedResult.rows.map((r) => [r.achievement_id, r.earned_at])
    );

    // Build response
    const achievements = ACHIEVEMENTS_CATALOG.map((ach) => {
      const earned = earnedMap.has(ach.id);
      const earnedDate = earned
        ? new Date(earnedMap.get(ach.id)).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })
        : null;

      // Calculate progress dynamically
      let progress = 0;
      if (ach.id === 'first_steps')      progress = Math.min(totalCompleted, 1);
      else if (ach.id === 'five_star')   progress = Math.min(totalCompleted, 5);
      else if (ach.id === 'perfect_ten') progress = Math.min(totalCompleted, 10);
      else if (ach.id === 'first_week')  progress = 1; // join = first_week
      else if (ach.id === 'advanced_learner') {
        progress = completedProjects.some((p) => p.difficulty === 'Advanced') ? 1 : 0;
      } else if (ach.id === 'graduate') {
        const hasBeginner     = completedProjects.some((p) => p.difficulty === 'Beginner') ? 1 : 0;
        const hasIntermediate = completedProjects.some((p) => p.difficulty === 'Intermediate') ? 1 : 0;
        const hasAdvanced     = completedProjects.some((p) => p.difficulty === 'Advanced') ? 1 : 0;
        progress = hasBeginner + hasIntermediate + hasAdvanced;
      } else {
        progress = earned ? ach.total : 0;
      }

      // Award achievements automatically when threshold met (and not yet awarded)
      if (!earned && progress >= ach.total) {
        // Fire-and-forget: update DB (don't await in map)
        pool.query(
          `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [userId, ach.id]
        ).catch(() => {}); // silent fail — will be awarded next request
      }

      return {
        id: ach.id,
        icon: ach.icon,
        title: ach.title,
        description: ach.description,
        category: ach.category,
        rarity: ach.rarity,
        points: ach.points,
        total: ach.total,
        reward: ach.reward,
        earned,
        earnedDate,
        progress: earned ? ach.total : progress,
      };
    });

    res.json({ achievements });
  } catch (err) {
    console.error('Achievements GET error:', err);
    res.status(500).json({ error: 'Failed to load achievements' });
  }
});

/**
 * POST /api/achievements/award
 * Manually award an achievement (called from other routes when milestones are hit).
 * Body: { achievementId }
 */
router.post('/award', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { achievementId } = req.body;

    if (!achievementId) {
      return res.status(400).json({ error: 'achievementId is required' });
    }

    const ach = ACHIEVEMENTS_CATALOG.find((a) => a.id === achievementId);
    if (!ach) {
      return res.status(404).json({ error: 'Achievement not found' });
    }

    await pool.query(
      `INSERT INTO user_achievements (user_id, achievement_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, achievementId]
    );

    res.json({ success: true, achievement: ach });
  } catch (err) {
    console.error('Achievements POST /award error:', err);
    res.status(500).json({ error: 'Failed to award achievement' });
  }
});

/**
 * GET /api/achievements/stats
 * Returns summary stats for profile display.
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT COUNT(*) AS earned_count FROM user_achievements WHERE user_id = $1`,
      [userId]
    );
    const earnedCount = parseInt(result.rows[0].earned_count, 10);
    const totalCount = ACHIEVEMENTS_CATALOG.length;
    const totalPoints = ACHIEVEMENTS_CATALOG.filter((_, i) => i < earnedCount)
      .reduce((s, a) => s + a.points, 0);

    res.json({
      earned: earnedCount,
      total: totalCount,
      totalPoints,
      completion: Math.round((earnedCount / totalCount) * 100),
    });
  } catch (err) {
    console.error('Achievements stats error:', err);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

module.exports = router;
