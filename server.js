import dns from 'dns';

const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// JSON veri almak için
app.use(express.json());


// Statik dosyalar (CSS, JS, img vs.)
app.use(express.static(path.join(__dirname, 'public')));

//  Ana sayfa artık login'e yönlendirsin
app.get('/', (req, res) => {
  res.redirect('/login');
});

//  Login ve Register sayfaları
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

//  Girişten sonra yönlendirilecek oyunlar sayfası
app.get('/games', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html')); // Oyunlar listesi 
});

//  Oyun sayfaları
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

//  API rotaları
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const userRoutes = require('./routes/user');
app.use('/api', userRoutes); 

const scoreRoutes = require('./routes/scores');
app.use('/api/scores', scoreRoutes);





app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Sunucu herkese açık: http://<sunucu-ip-adresi>:${port}`);
});
