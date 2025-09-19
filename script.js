const API_KEY = '437a1a2e27d8a5bbfe8a78e0a8ff2d00';

// ---------------------- Helpers ----------------------
function setTimeBasedGradient() {
  const hour = new Date().getHours();
  document.body.classList.toggle('night', hour < 6 || hour >= 18);
}

// Smooth temperature animation
function animateTemperature(elem, newTemp) {
  let current = parseInt(elem.textContent) || 0;
  const step = newTemp > current ? 1 : -1;
  const interval = setInterval(() => {
    current += step;
    elem.textContent = `${current}°`;
    if (current === newTemp) clearInterval(interval);
  }, 50);
}

// ---------------------- Weather Particles ----------------------
function createWeatherParticles(weatherType) {
  const container = document.querySelector('.floating-particles');
  container.innerHTML = ''; // Clear existing particles

  let particleCount = 0;
  let particleClass = 'particle';

  const screenWidth = window.innerWidth;

  switch (weatherType.toLowerCase()) {
    case 'clear':
      particleCount = screenWidth < 480 ? 10 : 20;
      particleClass = 'particle';
      break;
    case 'clouds':
      particleCount = screenWidth < 480 ? 8 : 15;
      particleClass = 'cloud-particle';
      break;
    case 'rain':
      particleCount = screenWidth < 480 ? 60 : 120;
      particleClass = 'rain-particle';
      break;
    case 'drizzle':
      particleCount = screenWidth < 480 ? 40 : 80;
      particleClass = 'rain-particle';
      break;
    case 'thunderstorm':
      particleCount = screenWidth < 480 ? 80 : 150;
      particleClass = 'heavy-rain-particle';
      flashLightning();
      break;
    case 'snow':
      particleCount = screenWidth < 480 ? 30 : 60;
      particleClass = 'snow-particle';
      break;
    case 'mist':
    case 'haze':
    case 'fog':
      particleCount = screenWidth < 480 ? 20 : 40;
      particleClass = 'mist-particle';
      break;
    default:
      particleCount = screenWidth < 480 ? 10 : 25;
      particleClass = 'particle';
  }

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = particleClass;
    p.style.left = Math.random() * 100 + '%';

    if (particleClass === 'rain-particle' || particleClass === 'heavy-rain-particle') {
      p.style.animationDelay = Math.random() * 2 + 's';
    } else if (particleClass === 'snow-particle') {
      p.style.width = p.style.height = (Math.random() * 8 + 3) + 'px';
      p.style.animationDuration = (Math.random() * 4 + 4) + 's';
      p.style.animationDelay = Math.random() * 6 + 's';
    } else if (particleClass === 'cloud-particle') {
      p.style.width = p.style.height = (Math.random() * 15 + 10) + 'px';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      p.style.animationDelay = Math.random() * 20 + 's';
    } else if (particleClass === 'mist-particle') {
      p.style.width = p.style.height = (Math.random() * 20 + 15) + 'px';
      p.style.animationDuration = (Math.random() * 8 + 10) + 's';
      p.style.animationDelay = Math.random() * 12 + 's';
    } else {
      p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      p.style.animationDelay = Math.random() * 15 + 's';
    }

    container.appendChild(p);
  }
}

// ---------------------- Lightning ----------------------
let lightningTimeout;
function flashLightning() {
  const flash = document.getElementById('lightningFlash');
  if (lightningTimeout) clearTimeout(lightningTimeout);
  flash.style.opacity = 1;
  lightningTimeout = setTimeout(() => { flash.style.opacity = 0; }, 100);
}

// ---------------------- Background & Weather ----------------------
function updateBackgroundWeather(main) {
  const dashboard = document.querySelector('.weather-dashboard');
  dashboard.classList.remove('weather-active');

  const weather = main.toLowerCase();
  dashboard.dataset.weather = weather; // store current weather

  createWeatherParticles(weather);

  dashboard.classList.add('weather-active');
}

