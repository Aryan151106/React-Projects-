import { useState, useEffect, useMemo } from 'react'
import './index.css'

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
  const [view, setView] = useState('browse')

  useEffect(() => { const saved = localStorage.getItem('moviesdb_watchlist'); if (saved) setWatchlist(JSON.parse(saved)) }, [])
  useEffect(() => { localStorage.setItem('moviesdb_watchlist', JSON.stringify(watchlist)) }, [watchlist])

  const filteredMovies = useMemo(() => movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || movie.genre.includes(selectedGenre)
    return matchesSearch && matchesGenre
  }), [movies, search, selectedGenre])

  const watchlistMovies = useMemo(() => movies.filter(movie => watchlist.includes(movie.id)), [movies, watchlist])
  const toggleWatchlist = (movieId) => setWatchlist(prev => prev.includes(movieId) ? prev.filter(id => id !== movieId) : [...prev, movieId])
  const isInWatchlist = (movieId) => watchlist.includes(movieId)
  const displayMovies = view === 'watchlist' ? watchlistMovies : filteredMovies

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex max-md:flex-col justify-between items-center py-4 px-10 max-md:px-5 max-md:gap-4 bg-[linear-gradient(to_bottom,rgba(10,10,15,0.95),transparent)] sticky top-0 z-[100] backdrop-blur-[10px]">
        <div>
          <h1 className="text-2xl font-bold gradient-text-red">🎬 CineVault</h1>
        </div>
        <div className="flex-1 max-w-[500px] mx-10 max-md:mx-0 max-md:w-full max-md:max-w-none">
          <div className="flex items-center gap-3 px-5 bg-bg-secondary border border-border rounded-[30px] transition-all duration-300 focus-within:border-accent-primary focus-within:shadow-[0_0_0_3px_rgba(229,9,20,0.15)]">
            <span>🔍</span>
            <input type="text" placeholder="Search movies..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 py-3.5 bg-transparent border-none text-text-primary text-[0.9rem] focus:outline-none placeholder:text-text-secondary" />
          </div>
        </div>
        <div className="flex gap-3 max-sm:w-full max-sm:justify-center">
          <button className={`py-2.5 px-5 border rounded-lg text-[0.9rem] cursor-pointer transition-all duration-300 ${view === 'browse' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-transparent border-border text-text-secondary hover:border-text-secondary hover:text-text-primary'}`} onClick={() => setView('browse')}>🎥 Browse</button>
          <button className={`py-2.5 px-5 border rounded-lg text-[0.9rem] cursor-pointer transition-all duration-300 ${view === 'watchlist' ? 'bg-accent-primary border-accent-primary text-white' : 'bg-transparent border-border text-text-secondary hover:border-text-secondary hover:text-text-primary'}`} onClick={() => setView('watchlist')}>⭐ Watchlist ({watchlist.length})</button>
        </div>
      </header>

      {/* Genre Filter */}
      {view === 'browse' && (
        <div className="flex gap-3 py-5 px-10 max-md:px-5 max-md:py-3 overflow-x-auto scrollbar-none">
          {GENRES.map(genre => (
            <button key={genre} className={`py-2.5 px-6 border rounded-3xl text-[0.85rem] font-medium cursor-pointer whitespace-nowrap transition-all duration-300 ${selectedGenre === genre ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-secondary border-border text-text-secondary hover:text-text-primary hover:border-text-secondary'}`} onClick={() => setSelectedGenre(genre)}>{genre}</button>
          ))}
        </div>
      )}

      {/* Movie Grid */}
      <main className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] max-md:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] max-sm:grid-cols-2 gap-6 max-md:gap-4 py-5 px-10 max-md:px-5 pb-16">
        {displayMovies.length === 0 ? (
          <div className="col-span-full text-center py-20 px-5">
            <span className="text-6xl block mb-4 opacity-50">{view === 'watchlist' ? '⭐' : '🎬'}</span>
            <h3 className="text-xl mb-2">{view === 'watchlist' ? 'Your watchlist is empty' : 'No movies found'}</h3>
            <p className="text-text-secondary">{view === 'watchlist' ? 'Add movies to your watchlist to see them here' : 'Try a different search or genre'}</p>
          </div>
        ) : (
          displayMovies.map(movie => (
            <div key={movie.id} className="cursor-pointer transition-transform duration-300 hover:scale-105 group" onClick={() => setSelectedMovie(movie)}>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-bg-card">
                <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.9),transparent_60%)] flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[0.9rem] font-semibold mb-2">⭐ {movie.rating}</span>
                  <button className={`py-2 px-4 backdrop-blur-[4px] border rounded-full text-[0.85rem] cursor-pointer transition-all duration-300 ${isInWatchlist(movie.id) ? 'bg-accent-gold border-accent-gold text-[#1a1a1a]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                    onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie.id) }}>
                    {isInWatchlist(movie.id) ? '★ Added' : '☆ Add'}
                  </button>
                </div>
              </div>
              <div className="py-3 px-1">
                <h3 className="text-[0.95rem] font-semibold mb-1.5 leading-tight">{movie.title}</h3>
                <div className="flex gap-2 text-[0.8rem] text-text-secondary">
                  <span className="text-accent-primary font-medium">{movie.year}</span>
                  <span>{movie.genre.slice(0, 2).join(' • ')}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </main>

      {/* Movie Details Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-[8px] flex items-center justify-center z-[1000] p-10 max-md:p-5 animate-[fadeIn_0.3s_ease]" onClick={() => setSelectedMovie(null)}>
          <div className="relative w-full max-w-[900px] max-h-[90vh] bg-bg-secondary rounded-xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-[slideUp_0.4s_ease]" onClick={e => e.stopPropagation()}>
            <button className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-[4px] border-none rounded-full text-white text-2xl cursor-pointer z-10 transition-colors duration-300 hover:bg-black/80" onClick={() => setSelectedMovie(null)}>×</button>
            <div className="relative h-[300px] bg-cover bg-center" style={{ backgroundImage: `url(${selectedMovie.backdrop})` }}>
              <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg-secondary),transparent_60%)]" />
            </div>
            <div className="flex max-md:flex-col max-md:items-center max-md:text-center gap-8 py-6 px-8 -mt-[100px] relative">
              <div className="shrink-0">
                <img src={selectedMovie.poster} alt={selectedMovie.title} className="w-[180px] max-sm:w-[140px] rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]" />
              </div>
              <div className="flex-1 pt-20 max-md:pt-0">
                <h1 className="text-[2rem] font-bold mb-3">{selectedMovie.title}</h1>
                <div className="flex flex-wrap gap-4 mb-5 text-[0.9rem] text-text-secondary">
                  <span className="text-accent-primary font-semibold">{selectedMovie.year}</span>
                  <span className="text-accent-gold">⭐ {selectedMovie.rating}</span>
                  <span>{selectedMovie.genre.join(' • ')}</span>
                </div>
                <p className="text-text-secondary leading-relaxed mb-6">{selectedMovie.overview}</p>
                <div className="flex max-sm:flex-col max-md:justify-center gap-4">
                  <button className="py-3.5 px-6 bg-accent-primary border-none rounded-lg text-[0.95rem] font-semibold text-white cursor-pointer transition-all duration-300 hover:bg-accent-secondary hover:-translate-y-0.5">▶️ Watch Trailer</button>
                  <button className={`py-3.5 px-6 border-2 rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-all duration-300 bg-transparent ${isInWatchlist(selectedMovie.id) ? 'bg-accent-gold/10 border-accent-gold text-accent-gold' : 'border-border text-text-primary hover:border-accent-gold hover:text-accent-gold'}`}
                    onClick={() => toggleWatchlist(selectedMovie.id)}>
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
