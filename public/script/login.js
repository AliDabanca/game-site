const form = document.getElementById('loginForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = '/games'; //  Başarılıysa oyunlara yönlendir
        } else {
            result.textContent = '❌ ' + (data.error || 'Hatalı giriş');
        }
    } catch {
        result.textContent = '❌ Sunucu hatası';
    }
});

window.history.pushState(null, "", window.location.href);
window.addEventListener("popstate", function () {
    window.history.pushState(null, "", window.location.href);
});