import { useState, useEffect } from 'react'
import './App.css'

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
      // Simple login simulation
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
      // Update existing task
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
      // Create new task
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
      // Remove from source
      updated[draggedFrom] = updated[draggedFrom].filter(t => t.id !== draggedTask.id)
      // Add to target
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
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>TaskFlow</h1>
            <p>Organize your work, boost productivity</p>
          </div>

          <div className="auth-tabs">
            <button
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Sign In
            </button>
            <button
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {authMode === 'register' && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={authForm.name}
                  onChange={(e) => setAuthForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm(p => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                required
              />
            </div>
            {authError && <div className="auth-error">{authError}</div>}
            <button type="submit" className="auth-submit">
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
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>TaskFlow</h1>
          <span className="tagline">Kanban Board</span>
        </div>
        <div className="header-right">
          <span className="user-greeting">Welcome, {user?.name || 'User'}</span>
          <button className="btn-add" onClick={() => openModal()}>
            + New Task
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Kanban Board */}
      <main className="board">
        {columns.map(column => (
          <div
            key={column.id}
            className="column"
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
          >
            <div className="column-header" style={{ borderColor: column.color }}>
              <span className="column-emoji">{column.emoji}</span>
              <h2>{column.title}</h2>
              <span className="task-count">{tasks[column.id].length}</span>
            </div>
            <div className="column-content">
              {tasks[column.id].map(task => (
                <div
                  key={task.id}
                  className={`task-card ${draggedTask?.id === task.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(task, column.id)}
                  onDragEnd={handleDragEnd}
                >
                  <div className="task-header">
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: priorityColors[task.priority] }}
                    >
                      {task.priority}
                    </span>
                    <div className="task-actions">
                      <button onClick={() => openModal(task)} title="Edit">✏️</button>
                      <button onClick={() => handleDeleteTask(task.id, column.id)} title="Delete">🗑️</button>
                    </div>
                  </div>
                  <h3 className="task-title">{task.title}</h3>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  {task.dueDate && (
                    <div className="task-due">
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              {tasks[column.id].length === 0 && (
                <div className="empty-column">
                  Drop tasks here
                </div>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'New Task'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSaveTask} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="What needs to be done?"
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Add more details..."
                  rows={3}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-save">
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
