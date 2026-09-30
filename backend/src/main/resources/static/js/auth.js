/**
 * Authentication logic & session management
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  checkAuthState();
  initLoginForm();
  initRegisterForm();
  initLogout();
});

// Mobile navbar toggle
function initNavbar() {
  const toggleBtn = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('show');
    });
  }
}

// Check logged in user state
async function checkAuthState() {
  const guestLinks = document.getElementById('guestLinks');
  const authLinks = document.getElementById('authLinks');
  const navUsername = document.getElementById('navUsername');
  const navAvatar = document.getElementById('navAvatar');

  try {
    const user = await API.auth.getCurrentUser();
    if (user && user.email) {
      // Store public profile snippet in localStorage for immediate UI display
      localStorage.setItem('gamezone_user', JSON.stringify(user));
      
      if (guestLinks) guestLinks.style.display = 'none';
      if (authLinks) authLinks.style.display = 'flex';
      if (navUsername) navUsername.textContent = user.fullName;
      if (navAvatar) navAvatar.textContent = user.fullName.charAt(0).toUpperCase();

      // Redirect away from login/register if already authenticated
      if (window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html')) {
        window.location.href = 'dashboard.html';
      }
    }
  } catch (err) {
    // Unauthenticated
    localStorage.removeItem('gamezone_user');
    if (guestLinks) guestLinks.style.display = 'flex';
    if (authLinks) authLinks.style.display = 'none';

    // Protect dashboard & profile pages
    if (window.location.pathname.endsWith('dashboard.html') || window.location.pathname.endsWith('profile.html')) {
      window.location.href = 'login.html';
    }
  }
}

// Login Form Handling
function initLoginForm() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = document.getElementById('submitBtn');

    let hasError = false;
    if (!email || !validateEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      hasError = true;
    }
    if (!password) {
      showFieldError('password', 'Password is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      const response = await API.auth.login({ email, password });
      showAlert('Login successful! Redirecting to dashboard...', 'success');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 800);
    } catch (err) {
      showAlert(err.message || 'Invalid email or password', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Sign In';
    }
  });
}

// Registration Form Handling
function initRegisterForm() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = document.getElementById('submitBtn');

    let hasError = false;

    if (!fullName || fullName.length < 2) {
      showFieldError('fullName', 'Full name must be at least 2 characters');
      hasError = true;
    }

    if (!email || !validateEmail(email)) {
      showFieldError('email', 'Please enter a valid email address');
      hasError = true;
    }

    if (!password || password.length < 6) {
      showFieldError('password', 'Password must be at least 6 characters');
      hasError = true;
    }

    if (password !== confirmPassword) {
      showFieldError('confirmPassword', 'Passwords do not match');
      hasError = true;
    }

    if (hasError) return;

    try {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Registering...';

      await API.auth.register({ fullName, email, password });
      showAlert('Account registered successfully! Redirecting to login...', 'success');

      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      showAlert(err.message || 'Registration failed', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Register Player';
    }
  });
}

// Logout handling
function initLogout() {
  document.addEventListener('click', async (e) => {
    if (e.target.closest('#logoutBtn')) {
      try {
        await API.auth.logout();
      } catch (err) {
        console.warn('Logout warning:', err);
      } finally {
        localStorage.removeItem('gamezone_user');
        window.location.href = 'login.html';
      }
    }
  });
}

// UI Helpers
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showFieldError(fieldId, message) {
  const input = document.getElementById(fieldId);
  const errorSpan = document.getElementById(`${fieldId}Error`);
  if (input) input.classList.add('error');
  if (errorSpan) errorSpan.textContent = message;
}

function clearErrors() {
  document.querySelectorAll('.form-control').forEach(el => el.classList.remove('error'));
  document.querySelectorAll('.error-text').forEach(el => el.textContent = '');
  const alertBox = document.getElementById('alertContainer');
  if (alertBox) alertBox.innerHTML = '';
}

function showAlert(message, type = 'info') {
  const alertContainer = document.getElementById('alertContainer');
  if (!alertContainer) return;
  alertContainer.innerHTML = `
    <div class="alert alert-${type}">
      <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i>
      <span>${message}</span>
    </div>
  `;
}
