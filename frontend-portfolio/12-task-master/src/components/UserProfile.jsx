import { useState, useRef } from 'react'
import { useUserStore } from '../store/userStore'
import { Star, Zap, Trophy, BarChart3, Upload, User, TrendingUp } from 'lucide-react'

export default function UserProfile() {
  const { player, userPhoto, setUserPhoto, setPlayerName } = useUserStore()
  const [editingName, setEditingName] = useState(false)
  const [tempName, setTempName] = useState(player.name)
  const fileInputRef = useRef(null)

  const expPercentage = (player.exp / player.expToNext) * 100
  const consistencyPoints = player.streak * 10 + player.totalTasksCompleted * 2

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setUserPhoto(ev.target.result)
    }
    reader.readAsDataURL(file)
  }

  const handleNameSave = () => {
    if (tempName.trim()) {
      setPlayerName(tempName.trim())
    }
    setEditingName(false)
  }

  return (
    <div className="card-fancy p-4 relative rounded-xl">
      {/* Title bar */}
      <div className="absolute -top-2.5 left-4 bg-[var(--color-surface)] px-3 py-0.5 rounded-full text-xs text-[var(--color-primary)] font-semibold border border-[var(--color-border)]">
        Profile
      </div>

      <div className="flex items-start gap-4 mt-3">
        {/* Avatar with upload support */}
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-16 h-16 rounded-xl bg-[var(--color-surface-dark)] border border-[var(--color-border)] flex items-center justify-center overflow-hidden">
            {userPhoto ? (
              <img
                src={userPhoto}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={28} className="text-[var(--color-primary)]" />
            )}
          </div>

          {/* Upload overlay on hover */}
          <div className="absolute inset-0 rounded-xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Upload size={16} className="text-white" />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Level Badge */}
          <div className="absolute -bottom-1.5 -right-1.5 bg-[var(--color-warning)] text-[var(--color-text)] text-[10px] px-2 py-0.5 rounded-full font-bold border border-[var(--color-border)]">
            Lv.{player.level}
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-3">
          {/* Player Name (editable) */}
          <div className="flex items-center gap-2">
            {editingName ? (
              <input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleNameSave}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                className="text-sm font-bold text-[var(--color-text)] bg-transparent border-b border-[var(--color-primary)] outline-none w-full"
                autoFocus
              />
            ) : (
              <span
                className="text-sm font-bold text-[var(--color-text)] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
                onClick={() => { setTempName(player.name); setEditingName(true) }}
                title="Click to edit name"
              >
                {player.name}
              </span>
            )}
          </div>

          {/* Consistency Points */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[var(--color-warning)] font-medium">
                <TrendingUp size={12} />
                Consistency
              </span>
              <span className="text-[var(--color-warning)] font-bold">{consistencyPoints} pts</span>
            </div>
            <div className="stat-bar" style={{ height: '6px' }}>
              <div
                className="stat-bar-fill"
                style={{
                  width: `${Math.min(100, (consistencyPoints / (player.level * 50)) * 100)}%`,
                  background: 'var(--color-warning)'
                }}
              />
            </div>
          </div>

          {/* EXP Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[var(--color-primary)] font-medium">
                <Star size={12} />
                Experience
              </span>
              <span className="text-[var(--color-text-muted)] font-medium">{player.exp}/{player.expToNext}</span>
            </div>
            <div className="stat-bar stat-bar-exp">
              <div
                className="stat-bar-fill"
                style={{ width: `${expPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
        <div className="flex-1 text-center bg-[var(--color-surface-dark)] p-2.5 rounded-lg">
          <Trophy size={16} className="text-[var(--color-warning)] mx-auto mb-1" />
          <div className="text-sm font-bold text-[var(--color-warning)]">{player.totalTasksCompleted}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] font-medium">Done</div>
        </div>
        <div className="flex-1 text-center bg-[var(--color-surface-dark)] p-2.5 rounded-lg">
          <BarChart3 size={16} className="text-[var(--color-primary)] mx-auto mb-1" />
          <div className="text-sm font-bold text-[var(--color-primary)]">{player.level}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] font-medium">Level</div>
        </div>
        <div className="flex-1 text-center bg-[var(--color-surface-dark)] p-2.5 rounded-lg">
          <Zap size={16} className="text-[var(--color-danger)] mx-auto mb-1" />
          <div className="text-sm font-bold text-[var(--color-danger)]">{player.streak}</div>
          <div className="text-[10px] text-[var(--color-text-muted)] font-medium">Streak</div>
        </div>
      </div>
    </div>
  )
}
