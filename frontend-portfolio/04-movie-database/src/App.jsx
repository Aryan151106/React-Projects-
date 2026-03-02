import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Movie Database App with Search, Browse, and Watchlist

// Mock movie data (simulating TMDB API response)
const MOCK_MOVIES = [
  { id: 1, title: 'Inception', year: 2010, rating: 8.8, genre: ['Sci-Fi', 'Action'], poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400', backdrop: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', overview: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.' },
  { id: 2, title: 'The Dark Knight', year: 2008, rating: 9.0, genre: ['Action', 'Drama'], poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400', backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800', overview: 'When the menace known as the Joker wreaks havoc on Gotham City, Batman must accept one of the greatest tests of his ability to fight injustice.' },
  { id: 3, title: 'Interstellar', year: 2014, rating: 8.6, genre: ['Sci-Fi', 'Adventure'], poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400', backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800', overview: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.' },
  { id: 4, title: 'Pulp Fiction', year: 1994, rating: 8.9, genre: ['Crime', 'Drama'], poster: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=400', backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', overview: 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.' },
  { id: 5, title: 'The Matrix', year: 1999, rating: 8.7, genre: ['Sci-Fi', 'Action'], poster: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400', backdrop: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800', overview: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.' },
  { id: 6, title: 'Fight Club', year: 1999, rating: 8.8, genre: ['Drama', 'Thriller'], poster: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=400', backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800', overview: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club.' },
  { id: 7, title: 'Forrest Gump', year: 1994, rating: 8.8, genre: ['Drama', 'Romance'], poster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=400', backdrop: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=800', overview: 'The presidencies of Kennedy and Johnson, the Vietnam War, and other historical events unfold from the perspective of an Alabama man.' },
  { id: 8, title: 'The Godfather', year: 1972, rating: 9.2, genre: ['Crime', 'Drama'], poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400', backdrop: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', overview: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.' },
  { id: 9, title: 'Gladiator', year: 2000, rating: 8.5, genre: ['Action', 'Drama'], poster: 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=400', backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800', overview: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family.' },
  { id: 10, title: 'Titanic', year: 1997, rating: 8.4, genre: ['Drama', 'Romance'], poster: 'https://images.unsplash.com/photo-1518930259200-3e5b29f42096?w=400', backdrop: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', overview: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.' },
  { id: 11, title: 'Avatar', year: 2009, rating: 7.9, genre: ['Sci-Fi', 'Adventure'], poster: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400', backdrop: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800', overview: 'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following orders and protecting the world he feels is his home.' },
  { id: 12, title: 'Joker', year: 2019, rating: 8.4, genre: ['Crime', 'Drama'], poster: 'https://images.unsplash.com/photo-1534809027769-b00d750a6bac?w=400', backdrop: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800', overview: 'In Gotham City, mentally troubled comedian Arthur Fleck is disregarded and mistreated by society.' }
]

const GENRES = ['All', 'Action', 'Sci-Fi', 'Drama', 'Crime', 'Romance', 'Thriller', 'Adventure']

function App() {
  const [movies] = useState(MOCK_MOVIES)
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [watchlist, setWatchlist] = useState([])
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [view, setView] = useState('browse') // browse or watchlist

  // Load watchlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('moviesdb_watchlist')
    if (saved) setWatchlist(JSON.parse(saved))
  }, [])

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('moviesdb_watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  // Filtered movies
  const filteredMovies = useMemo(() => {
    return movies.filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase())
      const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre)
      return matchesSearch && matchesGenre
    })
  }, [movies, search, selectedGenre])

  // Watchlist movies
  const watchlistMovies = useMemo(() => {
    return movies.filter(movie => watchlist.includes(movie.id))
  }, [movies, watchlist])

  const toggleWatchlist = (movieId) => {
    setWatchlist(prev =>
      prev.includes(movieId)
        ? prev.filter(id => id !== movieId)
        : [...prev, movieId]
    )
  }

  const isInWatchlist = (movieId) => watchlist.includes(movieId)

  const displayMovies = view === 'watchlist' ? watchlistMovies : filteredMovies

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>🎬 CineVault</h1>
        </div>
        <div className="header-center">
          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="header-right">
          <button
            className={`nav-btn ${view === 'browse' ? 'active' : ''}`}
            onClick={() => setView('browse')}
          >
            🎥 Browse
          </button>
          <button
            className={`nav-btn ${view === 'watchlist' ? 'active' : ''}`}
            onClick={() => setView('watchlist')}
          >
            ⭐ Watchlist ({watchlist.length})
          </button>
        </div>
      </header>

      {/* Genre Filter */}
      {view === 'browse' && (
        <div className="genre-filter">
          {GENRES.map(genre => (
            <button
              key={genre}
              className={`genre-btn ${selectedGenre === genre ? 'active' : ''}`}
              onClick={() => setSelectedGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* Movie Grid */}
      <main className="movie-grid">
        {displayMovies.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">{view === 'watchlist' ? '⭐' : '🎬'}</span>
            <h3>{view === 'watchlist' ? 'Your watchlist is empty' : 'No movies found'}</h3>
            <p>{view === 'watchlist' ? 'Add movies to your watchlist to see them here' : 'Try a different search or genre'}</p>
          </div>
        ) : (
          displayMovies.map(movie => (
            <div key={movie.id} className="movie-card" onClick={() => setSelectedMovie(movie)}>
              <div className="movie-poster">
                <img src={movie.poster} alt={movie.title} />
                <div className="movie-overlay">
                  <span className="rating">⭐ {movie.rating}</span>
                  <button
                    className={`watchlist-btn ${isInWatchlist(movie.id) ? 'added' : ''}`}
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie.id) }}
                  >
                    {isInWatchlist(movie.id) ? '★ Added' : '☆ Add'}
                  </button>
                </div>
              </div>
              <div className="movie-info">
                <h3>{movie.title}</h3>
                <div className="movie-meta">
                  <span className="year">{movie.year}</span>
                  <span className="genres">{movie.genre.slice(0, 2).join(' • ')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="modal-overlay" onClick={() => setSelectedMovie(null)}>
          <div className="modal movie-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedMovie(null)}>×</button>
            <div className="movie-backdrop" style={{ backgroundImage: `url(${selectedMovie.backdrop})` }}>
              <div className="backdrop-overlay" />
            </div>
            <div className="modal-content">
              <div className="modal-poster">
                <img src={selectedMovie.poster} alt={selectedMovie.title} />
              </div>
              <div className="modal-details">
                <h1>{selectedMovie.title}</h1>
                <div className="modal-meta">
                  <span className="year">{selectedMovie.year}</span>
                  <span className="rating">⭐ {selectedMovie.rating}</span>
                  <span className="genres">{selectedMovie.genre.join(' • ')}</span>
                </div>
                <p className="overview">{selectedMovie.overview}</p>
                <div className="modal-actions">
                  <button className="btn-play">
                    ▶️ Watch Trailer
                  </button>
                  <button
                    className={`btn-watchlist ${isInWatchlist(selectedMovie.id) ? 'added' : ''}`}
                    onClick={() => toggleWatchlist(selectedMovie.id)}
                  >
                    {isInWatchlist(selectedMovie.id) ? '★ In Watchlist' : '☆ Add to Watchlist'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
