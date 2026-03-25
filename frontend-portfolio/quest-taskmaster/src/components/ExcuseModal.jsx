import { useState } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useUserStore } from '../store/userStore'
import { analyzeExcuse, calculateDamage } from '../utils/excuseAnalyzer'
import { MessageSquare, AlertTriangle, Heart, Shield, Coffee, X } from 'lucide-react'

export default function ExcuseModal({ task, onClose }) {
  const { submitExcuse } = useTaskStore()
  const { takeDamage, resetStreak } = useUserStore()

  const [excuse, setExcuse] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [damageTaken, setDamageTaken] = useState(0)

  const handleSubmit = () => {
    if (!excuse.trim() && !submitted) {
      const result = analyzeExcuse('')
      processExcuse(result)
      return
    }

    const result = analyzeExcuse(excuse)
    processExcuse(result)
  }

  const processExcuse = (result) => {
    setAnalysis(result)
    setSubmitted(true)

    const damage = calculateDamage(task.monster.attack, result)
    setDamageTaken(damage)

    if (damage > 0) {
      takeDamage(damage)
      resetStreak()
    }

    submitExcuse(task.id, excuse, result)
  }

  const getResponseIcon = () => {
    if (!analysis) return null

    switch (analysis.monsterResponse) {
      case 'critical':
        return <AlertTriangle size={32} className="text-rose-400" />
      case 'heavy':
        return <AlertTriangle size={32} className="text-amber-400" />
      case 'normal':
        return <Shield size={32} className="text-amber-300" />
      case 'light':
        return <Shield size={32} className="text-emerald-400" />
      case 'blocked':
        return <Heart size={32} className="text-emerald-400" />
      default:
        return <MessageSquare size={32} className="text-gray-400" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="card-fancy w-full max-w-md relative rounded-xl overflow-hidden">

        {/* Header */}
        <div className="bg-[var(--color-surface-dark)] p-4 flex items-center justify-between border-b border-[var(--color-border)]">
          <h3 className="text-sm text-white font-semibold flex items-center gap-2">
            <MessageSquare size={16} />
            Task Review
          </h3>
          {submitted && (
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        <div className="p-5">
          {!submitted ? (
            <>
              {/* Task Info */}
              <div className="bg-[var(--color-surface-dark)] p-4 rounded-xl mb-4 text-center">
                <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-rose-500/15 flex items-center justify-center">
                  <AlertTriangle size={24} className="text-rose-400" />
                </div>
                <p className="text-rose-400 text-sm font-semibold">{task.title}</p>
                <p className="text-xs text-gray-500 mt-1">This task was not completed</p>
              </div>

              <div className="bg-[var(--color-surface-dark)] p-3 mb-4 border-l-3 rounded-lg" style={{ borderLeftColor: 'var(--color-danger)', borderLeftWidth: '3px' }}>
                <p className="text-xs text-rose-400 font-medium mb-1">Task Failed</p>
                <p className="text-sm text-white">{task.title}</p>
              </div>

              {/* Excuse Input */}
              <div className="mb-4">
                <label className="text-xs text-gray-400 mb-2 block font-medium">
                  What happened?
                </label>
                <textarea
                  value={excuse}
                  onChange={(e) => setExcuse(e.target.value)}
                  placeholder="Explain why this task wasn't completed..."
                  rows={4}
                  className="app-input resize-none rounded-xl"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Your response will be reviewed to determine the impact.
                </p>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                className="action-btn action-btn-gold w-full text-sm rounded-xl py-3"
              >
                Submit
              </button>
            </>
          ) : (
            <>
              {/* Analysis Result */}
              <div className="text-center mb-4">
                <div className="flex justify-center mb-4">
                  <div className={`p-4 rounded-full ${damageTaken > 0 ? 'bg-rose-500/15' : 'bg-emerald-500/15'}`}>
                    {getResponseIcon()}
                  </div>
                </div>

                <p className="text-sm mb-4 px-4 text-gray-300">{analysis?.response}</p>

                {damageTaken > 0 ? (
                  <div className="card-red p-4 inline-block rounded-xl">
                    <div className="text-xs text-gray-400 mb-1 font-medium">PENALTY</div>
                    <div className="text-rose-400 text-2xl font-bold">
                      -{damageTaken} HP
                    </div>
                  </div>
                ) : (
                  <div className="card-green p-4 inline-block rounded-xl">
                    <div className="text-xs text-gray-400 mb-1 font-medium">RESULT</div>
                    <div className="text-emerald-400 text-xl font-bold">
                      ✓ Forgiven
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion */}
              {analysis?.suggestion && (
                <div className="bg-indigo-500/10 p-3 mb-4 border-l-3 rounded-lg" style={{ borderLeftColor: 'var(--color-info)', borderLeftWidth: '3px' }}>
                  <p className="text-xs text-blue-400 mb-1 font-medium">Suggestion</p>
                  <p className="text-sm text-gray-300">{analysis.suggestion}</p>
                </div>
              )}

              {/* Rest Day Option */}
              {analysis?.offerRestDay && (
                <div className="card-green p-4 mb-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Coffee size={18} className="text-emerald-400" />
                    <span className="text-xs text-emerald-400 font-semibold">Rest Day Granted</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Take a break. All tasks are paused without penalty.
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={onClose}
                className={`action-btn w-full text-sm rounded-xl py-3 ${analysis?.offerRestDay ? 'action-btn-green' : 'action-btn-gold'}`}
              >
                {analysis?.offerRestDay ? 'Accept Rest Day' : 'Continue'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
