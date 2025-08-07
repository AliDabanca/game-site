import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

// __dirname tanımlaması ES module için
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// JSON veri almak için
app.use(express.json());

// Statik dosyalar (CSS, JS, img vs.)
app.use(express.static(path.join(__dirname, 'public')));

// Ana sayfa artık login'e yönlendirsin
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login ve Register sayfaları
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/my-ip', (req, res) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.send(ip);
});

// Test DNS lookup endpoint
app.get('/test-dns', (req, res) => {
  dns.lookup('db.xgwwfuzcuaafjjqxxtgu.supabase.co', (err, address) => {
    if (err) {
      console.error('DNS lookup failed:', err);
      res.status(500).send('DNS lookup failed: ' + err.message);
    } else {
      console.log('Supabase IP address:', address);
      res.send('Supabase IP address: ' + address);
    }
  });
});

// Oyunlar sayfası
app.get('/games', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); // Oyunlar listesi
});

// Oyun sayfaları
app.get('/game1', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/games/game1.html'));
});
app.get('/game2', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/games/game2.html'));
});
app.get('/game3', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/games/game3.html'));
});
app.get('/game4', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/games/game4.html'));
});
app.get('/game5', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/games/game5.html'));
});

// Diğer route dosyalarını import et (CommonJS değil, ES Module olarak yapman lazım)

// Eğer routes klasöründeki dosyaların da CommonJS ise onları ES Module’a çevirmen gerekir.
// Örnek olarak auth.js ES Module ise:

import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import scoreRoutes from './routes/scores.js';

app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/scores', scoreRoutes);

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Sunucu herkese açık: http://<sunucu-ip-adresi>:${port}`);
});
