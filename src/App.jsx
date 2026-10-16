
import { useState, useRef, useEffect } from 'react'
import {
  AudioLines,
  House,
  Library,
  Heart,
  ListMusic,
  Search,
  Plus,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Shuffle,
  Repeat,
  FileAudio,
} from 'lucide-react'
import './App.css'

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remaining = Math.floor(seconds % 60)

  return `${minutes}:${String(remaining).padStart(2, '0')}`
}

function App() {
  const [activePage, setActivePage] = useState('Home')
  const [tracks, setTracks] = useState([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [search, setSearch] = useState('')
  const [volume, setVolume] = useState(0.7)
  const [likedTracks, setLikedTracks] = useState([])
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [shuffle, setShuffle] = useState(false)
  const [repeat, setRepeat] = useState(false)

  const fileInput = useRef(null)
  const audioRef = useRef(null)
  const tracksRef = useRef([])

  const currentTrack = tracks[currentIndex] || null

  function importMusic(event) {
    const files = Array.from(event.target.files || [])
    const audioFiles = files.filter(file => file.type.startsWith('audio/'))

    const newTracks = audioFiles.map(file => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Local file',
      url: URL.createObjectURL(file),
    }))

    tracksRef.current = [...tracksRef.current, ...newTracks]
    setTracks(tracksRef.current)
    event.target.value = ''
  }

  function playTrack(index) {
    if (index < 0 || index >= tracks.length) return

    setCurrentIndex(index)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(true)
  }

  function togglePlayback() {
    if (!tracks.length) {
      fileInput.current?.click()
      return
    }

    if (currentIndex === -1) {
      playTrack(0)
    } else {
      setIsPlaying(playing => !playing)
    }
  }

  function nextTrack() {
    if (!tracks.length) return

    let nextIndex

    if (shuffle && tracks.length > 1) {
      do {
        nextIndex = Math.floor(Math.random() * tracks.length)
      } while (nextIndex === currentIndex)
    } else {
      nextIndex = (currentIndex + 1) % tracks.length
    }

    setCurrentIndex(nextIndex)
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(true)
  }

  function previousTrack() {
    const audio = audioRef.current

    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setCurrentTime(0)
      return
    }

    if (!tracks.length) return

    setCurrentIndex(index =>
      index <= 0 ? tracks.length - 1 : index - 1
    )
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(true)
  }

  function seekTo(value) {
    const audio = audioRef.current
    if (!audio || !Number.isFinite(audio.duration)) return

    const time = Math.min(Math.max(value, 0), audio.duration)
    audio.currentTime = time
    setCurrentTime(time)
  }

  function toggleLike(id) {
    setLikedTracks(previous =>
      previous.includes(id)
        ? previous.filter(trackId => trackId !== id)
        : [...previous, id]
    )
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    audio.src = currentTrack.url
    audio.load()
  }, [currentTrack?.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = volume

    if (isPlaying && currentTrack) {
      audio.play().catch(() => setIsPlaying(false))
    } else {
      audio.pause()
    }
  }, [isPlaying, currentTrack?.id, volume])

  useEffect(() => {
    return () => {
      tracksRef.current.forEach(track => URL.revokeObjectURL(track.url))
    }
  }, [])

  const visibleTracks = tracks.filter(track => {
    const matchesSearch = track.title
      .toLowerCase()
      .includes(search.toLowerCase())

    if (!matchesSearch) return false
    if (activePage === 'Liked Songs') return likedTracks.includes(track.id)

    return true
  })

  const progress = duration > 0
    ? Math.min((currentTime / duration) * 100, 100)
    : 0

  return (
    <div className="app">
      <div className="haunted-backdrop" aria-hidden="true">
        <span className="decor decor-one">🎃</span>
        <span className="decor decor-two">🕸️</span>
        <span className="decor decor-three">🎃</span>
        <span className="decor decor-four">🦇</span>
        <span className="decor decor-five">🕸️</span>
        <span className="decor decor-six">🎃</span>
        <span className="decor decor-seven">🦇</span>
      </div>

      <audio
        ref={audioRef}
        onLoadedMetadata={event => {
          setDuration(event.currentTarget.duration || 0)
        }}
        onDurationChange={event => {
          setDuration(event.currentTarget.duration || 0)
        }}
        onTimeUpdate={event => {
          if (!isSeeking) {
            setCurrentTime(event.currentTarget.currentTime)
          }
        }}
        onEnded={() => {
          if (repeat && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
          } else {
            nextTrack()
          }
        }}
      />

      <input
        ref={fileInput}
        type="file"
        accept="audio/*"
        multiple
        hidden
        onChange={importMusic}
      />

      <aside className="sidebar">
        <div className="brand">
          <span className="brand-pumpkin" aria-hidden="true">🎃</span>
          <span>VOIDPLAYER</span>
        </div>

        <p className="section-label">The crypt</p>

        <nav className="navigation">
          {[
            { name: 'Home', icon: House },
            { name: 'Library', icon: Library },
            { name: 'Liked Songs', icon: Heart },
          ].map(({ name, icon: Icon }) => (
            <button
              key={name}
              className={`nav-item ${activePage === name ? 'active' : ''}`}
              onClick={() => setActivePage(name)}
            >
              {name === 'Library'
                ? <span className="nav-pumpkin">🎃</span>
                : <Icon size={18} />}
              <span>{name}</span>
            </button>
          ))}
        </nav>

        <div className="playlist-heading">
          <p className="section-label">Your playlists</p>
          <button
            className="icon-button"
            aria-label="Add music"
            onClick={() => fileInput.current?.click()}
          >
            <Plus size={18} />
          </button>
        </div>

        <button
          className={`nav-item ${activePage === 'My Playlist' ? 'active' : ''}`}
          onClick={() => setActivePage('My Playlist')}
        >
          <span className="nav-pumpkin">🎃</span>
          <span>My Playlist</span>
        </button>

        <div className="sidebar-art" aria-hidden="true">
          <span>🕯️</span>
          <span>🎃</span>
          <span>🕯️</span>
        </div>

        <div className="sidebar-footer">
          <span className="status-dot" />
          <span>Your files, your music</span>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <label className="search-box">
            <span className="search-pumpkin" aria-hidden="true">🎃</span>
            <input
              type="search"
              placeholder="Search your music..."
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </label>

          <div className="profile" title="VOIDPLAYER">VP</div>
        </header>

        <section className="welcome">
          <p className="eyebrow">YOUR MUSIC, YOUR SPACE</p>
          <h1>{activePage === 'Home' ? 'Back in the void.' : activePage}</h1>
          <p className="subtitle">
            A little corner for the music you keep coming back to.
          </p>
          <span className="welcome-pumpkin" aria-hidden="true">🎃</span>
        </section>

        <section className="library-section">
          <div className="library-banner">
            <div className="banner-icon" aria-hidden="true">🎃</div>
            <div>
              <h2>{activePage === 'Home' ? 'Your music' : activePage}</h2>
              <p>
                {visibleTracks.length} {visibleTracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>

            <button
              className="import-button"
              onClick={() => fileInput.current?.click()}
            >
              <span aria-hidden="true">🎃</span>
              Add music
            </button>
          </div>

          {visibleTracks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎃</div>
              <h3>{search ? 'No matches this time.' : 'The crypt is quiet.'}</h3>
              <p>
                {search
                  ? 'Try another title.'
                  : 'Bring your own music. The pumpkins are getting bored.'}
              </p>
              {!search && (
                <button
                  className="primary-button"
                  onClick={() => fileInput.current?.click()}
                >
                  <Plus size={17} />
                  Pick some music
                </button>
              )}
            </div>
          ) : (
            <div className="track-list">
              <div className="track-list-header">
                <span>#</span>
                <span>Track</span>
                <span className="source-heading">Source</span>
                <span className="header-pumpkin">🎃</span>
              </div>

              {visibleTracks.map((track, rowIndex) => {
                const index = tracks.findIndex(item => item.id === track.id)
                const isCurrent = index === currentIndex
                const isLiked = likedTracks.includes(track.id)

                return (
                  <div
                    className={`track-row ${isCurrent ? 'current-track' : ''}`}
                    key={track.id}
                  >
                    <span className="track-number">
                      {isCurrent && isPlaying
                        ? <AudioLines size={17} />
                        : rowIndex + 1}
                    </span>

                    <div className="track-main">
                      <button
                        className="track-cover"
                        aria-label={`Play ${track.title}`}
                        onClick={() => {
                          if (isCurrent) {
                            setIsPlaying(playing => !playing)
                          } else {
                            playTrack(index)
                          }
                        }}
                      >
                        <span aria-hidden="true">🎃</span>
                        <span className="cover-play">
                          {isCurrent && isPlaying
                            ? <Pause size={17} />
                            : <Play size={17} fill="currentColor" />}
                        </span>
                      </button>

                      <button
                        className="track-name"
                        onClick={() => {
                          if (isCurrent) {
                            setIsPlaying(playing => !playing)
                          } else {
                            playTrack(index)
                          }
                        }}
                      >
                        <span className="track-title">{track.title}</span>
                        <span className="track-artist">{track.artist}</span>
                      </button>
                    </div>

                    <span className="track-source">
                      <FileAudio size={16} />
                      Local file
                    </span>

                    <button
                      className={`like-button ${isLiked ? 'liked' : ''}`}
                      aria-label={isLiked ? 'Unlike track' : 'Like track'}
                      onClick={() => toggleLike(track.id)}
                    >
                      <Heart
                        size={18}
                        fill={isLiked ? 'currentColor' : 'none'}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <div className="bottom-decoration" aria-hidden="true">
          <span>🎃</span>
          <span>🕯️</span>
          <span>🎃</span>
        </div>
      </main>

      <footer className="player-bar">
        <div className="now-playing">
          <div className="player-cover">
            {currentTrack ? '🎃' : <Music2 size={22} />}
          </div>

          <div className="now-playing-text">
            <p className="track-title">
              {currentTrack?.title || 'Nothing playing'}
            </p>
            <p className="track-artist">
              {currentTrack?.artist || 'Pick a song from your library'}
            </p>
          </div>

          {currentTrack && (
            <button
              className={`like-button ${likedTracks.includes(currentTrack.id) ? 'liked' : ''}`}
              aria-label="Like current track"
              onClick={() => toggleLike(currentTrack.id)}
            >
              <Heart
                size={17}
                fill={likedTracks.includes(currentTrack.id) ? 'currentColor' : 'none'}
              />
            </button>
          )}
        </div>

        <div className="player-center">
          <div className="playback-controls">
            <button
              className={`player-icon ${shuffle ? 'control-active' : ''}`}
              aria-label="Toggle shuffle"
              onClick={() => setShuffle(value => !value)}
            >
              <Shuffle size={17} />
            </button>

            <button
              className="player-icon"
              aria-label="Previous track"
              onClick={previousTrack}
            >
              <SkipBack size={19} />
            </button>

            <button
              className="play-button"
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={togglePlayback}
            >
              {isPlaying
                ? <Pause size={20} fill="currentColor" />
                : <Play size={20} fill="currentColor" />}
            </button>

            <button
              className="player-icon"
              aria-label="Next track"
              onClick={nextTrack}
            >
              <SkipForward size={19} />
            </button>

            <button
              className={`player-icon ${repeat ? 'control-active' : ''}`}
              aria-label="Toggle repeat"
              onClick={() => setRepeat(value => !value)}
            >
              <Repeat size={17} />
            </button>
          </div>

          <div className="seek-row">
            <span className="time-label">{formatTime(currentTime)}</span>
            <input
              className="seek-bar"
              aria-label="Seek through track"
              type="range"
              min="0"
              max={duration || 0}
              step="0.1"
              value={Math.min(currentTime, duration || 0)}
              disabled={!currentTrack || !duration}
              style={{ '--progress': `${progress}%` }}
              onPointerDown={() => setIsSeeking(true)}
              onChange={event => setCurrentTime(Number(event.target.value))}
              onPointerUp={event => {
                seekTo(Number(event.currentTarget.value))
                setIsSeeking(false)
              }}
              onKeyUp={event => {
                if (event.key.startsWith('Arrow')) {
                  seekTo(Number(event.currentTarget.value))
                }
              }}
              onBlur={event => {
                if (isSeeking) {
                  seekTo(Number(event.currentTarget.value))
                  setIsSeeking(false)
                }
              }}
            />
            <span className="time-label">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="volume-control">
          <Volume2 size={18} />
          <input
            aria-label="Volume"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={event => setVolume(Number(event.target.value))}
          />
          <span className="volume-pumpkin" aria-hidden="true">🎃</span>
        </div>
      </footer>
    </div>
  )
}

export default App
