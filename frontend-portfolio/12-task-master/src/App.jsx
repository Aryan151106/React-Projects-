import { useState, useMemo } from 'react'
import { useTaskStore } from './store/taskStore'
import { useUserStore } from './store/userStore'
import UserProfile from './components/UserProfile'
import TaskCard from './components/TaskCard'
import TaskCreator from './components/TaskCreator'
import ExcuseModal from './components/ExcuseModal'
import PlannerView from './components/PlannerView'
import LatenessExcuseModal from './components/LatenessExcuseModal'
import {
  ListTodo, ScrollText, Trophy, Star, Flame, Users,
  Target, Menu, X, ClipboardList, Sparkles, User, ChevronDown,
  Bell, Settings, PlusCircle, Zap
} from 'lucide-react'
import { getMotivationalMessage } from './utils/excuseAnalyzer'

function App() {
  const { tasks, addTask, pendingExcuses, pendingLatenessExcuse, completedToday, failedToday, failTask } = useTaskStore()
  const { player, teamMode } = useUserStore()

  const [activeTab, setActiveTab] = useState('tasks')
  const [excuseTask, setExcuseTask] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [lastRewards, setLastRewards] = useState(null)
  const [latenessInfo, setLatenessInfo] = useState(null)
  const [dismissedReminder, setDismissedReminder] = useState(false)

  const allDoneToday = useMemo(() => {
    return tasks.length === 0 && completedToday.length > 0 && pendingExcuses.length === 0
  }, [tasks.length, completedToday.length, pendingExcuses.length])

  const hasPendingExcuses = pendingExcuses.length > 0

  const handleCreateTask = (taskData) => {
    addTask(taskData)
  }

  const handleTaskComplete = (task, rewards) => {
    setLastRewards(rewards)
    setTimeout(() => setLastRewards(null), 3000)
  }

  const handleTaskFail = (task) => {
    failTask(task.id)
    setExcuseTask(task)
  }

  const handleExcuseClose = () => {
    setExcuseTask(null)
    if (pendingExcuses.length > 0) {
      setExcuseTask(pendingExcuses[0])
    }
  }

  const handleLateStart = (task, minutesLate) => {
    setLatenessInfo({ taskId: task.id, type: 'start', minutesLate })
  }

  const handleLateEnd = (task, minutesLate) => {
    setLatenessInfo({ taskId: task.id, type: 'end', minutesLate })
  }

  const handleLatenessClose = () => {
    setLatenessInfo(null)
  }

  const effectiveLatenessInfo = latenessInfo || pendingLatenessExcuse

  const motivationalMessage = getMotivationalMessage(player.streak, completedToday.length)

  const tabs = [
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'planner', label: 'Planner', icon: ClipboardList },
    { id: 'history', label: 'History', icon: ScrollText },
    { id: 'stats', label: 'Stats', icon: Trophy },
  ]

  const currentHeading = useMemo(() => {
    if (activeTab === 'planner') return 'Planner'
    if (activeTab === 'history') return 'History'
    if (activeTab === 'stats') return 'Stats'
    return 'Workspace'
  }, [activeTab])

  return (
    <div className="tm-app">
      <aside className={`tm-sidebar ${showMobileMenu ? 'open' : ''}`}>
        <div className="tm-brand-row">
          <div className="tm-brand-mark">
            <ListTodo size={16} />
          </div>
          <div>
            <div className="tm-brand-title">Taskmaster</div>
            <div className="tm-brand-subtitle">Focused workflow</div>
          </div>
        </div>

        <div className="tm-workspace-card">
          <p className="tm-workspace-label">Editorial Workspace</p>
          <p className="tm-workspace-sub">Productive and organized</p>
          <div className="tm-workspace-stats">
            <div>
              <span>Done</span>
              <strong>{completedToday.length}</strong>
            </div>
            <div>
              <span>Streak</span>
              <strong>{player.streak}</strong>
            </div>
          </div>
        </div>

        <nav className="tm-side-nav">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setShowMobileMenu(false)
                }}
                className={`tm-side-link ${activeTab === tab.id ? 'active' : ''}`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>

        <button
          className="tm-new-task"
          onClick={() => {
            setActiveTab('tasks')
            setShowMobileMenu(false)
          }}
        >
          <PlusCircle size={14} />
          New Task
        </button>

        <div className="tm-sidebar-footer">
          <button className="tm-side-link muted">
            <Sparkles size={14} />
            Help
          </button>
          <button className="tm-side-link muted">
            <User size={14} />
            Logout
          </button>
        </div>
      </aside>

      <div className="tm-main">
        <header className="tm-topbar">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="tm-mobile-toggle"
          >
            {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="tm-top-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`tm-top-tab ${activeTab === tab.id ? 'active' : ''}`}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              )
            })}
          </div>

          <div className="tm-top-actions">
            <button className="tm-icon-btn" aria-label="Notifications">
              <Bell size={14} />
            </button>
            <button className="tm-icon-btn" aria-label="Settings">
              <Settings size={14} />
            </button>
            <div className="gold-counter">
              <Star size={14} />
              <span>{player.exp}/{player.expToNext} XP</span>
            </div>
            <button className="user-menu-btn">
              {teamMode === 'solo' ? <User size={12} /> : <Users size={12} />}
              <span>User</span>
              <ChevronDown size={12} />
            </button>
          </div>
        </header>

        <main className="tm-content">
          <section className="tm-hero">
            <h1>{currentHeading}</h1>
            <p>
              {activeTab === 'tasks'
                ? 'Your focused environment for high-impact productivity.'
                : 'Track progress, review performance, and keep momentum going.'}
            </p>
          </section>

          {activeTab === 'tasks' && (
            <>
              {hasPendingExcuses && !excuseTask && (
                <div
                  className="card-red p-4 cursor-pointer hover:scale-[1.01] transition-transform rounded-xl"
                  onClick={() => setExcuseTask(pendingExcuses[0])}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--color-danger)]/20 flex items-center justify-center text-[var(--color-danger)]">
                      <Flame size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-[var(--color-danger)] font-semibold">Review Required</p>
                      <p className="text-xs text-[var(--color-text-muted)]">
                        You have {pendingExcuses.length} failed task{pendingExcuses.length > 1 ? 's' : ''} that need your attention
                      </p>
                    </div>
                    <div className="ml-auto action-btn text-xs py-2 px-4">Review</div>
                  </div>
                </div>
              )}

              <div className="tm-board-grid">
                <div className="space-y-4">
                  <TaskCreator onCreateTask={handleCreateTask} />

                  {tasks.length === 0 ? (
                    <div className="tm-empty-state">
                      <div className="tm-empty-icon-wrap">
                        <Target size={36} className="text-[var(--color-primary)]" />
                      </div>
                      <h3>No active tasks</h3>
                      <p>
                        Your desk is clear and your mind is free. Ready to start something new?
                      </p>
                      <button onClick={() => setActiveTab('planner')} className="action-btn action-btn-blue">
                        Plan your next move
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {tasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onComplete={handleTaskComplete}
                          onFail={handleTaskFail}
                          onLateStart={handleLateStart}
                          onLateEnd={handleLateEnd}
                        />
                      ))}
                    </div>
                  )}

                  {allDoneToday && !dismissedReminder && (
                    <div className="card-gold p-4 relative overflow-hidden rounded-xl">
                      <div className="absolute top-0 left-0 right-0 h-[3px] bg-[var(--color-warning)]" />
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center">
                          <Trophy size={18} className="text-[var(--color-warning)]" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-[var(--color-text)] font-semibold flex items-center gap-2 mb-1">
                            <Sparkles size={16} />
                            All Tasks Complete!
                          </p>
                          <p className="text-xs text-[var(--color-text-muted)] mb-3">
                            You reached your peak for today. Plan tomorrow to keep the streak alive.
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setActiveTab('planner')}
                              className="action-btn action-btn-gold text-xs py-2 px-4 flex items-center gap-1"
                            >
                              <ClipboardList size={12} />
                              Plan Tomorrow
                            </button>
                            <button
                              onClick={() => setDismissedReminder(true)}
                              className="text-xs text-[var(--color-text)]/80 hover:text-[var(--color-text)] px-3 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <aside className="tm-insights-col space-y-4">
                  <UserProfile />

                  <div className="card p-4 rounded-xl">
                    <h3 className="text-xs text-[var(--color-text-muted)] mb-3 flex items-center gap-2 font-medium">
                      <Zap size={14} />
                      Productivity Insights
                    </h3>
                    <div className="tm-mini-bars">
                      <span style={{ height: '26%' }} />
                      <span style={{ height: '44%' }} />
                      <span style={{ height: '72%' }} className="active" />
                      <span style={{ height: '34%' }} />
                      <span style={{ height: '56%' }} />
                      <span style={{ height: '39%' }} />
                      <span style={{ height: '37%' }} />
                    </div>
                  </div>

                  <div className="card-blue p-4 rounded-xl">
                    <p className="text-xs text-[var(--color-text-muted)]">Recent Achievement</p>
                    <p className="text-base font-semibold text-[var(--color-text)] mt-1">Early Bird</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      Completed tasks before 9:00 AM three days in a row.
                    </p>
                    <div className="mt-3 inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold badge-pill">
                      Rare Badge
                    </div>
                  </div>

                  <div className="card-green p-3 rounded-xl">
                    <p className="text-sm text-[var(--color-text)]">{motivationalMessage}</p>
                  </div>
                </aside>
              </div>
            </>
          )}

          {activeTab === 'planner' && (
            <PlannerView
              onStartTask={(taskId, result) => {
                if (result?.isLate) {
                  const task = tasks.find(t => t.id === taskId)
                  if (task) handleLateStart(task, result.minutesLate)
                }
              }}
              onCompleteTask={handleTaskComplete}
              onFailTask={handleTaskFail}
            />
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-sm text-[var(--color-text)] font-semibold flex items-center gap-2">
                <ScrollText size={16} />
                Task History
              </h3>

              {completedToday.length > 0 && (
                <div className="card-green p-4 rounded-xl">
                  <h4 className="text-xs text-[var(--color-primary)] mb-3 font-semibold">
                    COMPLETED TODAY ({completedToday.length})
                  </h4>
                  <div className="space-y-2">
                    {completedToday.map((task) => (
                      <div key={task.id} className="bg-[var(--color-surface-dark)] p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{task.title}</span>
                          <span className="text-xs text-[var(--color-primary)] font-medium">
                            +{task.expReward || task.monster?.expReward || 0} XP
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {failedToday.length > 0 && (
                <div className="card-red p-4 rounded-xl">
                  <h4 className="text-xs text-[var(--color-danger)] mb-3 font-semibold">
                    FAILED TODAY ({failedToday.length})
                  </h4>
                  <div className="space-y-2">
                    {failedToday.map((task) => (
                      <div key={task.id} className="bg-[var(--color-surface-dark)] p-3 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{task.title}</span>
                          <span className="text-xs text-[var(--color-danger)]">
                            {task.excuseAnalysis?.category || 'Failed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {completedToday.length === 0 && failedToday.length === 0 && (
                <div className="card p-8 text-center rounded-xl">
                  <ScrollText size={40} className="mx-auto mb-4 text-[var(--color-info)]" />
                  <p className="text-sm text-[var(--color-text-muted)]">No task history for today</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="card p-5 space-y-5 rounded-xl">
              <h3 className="text-sm text-[var(--color-text)] font-semibold flex items-center gap-2">
                <Trophy size={16} />
                Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[var(--color-surface-dark)] p-4 text-center rounded-xl">
                  <Star size={24} className="mx-auto mb-2 text-[var(--color-warning)]" />
                  <div className="text-2xl font-bold text-[var(--color-warning)]">{player.level}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Level</div>
                </div>
                <div className="bg-[var(--color-surface-dark)] p-4 text-center rounded-xl">
                  <Flame size={24} className="mx-auto mb-2 text-[var(--color-danger)]" />
                  <div className="text-2xl font-bold text-[var(--color-danger)]">{player.streak}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Day Streak</div>
                </div>
                <div className="bg-[var(--color-surface-dark)] p-4 text-center rounded-xl">
                  <Target size={24} className="mx-auto mb-2 text-[var(--color-primary)]" />
                  <div className="text-2xl font-bold">{player.totalTasksCompleted}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Tasks Completed</div>
                </div>
                <div className="bg-[var(--color-surface-dark)] p-4 text-center rounded-xl">
                  <Star size={24} className="mx-auto mb-2 text-[var(--color-success)]" />
                  <div className="text-2xl font-bold">{player.gold}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">Total Points</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {excuseTask && (
        <ExcuseModal task={excuseTask} onClose={handleExcuseClose} />
      )}

      {effectiveLatenessInfo && (
        <LatenessExcuseModal
          taskId={effectiveLatenessInfo.taskId}
          type={effectiveLatenessInfo.type}
          minutesLate={effectiveLatenessInfo.minutesLate}
          onClose={handleLatenessClose}
        />
      )}

      {/* Reward Toast */}
      {lastRewards && (
        <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 card-gold p-4 rounded-xl z-50 animate-bounce border border-amber-300/20">
          <p className="text-sm text-[var(--color-text)] font-semibold">Task Complete!</p>
          <p className="text-base font-medium">+{lastRewards.exp} XP · +{lastRewards.gold} Points</p>
        </div>
      )}
    </div>
  )
}

export default App
