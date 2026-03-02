import { useState, useEffect } from 'react'
import './index.css'

const getMockWeather = (city) => {
  const conditions = ['Sunny', 'Cloudy', 'Rainy', 'Stormy', 'Snowy']
  const condition = conditions[Math.floor(Math.random() * conditions.length)]
  return {
    current: { city, temp: Math.floor(Math.random() * 30) + 10, condition, humidity: Math.floor(Math.random() * 50) + 30, wind: Math.floor(Math.random() * 20) + 5, description: `Today is ${condition.toLowerCase()} with scatter clouds`, date: new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' }) },
    forecast: Array(5).fill(0).map((_, i) => { const d = new Date(); d.setDate(d.getDate() + i + 1); const c = conditions[Math.floor(Math.random() * conditions.length)]; return { day: d.toLocaleDateString('en-US', { weekday: 'short' }), temp: Math.floor(Math.random() * 30) + 10, condition: c } })
  }
}

const getWeatherIcon = (c) => ({ Sunny: '☀️', Cloudy: '☁️', Rainy: '🌧️', Stormy: '⛈️', Snowy: '❄️' }[c] || '🌤️')
const getBackgroundClass = (c) => ({ Sunny: 'bg-sunny', Cloudy: 'bg-cloudy', Rainy: 'bg-rainy', Stormy: 'bg-stormy', Snowy: 'bg-snowy' }[c] || 'bg-default')

function App() {
  const [search, setSearch] = useState('')
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState(['London', 'New York', 'Tokyo'])
  const [view, setView] = useState('dashboard')

  useEffect(() => { fetchWeather('Paris') }, [])

  const fetchWeather = async (city) => {
    setLoading(true)
    setTimeout(() => { const data = getMockWeather(city); setWeather(data); setLoading(false); if (!recentSearches.includes(city)) setRecentSearches(prev => [city, ...prev].slice(0, 5)) }, 800)
  }

  const handleSearch = (e) => { e.preventDefault(); if (search.trim()) { fetchWeather(search); setSearch('') } }

  if (!weather && loading) return <div className="h-screen flex items-center justify-center text-2xl bg-[#182848] text-white">Loading Weather...</div>

  return (
    <div className={`min-h-screen transition-[background] duration-1000 bg-cover bg-center relative ${weather ? getBackgroundClass(weather.current.condition) : ''}`}>
      <div className="flex max-md:flex-col h-[90vh] max-md:h-screen w-[90vw] max-md:w-screen absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/15 backdrop-blur-[12px] border border-glass-border rounded-3xl max-md:rounded-none overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        {/* Sidebar */}
        <aside className="w-80 max-md:w-full max-md:h-auto max-md:flex-row max-md:items-center max-md:p-4 max-md:gap-5 bg-black/20 p-8 flex flex-col backdrop-blur-[4px] border-r border-glass-border">
          <div className="text-[1.8rem] font-bold mb-8 max-md:mb-0 text-shadow-[0_2px_4px_rgba(0,0,0,0.1)]">🌤️ SkyCast</div>

          <form onSubmit={handleSearch} className="flex mb-8 max-md:mb-0 max-md:flex-1 bg-white/10 rounded-xl border border-glass-border overflow-hidden">
            <input type="text" placeholder="Search city..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none py-3 px-4 text-white font-[inherit] text-[0.95rem] placeholder:text-white/50 focus:outline-none focus:bg-white/10" />
            <button type="submit" className="bg-transparent border-none px-4 cursor-pointer text-lg transition-transform duration-200 hover:scale-110">🔍</button>
          </form>

          <div className="max-md:hidden">
            <h3 className="text-[0.9rem] uppercase tracking-wider mb-4 text-text-secondary">Recent Locations</h3>
            <ul className="list-none mb-8">
              {recentSearches.map(city => (
                <li key={city} onClick={() => fetchWeather(city)} className="py-2.5 border-b border-white/10 cursor-pointer transition-[padding-left] duration-200 opacity-80 hover:pl-2 hover:opacity-100">📍 {city}</li>
              ))}
            </ul>
          </div>

          <div className="max-md:hidden mt-auto">
            <h3 className="text-[0.9rem] uppercase tracking-wider mb-4 text-text-secondary">Weather Details</h3>
            {[{ l: 'Humidity', v: `${weather?.current.humidity}%` }, { l: 'Wind Speed', v: `${weather?.current.wind} km/h` }, { l: 'Precipitation', v: '10%' }].map(d => (
              <div key={d.l} className="flex justify-between py-3 border-b border-white/10 text-[0.95rem]">
                <span>{d.l}</span><span>{d.v}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10 max-md:p-5 overflow-y-auto relative">
          <header className="flex justify-between items-end mb-10">
            <div>
              <h1 className="text-[3rem] font-bold mb-2 text-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">{weather?.current.city}</h1>
              <p className="text-lg font-light">{weather?.current.date}</p>
            </div>
            <div className="flex bg-black/20 rounded-xl p-1">
              <button className={`py-2 px-4 bg-transparent border-none cursor-pointer rounded-lg font-[inherit] font-medium transition-all duration-300 ${view === 'dashboard' ? 'bg-white/20 text-white' : 'text-text-secondary'}`} onClick={() => setView('dashboard')}>📊 Dashboard</button>
              <button className={`py-2 px-4 bg-transparent border-none cursor-pointer rounded-lg font-[inherit] font-medium transition-all duration-300 ${view === 'map' ? 'bg-white/20 text-white' : 'text-text-secondary'}`} onClick={() => setView('map')}>🗺️ Map</button>
            </div>
          </header>

          {loading ? (
            <div className="text-center py-20 text-xl">Updating...</div>
          ) : (
            <>
              {view === 'dashboard' ? (
                <div className="flex flex-col gap-10 animate-[fadeIn_0.5s_ease]">
                  <div className="flex max-md:flex-col items-center max-md:items-start gap-10 max-md:gap-5">
                    <div className="flex items-center gap-5">
                      <span className="text-[5rem] drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]">{getWeatherIcon(weather?.current.condition)}</span>
                      <span className="text-[6rem] font-bold leading-none text-shadow-[0_4px_12px_rgba(0,0,0,0.3)]">{weather?.current.temp}°</span>
                    </div>
                    <div>
                      <h2 className="text-[2rem] font-semibold mb-2">{weather?.current.condition}</h2>
                      <p className="text-lg opacity-90">{weather?.current.description}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl mb-5 font-medium">5-Day Forecast</h3>
                    <div className="grid grid-cols-5 max-md:overflow-x-auto max-md:pb-5 gap-4">
                      {weather?.forecast.map((day, idx) => (
                        <div key={idx} className="bg-white/10 border border-glass-border rounded-2xl py-5 px-2.5 text-center flex flex-col gap-3 transition-all duration-300 cursor-default hover:bg-white/20 hover:-translate-y-1.5">
                          <span className="text-[0.9rem] uppercase font-semibold opacity-80">{day.day}</span>
                          <span className="text-[2.5rem] my-2">{getWeatherIcon(day.condition)}</span>
                          <span className="text-2xl font-bold">{day.temp}°</span>
                          <span className="text-[0.85rem] opacity-70">{day.condition}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-[400px] bg-black/30 rounded-[20px] relative overflow-hidden flex items-center justify-center border border-glass-border">
                  <div className="absolute top-5 left-5 bg-black/60 p-4 rounded-xl backdrop-blur-[4px]">
                    <span className="block font-semibold mb-1">Interactive Map Integration</span>
                    <p className="text-[0.85rem] opacity-80">Visualizing weather patterns for {weather?.current.city}</p>
                  </div>
                  <div className="text-[8rem] opacity-20">🗺️</div>
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
