const express = require('express');
const router = express.Router();
const pool = require('../db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('../middleware/authMiddleware'); 

// Token doğrulayıcı middleware
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token yok' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token geçersiz' });
  }
}

// POST /api/scores
router.post('/', verifyToken, async (req, res) => {
  const { game_name, score, moves, time } = req.body;
  const user_id = req.user.id;

  try {
    await pool.query(
      'INSERT INTO game_scores (user_id, game_name, score, moves, time) VALUES ($1, $2, $3, $4, $5)',
      [user_id, game_name, score, moves, time]
    );
    res.status(201).json({ message: 'Skor kaydedildi' });
  } catch (err) {
    res.status(500).json({ error: 'DB hatası: ' + err.message });
  }
});



router.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT username, game_name, score, created_at FROM (
  SELECT u.username, g.game_name, g.score, g.created_at,
  ROW_NUMBER() OVER (PARTITION BY g.game_name ORDER BY g.score DESC) AS rank
  FROM game_scores g
  JOIN users1 u ON g.user_id = u.id
  WHERE g.game_name != 'rps'
) sub
WHERE rank <= 3
ORDER BY game_name, score DESC;

    `);
    res.json(result.rows);
  } catch (err) {
    console.error("🔥 Liderlik hatası:", err); 
    res.status(500).json({ error: 'Liderlik tablosu alınamadı', detail: err.message });
  }
});

router.get('/:game', authenticateToken, async (req, res) => {
  const game = req.params.game;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'SELECT * FROM game_scores WHERE user_id = $1 AND game_name = $2 ORDER BY created_at DESC LIMIT 5',
      [userId, game]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Veri alınamadı' });
  }
});




module.exports = router;