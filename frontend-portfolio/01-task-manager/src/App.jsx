import { useState, useEffect } from 'react'
import './index.css'

// Task Manager with Authentication, Kanban Board, Drag & Drop, CRUD

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' })
  const [authError, setAuthError] = useState('')

  // Task state
  const [tasks, setTasks] = useState({
    todo: [],
    inProgress: [],
    done: []
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  })

  // Drag state
  const [draggedTask, setDraggedTask] = useState(null)
  const [draggedFrom, setDraggedFrom] = useState(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('taskmanager_user')
    const savedTasks = localStorage.getItem('taskmanager_tasks')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsAuthenticated(true)
    }
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks))
    }
  }, [])

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('taskmanager_tasks', JSON.stringify(tasks))
    }
  }, [tasks, isAuthenticated])

  // Authentication handlers
  const handleAuth = (e) => {
    e.preventDefault()
    setAuthError('')

    if (authMode === 'register') {
      if (authForm.password.length < 6) {
        setAuthError('Password must be at least 6 characters')
        return
      }
      const newUser = {
        id: Date.now(),
        email: authForm.email,
        name: authForm.name
      }
      localStorage.setItem('taskmanager_user', JSON.stringify(newUser))
      setUser(newUser)
      setIsAuthenticated(true)
    } else {
      const savedUser = localStorage.getItem('taskmanager_user')
      if (savedUser) {
        const userData = JSON.parse(savedUser)
        if (userData.email === authForm.email) {
          setUser(userData)
          setIsAuthenticated(true)
        } else {
          setAuthError('Invalid credentials')
        }
      } else {
        setAuthError('No account found. Please register first.')
      }
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setAuthForm({ email: '', password: '', name: '' })
  }

  // Task CRUD handlers
  const openModal = (task = null) => {
    if (task) {
      setEditingTask(task)
      setTaskForm({
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate
      })
    } else {
      setEditingTask(null)
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingTask(null)
    setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '' })
  }

  const handleSaveTask = (e) => {
    e.preventDefault()
    if (!taskForm.title.trim()) return

    if (editingTask) {
      setTasks(prev => {
        const newTasks = { ...prev }
        for (const column in newTasks) {
          newTasks[column] = newTasks[column].map(t =>
            t.id === editingTask.id ? { ...t, ...taskForm } : t
          )
        }
        return newTasks
      })
    } else {
      const newTask = {
        id: Date.now(),
        ...taskForm,
        createdAt: new Date().toISOString()
      }
      setTasks(prev => ({
        ...prev,
        todo: [...prev.todo, newTask]
      }))
    }
    closeModal()
  }

  const handleDeleteTask = (taskId, column) => {
    setTasks(prev => ({
      ...prev,
      [column]: prev[column].filter(t => t.id !== taskId)
    }))
  }

  // Drag & Drop handlers
  const handleDragStart = (task, column) => {
    setDraggedTask(task)
    setDraggedFrom(column)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (targetColumn) => {
    if (!draggedTask || draggedFrom === targetColumn) return

    setTasks(prev => {
      const updated = { ...prev }
      updated[draggedFrom] = updated[draggedFrom].filter(t => t.id !== draggedTask.id)
      updated[targetColumn] = [...updated[targetColumn], draggedTask]
      return updated
    })

    setDraggedTask(null)
    setDraggedFrom(null)
  }

  const handleDragEnd = () => {
    setDraggedTask(null)
    setDraggedFrom(null)
  }

  // Auth Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-5">
        <div className="w-full max-w-[420px] bg-bg-glass backdrop-blur-[20px] border border-border rounded-2xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text mb-2">TaskFlow</h1>
            <p className="text-text-secondary text-[0.95rem]">Organize your work, boost productivity</p>
          </div>

          <div className="flex gap-2 mb-7 bg-black/20 p-1 rounded-lg">
            <button
              className={`flex-1 py-3 border-none text-[0.95rem] font-medium cursor-pointer rounded-md transition-all duration-300 ${authMode === 'login' ? 'bg-accent-blue text-white' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-3 border-none text-[0.95rem] font-medium cursor-pointer rounded-md transition-all duration-300 ${authMode === 'register' ? 'bg-accent-blue text-white' : 'bg-transparent text-text-secondary hover:text-text-primary'}`}
              onClick={() => setAuthMode('register')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="flex flex-col gap-5">
            {authMode === 'register' && (
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Full Name</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                  className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] placeholder:text-white/30"
                />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-medium text-text-secondary">Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
                className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] placeholder:text-white/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-medium text-text-secondary">Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] placeholder:text-white/30"
              />
            </div>
            {authError && <div className="bg-accent-red/15 border border-accent-red text-accent-red p-3 rounded-lg text-[0.9rem] text-center">{authError}</div>}
            <button type="submit" className="p-4 gradient-btn border-none rounded-lg text-white text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.4)]">
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Main App - Kanban Board
  const columns = [
    { id: 'todo', title: 'To Do', emoji: '📋', color: '#6366f1' },
    { id: 'inProgress', title: 'In Progress', emoji: '🚀', color: '#f59e0b' },
    { id: 'done', title: 'Done', emoji: '✅', color: '#10b981' }
  ]

  const priorityColors = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444'
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex max-md:flex-col justify-between items-center p-4 px-8 max-md:px-4 max-md:gap-4 bg-bg-glass backdrop-blur-[10px] border-b border-border">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold gradient-text">TaskFlow</h1>
          <span className="text-[0.85rem] text-text-secondary py-1 px-3 bg-accent-blue/15 rounded-full">Kanban Board</span>
        </div>
        <div className="flex items-center gap-4 max-md:w-full max-md:justify-center max-md:flex-wrap">
          <span className="text-text-secondary text-[0.9rem]">Welcome, {user?.name || 'User'}</span>
          <button className="py-2.5 px-5 gradient-btn border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]" onClick={() => openModal()}>
            + New Task
          </button>
          <button className="py-2.5 px-4 bg-transparent border border-border rounded-lg text-text-secondary text-[0.9rem] cursor-pointer transition-all duration-300 hover:bg-accent-red/10 hover:border-accent-red hover:text-accent-red" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="grid grid-cols-3 max-md:grid-cols-1 gap-6 p-8 max-md:p-4 flex-1 overflow-x-auto">
        {columns.map(column => (
          <div
            key={column.id}
            className="bg-bg-glass backdrop-blur-[10px] border border-border rounded-2xl flex flex-col min-h-[400px] max-md:min-h-[300px]"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="flex items-center gap-2.5 p-5 border-b border-border border-t-[3px] rounded-t-2xl" style={{ borderTopColor: column.color }}>
              <span className="text-xl">{column.emoji}</span>
              <h2 className="text-base font-semibold flex-1">{column.title}</h2>
              <span className="bg-white/10 py-1 px-2.5 rounded-full text-[0.85rem] font-semibold text-text-secondary">{tasks[column.id].length}</span>
            </div>
            <div className="p-4 flex-1 flex flex-col gap-3 overflow-y-auto">
              {tasks[column.id].map(task => (
                <div
                  key={task.id}
                  className={`bg-bg-secondary border border-border rounded-lg p-4 cursor-grab transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:border-accent-blue group ${draggedTask?.id === task.id ? 'opacity-50 rotate-[3deg]' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <span
                      className="py-1 px-2.5 rounded-xl text-[0.7rem] font-semibold uppercase text-white"
                      style={{ backgroundColor: priorityColors[task.priority] }}
                    >
                      {task.priority}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button onClick={() => openModal(task)} title="Edit" className="bg-transparent border-none text-[0.9rem] cursor-pointer p-1 rounded hover:bg-white/10">✏️</button>
                      <button onClick={() => handleDeleteTask(task.id, column.id)} title="Delete" className="bg-transparent border-none text-[0.9rem] cursor-pointer p-1 rounded hover:bg-white/10">🗑️</button>
                    </div>
                  </div>
                  <h3 className="text-[0.95rem] font-semibold mb-2 leading-relaxed">{task.title}</h3>
                  {task.description && (
                    <p className="text-[0.85rem] text-text-secondary mb-3 leading-relaxed">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <div className="text-[0.8rem] text-text-secondary flex items-center gap-1.5">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {tasks[column.id].length === 0 && (
                <div className="flex-1 flex items-center justify-center text-text-secondary text-[0.9rem] border-2 border-dashed border-border rounded-lg my-2">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-5 animate-[fadeIn_0.2s_ease]" onClick={closeModal}>
          <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-[500px] shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center py-5 px-6 border-b border-border">
              <h2 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="bg-transparent border-none text-text-secondary text-3xl cursor-pointer leading-none transition-colors duration-200 hover:text-text-primary" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSaveTask} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  required
                  autoFocus
                  className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] placeholder:text-white/30"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Add more details..."
                  rows={3}
                  className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)] placeholder:text-white/30"
                />
              </div>
              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-medium text-text-secondary">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-medium text-text-secondary">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full py-3.5 px-4 bg-black/30 border border-border rounded-lg text-text-primary text-base font-[inherit] transition-all duration-300 focus:outline-none focus:border-accent-blue focus:shadow-[0_0_0_3px_rgba(99,102,241,0.2)]"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="py-3 px-6 bg-transparent border border-border rounded-lg text-text-secondary text-[0.9rem] font-medium cursor-pointer transition-all duration-200 hover:bg-white/5 hover:text-text-primary" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="py-3 px-6 gradient-btn border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(99,102,241,0.4)]">
                  {editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
