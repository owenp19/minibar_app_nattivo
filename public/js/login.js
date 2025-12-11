function showLoader() {
  const overlay = document.getElementById("loader-overlay");
  if (overlay) {
    overlay.classList.add("visible");
  }
}

function hideLoader() {
  const overlay = document.getElementById("loader-overlay");
  if (overlay) {
    overlay.classList.remove("visible");
  }
}

function setupPasswordToggle() {
  const passwordInput = document.getElementById("password");
  const toggle = document.getElementById("password-toggle");
  if (!passwordInput || !toggle) return;

  const icon = toggle.querySelector("i");

  toggle.addEventListener("click", () => {
    const hidden = passwordInput.type === "password";
    passwordInput.type = hidden ? "text" : "password";
    if (icon) {
      icon.className = hidden ? "ri-eye-line" : "ri-eye-off-line";
    }
  });
}

function setupLoginForm() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!form || !status || !emailInput || !passwordInput) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    status.textContent = "";
    status.className = "login-status";

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      status.textContent = "Completa el correo y la contraseña.";
      return;
    }

    showLoader();

    setTimeout(() => {
      hideLoader();
      window.location.href = "/app";
    }, 1000);
  });
}

function initLogin() {
  setupPasswordToggle();
  setupLoginForm();
}

document.addEventListener("DOMContentLoaded", initLogin);
