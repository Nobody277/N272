/**
 * File: script.js
 * Purpose: Implements the starry background animation, shooting stars, and options panel interactions.
 * Author: Nobody_272
 * Last Modified: 2025-03-28
 */

document.addEventListener('DOMContentLoaded', () => {
  const isReturningFromBtc = document.referrer.includes('btc.html');
  createStars(isReturningFromBtc);
  setInterval(createShootingStar, 2000);

  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    const background = document.querySelector('.animated-background');
    background.style.backgroundPosition = `${mouseX * 5 + 45}% ${mouseY * 5 + 45}%`;
  });

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

  // Password modal event listeners
  const passwordModal = document.querySelector('.password-modal');
  const passwordInput = document.getElementById('school-password');
  const passwordSubmit = document.getElementById('password-submit');

  // Close modal when clicking outside the password container
  passwordModal.addEventListener('click', (e) => {
    if (e.target === passwordModal) {
      passwordModal.classList.remove('visible');
      // Re-show options panel when password modal is closed
      optionsPanel.style.opacity = '1';
      optionsPanel.style.transform = 'scale(1)';
      optionsPanel.style.pointerEvents = 'auto';
    }
  });

  // Handle submit button click
  passwordSubmit.addEventListener('click', () => {
    handlePasswordSubmit(passwordInput.value);
  });

  // Handle Enter key press
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit(passwordInput.value);
    }
  });
});

/**
 * Handles the password submission and sends it to the backend for verification.
 * @param {string} password - The submitted password.
 */
function handlePasswordSubmit(password) {
  if (!password.trim()) {
    alert('Please enter a password');
    return;
  }

  // Contact the backend at your Render URL
  fetch('https://n272-backend.onrender.com/api/school-authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid password or server error');
      }
      return response.json();
    })
    .then(data => {
      if (data.success) {
        // Successful authentication; redirect to the school section
        window.location.href = 'school.html?transition=true';
      } else {
        alert('Invalid password.');
      }
    })
    .catch(error => {
      console.error('Error during authentication:', error);
      alert('Error: ' + error.message);
    });
}

/**
 * Handles click events on options and navigates based on the selected option.
 * @param {string} optionType - The type of option selected.
 */
