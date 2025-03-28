/**
 * File: script.js
 * Purpose: Implements the starry background animation, shooting stars, and options panel interactions.
 * Author: Nobody_272
 * Last Modified: 2025-03-28
 */

document.addEventListener('DOMContentLoaded', () => {
  initMainPage();
});

/**
 * Initializes the main page components and event listeners
 */
function initMainPage() {
  const isReturningFromBtc = document.referrer.includes('btc.html');
  createStars(isReturningFromBtc);
  setInterval(createShootingStar, 2000);
  setupBackgroundMouseMove();
  setupOptionsPanel();
  setupPasswordHandling();
  setupErrorHandling();
}

/**
 * Sets up the background parallax effect on mouse move
 */
function setupBackgroundMouseMove() {
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    const background = document.querySelector('.animated-background');
    background.style.backgroundPosition = `${mouseX * 5 + 45}% ${mouseY * 5 + 45}%`;
  });
}

/**
 * Sets up the options panel and option click handlers
 */
function setupOptionsPanel() {
  const optionsPanel = document.querySelector('.options-panel');
  
  setTimeout(() => {
    if (optionsPanel) {
      optionsPanel.classList.add('visible');
    }
  }, 2500);

  const options = document.querySelectorAll('.option');
  options.forEach((option) => {
    option.addEventListener('click', () => {
      const optionType = option.getAttribute('data-option');
      handleOptionClick(optionType);
    });
  });
}

/**
 * Sets up password modal and related event handlers
 */
function setupPasswordHandling() {
  const passwordModal = document.querySelector('.password-modal');
  const passwordInput = document.getElementById('school-password');
  const passwordSubmit = document.getElementById('password-submit');
  
  if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
      if (e.target === passwordModal) {
        closePasswordModal(passwordModal);
      }
    });
  }

  if (passwordSubmit) {
    passwordSubmit.addEventListener('click', () => {
      handlePasswordSubmit(passwordInput.value);
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        handlePasswordSubmit(passwordInput.value);
      }
    });
  }
}

/**
 * Closes the password modal and shows the options panel
 * @param {HTMLElement} passwordModal - The password modal element
 */
function closePasswordModal(passwordModal) {
  passwordModal.classList.remove('visible');
  const optionsPanel = document.querySelector('.options-panel');
  
  if (optionsPanel) {
    optionsPanel.style.opacity = '1';
    optionsPanel.style.transform = 'scale(1)';
    optionsPanel.style.pointerEvents = 'auto';
  }
}

/**
 * Sets up error handling for the error message dialog
 */
function setupErrorHandling() {
  const errorMessage = document.querySelector('.error-message');
  const errorClose = document.querySelector('.error-close');
  
  if (errorClose) {
    errorClose.addEventListener('click', hideError);
  }
  
  if (errorMessage) {
    errorMessage.addEventListener('click', (e) => {
      if (e.target === errorMessage) {
        hideError();
      }
    });
  }
}

/**
 * Shows a custom error message
 * @param {string} message - The error message to display
 */
function showError(message) {
  const errorMessage = document.querySelector('.error-message');
  const errorText = document.querySelector('.error-text');
  
  if (errorText) {
    errorText.textContent = message;
  }
  
  if (errorMessage) {
    errorMessage.classList.add('visible');
  }
}

/**
 * Hides the custom error message
 */
function hideError() {
  const errorMessage = document.querySelector('.error-message');
  
  if (errorMessage) {
    errorMessage.classList.remove('visible');
  }
}

/**
 * Handles the password submission and sends it to the backend for verification
 * @param {string} password - The submitted password
 */
function handlePasswordSubmit(password) {
  if (!password.trim()) {
    showError('Please enter a password');
    return;
  }

  const loadingOverlay = document.querySelector('.loading-overlay');
  loadingOverlay.classList.add('visible');
  
  wakeUpServer()
    .then(() => authenticateWithServer(password))
    .then(data => {
      loadingOverlay.classList.remove('visible');
      
      if (data.success) {
        storeAuthToken(data.token);
        window.location.href = 'school';
      } else {
        showError('Invalid password.');
      }
    })
    .catch(error => {
      loadingOverlay.classList.remove('visible');
      showError(error.message);
    });
}

