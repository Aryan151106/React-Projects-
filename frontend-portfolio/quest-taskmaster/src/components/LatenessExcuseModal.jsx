import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useUserStore } from '../store/userStore'
import { Clock, AlertTriangle, MessageSquare, X, Hourglass } from 'lucide-react'

export default function LatenessExcuseModal({ taskId, type, minutesLate, onClose }) {
    const { submitLatenessExcuse, clearLatenessExcuse } = useTaskStore()
    const { takeDamage } = useUserStore()
    const task = useTaskStore(state =>
        state.tasks.find(t => t.id === taskId)
    )

    const [excuse, setExcuse] = useState('')
    const [submitted, setSubmitted] = useState(false)
    const [penalty, setPenalty] = useState(0)

    const typeLabel = type === 'start' ? 'Starting' : 'Finishing'
    const typeContext = type === 'start'
        ? 'You were late beginning this task.'
        : 'You took too long to finish this task.'

    const handleSubmit = () => {
        if (!excuse.trim()) return

        const basePenalty = 5
        const latePenalty = Math.min(Math.floor(minutesLate / 10) * 3, 30)
        const totalPenalty = basePenalty + latePenalty

        setPenalty(totalPenalty)
        takeDamage(totalPenalty)
        submitLatenessExcuse(taskId, type, excuse.trim())
        setSubmitted(true)
    }

    const handleClose = () => {
        clearLatenessExcuse()
        onClose?.()
    }

    if (!task && !submitted) {
        handleClose()
        return null
    }

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card-fancy w-full max-w-md relative rounded-xl overflow-hidden">

                {/* Header */}
                <div className="bg-[var(--color-surface-dark)] p-4 flex items-center justify-between border-b border-[var(--color-border)]">
                    <h3 className="text-sm text-rose-400 font-semibold flex items-center gap-2">
                        <Clock size={16} />
                        Late {typeLabel}
                    </h3>
                    {submitted && (
                        <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="p-5">
                    {!submitted ? (
                        <>
                            {/* Late indicator */}
                            <div className="bg-[var(--color-surface-dark)] p-4 rounded-xl mb-4 text-center">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-amber-500/15 flex items-center justify-center">
                                    <Clock size={24} className="text-amber-400" />
                                </div>
                                <div className="inline-block px-4 py-2 mb-2 rounded-full bg-rose-500/10 border border-rose-500/30">
                                    <span className="text-lg text-rose-400 font-bold">{minutesLate} min late</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2">{typeContext}</p>
                            </div>

                            {/* Task info */}
                            <div className="bg-[var(--color-surface-dark)] p-3 mb-4 rounded-lg" style={{ borderLeft: '3px solid var(--color-warning)' }}>
                                <p className="text-xs text-amber-400 font-medium mb-1">
                                    {type === 'start' ? 'Late Start' : 'Overtime'}
                                </p>
                                <p className="text-sm text-white">{task?.title || 'Unknown Task'}</p>
                                {task?.scheduledStartTime && type === 'start' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Scheduled: {new Date(task.scheduledStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                                {task?.scheduledEndTime && type === 'end' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Deadline: {new Date(task.scheduledEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                )}
                            </div>

                            {/* Excuse input */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 mb-2 block flex items-center gap-1 font-medium">
                                    <MessageSquare size={12} />
                                    Why were you late?
                                </label>
                                <textarea
                                    value={excuse}
                                    onChange={(e) => setExcuse(e.target.value)}
                                    placeholder="Explain what happened..."
                                    rows={3}
                                    className="app-input resize-none rounded-xl"
                                    autoFocus
                                />
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                                    <AlertTriangle size={10} />
                                    Being late incurs a health penalty.
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!excuse.trim()}
                                className={`action-btn action-btn-gold w-full text-sm rounded-xl py-3 ${!excuse.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                Submit
                            </button>
                        </>
                    ) : (
                        <>
                            {/* Result */}
                            <div className="text-center mb-4">
                                <div className="flex justify-center mb-4">
                                    <div className="p-4 rounded-full bg-amber-500/15">
                                        <Hourglass size={32} className="text-amber-400" />
                                    </div>
                                </div>

                                <p className="text-sm mb-2 text-amber-400 font-medium">Lateness noted.</p>
                                <p className="text-xs text-gray-400 mb-4 px-4">
                                    Your explanation has been recorded. Try to stay on schedule next time!
                                </p>

                                <div className="card-red p-4 inline-block rounded-xl">
                                    <div className="text-xs text-gray-400 mb-1 font-medium">PENALTY</div>
                                    <div className="text-rose-400 text-2xl font-bold">
                                        -{penalty} HP
                                    </div>
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-indigo-500/10 p-3 mb-4 rounded-lg" style={{ borderLeft: '3px solid var(--color-info)' }}>
                                <p className="text-xs text-blue-400 mb-1 font-medium">Tip</p>
                                <p className="text-xs text-gray-300">
                                    {minutesLate > 60
                                        ? "Consider setting reminders or breaking big tasks into smaller chunks."
                                        : "Set an alarm 5 minutes before your scheduled time!"}
                                </p>
                            </div>

                            {/* Continue */}
                            <button
                                onClick={handleClose}
                                className="action-btn action-btn-gold w-full text-sm rounded-xl py-3"
                            >
                                Continue
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
