import { useEffect, useMemo, useRef, useState } from 'react'
import './index.css'

const playlist = [
  {
    id: 1,
    title: 'Sunrise Run',
    artist: 'Luma Drive',
    length: '06:12',
    cover:
      'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=900&q=80',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 2,
    title: 'Neon Streets',
    artist: 'Pulse Theory',
    length: '05:49',
    cover:
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=900&q=80',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 3,
    title: 'Deep Focus',
    artist: 'Signal Bloom',
    length: '05:01',
    cover:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
]

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function App() {
  const audioRef = useRef(null)
  const [trackIndex, setTrackIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [search, setSearch] = useState('')

  const activeTrack = playlist[trackIndex]

  const filteredTracks = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return playlist
    return playlist.filter(
      (track) =>
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query),
    )
  }, [search])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const onLoadedMetadata = () => setDuration(audio.duration || 0)
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => {
      setTrackIndex((prev) => (prev + 1) % playlist.length)
    }

    audio.addEventListener('loadedmetadata', onLoadedMetadata)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.load()
    setCurrentTime(0)
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [trackIndex, isPlaying])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
      return
    }
    try {
      await audio.play()
      setIsPlaying(true)
    } catch {
      setIsPlaying(false)
    }
  }

  const nextTrack = () => {
    setTrackIndex((prev) => (prev + 1) % playlist.length)
  }

  const previousTrack = () => {
    setTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length)
  }

  const seekTrack = (event) => {
    const audio = audioRef.current
    if (!audio) return
    const nextTime = Number(event.target.value)
    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const selectTrack = (trackId) => {
    const nextIndex = playlist.findIndex((track) => track.id === trackId)
    if (nextIndex >= 0) {
      setTrackIndex(nextIndex)
      setIsPlaying(true)
    }
  }

  return (
    <div className="app-shell">
      <audio ref={audioRef} preload="metadata">
        <source src={activeTrack.src} type="audio/mpeg" />
      </audio>

      <header className="app-header">
        <div>
          <p className="kicker">Studio Session</p>
          <h1>Playback Deck</h1>
        </div>
        <p>Curated audio queue with focus-friendly controls</p>
      </header>

      <main className="layout-grid">
        <section className="player-card">
          <div className="cover-wrap">
            <img src={activeTrack.cover} alt={activeTrack.title} className="cover-image" />
            <div className="cover-glow" />
            <p className="floating-badge">Now Playing</p>
          </div>

          <div className="track-meta">
            <p className="eyebrow">Current selection</p>
            <h2>{activeTrack.title}</h2>
            <p>{activeTrack.artist}</p>
          </div>

          <div className="timeline">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={seekTrack}
            />
            <span>{formatTime(duration)}</span>
          </div>

          <div className="controls">
            <button type="button" onClick={previousTrack} aria-label="Previous track">
              PREV
            </button>
            <button type="button" className="primary" onClick={togglePlay} aria-label="Play or pause">
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </button>
            <button type="button" onClick={nextTrack} aria-label="Next track">
              NEXT
            </button>
          </div>

          <div className="volume-row">
            <label htmlFor="volume">Volume</label>
            <input
              id="volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
            />
          </div>
        </section>

        <section className="playlist-card">
          <div className="playlist-head">
            <h2>Playlist</h2>
            <input
              type="text"
              placeholder="Search songs or artists"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="track-list">
            {filteredTracks.length === 0 && <p className="empty-state">No tracks found.</p>}
            {filteredTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className={`track-item ${track.id === activeTrack.id ? 'active' : ''}`}
                onClick={() => selectTrack(track.id)}
              >
                <img src={track.cover} alt={track.title} />
                <span>
                  <strong>{track.title}</strong>
                  <small>{track.artist}</small>
                </span>
                <em>{track.length}</em>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