/**
 * Wakes up the server before authentication
 * @returns {Promise} A promise that resolves when the server is awake
 */
function wakeUpServer() {
  return fetch('https://n272-backend.onrender.com/api/wake-up');
}

/**
 * Authenticates with the server using the provided password
 * @param {string} password - The password to authenticate with
 * @returns {Promise} A promise that resolves with the authentication response
 */
function authenticateWithServer(password) {
  return fetch('https://n272-backend.onrender.com/api/school-authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password }),
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Invalid password or server error');
    }
    return response.json();
  });
}

/**
 * Stores the authentication token in local storage
 * @param {string} token - The authentication token to store
 */
function storeAuthToken(token) {
  localStorage.setItem('schoolAuthToken', token);
  localStorage.setItem('schoolAuthTime', Date.now().toString());
}

/**
 * Handles click events on options and navigates based on the selected option
 * @param {string} optionType - The type of option selected
 */
function handleOptionClick(optionType) {
  const optionsPanel = document.querySelector('.options-panel');
  const container = document.querySelector('.container');
  const stars = document.querySelectorAll('.star');
  const passwordModal = document.querySelector('.password-modal');

  if (optionType === 'school') {
    handleSchoolOptionClick(optionsPanel, passwordModal);
    return;
  }

  fadeOutPage(optionsPanel, container, stars);
  navigateTo(optionType);
}

/**
 * Handles the school option click
 * @param {HTMLElement} optionsPanel - The options panel element
 * @param {HTMLElement} passwordModal - The password modal element
 */
function handleSchoolOptionClick(optionsPanel, passwordModal) {
  optionsPanel.style.opacity = '0';
  optionsPanel.style.transform = 'scale(0.95)';
  optionsPanel.style.pointerEvents = 'none';
  
  setTimeout(() => {
    passwordModal.classList.add('visible');
    document.getElementById('school-password').focus();
  }, 900);
}

/**
 * Fades out the page elements
 * @param {HTMLElement} optionsPanel - The options panel element
 * @param {HTMLElement} container - The main container element
 * @param {NodeList} stars - The star elements
 */
function fadeOutPage(optionsPanel, container, stars) {
  optionsPanel.style.opacity = '0';
  optionsPanel.style.transform = 'scale(0.95)';
  optionsPanel.style.pointerEvents = 'none';

  container.classList.add('transitioning-out');

  stars.forEach((star) => {
    star.style.transition = 'opacity 0.8s ease';
    star.style.opacity = '0 !important';
    star.style.animationPlayState = 'paused';
  });

  const fadeOutStyle = document.createElement('style');
  fadeOutStyle.textContent = `
    .star {
      opacity: 0 !important;
      animation: none !important;
    }
    .shooting-star-container {
      opacity: 0 !important;
      animation: none !important;
    }
  `;
  document.head.appendChild(fadeOutStyle);
}

/**
 * Navigates to the selected option page
 * @param {string} optionType - The type of option to navigate to
 */
function navigateTo(optionType) {
  setTimeout(() => {
    window.location.href = optionType === 'btc' ? 'btc' : '#';
  }, 800);
}

/**
 * Creates a starfield background with optional twinkling
 * @param {boolean} isReturningFromBtc - Whether the user is returning from the BTC page
 */
function createStars(isReturningFromBtc) {
  const container = document.querySelector('.animated-background');
  if (!container) return;
  
  const starCount = isReturningFromBtc ? 350 : 250;
  
  for (let i = 0; i < starCount; i++) {
    createSingleStar(container, isReturningFromBtc);
  }
  
  if (!isReturningFromBtc) {
    setTimeout(revealStars, 600);
  } else {
    revealStars();
  }
}

/**
 * Creates a single star element and adds it to the container
 * @param {HTMLElement} container - The container for the stars
 * @param {boolean} isReturningFromBtc - Whether the user is returning from BTC page
 */
