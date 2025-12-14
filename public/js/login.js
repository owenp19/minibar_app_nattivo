document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const emailInput = document.getElementById("email");
  const emailStatus = document.getElementById("email-status");
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.getElementById("password-toggle");
  const loaderOverlay = document.getElementById("loader-overlay");
  const loginStatus = document.getElementById("login-status");

  function showLoader(show) {
    if (!loaderOverlay) return;
    loaderOverlay.style.display = show ? "flex" : "none";
  }

  function setStatus(message, type) {
    if (!loginStatus) return;
    loginStatus.textContent = message || "";
    loginStatus.className = "login-status" + (type ? " " + type : "");
  }

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      const icon = passwordToggle.querySelector("i");
      if (icon) {
        icon.classList.remove(isHidden ? "ri-eye-off-line" : "ri-eye-line");
        icon.classList.add(isHidden ? "ri-eye-line" : "ri-eye-off-line");
      }
    });
  }

  if (emailInput && emailStatus) {
    emailInput.addEventListener("input", () => {
      const value = emailInput.value.trim();
      const valid = value.includes("@") && value.includes(".");
      emailStatus.style.opacity = valid ? "1" : "0";
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      setStatus("", "");
      showLoader(true);

      try {
        const formData = new FormData(form);
        const body = new URLSearchParams(formData);

        const response = await fetch("/api/auth/login", {
          method: "POST",
          body
        });

        if (response.redirected) {
          window.location.href = response.url;
          return;
        }

        if (!response.ok) {
          const text = await response.text();
          showLoader(false);
          setStatus(text || "Error al iniciar sesión. Inténtalo de nuevo.", "error");
          return;
        }

        showLoader(false);
        window.location.href = "/app"; // Redirige a /app después de un login exitoso
      } catch (error) {
        console.error("Error en login:", error);
        showLoader(false);
        setStatus("Ocurrió un error al iniciar sesión. Verifica tu conexión.", "error");
      }
    });
  }

  showLoader(false);
});
