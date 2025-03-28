/**
 * School Dashboard Scripts
 * Purpose: Implements interactivity and animations for the school dashboard interface.
 * Author: Nobody_272
 * Last Modified: 2025-03-28
 */

document.addEventListener('DOMContentLoaded', function () {
  initAnimatedBackground();
  initSchoolDashboard();
  initAdditionalEventHandlers();
});

/**
 * Initializes the animated background.
 */
function initAnimatedBackground() {
  createStars();
  setInterval(createShootingStar, 2000);
}

/**
 * Creates a starfield background with optional twinkling.
 */
function createStars() {
  const container = document.querySelector('.animated-background');
  if (!container) return;
  
  const starCount = 250;
  for (let i = 0; i < starCount; i++) {
    createSingleStar(container);
  }
  
  setTimeout(revealStars, 300);
}

/**
 * Creates a single star element and adds it to the container
 * @param {HTMLElement} container - The container for the stars
 */
function createSingleStar(container) {
  const star = document.createElement('div');
  star.classList.add('star');
  star.style.left = `${Math.random() * 100}%`;
  star.style.top = `${Math.random() * 100}%`;
  
  const size = Math.random() * 2 + 0.5;
  star.style.width = `${size}px`;
  star.style.height = `${size}px`;
  
  const shouldTwinkle = Math.random() > 0.3;
  star.style.transition = 'opacity 1.5s ease';
  star.style.opacity = 0;
  
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
    const originalOpacity = star.getAttribute('data-original-opacity');
    star.style.transition = `opacity 1.5s ease`;
    star.style.opacity = originalOpacity;
  });
}

/**
 * Initializes the school dashboard by setting up navigation, back button, class selector, and assignment filter.
 */
function initSchoolDashboard() {
  setupBackButton();
  setupNavigation();
  setupClassSelector();
  setupAssignmentFilter();
  animateDashboardEntrance();
  
  // Hide all non-active content sections on page load
  document.querySelectorAll('.content-section:not(.active)').forEach(section => {
    section.style.display = 'none';
  });
}

/**
 * Sets up the back button functionality.
 */
function setupBackButton() {
  const backButton = document.querySelector('.back-button');
  if (!backButton) return;
  
  backButton.addEventListener('click', handleBackButtonClick);
}

/**
 * Handles the back button click event
 */
function handleBackButtonClick() {
  const dashboard = document.querySelector('.school-dashboard');
  dashboard.style.opacity = '0';
  dashboard.style.transform = 'scale(0.95) translateY(-10px)';
  
  const container = document.querySelector('.container');
  const fadeOverlay = createFadeOverlay();
  container.appendChild(fadeOverlay);
  
  setTimeout(() => {
    fadeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
  }, 10);
  
  setTimeout(() => {
    window.location.href = '../';
  }, 800);
}

/**
 * Creates a fade overlay for transitions
 * @returns {HTMLElement} The created fade overlay
 */
function createFadeOverlay() {
  const fadeOverlay = document.createElement('div');
  fadeOverlay.className = 'fade-overlay';
  fadeOverlay.style.position = 'absolute';
  fadeOverlay.style.top = '0';
  fadeOverlay.style.left = '0';
  fadeOverlay.style.width = '100%';
  fadeOverlay.style.height = '100%';
  fadeOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0)';
  fadeOverlay.style.transition = 'background-color 0.8s ease-out';
  fadeOverlay.style.zIndex = '0';
  
  return fadeOverlay;
}

/**
 * Sets up navigation functionality so that only one content section is visible at a time.
 */
function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-menu li');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      handleNavItemClick(this, navItems);
    });
  });
  
  setupMobileNavigation();
}

/**
 * Handles a navigation item click
 * @param {HTMLElement} clickedItem - The clicked navigation item
 * @param {NodeList} allNavItems - All navigation items
 */
function handleNavItemClick(clickedItem, allNavItems) {
  allNavItems.forEach(nav => nav.classList.remove('active'));
  
  document.querySelectorAll('.content-section').forEach(section => {
    section.classList.remove('active');
    section.style.display = 'none';
  });
  
  clickedItem.classList.add('active');
  
  const sectionId = clickedItem.getAttribute('data-section');
  const targetSection = document.getElementById(sectionId);
  
  if (targetSection) {
    showTargetSection(targetSection);
  }
}

/**
 * Shows a target section with animation
 * @param {HTMLElement} targetSection - The section to show
 */
function showTargetSection(targetSection) {
  targetSection.style.display = 'block';
  targetSection.style.opacity = '0';
  targetSection.style.transform = 'translateY(20px)';
  
  void targetSection.offsetWidth; // Force reflow for transition
  
  targetSection.classList.add('active');
  targetSection.style.opacity = '1';
  targetSection.style.transform = 'translateY(0)';
}

