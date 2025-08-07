const emojis = ['🐶', '🐱', '🐭', '🦊', '🐼', '🐵', '🐸', '🐤'];
let gameBoard = document.getElementById('gameBoard');
let movesEl = document.getElementById('moves');
let scoreEl = document.getElementById('score');
let timerEl = document.getElementById('timer');

let openCards = [], matched = 0, moves = 0, score = 0;
let cards = [], timer = 0, interval;
let currentUsername = "Sen";

function shuffleAndCreateCards() {
    cards = [...emojis, ...emojis].sort(() => 0.5 - Math.random());
    gameBoard.innerHTML = '';
    cards.forEach((emoji, index) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.emoji = emoji;
        card.dataset.index = index;
        card.innerText = '';
        card.addEventListener('click', onCardClick);
        gameBoard.appendChild(card);
    });
}

function onCardClick(e) {
    const card = e.currentTarget;
    if (card.classList.contains('matched') || openCards.includes(card)) return;

    card.innerText = card.dataset.emoji;
    card.classList.add('open');
    openCards.push(card);

    if (openCards.length === 2) {
        moves++;
        movesEl.innerText = moves;

        const [first, second] = openCards;
        if (first.dataset.emoji === second.dataset.emoji) {
            first.classList.add('matched');
            second.classList.add('matched');
            matched += 2;
            score += 100;
            scoreEl.innerText = score;
            openCards = [];

            if (matched === cards.length) {
                clearInterval(interval);
                setTimeout(() => {
                    saveScoreToDB("memory", score, moves, timer);
                    alert(`🎉 Tebrikler!\nHamle: ${moves}\nSkor: ${score}\nSüre: ${timer} sn`);
                    getScoresFromDB("memory");
                }, 300);
            }
        } else {
            score -= 10;
            scoreEl.innerText = score;
            setTimeout(() => {
                first.innerText = '';
                second.innerText = '';
                first.classList.remove('open');
                second.classList.remove('open');
                openCards = [];
            }, 1000);
        }
    }
}

function baslatTimer() {
    clearInterval(interval);
    timer = 0;
    timerEl.innerText = timer;
    interval = setInterval(() => {
        timer++;
        timerEl.innerText = timer;
    }, 1000);
}

function yenidenBasla() {
    openCards = [];
    matched = 0;
    moves = 0;
    score = 0;
    movesEl.innerText = "0";
    scoreEl.innerText = "0";
    baslatTimer();
    shuffleAndCreateCards();
    getScoresFromDB("memory");
}

async function saveScoreToDB(game, score, moves, time) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ game_name: game, score, moves, time })
        });
    } catch (err) {
        console.error("Skor kaydedilemedi:", err);
    }
}

async function getScoresFromDB(game) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('/api/scores/' + game, {
            headers: { Authorization: 'Bearer ' + token }
        });
        const scores = await res.json();
        const tbody = document.querySelector('#scoreTable tbody');
        tbody.innerHTML = '';
        scores.forEach(s => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${s.score}</td>
            <td>${s.moves}</td>
            <td>${s.time ?? "-"}</td>
            <td>${new Date(s.created_at).toLocaleString()}</td>
          `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("Skor çekme hatası:", err);
    }
}

async function fetchUsername() {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('/api/profile', {
            headers: { Authorization: 'Bearer ' + token }
        });
        const data = await res.json();
        if (res.ok && data.user?.username) {
            currentUsername = data.user.username;
            document.getElementById("username").textContent = currentUsername;
        } else {
            document.getElementById("username").textContent = "Bilinmeyen";
        }
    } catch {
        document.getElementById("username").textContent = "Hata";
    }
}

fetchUsername();
yenidenBasla();