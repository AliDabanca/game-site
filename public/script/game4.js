const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const box = 20;
const canvasSize = 400;
let snake = [], direction = "RIGHT", food = {}, score = 0, interval;
let currentUsername = "Sen";

document.addEventListener("keydown", changeDirection);

function changeDirection(event) {
    const key = event.keyCode;
    if (key === 37 && direction !== "RIGHT") direction = "LEFT";
    if (key === 38 && direction !== "DOWN") direction = "UP";
    if (key === 39 && direction !== "LEFT") direction = "RIGHT";
    if (key === 40 && direction !== "UP") direction = "DOWN";
}

async function drawGame() {
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = i === 0 ? "lime" : "#0f0";
        ctx.fillRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = "red";
    ctx.fillRect(food.x, food.y, box, box);

    let headX = snake[0].x;
    let headY = snake[0].y;

    if (direction === "LEFT") headX -= box;
    if (direction === "RIGHT") headX += box;
    if (direction === "UP") headY -= box;
    if (direction === "DOWN") headY += box;

    if (headX < 0 || headX >= canvasSize || headY < 0 || headY >= canvasSize || collision(headX, headY)) {
        clearInterval(interval);
        alert("💥 Oyun Bitti! Skor: " + score);
        await saveScoreToDB("snake", score, null, null); 
        await getScoresFromDB("snake");                  
        return;
    }

    let newHead = { x: headX, y: headY };
    snake.unshift(newHead);

    if (headX === food.x && headY === food.y) {
        score++;
        document.getElementById("scoreDisplay").innerText = "Skor: " + score;
        createFood();
    } else {
        snake.pop();
    }
}

function collision(x, y) {
    return snake.some(part => part.x === x && part.y === y);
}

function createFood() {
    food = {
        x: Math.floor(Math.random() * (canvasSize / box)) * box,
        y: Math.floor(Math.random() * (canvasSize / box)) * box
    };
}

function startGame() {
    snake = [{ x: 9 * box, y: 9 * box }];
    direction = "RIGHT";
    score = 0;
    document.getElementById("scoreDisplay").innerText = "Skor: 0";
    createFood();
    clearInterval(interval);
    interval = setInterval(drawGame, 120);
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
        console.error("❌ Skor DB'ye kaydedilemedi:", err);
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
        const tbody = document.getElementById("scoreTable");
        tbody.innerHTML = "";
        scores.forEach(s => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${s.score}</td><td>${new Date(s.created_at).toLocaleString()}</td>`;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("❌ Skorları çekme hatası:", err);
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
        document.getElementById("username").textContent = "Bağlantı Hatası";
    }
}

fetchUsername();
getScoresFromDB("snake");
startGame();