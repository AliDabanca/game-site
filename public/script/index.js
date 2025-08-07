async function fetchLeaderboard() {
  try {
    const res = await fetch('/api/scores/leaderboard');
    const data = await res.json();
    const container = document.getElementById('leaderboardsContainer');
    container.innerHTML = '';

    const grouped = {};
    data.forEach(entry => {
      if (!grouped[entry.game_name]) grouped[entry.game_name] = [];
      grouped[entry.game_name].push(entry);
    });

    Object.entries(grouped).forEach(([game, scores]) => {
      const box = document.createElement('div');
      box.className = 'leaderboard-box';

      const title = document.createElement('h3');
      title.textContent = `🏆 ${game.toUpperCase()} Liderlik Tablosu`;
      box.appendChild(title);

      const table = document.createElement('table');
      table.innerHTML = `
            <thead>
              <tr><th>Kullanıcı</th><th>Skor</th></tr>
            </thead>
            <tbody>
              ${scores.map(s => `
                <tr>
                  <td>${s.username}</td>
                  <td>${s.score}</td>
                </tr>
              `).join('')}
            </tbody>
          `;
      box.appendChild(table);
      container.appendChild(box);
    });
  } catch (err) {
    console.error("❌ Liderlik verisi alınamadı:", err);
  }
}
fetchLeaderboard();


window.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = "/login.html";
    return;
  }

  try {
    const res = await fetch('/api/profile', {
      headers: { Authorization: 'Bearer ' + token }
    });
    const data = await res.json();

    if (!res.ok || !data.user?.username) {
      localStorage.removeItem("token");
      return window.location.href = "/login.html";
    }

    document.getElementById("welcome-user").textContent = `Hoş geldin, ${data.user.username}`;
    // skorları veya diğer şeyleri yüklemek için devam et...
    fetchLeaderboard();

  } catch (err) {
    console.error("❌ Token doğrulama hatası:", err);
    localStorage.removeItem("token");
    window.location.href = "/login.html";
  }
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
});


