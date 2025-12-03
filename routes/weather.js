// ===================================
// WEATHER ROUTES (OpenWeatherMap)
// ===================================

const express = require('express')
const request = require('request')

const router = express.Router()

// OpenWeatherMap API key
const API_KEY = '665cf5a4e9514bf219bf365cda974e86'

// GET /weather
// Renders weather details for a user-provided city (defaults to London)
router.get('/', (req, res, next) => {
  const apiKey = API_KEY
  const rawCity = typeof req.query.city === 'string' ? req.query.city : ''
  const sanitizedInput = rawCity && typeof req.sanitize === 'function' ? req.sanitize(rawCity) : rawCity
  const userCity = sanitizedInput ? sanitizedInput.trim() : ''
  const lookupCity = userCity || 'London'

  const url = `http://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(lookupCity)}&units=metric&appid=${apiKey}`

  request(url, (err, response, body) => {
    if (err) {
      return next(err)
    }

    try {
      const weather = JSON.parse(body)

      if (!weather || !weather.main) {
        return res.render('weather.ejs', {
          query: userCity,
          weather: null,
          error: 'No data found for that location.'
        })
      }

      if (Number(weather.cod) !== 200) {
        return res.render('weather.ejs', {
          query: userCity,
          weather: null,
          error: weather.message ? `Unable to fetch weather: ${weather.message}` : 'Unable to fetch weather right now.'
        })
      }

      const weatherDetails = {
        city: weather.name,
        description: weather.weather && weather.weather[0] ? weather.weather[0].description : 'No description available',
        temperature: weather.main ? weather.main.temp : null,
        feelsLike: weather.main ? weather.main.feels_like : null,
        humidity: weather.main ? weather.main.humidity : null,
        windSpeed: weather.wind ? weather.wind.speed : null,
        windDirection: weather.wind && typeof weather.wind.deg === 'number' ? weather.wind.deg : null,
        cloudCover: weather.clouds ? weather.clouds.all : null
      }

      return res.render('weather.ejs', {
        query: userCity || lookupCity,
        weather: weatherDetails,
        error: null
      })
    } catch (parseErr) {
      return next(parseErr)
    }
  })
})

module.exports = router
