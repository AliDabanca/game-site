const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
ctx.scale(20, 20);

const arena = createMatrix(12, 20);
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let score = 0;
let currentUsername = 'Sen';

const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
};

const colors = [
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    switch (type) {
        case 'T': return [[0, 0, 0], [1, 1, 1], [0, 1, 0]];
        case 'O': return [[2, 2], [2, 2]];
        case 'L': return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
        case 'J': return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
        case 'I': return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
        case 'S': return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
        case 'Z': return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
    }
}

function collide(arena, player) {
    const m = player.matrix;
    const o = player.pos;
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}
async function playerReset() {
    const pieces = 'TJLOSZI';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));

        
        await saveScoreToDB("tetris", score, null, null);
        await getScoresFromDB("tetris");

        score = 0;
        updateScore();
    }
}


function playerRotate(dir) {
    const pos = player.pos.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}

function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        score += 10;
    }
}

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }
    draw();
    requestAnimationFrame(update);
}

function draw() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                ctx.fillStyle = colors[value];
                ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function updateScore() {
    document.getElementById('score').innerText = 'Skor: ' + score;
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
        }
    } catch { }
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
        console.error("❌ Skor kaydı hatası:", err);
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

function startGame() {
    arena.forEach(row => row.fill(0));
    score = 0;
    playerReset();
    updateScore();
    getScoresFromDB("tetris");
}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) playerMove(-1);
    else if (event.keyCode === 39) playerMove(1);
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) playerRotate(1);
});

fetchUsername();
getScoresFromDB("tetris");
startGame();
update();