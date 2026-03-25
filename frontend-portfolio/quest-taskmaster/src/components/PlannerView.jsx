import { useState, useMemo } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useUserStore } from '../store/userStore'
import {
    Calendar, Clock, CheckCircle, XCircle, Play,
    ChevronLeft, ChevronRight, Target, Timer, AlertTriangle,
    Sunrise, Sun, Sunset, Moon
} from 'lucide-react'

const TIME_BLOCKS = [
    { id: 'morning', label: 'Morning', icon: Sunrise, range: [4, 12], color: '#f59e0b' },
    { id: 'afternoon', label: 'Afternoon', icon: Sun, range: [12, 17], color: '#f97316' },
    { id: 'evening', label: 'Evening', icon: Sunset, range: [17, 21], color: '#e11d48' },
    { id: 'night', label: 'Night', icon: Moon, range: [21, 4], color: '#6366f1' },
]

function getTaskTimeBlock(task) {
    if (!task.scheduledStartTime) return null
    const hour = new Date(task.scheduledStartTime).getHours()
    if (hour >= 4 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 21) return 'evening'
    return 'night'
}

function getTaskStatusInfo(task) {
    if (task.taskStatus === 'completed' || task.status === 'completed' || task._source === 'completed') {
        return { label: 'DONE', color: '#10b981', icon: CheckCircle, bg: 'bg-emerald-500/10' }
    }
    if (task.taskStatus === 'failed' || task.status === 'failed' || task._source === 'failed') {
        return { label: 'FAILED', color: '#f43f5e', icon: XCircle, bg: 'bg-rose-500/10' }
    }
    if (task.taskStatus === 'in-progress') {
        return { label: 'IN PROGRESS', color: '#3b82f6', icon: Timer, bg: 'bg-blue-500/10' }
    }

    if (task.scheduledStartTime) {
        const now = new Date()
        const start = new Date(task.scheduledStartTime)
        const diffMin = Math.floor((now - start) / 60000)

        if (diffMin > 0) {
            return { label: 'OVERDUE', color: '#f97316', icon: AlertTriangle, bg: 'bg-orange-500/10' }
        }
        if (diffMin > -30) {
            return { label: 'STARTING SOON', color: '#f59e0b', icon: Clock, bg: 'bg-amber-500/10' }
        }
        if (diffMin > -120) {
            const minsLeft = Math.abs(diffMin)
            const h = Math.floor(minsLeft / 60)
            const m = minsLeft % 60
            const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`
            return { label: `IN ${timeStr}`, color: '#6366f1', icon: Clock, bg: 'bg-indigo-500/10' }
        }
    }

    return { label: 'SCHEDULED', color: '#6366f1', icon: Calendar, bg: 'bg-indigo-500/10' }
}

function formatTimeShort(isoString) {
    if (!isoString) return '--:--'
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function PlannerView({ onStartTask, onCompleteTask, onFailTask }) {
    const { incrementTasksCompleted, gainExp, gainGold, incrementStreak } = useUserStore()
    const { tasks, completedToday, failedToday, startTask } = useTaskStore()
    const [dateOffset, setDateOffset] = useState(0)
    const [expandedBlock, setExpandedBlock] = useState(null)

    const selectedDate = useMemo(() => {
        const d = new Date()
        d.setDate(d.getDate() + dateOffset)
        d.setHours(0, 0, 0, 0)
        return d
    }, [dateOffset])

    const nextDay = useMemo(() => {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() + 1)
        return d
    }, [selectedDate])

    const dateLabel = dateOffset === 0 ? 'Today' : dateOffset === 1 ? 'Tomorrow' : dateOffset === -1 ? 'Yesterday' : selectedDate.toLocaleDateString()

    const dayTasks = useMemo(() => {
        const allTasks = [
            ...tasks.map(t => ({ ...t, _source: 'active' })),
            ...(dateOffset === 0 ? completedToday.map(t => ({ ...t, _source: 'completed' })) : []),
            ...(dateOffset === 0 ? failedToday.map(t => ({ ...t, _source: 'failed' })) : []),
        ]

        return allTasks.filter(t => {
            if (t.scheduledStartTime) {
                const start = new Date(t.scheduledStartTime)
                return start >= selectedDate && start < nextDay
            }
            if (dateOffset === 0) {
                const created = new Date(t.createdAt)
                return created >= selectedDate && created < nextDay
            }
            return false
        }).sort((a, b) => {
            if (!a.scheduledStartTime && !b.scheduledStartTime) return 0
            if (!a.scheduledStartTime) return 1
            if (!b.scheduledStartTime) return -1
            return new Date(a.scheduledStartTime) - new Date(b.scheduledStartTime)
        })
    }, [tasks, completedToday, failedToday, selectedDate, nextDay, dateOffset])

    const groupedTasks = useMemo(() => {
        const groups = {}
        const unscheduled = []

        for (const task of dayTasks) {
            const blockId = getTaskTimeBlock(task)
            if (blockId) {
                if (!groups[blockId]) groups[blockId] = []
                groups[blockId].push(task)
            } else {
                unscheduled.push(task)
            }
        }

        return { groups, unscheduled }
    }, [dayTasks])

    const totalTasks = dayTasks.length
    const completedCount = dayTasks.filter(t => t.taskStatus === 'completed' || t.status === 'completed' || t._source === 'completed').length
    const inProgressCount = dayTasks.filter(t => t.taskStatus === 'in-progress').length
    const progressPercent = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

    const handleQuickStart = (taskId) => {
        const result = startTask(taskId)
        if (result?.isLate) {
            onStartTask?.(taskId, result)
        }
    }

    return (
        <div className="space-y-4">

            {/* Planner Header */}
            <div className="card p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm text-white font-semibold flex items-center gap-2">
                        <Calendar size={16} />
                        Daily Planner
                    </h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDateOffset(d => d - 1)}
                            className="tab-btn p-2"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() => setDateOffset(0)}
                            className={`tab-btn px-4 py-2 font-medium ${dateOffset === 0 ? 'active' : ''}`}
                        >
                            {dateLabel}
                        </button>
                        <button
                            onClick={() => setDateOffset(d => d + 1)}
                            className="tab-btn p-2"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-[var(--color-surface-dark)] p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500 font-medium">Daily Progress</span>
                        <span className="text-sm text-white font-semibold">
                            {completedCount}/{totalTasks} tasks ({progressPercent}%)
                        </span>
                    </div>
                    <div className="stat-bar stat-bar-exp">
                        <div
                            className="stat-bar-fill transition-all duration-700"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <div className="flex gap-4 mt-2">
                        <span className="text-xs text-emerald-400 font-medium">✓ {completedCount} Done</span>
                        <span className="text-xs text-blue-400 font-medium">● {inProgressCount} Active</span>
                        <span className="text-xs text-gray-500">○ {totalTasks - completedCount - inProgressCount} Pending</span>
                    </div>
                </div>
            </div>

            {/* Time Blocks */}
            {TIME_BLOCKS.map((block) => {
                const blockTasks = groupedTasks.groups[block.id] || []
                const Icon = block.icon
                const isExpanded = expandedBlock === block.id || expandedBlock === null

                return (
                    <div key={block.id} className="card rounded-xl overflow-hidden">
                        {/* Block Header */}
                        <button
                            onClick={() => setExpandedBlock(expandedBlock === block.id ? null : block.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-surface-light)] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                                    style={{ background: block.color + '18' }}
                                >
                                    <Icon size={18} style={{ color: block.color }} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-semibold" style={{ color: block.color }}>{block.label}</div>
                                    <div className="text-xs text-gray-500">
                                        {block.range[0] > block.range[1]
                                            ? `${block.range[0]}:00 - ${block.range[1]}:00`
                                            : `${block.range[0]}:00 - ${block.range[1]}:00`
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {blockTasks.length > 0 && (
                                    <span
                                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                                        style={{ color: block.color, background: block.color + '15' }}
                                    >
                                        {blockTasks.length} task{blockTasks.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                        </button>

                        {/* Block Tasks */}
                        {isExpanded && blockTasks.length > 0 && (
                            <div className="border-t border-[var(--color-border)] p-3 space-y-2">
                                {blockTasks.map((task) => {
                                    const statusInfo = getTaskStatusInfo(task)
                                    const StatusIcon = statusInfo.icon
                                    return (
                                        <div
                                            key={task.id}
                                            className={`bg-[var(--color-surface-dark)] p-3 rounded-lg border-l-3 transition-all hover:bg-[var(--color-surface-light)] ${statusInfo.bg}`}
                                            style={{ borderLeftColor: statusInfo.color, borderLeftWidth: '3px' }}
                                        >
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <StatusIcon size={16} style={{ color: statusInfo.color }} />
                                                    <span className={`text-sm ${task._source === 'completed' || task.taskStatus === 'completed' ? 'line-through text-gray-500' : 'text-white'}`}>
                                                        {task.title}
                                                    </span>
                                                </div>
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                    style={{ color: statusInfo.color, background: statusInfo.color + '15' }}
                                                >
                                                    {statusInfo.label}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center gap-3 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <Clock size={10} />
                                                        {formatTimeShort(task.scheduledStartTime)} → {formatTimeShort(task.scheduledEndTime)}
                                                    </span>
                                                    {task.monster && (
                                                        <span style={{ color: DIFFICULTY_COLORS[task.difficulty] || '#888' }} className="font-medium">
                                                            {task.difficulty === 'easy' ? 'Low' : task.difficulty === 'medium' ? 'Medium' : task.difficulty === 'hard' ? 'High' : 'Critical'}
                                                        </span>
                                                    )}
                                                </div>

                                                {task._source === 'active' && task.taskStatus === 'not-started' && dateOffset === 0 && (
                                                    <button
                                                        onClick={() => handleQuickStart(task.id)}
                                                        className="text-xs px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-colors flex items-center gap-1 font-medium"
                                                    >
                                                        <Play size={10} /> Start
                                                    </button>
                                                )}
                                            </div>

                                            {task.lateStartExcuse && (
                                                <div className="mt-2 text-xs text-amber-400 italic border-t border-[var(--color-border)] pt-2">
                                                    ⏰ Late start: "{task.lateStartExcuse}"
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {isExpanded && blockTasks.length === 0 && (
                            <div className="border-t border-[var(--color-border)] p-4 text-center">
                                <p className="text-xs text-gray-600">No tasks scheduled</p>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Unscheduled Tasks */}
            {groupedTasks.unscheduled.length > 0 && (
                <div className="card rounded-xl overflow-hidden">
                    <div className="p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-500/10 flex items-center justify-center">
                            <Target size={18} className="text-gray-400" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-400 font-semibold">Unscheduled</div>
                            <div className="text-xs text-gray-600">No time set</div>
                        </div>
                        <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-gray-500/10 text-gray-400 font-medium">
                            {groupedTasks.unscheduled.length} task{groupedTasks.unscheduled.length > 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="border-t border-[var(--color-border)] p-3 space-y-2">
                        {groupedTasks.unscheduled.map((task) => {
                            const statusInfo = getTaskStatusInfo(task)
                            const StatusIcon = statusInfo.icon
                            return (
                                <div
                                    key={task.id}
                                    className="bg-[var(--color-surface-dark)] p-3 rounded-lg border-l-3 flex items-center justify-between"
                                    style={{ borderLeftColor: statusInfo.color, borderLeftWidth: '3px' }}
                                >
                                    <div className="flex items-center gap-2">
                                        <StatusIcon size={16} style={{ color: statusInfo.color }} />
                                        <span className="text-sm">{task.title}</span>
                                    </div>
                                    <span className="text-xs font-medium" style={{ color: statusInfo.color }}>
                                        {statusInfo.label}
                                    </span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {dayTasks.length === 0 && (
                <div className="card p-8 text-center rounded-xl">
                    <Calendar size={40} className="mx-auto mb-4 text-gray-600" />
                    <p className="text-sm text-gray-400 mb-2">No tasks for {dateLabel.toLowerCase()}</p>
                    <p className="text-xs text-gray-500">
                        Create a new task and schedule it to see it here!
                    </p>
                </div>
            )}
        </div>
    )
}

const DIFFICULTY_COLORS = {
    easy: '#10b981',
    medium: '#f59e0b',
    hard: '#f97316',
    boss: '#f43f5e',
}
