import { useState, useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useUserStore } from '../store/userStore'
import { CheckCircle, Star, XCircle, Clock, Play, Timer } from 'lucide-react'

const DIFFICULTY_CONFIG = {
  easy: { color: '#10b981', label: 'Low', bg: 'bg-emerald-500/10' },
  medium: { color: '#f59e0b', label: 'Medium', bg: 'bg-amber-500/10' },
  hard: { color: '#f97316', label: 'High', bg: 'bg-orange-500/10' },
  boss: { color: '#f43f5e', label: 'Critical', bg: 'bg-rose-500/10' },
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function TaskCard({ task, onComplete, onFail, onLateStart, onLateEnd }) {
  const { completeTask, startTask, endTask } = useTaskStore()
  const { gainExp, gainGold, incrementTasksCompleted, incrementStreak } = useUserStore()

  const [showVictory, setShowVictory] = useState(false)
  const [elapsed, setElapsed] = useState('')

  const config = DIFFICULTY_CONFIG[task.difficulty]

  useEffect(() => {
    const update = () => {
      if (task.taskStatus === 'in-progress' && task.actualStartTime) {
        const started = new Date(task.actualStartTime)
        const now = new Date()
        const diffMin = Math.floor((now - started) / 60000)
        const hrs = Math.floor(diffMin / 60)
        const mins = diffMin % 60
        setElapsed(hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`)
      }
    }
    update()
    const interval = setInterval(update, 10000)
    return () => clearInterval(interval)
  }, [task.taskStatus, task.actualStartTime])

  const handleStartTask = () => {
    const result = startTask(task.id)
    if (result?.isLate) {
      onLateStart?.(task, result.minutesLate)
    }
  }

  const handleComplete = () => {
    const endResult = endTask(task.id)
    setShowVictory(true)
    const rewards = completeTask(task.id)

    if (rewards) {
      gainExp(rewards.exp)
      gainGold(rewards.gold)
      incrementTasksCompleted()
      incrementStreak()
    }

    if (endResult?.isLate) {
      onLateEnd?.(task, endResult.minutesLate)
    }

    setTimeout(() => {
      setShowVictory(false)
      onComplete?.(task, rewards)
    }, 2000)
  }

  const getTimeDisplay = () => {
    if (!task.scheduledStartTime) return null
    const start = formatTime(new Date(task.scheduledStartTime))
    const end = task.scheduledEndTime ? formatTime(new Date(task.scheduledEndTime)) : null
    return end ? `${start} → ${end}` : start
  }

  const timeDisplay = getTimeDisplay()
  const isNotStarted = task.taskStatus === 'not-started'
  const isInProgress = task.taskStatus === 'in-progress'
  const expReward = task.expReward || task.monster?.expReward || 25
  const goldReward = task.goldReward || task.monster?.goldReward || 10

  if (showVictory) {
    return (
      <div className="card p-8 text-center relative overflow-hidden rounded-xl" style={{ borderColor: 'var(--color-success)' }}>
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle size={32} className="text-emerald-400" />
        </div>
        <h3 className="text-emerald-400 text-xl font-bold mb-2">Complete!</h3>
        <p className="text-sm text-gray-400 mb-6">
          <span className="text-white font-medium">{task.title}</span> is done!
        </p>
        <div className="card-green p-4 rounded-xl inline-block">
          <p className="text-xs text-gray-400 mb-2 font-medium">REWARDS</p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl text-emerald-400 font-bold">+{expReward}</div>
              <div className="text-xs text-gray-400 flex items-center gap-1"><Star size={12} /> XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl text-amber-400 font-bold">+{goldReward}</div>
              <div className="text-xs text-gray-400">⭐ Points</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-5 rounded-xl relative overflow-hidden" style={{ borderColor: config.color + '30' }}>
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: config.color }} />

      {/* Task Header */}
      <div className="flex items-start justify-between mb-3 mt-1">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-white mb-1">{task.title}</h3>
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium px-2.5 py-0.5 rounded-full"
              style={{ color: config.color, background: config.color + '15', border: `1px solid ${config.color}30` }}
            >
              {config.label}
            </span>
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
              <Star size={12} /> {expReward} XP
            </span>
            <span className="text-xs text-amber-400 font-medium">
              ⭐ {goldReward}
            </span>
          </div>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex items-center gap-2">
        {timeDisplay && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[var(--color-surface-dark)] rounded-lg px-3 py-2 shrink-0">
            <Clock size={12} className="text-indigo-400" />
            <span>{timeDisplay}</span>
            {isInProgress && elapsed && (
              <span className="text-emerald-400 ml-1 flex items-center gap-0.5 font-medium">
                <Timer size={10} /> {elapsed}
              </span>
            )}
          </div>
        )}

        {isNotStarted ? (
          <>
            <button onClick={handleStartTask} className="action-btn action-btn-green flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-lg">
              <Play size={14} /> Start
            </button>
            <button onClick={() => onFail?.(task)} className="action-btn flex items-center justify-center gap-1 px-3 py-2.5 text-xs rounded-lg">
              <XCircle size={14} />
            </button>
          </>
        ) : (
          <>
            <button onClick={handleComplete} className="action-btn action-btn-green flex-1 flex items-center justify-center gap-2 py-2.5 text-xs rounded-lg">
              <CheckCircle size={14} /> Complete
            </button>
            <button onClick={() => onFail?.(task)} className="action-btn flex items-center justify-center gap-1 px-3 py-2.5 text-xs rounded-lg">
              <XCircle size={14} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