function handleOptionClick(optionType) {
  try {
    const optionsPanel = document.querySelector('.options-panel');
    const container = document.querySelector('.container');
    const stars = document.querySelectorAll('.star');
    const shootingStars = document.querySelectorAll('.shooting-star-container');
    const passwordModal = document.querySelector('.password-modal');

    if (optionType === 'school') {
      // Show password modal instead of transitioning out immediately
      optionsPanel.style.opacity = '0';
      optionsPanel.style.transform = 'scale(0.95)';
      optionsPanel.style.pointerEvents = 'none';
      
      // Wait for options to fade out completely before showing password modal
      setTimeout(() => {
        passwordModal.classList.add('visible');
        document.getElementById('school-password').focus();
      }, 900);
      
      return;
    }

    // For other options, proceed with the original transition
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
      .transitioning-out .star {
        opacity: 0 !important;
        transition: opacity 0.8s ease !important;
        animation-play-state: paused !important;
      }
      .transitioning-out .shooting-star-container {
        opacity: 0 !important;
        transition: opacity 0.8s ease !important;
      }
    `;
    document.head.appendChild(fadeOutStyle);

    shootingStars.forEach((star) => {
      if (star) {
        star.style.transition = 'opacity 0.8s ease';
        star.style.opacity = '0';
      }
    });

    switch (optionType) {
      case 'btc':
        setTimeout(() => {
          window.location.href = 'btc.html?transition=true';
        }, 900);
        break;
      case 'tbd':
        setTimeout(() => {
          alert('Navigating to TBD...');
        }, 1000);
        break;
      default:
        break;
    }
  } catch (error) {
    throw new Error(`Error in handleOptionClick: ${error.message}`);
  }
}

/**
 * Creates star elements in the background and fades them in.
 * @param {boolean} isReturningFromBtc - Indicates if returning from the BTC page.
 */
function createStars(isReturningFromBtc) {
  const container = document.querySelector('.container');
  const starCount = 250;
  const initialOpacity = '0';

  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    const size = Math.random() * 2 + 0.5;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    const shouldTwinkle = Math.random() > 0.3;
    star.style.transition = 'opacity 1.5s ease';
    star.style.opacity = initialOpacity;
    if (shouldTwinkle) {
      star.setAttribute('data-original-opacity', '0.3');
      const duration = Math.random() * 7 + 5;
      const delay = Math.random() * 15;
      star.style.animation = `twinkle ${duration}s ease-in-out ${delay}s infinite`;
    } else {
      const brightness = Math.random() * 0.7 + 0.3;
      star.setAttribute('data-original-opacity', brightness);
    }
    container.appendChild(star);
  }

  const fadeInDelay = isReturningFromBtc ? 300 : 500;
  setTimeout(() => {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star) => {
      const originalOpacity = star.getAttribute('data-original-opacity');
      star.style.opacity = originalOpacity;
    });
  }, fadeInDelay);
}

/**
 * Creates a shooting star element with a continuous trail animation.
 */
function createShootingStar() {
  const container = document.querySelector('.container');

  if (Math.random() > 0.5) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const edgeStart = Math.floor(Math.random() * 4);
    let startX, startY, angle;

    switch (edgeStart) {
      case 0:
        startX = Math.random() * viewportWidth * 1.5 - viewportWidth * 0.25;
        startY = -50;
        angle = Math.random() * 30 + 30;
        if (startX > viewportWidth / 2) angle = -angle;
        break;
      case 1:
        startX = viewportWidth + 50;
        startY = Math.random() * viewportHeight * 0.7;
        angle = Math.random() * 30 + 150;
        break;
      case 2:
        if (Math.random() > 0.7) {
          startX = Math.random() * viewportWidth;
          startY = viewportHeight + 50;
          angle = Math.random() * 30 - 120;
        } else {
          startX = Math.random() * viewportWidth;
          startY = -50;
          angle = Math.random() * 30 + 30;
          if (startX > viewportWidth / 2) angle = -angle;
        }
        break;
      case 3:
        startX = -50;
        startY = Math.random() * viewportHeight * 0.7;
        angle = Math.random() * 30;
        break;
      default:
        startX = 0;
        startY = 0;
        angle = 45;
        break;
    }

    const angleRad = (angle * Math.PI) / 180;
    const diagonalLength =
      Math.sqrt(viewportWidth ** 2 + viewportHeight ** 2) * 1.5;
    const endX = startX + Math.cos(angleRad) * diagonalLength;
    const endY = startY + Math.sin(angleRad) * diagonalLength;

    const shootingStarContainer = document.createElement('div');
    shootingStarContainer.classList.add('shooting-star-container');
    shootingStarContainer.style.left = `${startX}px`;
    shootingStarContainer.style.top = `${startY}px`;
    shootingStarContainer.style.transform = `rotate(${angle}deg)`;
    shootingStarContainer.style.transition = 'opacity 1.5s ease';
    shootingStarContainer.style.opacity = '0';

    const starHead = document.createElement('div');
    starHead.classList.add('star-head');
    const trail = document.createElement('div');
    trail.classList.add('star-trail');
    shootingStarContainer.appendChild(trail);
    shootingStarContainer.appendChild(starHead);
    container.appendChild(shootingStarContainer);

    const isReturningFromBtc = document.referrer.includes('btc.html');
    const fadeInDelay = isReturningFromBtc ? 300 : 500;
    setTimeout(() => {
      shootingStarContainer.style.opacity = '1';
    }, fadeInDelay);

    const speed = Math.random() * 600 + 500;
    const totalDistance = Math.sqrt(
      (endX - startX) ** 2 + (endY - startY) ** 2
    );
    const duration = totalDistance / speed;
    const startTime = performance.now();
    let trailLength = 0;
    const maxTrailLength = Math.random() * 150 + 100;

    function animateShootingStar(timestamp) {
      const elapsed = (timestamp - startTime) / 1000;
      if (elapsed < duration) {
        const progress = elapsed / duration;
        const distance = totalDistance * progress;
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        shootingStarContainer.style.left = `${currentX}px`;
        shootingStarContainer.style.top = `${currentY}px`;
        trailLength = distance < maxTrailLength ? distance : maxTrailLength;
        trail.style.width = `${trailLength}px`;
        requestAnimationFrame(animateShootingStar);
      } else {
        shootingStarContainer.remove();
      }
    }
    requestAnimationFrame(animateShootingStar);
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