// Weather icons
function getWeatherIcon(cond) {
  const map = {
    clear: '☀️',
    clouds: '☁️',
    rain: '🌧️',
    drizzle: '🌦️',
    thunderstorm: '⛈️',
    snow: '🌨️',
    mist: '🌫️',
    haze: '🌫️',
    fog: '🌫️'
  };
  return map[cond.toLowerCase()] || '🌤️';
}

// ---------------------- UI Helpers ----------------------
function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'block';
  document.getElementById('weatherDisplay').style.display = 'none';
  document.getElementById('errorMessage').style.display = 'none';
}
function hideLoading() { document.getElementById('loadingSpinner').style.display = 'none'; }
function showError(msg) {
  const e = document.getElementById('errorMessage');
  e.textContent = msg;
  e.style.display = 'block';
  setTimeout(() => { e.style.display = 'none'; }, 5000);
}

// Display weather
function displayWeather(data) {
  hideLoading();
  updateBackgroundWeather(data.weather[0].main);

  document.querySelector('#locationName span').textContent = `${data.name}, ${data.sys.country}`;
  const icon = getWeatherIcon(data.weather[0].main);
  document.getElementById('weatherIcon').textContent = icon;

  animateTemperature(document.getElementById('temperature'), Math.round(data.main.temp));
  document.getElementById('weatherDesc').textContent = data.weather[0].description;
  document.getElementById('humidity').textContent = `${data.main.humidity}%`;
  document.getElementById('windSpeed').textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
  document.getElementById('feelsLike').textContent = `${Math.round(data.main.feels_like)}°`;
  document.getElementById('visibility').textContent = data.visibility ? `${(data.visibility/1000).toFixed(1)} km` : 'N/A';

  document.getElementById('weatherDisplay').style.display = 'block';
}

// ---------------------- API Calls ----------------------
async function searchWeather() {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) { showError('Please enter a city name'); return; }
  showLoading();

  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`);
    if (!res.ok) throw new Error('City not found');
    const data = await res.json();
    displayWeather(data);
    document.getElementById('cityInput').value = '';
  } catch (err) {
    hideLoading();
    showError(err.message === 'City not found' ? 'City not found. Check spelling.' : 'Failed to fetch weather data.');
    console.error(err);
  }
}

function getLocationWeather() {
  if (!navigator.geolocation) { showError('Geolocation not supported'); return; }
  showLoading();

  navigator.geolocation.getCurrentPosition(async pos => {
    const { latitude, longitude } = pos.coords;
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`);
      if (!res.ok) throw new Error('Failed to fetch weather data');
      const data = await res.json();
      displayWeather(data);
    } catch (err) {
      hideLoading();
      showError('Failed to fetch location weather');
      console.error(err);
    }
  }, () => { hideLoading(); showError('Unable to retrieve your location.'); }, { timeout: 10000, enableHighAccuracy: true });
}

// ---------------------- Stars ----------------------
function generateStars(num = 100) {
  const layer = document.querySelector('.star-layer');
  layer.innerHTML = '';
  const count = window.innerWidth < 480 ? Math.floor(num / 2) : num;

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.top = Math.random() * 100 + '%';
    star.style.left = Math.random() * 100 + '%';
    star.style.width = star.style.height = (Math.random() * 2 + 1) + 'px';
    star.style.animationDuration = (Math.random() * 2 + 1) + 's';
    layer.appendChild(star);
  }
}

