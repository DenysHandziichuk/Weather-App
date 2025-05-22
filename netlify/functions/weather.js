const fetch = require('node-fetch');

exports.handler = async function (event) {
    const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
    const BASE_URL = 'https://api.openweathermap.org/data/2.5';

    const params = event.queryStringParameters;
    const city = params.city;
    const lat = params.lat;
    const lon = params.lon;

    try {
        let currentWeather;
        let coordinates = { lat, lon };

        if (city) {
            const currentUrl = `${BASE_URL}/weather?q=${city}&units=metric&appid=${OPENWEATHER_API_KEY}`;
            const currentResponse = await fetch(currentUrl);
            currentWeather = await currentResponse.json();

            if (!currentResponse.ok) {
                return {
                    statusCode: currentResponse.status,
                    body: JSON.stringify({ error: currentWeather.message })
                };
            }

            coordinates.lat = currentWeather.coord.lat;
            coordinates.lon = currentWeather.coord.lon;
        } else if (lat && lon) {
            const currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
            const currentResponse = await fetch(currentUrl);
            currentWeather = await currentResponse.json();

            if (!currentResponse.ok) {
                return {
                    statusCode: currentResponse.status,
                    body: JSON.stringify({ error: currentWeather.message })
                };
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'City or coordinates required' })
            };
        }

        const forecastUrl = `${BASE_URL}/onecall?lat=${coordinates.lat}&lon=${coordinates.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        return {
            statusCode: 200,
            body: JSON.stringify({
                current: currentWeather,
                forecast: forecastData
            })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