function createSingleStar(container, isReturningFromBtc) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  
  const size = Math.random() * 2 + 0.5;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  
  const initialOpacity = isReturningFromBtc ? (Math.random() * 0.5 + 0.2).toFixed(2) : 0;
  star.style.opacity = initialOpacity;
  
  if (!isReturningFromBtc) {
    star.style.transition = 'opacity 1.5s ease';
  }
  
  const shouldTwinkle = Math.random() > 0.3;
  if (shouldTwinkle) {
    const duration = Math.random() * 5 + 3;
    const delay = Math.random() * 3;
    star.setAttribute('data-original-opacity', '0.3');
    star.style.animation = `twinkle ${duration}s ease-in-out ${delay}s infinite`;
  } else {
    const brightness = (Math.random() * 0.5 + 0.2).toFixed(2);
    star.setAttribute('data-original-opacity', brightness);
  }
  
  container.appendChild(star);
}

/**
 * Reveals all stars with a fade-in effect
 */
function revealStars() {
  const stars = document.querySelectorAll('.star');
  stars.forEach(star => {
    if (star.style.opacity === '0') {
      const originalOpacity = star.getAttribute('data-original-opacity');
      star.style.opacity = originalOpacity;
    }
  });
}

/**
 * Creates and animates a shooting star
 */
function createShootingStar() {
  const container = document.querySelector('.animated-background');
  if (!container) return;
  
  const shootingStarContainer = document.createElement('div');
  shootingStarContainer.className = 'shooting-star-container';
  
  const shootingStar = document.createElement('div');
  shootingStar.className = 'shooting-star';
  
  const trail = document.createElement('div');
  trail.className = 'star-trail';
  
  shootingStarContainer.appendChild(shootingStar);
  shootingStarContainer.appendChild(trail);
  container.appendChild(shootingStarContainer);
  
  const top = Math.random() * 40 + 5;
  const left = Math.random() * 25 + 5;
  const size = Math.random() * 2 + 1;
  
  shootingStarContainer.style.top = `${top}%`;
  shootingStarContainer.style.left = `${left}%`;
  shootingStar.style.width = `${size}px`;
  shootingStar.style.height = `${size}px`;
  
  const trailLength = Math.random() * 150 + 50;
  trail.style.width = `${trailLength}px`;
  
  const angle = Math.random() * 20 + 20;
  shootingStarContainer.style.transform = `rotate(${angle}deg)`;
  
  const startTime = performance.now();
  const duration = Math.random() * 1500 + 1000;
  
  requestAnimationFrame(function animate(timestamp) {
    animateShootingStar(timestamp, startTime, duration, shootingStarContainer);
  });
  
  setTimeout(() => {
    shootingStarContainer.remove();
  }, duration + 100);
}

/**
 * Animates a shooting star across the screen
 * @param {number} timestamp - The current animation timestamp
 * @param {number} startTime - The time when the animation started
 * @param {number} duration - The duration of the animation
 * @param {HTMLElement} shootingStarContainer - The shooting star container element
 */
function animateShootingStar(timestamp, startTime, duration, shootingStarContainer) {
  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / duration, 1);
  
  const distance = 100;
  const currentDistance = distance * progress;
  
  shootingStarContainer.style.transform = `rotate(${shootingStarContainer.dataset.angle || 30}deg) translateX(${currentDistance}vw)`;
  
  if (progress < 0.2) {
    shootingStarContainer.style.opacity = progress / 0.2;
  } else if (progress > 0.8) {
    shootingStarContainer.style.opacity = (1 - progress) / 0.2;
  }
  
  if (progress < 1) {
    requestAnimationFrame((newTimestamp) => 
      animateShootingStar(newTimestamp, startTime, duration, shootingStarContainer)
    );
  }
}

const shootingStarStyles = document.createElement('style');
shootingStarStyles.textContent = `
  .shooting-star-container {
    position: absolute;
    z-index: 0;
    transform-origin: left center;
  }
  .star-head {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 3px;
    background-color: #fff;
    border-radius: 50%;
    box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.8);
  }
  .star-trail {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    height: 1.5px;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    transform-origin: right center;
  }
  @keyframes twinkle {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.9; }
  }
`;
document.head.appendChild(shootingStarStyles);
