const express = require('express');
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

//  Token ile korunan endpoint
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, username, created_at FROM users1 WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(" Profile hatası:", err);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
