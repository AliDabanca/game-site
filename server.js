const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const pool = require('./db'); // DB bağlantısı

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// JSON veri almak için
app.use(express.json());

// Statik dosyalar
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa -> login
app.get('/', (req, res) => res.redirect('/login'));

// Login ve Register sayfaları
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public', 'register.html')));

// Girişten sonra oyunlar sayfası
app.get('/games', (req, res) => res.sendFile(path.join(__dirname, 'views', 'index.html')));

// Oyun sayfaları
['game1','game2','game3','game4','game5'].forEach(game => {
  app.get(`/${game}`, (req, res) => res.sendFile(path.join(__dirname, `public/games/${game}.html`)));
});

// ✅ DB bağlantı test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send({ db_time: result.rows[0].now });
  } catch (err) {
    console.error("DB bağlantı hatası:", err);
    res.status(500).send("DB bağlantı hatası: " + err.message);
  }
});

// ✅ Register testi endpoint
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users1 (username, password) VALUES ($1, $2) RETURNING id',
      [username, hashed]
    );
    console.log('Yeni kullanıcı oluşturuldu:', result.rows[0]);
    res.status(201).json({ userId: result.rows[0].id });
  } catch (err) {
    console.error('Register hatası detay:', err);
    if (err.code === '23505') {
      res.status(409).json({ error: 'Kullanıcı adı zaten kullanılıyor' });
    } else {
      res.status(500).json({ error: 'Sunucu hatası: ' + err.message });
    }
  }
});

// API rotaları
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api', userRoutes);

const scoreRoutes = require('./routes/scores');
app.use('/api/scores', scoreRoutes);

// Sunucu başlat
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Sunucu herkese açık: http://0.0.0.0:${port}`);
});
