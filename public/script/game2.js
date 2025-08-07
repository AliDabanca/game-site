let currentUsername = 'Sen';
let numberToGuess = Math.floor(Math.random() * 100) + 1;
let attempts = 0;

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
            getScoresFromDB("guess");  // Veritabanından skorları çek
        } else {
            document.getElementById("username").textContent = "Bilinmeyen";
        }
    } catch {
        document.getElementById("username").textContent = "Hata!";
    }
}

async function checkGuess() {
    const guess = parseInt(document.getElementById("guessInput").value);
    if (!guess || guess < 1 || guess > 100) return;

    attempts++;

    if (guess === numberToGuess) {
        document.getElementById("feedback").textContent = `🎉 Doğru bildin! ${attempts} denemede`;

        await saveScoreToDB("guess", 100 - attempts, attempts, null);  
        await getScoresFromDB("guess");                                
        resetGame();
    } else {
        document.getElementById("feedback").textContent = guess < numberToGuess ? "⬆️ Daha büyük!" : "⬇️ Daha küçük!";
    }
}

function resetGame() {
    numberToGuess = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    document.getElementById("guessInput").value = '';
}

async function saveScoreToDB(game, score, moves, time) {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const res = await fetch('/api/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ game_name: game, score, moves, time })
        });
        const data = await res.json();
        if (res.ok) {
            console.log("✅ Skor veritabanına kaydedildi.");
        } else {
            console.error("❌ Skor kaydı hatası:", data.error);
        }
    } catch (err) {
        console.error("❌ API hatası:", err);
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

        if (!Array.isArray(scores) || scores.length === 0) {
            tbody.innerHTML = `<tr><td colspan="2">Henüz skor yok</td></tr>`;
            return;
        }

        scores.forEach(s => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${s.moves ?? '-'}</td>
            <td>${new Date(s.created_at).toLocaleString()}</td>
          `;
            tbody.appendChild(row);
        });
    } catch (err) {
        console.error("❌ Skor çekme hatası:", err);
    }
}

fetchUsername();