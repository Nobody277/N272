/**
 * School Authentication Script
 * Purpose: Verifies user authentication for school page access
 * Author: Nobody_272
 * Last Modified: 2025-03-28
 */

document.addEventListener('DOMContentLoaded', () => {
  const loadingOverlay = createOrUpdateLoadingOverlay();
  loadingOverlay.classList.add('visible');
  verifyAuthentication(loadingOverlay);
});

/**
 * Creates or updates the loading overlay
 * @returns {HTMLElement} The loading overlay element
 */
function createOrUpdateLoadingOverlay() {
  let loadingOverlay = document.querySelector('.loading-overlay');
  
  if (!loadingOverlay) {
    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Authenticating...</div>
    `;
    document.body.appendChild(loadingOverlay);
  } else {
    const loadingText = loadingOverlay.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'Authenticating...';
    }
  }
  
  return loadingOverlay;
}

/**
 * Verifies user authentication by checking for a valid token
 * Redirects to main page if authentication fails
 * @param {HTMLElement} loadingOverlay - The loading overlay element
 */
function verifyAuthentication(loadingOverlay) {
  const token = localStorage.getItem('schoolAuthToken');
  const authTime = localStorage.getItem('schoolAuthTime');
  
  if (!isTokenValid(token, authTime)) {
    redirectToLogin();
    return;
  }
  
  verifyTokenWithServer(token, loadingOverlay);
}

/**
 * Checks if token exists and has not expired
 * @param {string} token - The authentication token
 * @param {string} authTime - The authentication timestamp
 * @returns {boolean} Whether the token is valid
 */
function isTokenValid(token, authTime) {
  if (!token || !authTime) {
    return false;
  }
  
  const currentTime = Date.now();
  const tokenAge = currentTime - parseInt(authTime);
  const expiryTime = 12 * 60 * 60 * 1000; // 12 hours
  
  return tokenAge <= expiryTime;
}

/**
 * Verifies the token with the server
 * @param {string} token - The authentication token
 * @param {HTMLElement} loadingOverlay - The loading overlay element
 */
function verifyTokenWithServer(token, loadingOverlay) {
  fetch('https://n272-backend.onrender.com/api/verify-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ token }),
    credentials: 'include'
  })
  .then(response => handleServerResponse(response))
  .then(data => {
    if (data && (data.authenticated || data.success)) {
      authenticateSuccess(loadingOverlay);
    } else {
      redirectToLogin();
    }
  })
  .catch(error => {
    setTimeout(redirectToLogin, 2000);
  });
}

/**
 * Handles the server response
 * @param {Response} response - The server response
 * @returns {Promise} A promise that resolves to the response JSON
 */
function handleServerResponse(response) {
  if (response.status >= 200 && response.status < 300) {
    return response.json();
  }
  
  if (response.status === 401 || response.status === 403) {
    throw new Error('Token rejected by server');
  }
  
  throw new Error(`Server error: ${response.status}`);
}

/**
 * Handle successful authentication
 * @param {HTMLElement} loadingOverlay - The loading overlay element
 */
function authenticateSuccess(loadingOverlay) {
  localStorage.setItem('schoolAuthTime', Date.now().toString());
  
  if (loadingOverlay) {
    loadingOverlay.classList.remove('visible');
  }
}

/**
 * Redirects the user to the login page
 */
function redirectToLogin() {
  localStorage.removeItem('schoolAuthToken');
  localStorage.removeItem('schoolAuthTime');
  
  window.location.href = '../';
} 