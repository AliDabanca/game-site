const form = document.getElementById('registerForm');
const result = document.getElementById('result');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            alert('✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
            window.location.href = '/login';
        } else {
            result.textContent = '❌ ' + (data.error || 'Kayıt başarısız');
        }
    } catch (err) {
        console.error(err);
        result.textContent = '❌ Sunucu hatası';
    }
});
