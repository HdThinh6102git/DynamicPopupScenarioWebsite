// login.js - Authentication logic for the RPA Testing Suite
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const errorMessage = document.getElementById('login-error');

  // Check if already logged in
  if (localStorage.getItem('isLoggedIn') === 'true') {
    window.location.href = 'index.html';
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;

    // Hardcoded credentials as requested: 123 / 123
    if (username === '123' && password === '123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', username);
      
      // Visual feedback before redirect
      const btnLogin = document.getElementById('btn-login');
      btnLogin.textContent = 'Authenticating...';
      btnLogin.disabled = true;

      setTimeout(() => {
        window.location.href = 'index.html';
      }, 800);
    } else {
      // Show error message
      errorMessage.classList.remove('hidden');
      
      // Shake animation effect for error
      const loginCard = document.querySelector('.login-card');
      loginCard.classList.add('shake');
      setTimeout(() => {
        loginCard.classList.remove('shake');
      }, 500);

      // Clear password field
      passwordInput.value = '';
    }
  });

  // Hide error message when user starts typing again
  usernameInput.addEventListener('input', () => errorMessage.classList.add('hidden'));
  passwordInput.addEventListener('input', () => errorMessage.classList.add('hidden'));
});
