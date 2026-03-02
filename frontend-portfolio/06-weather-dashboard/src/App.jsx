import { useState, useEffect } from 'react'
import './App.css'

// Weather Dashboard with Search, Forecast, and Maps integration

// Mock Weather Data Generator
const getMockWeather = (city) => {
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]

  return {
    current: {
      city: city,
      temp: Math.floor(Math.random() * 30) + 10,
      condition,
      humidity: Math.floor(Math.random() * 50) + 30,
      wind: Math.floor(Math.random() * 20) + 5,
      description: `Today is ${condition.toLowerCase()} with scatter clouds`,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    },
    forecast: Array(5).fill(0).map((_, i) => {
      const dayDate = new Date()
      dayDate.setDate(dayDate.getDate() + i + 1)
      const cond = conditions[Math.floor(Math.random() * conditions.length)]
      return {
        day: dayDate.toLocaleDateString('en-US', { weekday: 'short' }),
        temp: Math.floor(Math.random() * 30) + 10,
        condition: cond
      }
    })
  }
}

const getWeatherIcon = (condition) => {
  switch (condition) {
    case 'Sunny': return '☀️'
    case 'Cloudy': return '☁️'
    case 'Rainy': return '🌧️'
    case 'Stormy': return '⛈️'
    case 'Snowy': return '❄️'
    default: return '🌤️'
  }
}

const getBackgroundClass = (condition) => {
  switch (condition) {
    case 'Sunny': return 'bg-sunny'
    case 'Cloudy': return 'bg-cloudy'
    case 'Rainy': return 'bg-rainy'
    case 'Stormy': return 'bg-stormy'
    case 'Snowy': return 'bg-snowy'
    default: return 'bg-default'
  }
}

function App() {
  const [search, setSearch] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(['London', 'New York', 'Tokyo'])
  const [view, setView] = useState('dashboard') // dashboard or map

  // Initial load
  useEffect(() => {
    fetchWeather('Paris')
  }, [])

  const fetchWeather = async (city) => {
    setLoading(true)
    // Simulate API delay
    setTimeout(() => {
      const data = getMockWeather(city)
      setWeather(data)
      setLoading(false)
      if (!recentSearches.includes(city)) {
        setRecentSearches(prev => [city, ...prev].slice(0, 5))
      }
    }, 800)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      fetchWeather(search)
      setSearch('')
    }
  }

  if (!weather && loading) return <div className="loading">Loading Weather...</div>

  return (
    <div className={`app ${weather ? getBackgroundClass(weather.current.condition) : ''}`}>
      <div className="glass-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="logo">
            🌤️ SkyCast
          </div>

          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>

          <div className="recent-searches">
            <h3>Recent Locations</h3>
            <ul>
              {recentSearches.map(city => (
                <li key={city} onClick={() => fetchWeather(city)}>
                  📍 {city}
                </li>
              ))}
            </ul>
          </div>

          <div className="weather-details">
            <h3>Weather Details</h3>
            <div className="detail-item">
              <span>Humidity</span>
              <span>{weather?.current.humidity}%</span>
            </div>
            <div className="detail-item">
              <span>Wind Speed</span>
              <span>{weather?.current.wind} km/h</span>
            </div>
            <div className="detail-item">
              <span>Precipitation</span>
              <span>10%</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {/* Header */}
          <header className="header">
            <div className="location-info">
              <h1>{weather?.current.city}</h1>
              <p>{weather?.current.date}</p>
            </div>
            <div className="view-switch">
              <button
                className={view === 'dashboard' ? 'active' : ''}
                onClick={() => setView('dashboard')}
              >
                📊 Dashboard
              </button>
              <button
                className={view === 'map' ? 'active' : ''}
                onClick={() => setView('map')}
              >
                🗺️ Map
              </button>
            </div>
          </header>

          {loading ? (
            <div className="loading-state">Updating...</div>
          ) : (
            <>
              {view === 'dashboard' ? (
                <div className="dashboard-view">
                  {/* Main Weather Card */}
                  <div className="current-weather">
                    <div className="temp-display">
                      <span className="icon">{getWeatherIcon(weather?.current.condition)}</span>
                      <span className="temp">{weather?.current.temp}°</span>
                    </div>
                    <div className="condition-display">
                      <h2>{weather?.current.condition}</h2>
                      <p>{weather?.current.description}</p>
                    </div>
                  </div>

                  {/* Forecast Cards */}
                  <div className="forecast-section">
                    <h3>5-Day Forecast</h3>
                    <div className="forecast-grid">
                      {weather?.forecast.map((day, idx) => (
                        <div key={idx} className="forecast-card">
                          <span className="day">{day.day}</span>
                          <span className="icon">{getWeatherIcon(day.condition)}</span>
                          <span className="temp">{day.temp}°</span>
                          <span className="cond">{day.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="map-view">
                  <div className="map-placeholder">
                    <div className="map-overlay">
                      <span>Interactive Map Integration</span>
                      <p>Visualizing weather patterns for {weather?.current.city}</p>
                    </div>
                    {/* In a real app, this would be a Google Maps or Leaflet iframe */}
                    <div className="fake-map">
                      🗺️
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
