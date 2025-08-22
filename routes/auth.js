const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
require('dotenv').config();

//  Kayıt (Register)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
         'INSERT INTO users1 (username, password, created_at) VALUES ($1, $2, NOW()) RETURNING id',
          [username, hash]
          );
        res.status(201).json({ userId: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') {
            res.status(409).json({ error: 'Kullanıcı adı zaten kullanılıyor' });
        } else {
            console.error(' Register hatası:', err);
            res.status(500).json({ error: 'Sunucu hatası' });
        }
    }
});

//  Giriş (Login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });
    }

    try {
        const result = await pool.query(
            'SELECT * FROM users1 WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const user = result.rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Geçersiz şifre' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token });
    } catch (err) {
        console.error('🔥 Login hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
