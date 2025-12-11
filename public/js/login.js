document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const passwordToggle = document.getElementById('password-toggle');
  const passwordInput = document.getElementById('password');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // Aquí iría la lógica de envío del formulario de login
      console.log('Login form submitted');
    });
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        passwordToggle.innerHTML = '<i class="ri-eye-line"></i>';
      } else {
        passwordInput.type = 'password';
        passwordToggle.innerHTML = '<i class="ri-eye-off-line"></i>';
      }
    });
  }
});
