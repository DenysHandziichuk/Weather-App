const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.submit-btn');

const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');
const weatherInfoSection = document.querySelector('.weather-info');

const cityNameElem = document.querySelector('.country-txt');
const dateElem = document.querySelector('.date-txt');
const tempElem = document.querySelector('.temp-txt');
const conditionElem = document.querySelector('.condition-txt');
const humidityElem = document.querySelectorAll('.humidity-number')[0];
const windSpeedElem = document.querySelectorAll('.humidity-number')[1];
const weatherIcon = document.querySelector('.image');
const humidityIcon = document.querySelector('.humidity-icon');

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

async function getFetchData(endpoint, city) {
    const url = `/.netlify/functions/weather?city=${encodeURIComponent(city)}`;
    const response = await fetch(url);
    return response.json();
}

async function getFetchDataByCoords(lat, lon) {
    const url = `/.netlify/functions/weather?lat=${lat}&lon=${lon}`;
    const response = await fetch(url);
    return response.json();
}

async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);

    if (weatherData.cod !== 200) {
        showSection(notFoundSection);
        return;
    }

    updateUI(weatherData);
}

async function updateWeatherByCoords(lat, lon) {
    const weatherData = await getFetchDataByCoords(lat, lon);

    if (weatherData.cod !== 200) {
        showSection(notFoundSection);
        return;
    }

    updateUI(weatherData);
}

function updateUI(weatherData) {
    const weatherMain = weatherData.weather[0].main.toLowerCase();
    const weatherIcons = {
        clouds: "clouds.svg",
        clear: "clear.svg",
        rain: "rain.svg",
        snow: "snow.svg",
        thunderstorm: "storm.svg",
        drizzle: "drizzle.svg",
        atmosphere: "atmosphere.svg"
    };

    const iconFile = weatherIcons[weatherMain] || "clouds.svg";
    weatherIcon.src = `assets/weather/${iconFile}`;
    weatherIcon.alt = weatherMain;

    cityNameElem.textContent = weatherData.name;
    dateElem.textContent = formatDate(new Date());
    tempElem.textContent = `${Math.round(weatherData.main.temp)} °C`;
    conditionElem.textContent = weatherData.weather[0].main;

    const humidityValue = weatherData.main.humidity;
    humidityElem.textContent = `${humidityValue}%`;
    updateHumidityIcon(humidityValue);

    windSpeedElem.textContent = `${weatherData.wind.speed} M/s`;

    showSection(weatherInfoSection);
}

function showSection(sectionToShow) {
    [searchCitySection, notFoundSection, weatherInfoSection].forEach(section => {
        section.style.display = 'none';
    });
    sectionToShow.style.display = 'flex';
}

function updateHumidityIcon(humidityValue) {
    let iconSrc = '';

    if (humidityValue < 35) {
        iconSrc = 'assets/icons/low-humidity.png';
    } else if (humidityValue >= 35 && humidityValue <= 70) {
        iconSrc = 'assets/icons/medium-humidity.png';
    } else {
        iconSrc = 'assets/icons/high-humidity.png';
    }

    humidityIcon.src = iconSrc;
    humidityIcon.alt = `Humidity: ${humidityValue}%`;
}

function formatDate(date) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
}

window.addEventListener('load', () => {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                updateWeatherByCoords(lat, lon);
            },
            (error) => {
                console.warn("Geolocation denied or error:", error.message);
                showSection(searchCitySection);
            }
        );
    } else {
        showSection(searchCitySection);
    }
});