// ---------------------- Init ----------------------
document.addEventListener('DOMContentLoaded', () => {
  setTimeBasedGradient();
  setInterval(setTimeBasedGradient, 60 * 60 * 1000);

  createWeatherParticles('default');
  generateStars(120);

  const input = document.getElementById('cityInput');
  const searchBtn = document.getElementById('searchBtn');
  const locBtn = document.getElementById('locationBtn');

  input.addEventListener('keypress', e => { if (e.key === 'Enter') searchWeather(); });
  input.addEventListener('focus', () => { input.parentElement.style.transform = 'scale(1.02)'; });
  input.addEventListener('blur', () => { input.parentElement.style.transform = 'scale(1)'; });

  searchBtn.addEventListener('click', searchWeather);
  locBtn.addEventListener('click', getLocationWeather);

  // Regenerate particles on resize
  window.addEventListener('resize', () => {
    const dashboard = document.querySelector('.weather-dashboard');
    if (dashboard.dataset.weather) createWeatherParticles(dashboard.dataset.weather);
    generateStars(120); // optional: update stars
  });
});
// ---------------------- Weather Particles (Mobile Optimized) ----------------------
function createWeatherParticles(weatherType) {
  const container = document.querySelector('.floating-particles');
  container.innerHTML = '';

  let particleCount = 0;
  let particleClass = 'particle';
  const screenWidth = window.innerWidth;

  switch (weatherType.toLowerCase()) {
    case 'clear':
      particleCount = screenWidth < 480 ? 10 : 20;
      particleClass = 'particle';
      break;
    case 'clouds':
      particleCount = screenWidth < 480 ? 6 : 15; // reduced clouds on mobile
      particleClass = 'cloud-particle';
      break;
    case 'rain':
      particleCount = screenWidth < 480 ? 40 : 120; // lighter rain on mobile
      particleClass = 'rain-particle';
      break;
    case 'drizzle':
      particleCount = screenWidth < 480 ? 30 : 80;
      particleClass = 'rain-particle';
      break;
    case 'thunderstorm':
      particleCount = screenWidth < 480 ? 50 : 150; // limit heavy rain
      particleClass = 'heavy-rain-particle';
      flashLightning(); // lightning flash is throttled
      break;
    case 'snow':
      particleCount = screenWidth < 480 ? 20 : 60;
      particleClass = 'snow-particle';
      break;
    case 'mist':
    case 'haze':
    case 'fog':
      particleCount = screenWidth < 480 ? 15 : 40;
      particleClass = 'mist-particle';
      break;
    default:
      particleCount = screenWidth < 480 ? 10 : 25;
      particleClass = 'particle';
  }

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.className = particleClass;
    p.style.left = Math.random() * 100 + '%';

    if (particleClass === 'rain-particle' || particleClass === 'heavy-rain-particle') {
      p.style.animationDelay = Math.random() * 2 + 's';
    } else if (particleClass === 'snow-particle') {
      p.style.width = p.style.height = (Math.random() * 8 + 3) + 'px';
      p.style.animationDuration = (Math.random() * 4 + 4) + 's';
      p.style.animationDelay = Math.random() * 6 + 's';
    } else if (particleClass === 'cloud-particle') {
      p.style.width = p.style.height = (Math.random() * 15 + 10) + 'px';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      p.style.animationDelay = Math.random() * 20 + 's';
    } else if (particleClass === 'mist-particle') {
      p.style.width = p.style.height = (Math.random() * 20 + 15) + 'px';
      p.style.animationDuration = (Math.random() * 8 + 10) + 's';
      p.style.animationDelay = Math.random() * 12 + 's';
    } else {
      p.style.width = p.style.height = (Math.random() * 4 + 2) + 'px';
      p.style.animationDuration = (Math.random() * 10 + 15) + 's';
      p.style.animationDelay = Math.random() * 15 + 's';
    }

    container.appendChild(p);
  }
}

// ---------------------- Throttled Lightning ----------------------
let lastFlash = 0;
function flashLightning() {
  const now = Date.now();
  if (now - lastFlash < 1500) return; // allow flash every 1.5s max
  lastFlash = now;

  const flash = document.getElementById('lightningFlash');
  flash.style.opacity = 1;
  setTimeout(() => { flash.style.opacity = 0; }, 100);
}
