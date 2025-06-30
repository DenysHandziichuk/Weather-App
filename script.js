const API_KEY = API_KEY;

const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.submit-btn');

const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');

const cityNameElem = document.querySelector('.country-txt');
const dateElem = document.querySelector('.date-txt');
const tempElem = document.querySelector('.temp-txt');
const conditionElem = document.querySelector('.condition-txt');
const humidityElem = document.querySelector('.humidity-number');
const windSpeedElem = document.querySelector('.wind-speed-number');
const weatherIcon = document.querySelector('.image');
const humidityIcon = document.querySelector('.humidity-icon');
const forecastContainer = document.querySelector('.forecast-items-container');

searchBtn.addEventListener('click', () => {
  if (cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = '';
    cityInput.blur();
  }
});

cityInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && cityInput.value.trim() !== '') {
    updateWeatherInfo(cityInput.value.trim());
    cityInput.value = '';
    cityInput.blur();
  }
});

async function getWeatherData(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching weather:", error);
    return { cod: 500 };
  }
}

async function getWeatherByCoords(lat, lon) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error("Error fetching location weather:", error);
    return { cod: 500 };
  }
}

async function updateWeatherInfo(city) {
  showLoading();
  const weatherData = await getWeatherData(city);

  if (weatherData.cod !== 200) {
    showSection(notFoundSection);
    return;
  }

  updateUI(weatherData);
  updateForecast(weatherData.name);
}

async function updateWeatherByCoords(lat, lon) {
  showLoading();
  const weatherData = await getWeatherByCoords(lat, lon);

  if (weatherData.cod !== 200) {
    showSection(notFoundSection);
    return;
  }

  updateUI(weatherData);
  updateForecast(weatherData.name);
}

function updateUI(data) {
  const weatherMain = data.weather[0].main.toLowerCase();
  const weatherIcons = {
    clouds: "clouds.svg",
    clear: "clear.svg",
    rain: "rain.svg",
    snow: "snow.svg",
    thunderstorm: "storm.svg",
    drizzle: "drizzle.svg",
    atmosphere: "atmosphere.svg"
  };

  const iconFile = weatherIcons[weatherMain] || weatherIcons.atmosphere;
  weatherIcon.src = `assets/weather/${iconFile}`;
  weatherIcon.alt = weatherMain;

  cityNameElem.textContent = data.name;
  dateElem.textContent = formatDate(new Date());
  tempElem.textContent = `${Math.round(data.main.temp)} °C`;
  conditionElem.textContent = data.weather[0].main;

  const humidityValue = data.main.humidity;
  humidityElem.textContent = `${humidityValue}%`;
  updateHumidityIcon(humidityValue);

  windSpeedElem.textContent = `${data.wind.speed} m/s`;

  showSection(weatherInfoSection);
}

function showSection(sectionToShow) {
  [searchCitySection, notFoundSection, weatherInfoSection].forEach(section => {
    section.style.display = 'none';
  });
  sectionToShow.style.display = 'flex';
}

function showLoading() {
  cityNameElem.textContent = 'Loading...';
  showSection(weatherInfoSection);
}

function updateHumidityIcon(value) {
  let src = '';
  if (value < 35) src = 'assets/icons/low-humidity.png';
  else if (value <= 70) src = 'assets/icons/medium-humidity.png';
  else src = 'assets/icons/high-humidity.png';

  humidityIcon.src = src;
  humidityIcon.alt = `Humidity: ${value}%`;
}

function formatDate(date) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

function formatDay(date) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
}

async function updateForecast(city) {
  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
    const res = await fetch(url);
    const data = await res.json();

    forecastContainer.innerHTML = '';

    const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00")).slice(0, 4);

    const iconMap = {
      clouds: "clouds.svg",
      clear: "clear.svg",
      rain: "rain.svg",
      snow: "snow.svg",
      thunderstorm: "storm.svg",
      drizzle: "drizzle.svg",
      atmosphere: "atmosphere.svg"
    };

    dailyData.forEach(item => {
      const date = new Date(item.dt_txt);
      const temp = Math.round(item.main.temp);
      const icon = item.weather[0].main.toLowerCase();
      const iconFile = iconMap[icon] || "clouds.svg";

      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
        <h4>${formatDay(date)}</h4>
        <img src="assets/weather/${iconFile}" alt="${icon}" class="forecast-item-img" />
        <p>${temp} °C</p>
      `;
      forecastContainer.appendChild(forecastItem);
    });
  } catch (e) {
    console.error('Forecast error:', e);
  }
}


window.addEventListener('load', () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        showSection(searchCitySection);
      }
    );
  } else {
    showSection(searchCitySection);
  }
});
