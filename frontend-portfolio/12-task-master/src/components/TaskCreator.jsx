import { useState } from 'react'
import { useUserStore } from '../store/userStore'
import { Plus, Target, Flame, Crown, Clock, Zap, CheckCircle } from 'lucide-react'

const DIFFICULTY_OPTIONS = [
  { id: 'easy', label: 'Low', color: '#10b981', description: 'Quick task' },
  { id: 'medium', label: 'Medium', color: '#f59e0b', description: 'Regular task' },
  { id: 'hard', label: 'High', color: '#f97316', description: 'Complex task' },
  { id: 'boss', label: 'Critical', color: '#f43f5e', description: 'Major task' },
]

const TIME_PERIOD_PRESETS = [
  { id: 'morning', label: 'Morning', start: '04:00', end: '12:00', color: '#f59e0b', icon: '☀️' },
  { id: 'afternoon', label: 'Afternoon', start: '12:00', end: '17:00', color: '#f97316', icon: '🌤️' },
  { id: 'evening', label: 'Evening', start: '17:00', end: '21:00', color: '#e11d48', icon: '🌅' },
  { id: 'night', label: 'Night', start: '21:00', end: '04:00', color: '#6366f1', icon: '🌙' },
]

function buildISOFromTime(timeStr) {
  const now = new Date()
  const [hours, minutes] = timeStr.split(':').map(Number)
  now.setHours(hours, minutes, 0, 0)
  return now.toISOString()
}

export default function TaskCreator({ onCreateTask, squadMembers = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [difficulty, setDifficulty] = useState('easy')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(null)
  const [useCustomTime, setUseCustomTime] = useState(false)
  const [assignedTo, setAssignedTo] = useState(null)

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period.id)
    setStartTime(period.start)
    setEndTime(period.end)
    setUseCustomTime(false)
  }

  const handleCustomToggle = () => {
    setUseCustomTime(true)
    setSelectedPeriod(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return

    onCreateTask({
      title: title.trim(),
      description: description.trim(),
      difficulty,
      scheduledStartTime: startTime ? buildISOFromTime(startTime) : null,
      scheduledEndTime: endTime ? buildISOFromTime(endTime) : null,
      assignedTo,
    })

    setTitle('')
    setDescription('')
    setDifficulty('easy')
    setStartTime('')
    setEndTime('')
    setSelectedPeriod(null)
    setUseCustomTime(false)
    setAssignedTo(null)
    setIsOpen(false)
  }

  const getCurrentPeriod = () => {
    const hour = new Date().getHours()
    if (hour >= 4 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="new-task-banner flex items-center justify-center gap-2"
      >
        <Plus size={18} />
        New Task
      </button>
    )
  }

  const { player } = useUserStore()
  const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="card-fancy p-5 relative rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm text-white font-semibold flex items-center gap-2">
          <Plus size={16} className="text-indigo-400" />
          New Task
        </h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-400 hover:text-white text-xl transition-colors"
        >
          ×
        </button>
      </div>

      {/* Date */}
      <div className="bg-[var(--color-surface-dark)] rounded-lg p-2.5 mb-4 flex items-center justify-between">
        <span className="text-xs text-indigo-400 flex items-center gap-1 font-medium">📅 Today</span>
        <span className="text-sm text-gray-300">{todayStr}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1 font-medium">
            <Target size={12} className="text-indigo-400" />
            Task Name
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="app-input rounded-xl"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block font-medium">Description (Optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={2}
            className="app-input resize-none rounded-xl"
          />
        </div>

        {/* Priority */}
        <div>
          <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1 font-medium">
            <Flame size={12} className="text-rose-400" />
            Priority
          </label>
          <div className="grid grid-cols-4 gap-2">
            {DIFFICULTY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setDifficulty(opt.id)}
                className={`p-3 text-center transition-all rounded-xl ${difficulty === opt.id
                  ? 'ring-2'
                  : 'bg-[var(--color-surface-dark)] hover:bg-[var(--color-surface-light)]'
                  }`}
                style={difficulty === opt.id ? {
                  ringColor: opt.color,
                  borderColor: opt.color,
                  background: opt.color + '15'
                } : {}}
              >
                <div
                  className="w-3 h-3 rounded-full mx-auto mb-1.5"
                  style={{ background: opt.color }}
                />
                <div className="text-xs font-medium" style={{ color: opt.color }}>{opt.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Scheduling */}
        <div className="card p-4 rounded-xl">
          <label className="text-xs text-indigo-400 mb-3 block flex items-center gap-1 font-medium">
            <Clock size={12} />
            Schedule
          </label>

          {/* Period presets */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {TIME_PERIOD_PRESETS.map((period) => (
              <button
                key={period.id}
                type="button"
                onClick={() => handlePeriodSelect(period)}
                className={`p-2.5 text-center transition-all rounded-xl ${selectedPeriod === period.id
                  ? 'ring-2'
                  : period.id === getCurrentPeriod()
                    ? 'bg-[var(--color-surface-dark)] ring-1 ring-gray-600'
                    : 'bg-[var(--color-surface-dark)] hover:bg-[var(--color-surface-light)]'
                  }`}
                style={selectedPeriod === period.id ? {
                  background: period.color + '15'
                } : {}}
              >
                <div className="text-sm mb-0.5">{period.icon}</div>
                <div className="text-[11px] font-medium" style={{ color: selectedPeriod === period.id ? period.color : '#888' }}>{period.label}</div>
              </button>
            ))}
          </div>

          {/* Custom time toggle */}
          <button
            type="button"
            onClick={handleCustomToggle}
            className={`w-full text-xs py-2.5 px-3 rounded-lg mb-3 flex items-center justify-center gap-1 transition-all font-medium ${useCustomTime
              ? 'bg-indigo-500/15 border border-indigo-500/30 text-indigo-400'
              : 'bg-[var(--color-surface-dark)] border border-[var(--color-border)] text-gray-400 hover:text-white hover:border-gray-500'
              }`}
          >
            <Zap size={10} />
            Custom Time
          </button>

          {/* Time inputs */}
          {(startTime || endTime || useCustomTime) && (
            <div className="grid grid-cols-2 gap-3 p-2.5 bg-[var(--color-surface-dark)] rounded-lg">
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block font-medium">From</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value)
                    setSelectedPeriod(null)
                    setUseCustomTime(true)
                  }}
                  className="app-input-time rounded-lg"
                />
              </div>
              <div>
                <label className="text-[11px] text-gray-500 mb-1 block font-medium">To</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value)
                    setSelectedPeriod(null)
                    setUseCustomTime(true)
                  }}
                  className="app-input-time rounded-lg"
                />
              </div>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-2">
            Pick a period or set a custom time · 20+ min late = penalty
          </p>
        </div>

        {/* Squad Assignment */}
        {squadMembers.length > 0 && (
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block flex items-center gap-1 font-medium">
              <Crown size={12} /> Assign To
            </label>
            <select
              value={assignedTo || ''}
              onChange={(e) => setAssignedTo(e.target.value || null)}
              className="w-full game-select rounded-xl"
            >
              <option value="">Everyone</option>
              {squadMembers.map((member) => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>
        )}

        {/* Submit */}
        <button type="submit" className="action-btn action-btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3">
          <CheckCircle size={16} />
          Create Task
        </button>
      </form>
    </div>
  )
}
