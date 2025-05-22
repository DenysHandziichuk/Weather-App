const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const apiKey = process.env.WEATHER_API_KEY;
  const city = event.queryStringParameters.city;

  if (!city) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'City parameter is required' }),
    };
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: response.statusText }),
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};
