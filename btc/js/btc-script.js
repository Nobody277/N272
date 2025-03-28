/**
 * @file btc-script.js
 * @description Handles BTC Dashboard functionality including live price updates, chart initialization, API rate limiting, UI animations, and dashboard data updates.
 * @author Nobody_272
 * @lastModified 2025-03-28
 */

document.addEventListener('DOMContentLoaded', () => {
    window.currentBTCPrice = null;
    window.lastPriceUpdate = 0;
    window.apiCallHistory = {};
    window.cachedChartData = {};
    window.cachedDashboardData = null;
    window.cacheTimestamps = {};
    window.pauseRealtimeUpdates = false;
  
    createStars();
    setInterval(createShootingStar, 2000);
    animateEntrance();
    initializeChart();
    setupTimePeriodButtons();
    setupBackButton();
    initializeApiRateLimiting();
    fetchLivePrice();
    loadRealBTCData('12h');
  
    setInterval(fetchLivePrice, 30000);
    setInterval(() => {
      const activePeriod = document.querySelector('.time-btn.active').innerText;
      if (!window.pauseRealtimeUpdates) {
        const cacheKey = `chart:${activePeriod}`;
        if (!isCacheValid(cacheKey, 120000)) {
          loadRealBTCData(activePeriod);
        }
      }
    }, 120000);
    setInterval(updateDashboardInfo, 120000);
    updateDashboardInfo();
    updateTransactionTimestamps();
    setInterval(generateRandomTransactions, 300000);
    connectWebSocket();
  
    const style = document.createElement('style');
    style.textContent = `
      .chart-container {
        height: 300px !important;
        width: 100% !important;
        position: relative !important;
        box-sizing: border-box !important;
      }
      .chart-container canvas {
        box-sizing: border-box !important;
      }
      .btc-price::after {
        content: " USD";
        font-size: 0.8em;
        opacity: 0.7;
        margin-left: 2px;
      }
    `;
    document.head.appendChild(style);
  });
  
  /**
   * Initializes API rate limiting.
   */
  function initializeApiRateLimiting() {
    window.apiCallHistory = { coincap: [] };
    window.apiRateLimits = {
      coincap: {
        callsPerMinute: 100,
        callsPerHour: 2000,
      },
    };
  }
  
  /**
   * Checks if an API call can be made under the current rate limits.
   * @param {string} apiName - The API identifier.
   * @returns {boolean} True if the call is allowed.
   */
  function canMakeApiCall(apiName) {
    if (!window.apiCallHistory || !window.apiCallHistory[apiName]) {
      return true;
    }
    const now = Date.now();
    const recentCallsPerMinute = window.apiCallHistory[apiName].filter(ts => ts > now - 60000);
    const recentCallsPerHour = window.apiCallHistory[apiName].filter(ts => ts > now - 3600000);
    return (
      recentCallsPerMinute.length < window.apiRateLimits[apiName].callsPerMinute &&
      recentCallsPerHour.length < window.apiRateLimits[apiName].callsPerHour
    );
  }
  
  /**
   * Records an API call timestamp for rate limiting.
   * @param {string} apiName - The API identifier.
   */
  function recordApiCall(apiName) {
    if (!window.apiCallHistory || !window.apiCallHistory[apiName]) return;
    window.apiCallHistory[apiName].push(Date.now());
    const oneHourAgo = Date.now() - 3600000;
    window.apiCallHistory[apiName] = window.apiCallHistory[apiName].filter(ts => ts > oneHourAgo);
  }
  
  /**
   * Animates the dashboard and background entrance.
   */
  function animateEntrance() {
    const dashboard = document.querySelector('.dashboard');
    const stars = document.querySelectorAll('.star');
    const backgroundStars = document.querySelectorAll('.shooting-star-container');
  
    dashboard.style.opacity = '0';
    dashboard.style.transform = 'scale(0.95)';
  
    stars.forEach(star => {
      star.style.transition = 'opacity 1s ease';
      star.style.opacity = '0';
    });
    backgroundStars.forEach(star => {
      if (star) {
        star.style.transition = 'opacity 1s ease';
        star.style.opacity = '0';
      }
    });
    setTimeout(() => {
      dashboard.style.opacity = '1';
      dashboard.style.transform = 'scale(1)';
      stars.forEach(star => {
        star.style.opacity =
          star.getAttribute('data-original-opacity') ||
          (Math.random() * 0.7 + 0.3).toString();
      });
      backgroundStars.forEach(star => {
        if (star) star.style.opacity = '1';
      });
    }, 300);
  }
  
  /**
   * Initializes the Chart.js chart for BTC price.
   */
  function initializeChart() {
    const canvas = document.getElementById('btcChart');
    const ctx = canvas.getContext('2d');
    canvas.height = 300;
    canvas.style.height = '300px';
    canvas.style.width = '100%';
  
    const chartConfig = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: 'BTC Price',
            data: [],
            borderColor: 'rgba(255, 255, 255, 0.8)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 255, 255, 0.8)',
            pointHoverBorderWidth: 2,
            tension: 0.4,
            fill: true,
            spanGaps: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        devicePixelRatio: 2,
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            titleColor: 'rgba(255, 255, 255, 0.9)',
            bodyColor: 'rgba(255, 255, 255, 0.8)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: context => `$${context.parsed.y.toFixed(2)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: true, color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 10 },
              maxRotation: 0,
              maxTicksLimit: 8,
            },
          },
          y: {
            grid: { display: true, color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
            ticks: {
              color: 'rgba(255, 255, 255, 0.5)',
              font: { size: 10 },
              callback: value => '$' + value.toLocaleString(),
              maxTicksLimit: 6,
            },
            beginAtZero: false,
            suggestedMin: null,
            suggestedMax: null,
          },
        },
        interaction: { mode: 'index', intersect: false },
        animations: {
          tension: { duration: 1000, easing: 'easeOutQuad' },
          colors: { duration: 1000, easing: 'easeOutQuad' },
          y: { duration: 1000, easing: 'easeInOutCubic' },
        },
        transition: { duration: 600 },
        layout: { padding: { top: 5, right: 10, bottom: 5, left: 10 } },
      },
    };
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.btcChart = new Chart(ctx, chartConfig);
    window.lastChartUpdate = Date.now();
    window.realtimeData = { labels: [], prices: [] };
    window.priceRange = { min: null, max: null };
  }
  
  /**
   * Sets up the time period buttons and debounces period changes.
   */
  function setupTimePeriodButtons() {
    const timeButtons = document.querySelectorAll('.time-btn');
    let lastPeriodChange = 0;
    let periodChangeTimeout = null;
  
    timeButtons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;
        
        const prevActivePeriod = document.querySelector('.time-btn.active')?.innerText;
        if (prevActivePeriod && window.chartRetryTimers && window.chartRetryTimers[prevActivePeriod]) {
          clearTimeout(window.chartRetryTimers[prevActivePeriod]);
          delete window.chartRetryTimers[prevActivePeriod];
        }
        
        timeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
  
        const period = button.innerText;
        document.querySelector('.chart-header h2').innerText = `Price History (${period})`;
        const changePeriod = document.querySelector('.change-period');
        if (changePeriod) changePeriod.textContent = period;
  
        if (periodChangeTimeout) clearTimeout(periodChangeTimeout);
  
        const now = Date.now();
        const cacheKey = `chart:${period}`;
        const hasCachedData = window.cachedChartData && window.cachedChartData[period];
  
        if (hasCachedData && isCacheValid(cacheKey, 60000)) {
          updateChartWithData(window.cachedChartData[period], period);
        } else if (now - lastPeriodChange < 1000) {
          periodChangeTimeout = setTimeout(() => {
            updateChart(period);
            lastPeriodChange = Date.now();
          }, 1000);
        } else {
          updateChart(period);
          lastPeriodChange = now;
        }
      });
    });
  }
  
  /**
   * Updates the chart when a new period is selected.
   * @param {string} period - The selected time period.
   */
  function updateChart(period) {
    const chartContainer = document.querySelector('.chart-container');
    if (chartContainer) {
      chartContainer.classList.add('loading-transition');
      setTimeout(() => {
        chartContainer.classList.remove('loading-transition');
      }, 1500);
    }
    loadRealBTCData(period);
    document.querySelector('.chart-header h2').innerText = `Price History (${period})`;
    const changePeriod = document.querySelector('.change-period');
    if (changePeriod) changePeriod.textContent = period;
  }
  
  /**
   * Sets up the back button with a fade-out animation.
   */
  function setupBackButton() {
    const backButton = document.querySelector('.back-button');
    const dashboard = document.querySelector('.dashboard');
    const container = document.querySelector('.container');
    const stars = document.querySelectorAll('.star');
    const shootingStars = document.querySelectorAll('.shooting-star-container');
  
    backButton.addEventListener('click', e => {
      e.preventDefault();
      dashboard.style.opacity = '0';
      dashboard.style.transform = 'scale(0.95)';
      container.classList.add('transitioning-out');
  
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
  
      stars.forEach(star => {
        star.style.transition = 'opacity 0.8s ease';
        star.style.opacity = '0 !important';
        star.style.animationPlayState = 'paused';
      });
      shootingStars.forEach(star => {
        if (star) {
          star.style.transition = 'opacity 0.8s ease';
          star.style.opacity = '0';
        }
      });
  
      setTimeout(() => {
        window.location.href = '../';
      }, 900);
    });
  }
  
  /**
   * Creates a starry background.
   */
  function createStars() {
    const container = document.querySelector('.container');
    const starCount = 250;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const size = Math.random() * 2 + 0.5;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      if (Math.random() > 0.3) {
        star.style.opacity = '0.3';
        star.setAttribute('data-original-opacity', '0.3');
        const duration = Math.random() * 7 + 5;
        const delay = Math.random() * 15;
        star.style.animation = `twinkle ${duration}s ease-in-out ${delay}s infinite`;
      } else {
        const brightness = Math.random() * 0.7 + 0.3;
        star.style.opacity = brightness;
        star.setAttribute('data-original-opacity', brightness);
      }
      container.appendChild(star);
    }
  }
  
  /**
   * Connects to the WebSocket for real-time BTC price updates.
   */
  function connectWebSocket() {
    try {
      const socket = new WebSocket('wss://streamer.cryptocompare.com/v2');
      socket.addEventListener('open', event => {
        const subRequest = {
          action: 'SubAdd',
          subs: ['0~Coinbase~BTC~USD'],
        };
        socket.send(JSON.stringify(subRequest));
        if (window.wsReconnectTimer) {
          clearTimeout(window.wsReconnectTimer);
          window.wsReconnectTimer = null;
        }
        window.wsConnected = true;
        stopFallbackPricePolling();
        window.wsPingInterval = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ action: 'Ping' }));
          } else {
            clearInterval(window.wsPingInterval);
          }
        }, 25000);
      });
      socket.addEventListener('error', event => {
        startFallbackPricePolling();
        window.wsConnected = false;
        if (window.wsPingInterval) {
          clearInterval(window.wsPingInterval);
          window.wsPingInterval = null;
        }
        scheduleWebSocketReconnection();
      });
      socket.addEventListener('close', event => {
        startFallbackPricePolling();
        window.wsConnected = false;
        if (window.wsPingInterval) {
          clearInterval(window.wsPingInterval);
          window.wsPingInterval = null;
        }
        scheduleWebSocketReconnection();
      });
      socket.addEventListener('message', event => {
        try {
          const data = JSON.parse(event.data);
          if (data.TYPE === 'PONG') return;
          if (data.TYPE === '0' && data.FROMSYMBOL === 'BTC' && data.TOSYMBOL === 'USD') {
            const now = Date.now();
            if (now - window.lastPriceUpdate > 5000 && !window.pauseRealtimeUpdates) {
              updateRealtimePrice(data.PRICE);
              window.lastPriceUpdate = now;
              const activePeriod = document.querySelector('.time-btn.active')?.innerText;
              if (activePeriod === '12h') {
                addRealtimeDataPoint(data.PRICE);
              }
            }
          }
        } catch (error) {
        }
      });
      window.priceSocket = socket;
    } catch (error) {
      startFallbackPricePolling();
    }
  }
  
  /**
   * Schedules a WebSocket reconnection using exponential backoff.
   */
  function scheduleWebSocketReconnection() {
    if (window.wsReconnectTimer) clearTimeout(window.wsReconnectTimer);
    const reconnectAttempt = window.wsReconnectAttempts || 0;
    const baseDelay = 5000;
    const maxDelay = 120000;
    const reconnectDelay = Math.min(baseDelay * Math.pow(2, reconnectAttempt), maxDelay);
    window.wsReconnectTimer = setTimeout(() => {
      window.wsReconnectAttempts = (window.wsReconnectAttempts || 0) + 1;
      if (!window.wsConnected) connectWebSocket();
    }, reconnectDelay);
  }
  
  /**
   * Starts fallback price polling if WebSocket is not available.
   */
  function startFallbackPricePolling() {
    if (!window.fallbackPriceInterval) {
      window.fallbackPriceInterval = setInterval(fetchLivePrice, 30000);
    }
  }
  
  /**
   * Stops fallback price polling.
   */
  function stopFallbackPricePolling() {
    if (window.fallbackPriceInterval) {
      clearInterval(window.fallbackPriceInterval);
      window.fallbackPriceInterval = null;
    }
  }
  
  /**
   * Fetches the current live BTC price.
   */
  async function fetchLivePrice() {
    const now = Date.now();
    if (now - window.lastPriceUpdate < 15000 || window.pauseRealtimeUpdates) return;
    if (!canMakeApiCall('coincap')) {
      const priceElement = document.querySelector('.btc-price');
      if (priceElement && priceElement.textContent === 'Loading...') {
        priceElement.textContent = 'Rate Limited';
        setTimeout(() => {
          if (priceElement.textContent === 'Rate Limited') {
            priceElement.textContent = 'Loading...';
          }
        }, 60000);
      }
      return;
    }
    try {
      const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
      recordApiCall('coincap');
      window.lastPriceUpdate = Date.now();
      if (!response.ok) throw new Error(`Failed to fetch current price: ${response.status}`);
      const data = await response.json();
      const price = parseFloat(data.data.priceUsd);
      updateRealtimePrice(price);
      updateCacheTimestamp('price:btc');
      const activePeriod = document.querySelector('.time-btn.active')?.innerText;
      if (activePeriod === '12h') {
        addRealtimeDataPoint(price);
      }
    } catch (error) {
      const priceElement = document.querySelector('.btc-price');
      if (priceElement && priceElement.textContent === 'Loading...') {
        priceElement.textContent = 'Data Unavailable';
        setTimeout(() => {
          if (priceElement.textContent === 'Data Unavailable') {
            priceElement.textContent = 'Loading...';
          }
        }, 5000);
      }
    }
  }
  
  /**
   * Updates the displayed BTC price and triggers animations for price changes.
   * @param {number} price - The new BTC price.
   */
  function updateRealtimePrice(price) {
    const formattedPrice = parseFloat(price).toFixed(2);
    const priceElement = document.querySelector('.btc-price');
    if (priceElement) {
      if (window.currentBTCPrice !== null) {
        const priceDiff = price - window.currentBTCPrice;
        if (Math.abs(priceDiff) > 0.01) {
          const priceChangeElement = document.createElement('div');
          priceChangeElement.classList.add('price-change-float');
          priceChangeElement.textContent = `${priceDiff > 0 ? '+' : ''}${priceDiff.toFixed(2)}`;
          const priceCard = document.querySelector('.price-card');
          if (priceCard) {
            priceCard.appendChild(priceChangeElement);
            setTimeout(() => {
              if (priceChangeElement.parentNode) {
                priceChangeElement.parentNode.removeChild(priceChangeElement);
              }
            }, 2000);
          }
        }
        if (price > window.currentBTCPrice) {
          priceElement.classList.remove('price-down');
          priceElement.classList.add('price-up');
          setTimeout(() => priceElement.classList.remove('price-up'), 1000);
        } else if (price < window.currentBTCPrice) {
          priceElement.classList.remove('price-up');
          priceElement.classList.add('price-down');
          setTimeout(() => priceElement.classList.remove('price-down'), 1000);
        }
      }
      priceElement.textContent = formattedPrice;
      window.currentBTCPrice = price;
      updateBalanceCard(price);
      const balanceDisplay = document.querySelector('.balance-amount .amount');
      if (balanceDisplay && (balanceDisplay.textContent === 'Loading...' || balanceDisplay.textContent === 'Loading.')) {
        const btcBalance = 0.8756;
        balanceDisplay.textContent = btcBalance.toFixed(4);
      }
    }
  }
  
  /**
   * Adds a new data point to the chart for real-time updates.
   * @param {number} price - The new BTC price.
   */
  function addRealtimeDataPoint(price) {
    const chart = window.btcChart;
    const activePeriod = document.querySelector('.time-btn.active')?.innerText || '12h';
    if (!chart || activePeriod !== '12h' || window.pauseRealtimeUpdates) return;
    const now = Date.now();
    if (window.lastChartUpdate && now - window.lastChartUpdate < 30000) return;
    const currentDate = new Date();
    let hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const timeLabel = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    window.realtimeData.labels.push(timeLabel);
    window.realtimeData.prices.push(price);
    if (window.realtimeData.labels.length > 24) {
      window.realtimeData.labels.shift();
      window.realtimeData.prices.shift();
    }
    if (price > window.priceRange.max) {
      window.priceRange.max = price * 1.05;
      chart.options.scales.y.max = window.priceRange.max;
    } else if (price < window.priceRange.min) {
      window.priceRange.min = price * 0.95;
      chart.options.scales.y.min = window.priceRange.min;
    }
    chart.data.labels = [...window.realtimeData.labels];
    chart.data.datasets[0].data = [...window.realtimeData.prices];
    chart.update();
    window.lastChartUpdate = now;
  }
  
  /**
   * Fetches historical BTC price data and updates the chart.
   * @param {string} period - The selected time period (e.g., '12h', '24h', '7d').
   */
  async function loadRealBTCData(period) {
    let interval, limit;
    switch (period) {
      case '24h':
        interval = 'h1';
        limit = 24;
        break;
      case '7d':
        interval = 'h6';
        limit = 28;
        break;
      default:
        interval = 'm30';
        limit = 24;
        break;
    }
    try {
      const cacheKey = `chart:${period}`;
      const hasCachedData = window.cachedChartData && window.cachedChartData[period];
      const chartContainer = document.querySelector('.chart-container');
      if (!hasCachedData && chartContainer) chartContainer.classList.add('loading');
      window.pauseRealtimeUpdates = true;
      cleanupExpiredCache();
      const isCached = hasCachedData && isCacheValid(cacheKey, 1800000);
      const canCallApi = canMakeApiCall('coincap');
      const useCache = hasCachedData && (isCached || !canCallApi);
      if (useCache) {
        updateChartWithData(window.cachedChartData[period], period);
        if (chartContainer) chartContainer.classList.remove('loading');
        setTimeout(() => {
          window.pauseRealtimeUpdates = false;
        }, 1000);
        return;
      }
      if (!canCallApi && !useCache) {
        if (chartContainer) chartContainer.classList.remove('loading');
        const chartHeader = document.querySelector('.chart-header h2');
        if (chartHeader) {
          const originalText = chartHeader.textContent;
          chartHeader.textContent = 'Chart Data Unavailable (Rate Limited)';
          setTimeout(() => {
            chartHeader.textContent = originalText;
          }, 3000);
        }
        
        const retryDelay = 5000;
        if (!window.chartRetryTimers) window.chartRetryTimers = {};
        
        if (window.chartRetryTimers[period]) {
          clearTimeout(window.chartRetryTimers[period]);
        }
        
        window.chartRetryTimers[period] = setTimeout(() => {
          console.log(`Retrying chart data load for ${period} after rate limit`);
          loadRealBTCData(period);
          delete window.chartRetryTimers[period];
        }, retryDelay);
        
        const chart = window.btcChart;
        if (chart) {
          if (!chart.options.plugins.annotation) {
            chart.options.plugins.annotation = { annotations: {} };
          }
          chart.options.plugins.annotation.annotations.retryBox = {
            type: 'box',
            xMin: 'center',
            xMax: 'center',
            yMin: 'center',
            yMax: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'Retrying in 5s...',
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 14 },
            },
          };
          chart.update();
        }
        
        setTimeout(() => {
          window.pauseRealtimeUpdates = false;
        }, 1000);
        return;
      }
      const now = Date.now();
      let start, end;
      if (period === '7d') {
        start = now - 7 * 24 * 60 * 60 * 1000;
        end = now;
      } else if (period === '24h') {
        start = now - 24 * 60 * 60 * 1000;
        end = now;
      } else {
        start = now - 12 * 60 * 60 * 1000;
        end = now;
      }
      const startTs = Math.floor(start);
      const endTs = Math.floor(end);
      const apiUrl = `https://api.coincap.io/v2/assets/bitcoin/history?interval=${interval}&start=${startTs}&end=${endTs}`;
      const response = await fetch(apiUrl);
      recordApiCall('coincap');
      if (!response.ok) throw new Error(`Failed to fetch Bitcoin data: ${response.status}`);
      const data = await response.json();
      const prices = data.data || [];
      if (!prices || prices.length === 0) throw new Error('No price data received');
      const labels = [];
      const priceValues = [];
      let minPrice = Number.MAX_VALUE;
      let maxPrice = Number.MIN_VALUE;
      let lastTimestamp = 0;
      const targetPointCount = 24;
      const dataLength = prices.length;
      const samplingRate = Math.max(1, Math.floor(dataLength / targetPointCount));
      prices.forEach((pricePoint, index) => {
        if (index === 0 || index === dataLength - 1 || index % samplingRate === 0) {
          const timestamp = pricePoint.time;
          const price = parseFloat(pricePoint.priceUsd);
          if (timestamp < lastTimestamp) return;
          lastTimestamp = timestamp;
          const date = new Date(timestamp);
          let hours = date.getHours();
          const minutes = date.getMinutes();
          const ampm = hours >= 12 ? 'PM' : 'AM';
          hours = hours % 12 || 12;
          let timeLabel;
          if (period === '7d') {
            timeLabel = `${date.getMonth() + 1}/${date.getDate()} ${hours}${ampm}`;
          } else {
            timeLabel = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
          }
          labels.push(timeLabel);
          priceValues.push(price);
          minPrice = Math.min(minPrice, price);
          maxPrice = Math.max(maxPrice, price);
        }
      });
      const paddingBuffer = (maxPrice - minPrice) * 0.1;
      minPrice -= paddingBuffer;
      maxPrice += paddingBuffer;
      window.cachedChartData[period] = { labels, priceValues, minPrice, maxPrice, timestamp: Date.now() };
      updateCacheTimestamp(`chart:${period}`);
      updateChartWithData(window.cachedChartData[period], period);
      if (chartContainer) chartContainer.classList.remove('loading');
      setTimeout(() => {
        window.pauseRealtimeUpdates = false;
      }, 1000);
    } catch (error) {
      const chartContainer = document.querySelector('.chart-container');
      if (chartContainer) chartContainer.classList.remove('loading');
      
      if (window.chartRetryTimers && window.chartRetryTimers[period]) {
        clearTimeout(window.chartRetryTimers[period]);
        delete window.chartRetryTimers[period];
      }
      
      if (window.cachedChartData && window.cachedChartData[period]) {
        updateChartWithData(window.cachedChartData[period], period);
      } else {
        const chartHeader = document.querySelector('.chart-header h2');
        if (chartHeader) {
          const originalText = chartHeader.textContent;
          chartHeader.textContent = 'Chart Data Unavailable';
          setTimeout(() => {
            chartHeader.textContent = originalText;
          }, 3000);
        }
        
        const retryDelay = 15000;
        if (!window.chartRetryTimers) window.chartRetryTimers = {};
        
        window.chartRetryTimers[period] = setTimeout(() => {
          console.log(`Retrying chart data load for ${period} after error`);
          loadRealBTCData(period);
          delete window.chartRetryTimers[period];
        }, retryDelay);
        
        const chart = window.btcChart;
        if (chart) {
          chart.data.labels = [];
          chart.data.datasets[0].data = [];
          if (!chart.options.plugins.annotation) {
            chart.options.plugins.annotation = { annotations: {} };
          }
          chart.options.plugins.annotation.annotations.noDataBox = {
            type: 'box',
            xMin: 'center',
            xMax: 'center',
            yMin: 'center',
            yMax: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
            label: {
              display: true,
              content: 'No Data Available\nRetrying in 15s...',
              color: 'rgba(255, 255, 255, 0.8)',
              font: { size: 14 },
            },
          };
          chart.update();
        }
      }
      window.pauseRealtimeUpdates = false;
    }
  }
  
  /**
   * Updates the chart with new data.
   * @param {Object} data - Processed chart data.
   * @param {string} period - The chart period.
   */
  function updateChartWithData(data, period) {
    const { labels, priceValues, minPrice, maxPrice } = data;
    const range = maxPrice - minPrice;
    const buffer = range * 0.1;
    if (window.priceRange.min === null || window.priceRange.max === null) {
      window.priceRange.min = minPrice - buffer;
      window.priceRange.max = maxPrice + buffer;
    } else {
      if (minPrice < window.priceRange.min) window.priceRange.min = minPrice - buffer;
      if (maxPrice > window.priceRange.max) window.priceRange.max = maxPrice + buffer;
    }
    const chart = window.btcChart;
    if (chart) {
      if (chart.options.plugins.annotation && chart.options.plugins.annotation.annotations) {
        if (chart.options.plugins.annotation.annotations.retryBox) {
          delete chart.options.plugins.annotation.annotations.retryBox;
        }
        if (chart.options.plugins.annotation.annotations.noDataBox) {
          delete chart.options.plugins.annotation.annotations.noDataBox;
        }
      }
      
      chart.options.scales.y.min = window.priceRange.min;
      chart.options.scales.y.max = window.priceRange.max;
      chart.data.labels = [...labels];
      chart.data.datasets[0] = {
        label: 'BTC Price',
        data: [...priceValues],
        borderColor: 'rgba(255, 255, 255, 0.8)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(255, 255, 255, 0.8)',
        pointHoverBorderWidth: 2,
        tension: 0.4,
        fill: true,
        spanGaps: true,
      };
      chart.update();
      if (period === '12h') {
        window.realtimeData.labels = [...labels];
        window.realtimeData.prices = [...priceValues];
      }
      if (priceValues.length >= 2) {
        const changePercent = ((priceValues[priceValues.length - 1] - priceValues[0]) / priceValues[0]) * 100;
        updatePriceChangeDisplay(changePercent, period);
      }
    }
    updateCacheTimestamp(`chart:${period}`);
  }
  
  /**
   * Updates the price change percentage display.
   * @param {number} changePercent - The calculated percentage change.
   * @param {string} period - The current period label.
   */
  function updatePriceChangeDisplay(changePercent, period) {
    const changeElement = document.querySelector('.change-percentage');
    const changeContainer = document.querySelector('.price-change');
    const changePeriod = document.querySelector('.change-period');
    if (changeElement && changeContainer) {
      if (changePercent === undefined || changePercent === null || isNaN(changePercent)) {
        if (changeElement.textContent === 'Loading...') {
          changeElement.textContent = 'No Data';
          changeContainer.classList.remove('positive', 'negative');
        }
        return;
      }
      changeElement.textContent = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;
      changeContainer.classList.remove('positive', 'negative');
      changeContainer.classList.add(changePercent >= 0 ? 'positive' : 'negative');
      if (changePeriod) changePeriod.textContent = period;
    }
  }
  
  /**
   * Updates all dashboard information.
   */
  async function updateDashboardInfo() {
    try {
      cleanupExpiredCache();
      const hasCachedData = window.cachedDashboardData != null;
      const isCached = hasCachedData && isCacheValid('dashboard', 300000);
      const canCallApi = canMakeApiCall('coincap');
      if (hasCachedData && (!canCallApi || isCached)) {
        updateDashboardWithData(window.cachedDashboardData);
        return;
      }
      const responseData = await fetchCoinCapData();
      if (window.currentBTCPrice !== null) {
        responseData.market_data.current_price.usd = window.currentBTCPrice;
      }
      try {
        const dominanceData = await fetchBitcoinDominance();
        responseData.market_data.market_cap_percentage = { btc: dominanceData.bitcoin_dominance };
      } catch (dominanceError) {
        responseData.market_data.market_cap_percentage = { btc: 60.5 };
      }
      window.cachedDashboardData = { ...responseData, timestamp: Date.now() };
      updateCacheTimestamp('dashboard');
      updateDashboardWithData(responseData);
    } catch (error) {
      if (window.cachedDashboardData) {
        updateDashboardWithData(window.cachedDashboardData);
        return;
      }
      if (window.currentBTCPrice !== null) {
        updateBalanceCard(window.currentBTCPrice);
        const mockData = createFallbackDashboardData(window.currentBTCPrice);
        updateDashboardWithData(mockData);
      } else {
        const samplePrice = 37000 + (Math.random() * 2000 - 1000);
        updateRealtimePrice(samplePrice);
        const mockData = createFallbackDashboardData(samplePrice);
        updateDashboardWithData(mockData);
      }
    }
  }
  
  /**
   * Fetches BTC data from CoinCap.
   * @returns {Promise<Object>} Formatted market data.
   */
  async function fetchCoinCapData() {
    const response = await fetch('https://api.coincap.io/v2/assets/bitcoin');
    recordApiCall('coincap');
    if (!response.ok) throw new Error(`Failed to fetch Bitcoin data: ${response.status}`);
    const data = await response.json();
    const price = parseFloat(data.data.priceUsd);
    return {
      market_data: {
        current_price: { usd: price },
        price_change_percentage_24h: parseFloat(data.data.changePercent24Hr),
        market_cap: { usd: parseFloat(data.data.marketCapUsd) },
        total_volume: { usd: parseFloat(data.data.volumeUsd24Hr) },
        circulating_supply: parseFloat(data.data.supply),
      },
    };
  }
  
  /**
   * Fetches Bitcoin dominance from CoinGecko.
   * @returns {Promise<Object>} An object with bitcoin_dominance.
   */
  async function fetchBitcoinDominance() {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/global');
      if (!response.ok) throw new Error(`Failed to fetch global market data: ${response.status}`);
      const data = await response.json();
      return { bitcoin_dominance: data.data?.market_cap_percentage?.btc || 60.5 };
    } catch (error) {
      return { bitcoin_dominance: 60.5 };
    }
  }
  
  /**
   * Creates fallback dashboard data based on a given price.
   * @param {number} price - The current BTC price.
   * @returns {Object} Fallback dashboard data.
   */
  function createFallbackDashboardData(price) {
    const supply = 19840000;
    const marketCap = price * supply;
    const volume24h = marketCap * 0.02;
    return {
      market_data: {
        current_price: { usd: price },
        price_change_percentage_24h: 1.2,
        market_cap: { usd: marketCap },
        total_volume: { usd: volume24h },
        circulating_supply: supply,
        market_cap_percentage: { btc: 60.5 },
      },
    };
  }
  
  /**
   * Animates and updates a stat element.
   * @param {string} elementId - The element ID.
   * @param {number} value - The new stat value.
   * @param {Function} formatter - Function to format the value.
   */
  function updateStatWithAnimation(elementId, value, formatter) {
    const element = document.getElementById(elementId);
    if (!element) return;
    if (value === undefined || value === null) {
      if (element.textContent === 'Loading.' || element.textContent === 'Loading...') {
        element.textContent = 'Data Unavailable';
      }
      return;
    }
    const currentText = element.textContent;
    const formattedValue = formatter(value);
    if (
      currentText &&
      currentText !== formattedValue &&
      currentText !== 'Loading.' &&
      currentText !== 'Data Unavailable'
    ) {
      const clone = element.cloneNode(true);
      clone.classList.add('float-away');
      element.parentNode.appendChild(clone);
      setTimeout(() => {
        if (clone.parentNode) {
          clone.parentNode.removeChild(clone);
        }
      }, 2000);
      element.classList.add('float-in');
      setTimeout(() => {
        element.classList.remove('float-in');
      }, 1000);
    }
    element.textContent = formattedValue;
  }
  
  /**
   * Updates the balance card with the current BTC price.
   * @param {number} currentPrice - The current BTC price.
   */
  function updateBalanceCard(currentPrice) {
    const btcBalance = 0.8756;
    const usdValue = btcBalance * currentPrice;
    const btcAmountElement = document.querySelector('.balance-amount .amount');
    const usdAmountElement = document.querySelector('.balance-usd .usd-amount');
    if (btcAmountElement) {
      if (btcAmountElement.textContent === 'Loading.' || btcAmountElement.textContent === 'Data Unavailable') {
        btcAmountElement.textContent = btcBalance.toFixed(4);
      }
    }
    if (usdAmountElement) {
      if (currentPrice > 0) {
        usdAmountElement.textContent = usdValue.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      } else if (usdAmountElement.textContent === 'Loading.') {
        usdAmountElement.textContent = 'Waiting for price.';
      }
    }
  }
  
  /**
   * Updates transaction timestamps.
   */
  function updateTransactionTimestamps() {
    const transactions = document.querySelectorAll('.transaction');
    if (transactions.length === 0) {
      generateRandomTransactions();
      return;
    }
    const now = new Date();
    const todayDate = new Date(now);
    todayDate.setMinutes(todayDate.getMinutes() - 30);
    const firstTransaction = transactions[0];
    const firstDateElem = firstTransaction.querySelector('.transaction-date');
    if (firstDateElem) {
      firstDateElem.textContent = formatTransactionDate(todayDate);
    }
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(now.getDate() - 1);
    yesterdayDate.setHours(9, 47);
    const secondTransaction = transactions[1];
    const secondDateElem = secondTransaction.querySelector('.transaction-date');
    if (secondDateElem) {
      secondDateElem.textContent = formatTransactionDate(yesterdayDate);
    }
    const oldDate = new Date(now);
    oldDate.setDate(now.getDate() - 3);
    oldDate.setHours(22, 18);
    const thirdTransaction = transactions[2];
    const thirdDateElem = thirdTransaction.querySelector('.transaction-date');
    if (thirdDateElem) {
      thirdDateElem.textContent = formatTransactionDate(oldDate);
    }
  }
  
  /**
   * Generates random transactions for demonstration.
   */
  function generateRandomTransactions() {
    const transactionList = document.querySelector('.transaction-list');
    if (!transactionList) return;
    transactionList.innerHTML = '';
  }
  
  /**
   * Updates the dashboard with new market data.
   * @param {Object} data - Market data.
   */
  function updateDashboardWithData(data) {
    const priceElement = document.querySelector('.btc-price');
    if (priceElement && data.market_data?.current_price?.usd) {
      const currentPrice = data.market_data.current_price.usd;
      priceElement.textContent = currentPrice.toFixed(2);
      window.currentBTCPrice = currentPrice;
    }
    updateStatWithAnimation('market-cap', data.market_data?.market_cap?.usd, value =>
      `$${(value / 1e9).toFixed(1)}B`
    );
    updateStatWithAnimation('volume-24h', data.market_data?.total_volume?.usd, value =>
      `$${(value / 1e9).toFixed(1)}B`
    );
    updateStatWithAnimation('btc-dominance', data.market_data?.market_cap_percentage?.btc, value =>
      `${value.toFixed(1)}%`
    );
    updateStatWithAnimation('btc-supply', data.market_data?.circulating_supply, value =>
      `${(value / 1e6).toFixed(1)}M BTC`
    );
    if (window.currentBTCPrice) {
      updateBalanceCard(window.currentBTCPrice);
    }
  }
  
  /**
   * Updates the cache timestamp for a given key.
   * @param {string} key - The cache key.
   */
  function updateCacheTimestamp(key) {
    if (!window.cacheTimestamps) window.cacheTimestamps = {};
    window.cacheTimestamps[key] = Date.now();
  }
  
  /**
   * Checks if cached data for a key is still valid.
   * @param {string} key - The cache key.
   * @param {number} maxAge - Maximum age in milliseconds.
   * @returns {boolean} True if cache is valid.
   */
  function isCacheValid(key, maxAge) {
    return window.cacheTimestamps && window.cacheTimestamps[key] && Date.now() - window.cacheTimestamps[key] < maxAge;
  }
  
  /**
   * Cleans up expired cache entries.
   */
  function cleanupExpiredCache() {
    if (!window.cacheTimestamps) return;
    Object.keys(window.cacheTimestamps).forEach(key => {
      let maxAge;
      switch (key.split(':')[0]) {
        case 'chart':
          maxAge = 1800000;
          break;
        case 'dashboard':
          maxAge = 300000;
          break;
        default:
          maxAge = 600000;
      }
      if (Date.now() - window.cacheTimestamps[key] > maxAge) {
        if (key.startsWith('chart:') && window.cachedChartData) {
          const period = key.split(':')[1];
          delete window.cachedChartData[period];
        } else if (key === 'dashboard' && window.cachedDashboardData) {
          window.cachedDashboardData = null;
        }
        delete window.cacheTimestamps[key];
      }
    });
  }
  
  /**
   * Formats a date for transaction display.
   * @param {Date} date - The date to format.
   * @returns {string} The formatted date string.
   */
  function formatTransactionDate(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }