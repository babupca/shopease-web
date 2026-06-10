document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const error = document.getElementById('login-error');
  error.textContent = '';
  try {
    const { token } = await ShopEase.call('/auth/login', {
      method: 'POST',
      body: { email: document.getElementById('email').value, password: document.getElementById('password').value }
    });
    ShopEase.setToken(token);
    window.location.href = '/';
  } catch (err) {
    error.textContent = err.message;
  }
});
