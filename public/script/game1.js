const choices = ['taş', 'kağıt', 'makas'];
let userScore = 0;
let computerScore = 0;
let currentUsername = 'Sen';

// Kullanıcı bilgisini çek
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
            document.getElementById('username').textContent = currentUsername;
            document.getElementById('playerName').textContent = currentUsername;
            getScoresFromDB("rps"); // veritabanından skorları çek
        } else {
            document.getElementById('username').textContent = 'Bilinmeyen';
        }
    } catch {
        document.getElementById('username').textContent = 'Bağlantı Hatası';
    }
}

// Oyun oynanırken çalışır
async function play(userChoice) {
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    let result = '';

    if (userChoice === computerChoice) {
        result = ` Berabere! Her ikisi de ${userChoice}`;
    } else if (
        (userChoice === 'taş' && computerChoice === 'makas') ||
        (userChoice === 'kağıt' && computerChoice === 'taş') ||
        (userChoice === 'makas' && computerChoice === 'kağıt')
    ) {
        result = ` Kazandın! ${userChoice} ${computerChoice}'i yener`;
        userScore++;
    } else {
        result = ` Kaybettin! ${computerChoice} ${userChoice}'i yener`;
        computerScore++;
    }

    document.getElementById("result").innerText = result;
    document.getElementById("score").innerText = `${currentUsername}: ${userScore} | Bilgisayar: ${computerScore}`;

    if (userScore >= 5 || computerScore >= 5) {
        const finalResult = userScore > computerScore ? " Oyunu kazandın!" : " Oyunu kaybettin!";
        alert(`${finalResult}\nSkor: ${currentUsername} ${userScore} - Bilgisayar ${computerScore}`);

        await saveScore(userScore, computerScore);  //  Buraya await eklendi
        restart();
    }
}


function restart() {
    userScore = 0;
    computerScore = 0;
    document.getElementById("result").innerText = '';
    document.getElementById("score").innerText = `${currentUsername}: 0 | Bilgisayar: 0`;
}

// LocalStorage'a skor kaydet
async function saveScore(user, computer) {
    const key = `tpmScores_${currentUsername}`;
    let scores = JSON.parse(localStorage.getItem(key)) || [];
    scores.push({ username: currentUsername, user, computer, date: new Date().toLocaleString() });
    scores.sort((a, b) => b.user - a.user);
    scores = scores.slice(0, 5);
    localStorage.setItem(key, JSON.stringify(scores));

    //  Veritabanına yazımı bekle
    await saveScoreToDB("rps", user, computer, null);

    //  Sonrasında veritabanından oku
    await getScoresFromDB("rps");
}


//  Veritabanına skor kaydet
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
            body: JSON.stringify({
                game_name: game,
                score,
                moves,
                time
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log("✅ Skor veritabanına kaydedildi.");
        } else {
            console.error("❌ Skor kaydı hatası:", data.error);
        }
    } catch (err) {
        console.error("❌ API çağrısı başarısız:", err);
    }
}

//  Veritabanından skorları getir
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
            const row = document.createElement("tr");
            row.innerHTML = `<td colspan="2">Henüz skor yok</td>`;
            tbody.appendChild(row);
            return;
        }

        scores.forEach(s => {
            const row = document.createElement("tr");
            row.innerHTML = `
          <td><strong>${currentUsername} ${s.score} - ${s.moves ?? 0} bilgisayar</strong></td>
          <td>${new Date(s.created_at).toLocaleString()}</td>
        `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("❌ Skor çekme hatası:", err);
    }
}

// Sayfa yüklenince başlat
fetchUsername();