/**
 * Sets up mobile navigation for smaller screens
 */
function setupMobileNavigation() {
  if (window.innerWidth > 768) return;
  
  const sidebarHeader = document.querySelector('.sidebar-header');
  const sidebar = document.querySelector('.sidebar');
  const navItems = document.querySelectorAll('.nav-menu li');
  
  if (sidebarHeader && sidebar) {
    sidebarHeader.addEventListener('click', function(e) {
      if (!e.target.closest('.back-button')) {
        sidebar.classList.toggle('expanded');
      }
    });
    
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        sidebar.classList.remove('expanded');
      });
    });
  }
}

/**
 * Sets up the class selector change event to update content based on the selected class.
 */
function setupClassSelector() {
  const classSelect = document.getElementById('class-select');
  if (!classSelect) return;
  
  classSelect.addEventListener('change', function() {
    updatePageTitle(this.value);
  });
}

/**
 * Updates the page title based on the selected class
 * @param {string} selectedClass - The selected class
 */
function updatePageTitle(selectedClass) {
  const pageTitle = document.querySelector('.section-header h2');
  if (!pageTitle) return;
  
  const currentSection = document.querySelector('.content-section.active').id;
  pageTitle.textContent = `${capitalizeFirstLetter(currentSection)} - ${capitalizeFirstLetter(selectedClass)}`;
}

/**
 * Sets up the assignment filter functionality.
 */
function setupAssignmentFilter() {
  const assignmentFilter = document.getElementById('assignment-filter');
  const assignmentItems = document.querySelectorAll('.assignment-item');
  
  if (!assignmentFilter || assignmentItems.length === 0) return;
  
  assignmentFilter.addEventListener('change', function() {
    filterAssignments(this.value, assignmentItems);
  });
}

/**
 * Filters assignments based on the selected filter value
 * @param {string} filterValue - The filter value
 * @param {NodeList} assignmentItems - The assignment items to filter
 */
function filterAssignments(filterValue, assignmentItems) {
  assignmentItems.forEach(item => {
    const status = item.querySelector('.assignment-status');
    if (!status) return;
    
    const statusText = status.textContent.toLowerCase();
    item.style.display = 
      filterValue === 'all' || filterValue === statusText ? 'flex' : 'none';
  });
}

/**
 * Animates the entrance of the dashboard.
 */
function animateDashboardEntrance() {
  const dashboard = document.querySelector('.school-dashboard');
  if (!dashboard) return;
  
  dashboard.style.opacity = '0';
  dashboard.style.transform = 'scale(0.95) translateY(10px)';
  
  setTimeout(function() {
    dashboard.style.opacity = '1';
    dashboard.style.transform = 'scale(1) translateY(0)';
  }, 100);
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} string - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Initializes additional event handlers for file downloads, uploads, and quiz interactions.
 */
function initAdditionalEventHandlers() {
  setupDownloadButtons();
  setupUploadButton();
  setupQuizButtons();
}

/**
 * Sets up download buttons
 */
function setupDownloadButtons() {
  const downloadButtons = document.querySelectorAll('.download-btn');
  downloadButtons.forEach(button => {
    button.addEventListener('click', function() {
      const fileName = this.closest('.file-item').querySelector('.file-name').textContent;
      alert(`Downloading ${fileName}...`);
    });
  });
}

/**
 * Sets up the upload button
 */
function setupUploadButton() {
  const uploadBtn = document.querySelector('.upload-btn');
  if (!uploadBtn) return;
  
  uploadBtn.addEventListener('click', function() {
    alert('File upload functionality would be implemented here.');
  });
}

/**
 * Sets up quiz-related buttons
 */
function setupQuizButtons() {
  setupReviewButtons();
  setupStartButtons();
}

/**
 * Sets up review buttons for quizzes
 */
function setupReviewButtons() {
  const reviewBtns = document.querySelectorAll('.review-btn');
  reviewBtns.forEach(button => {
    button.addEventListener('click', function() {
      const quizName = this.closest('.quiz-item').querySelector('h3').textContent;
      alert(`Opening review for ${quizName}`);
    });
  });
}

/**
 * Sets up start buttons for quizzes
 */
function setupStartButtons() {
  const startBtns = document.querySelectorAll('.start-btn');
  startBtns.forEach(button => {
    button.addEventListener('click', function() {
      const quizName = this.closest('.quiz-item').querySelector('h3').textContent;
      alert(`Starting quiz: ${quizName}`);
    });
  });
}