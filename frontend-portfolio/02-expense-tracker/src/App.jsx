import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Expense Tracker with Data Visualization

const CATEGORIES = [
  { id: 'food', name: 'Food & Dining', emoji: '🍔', color: '#f97316' },
  { id: 'transport', name: 'Transport', emoji: '🚗', color: '#3b82f6' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️', color: '#ec4899' },
  { id: 'entertainment', name: 'Entertainment', emoji: '🎬', color: '#8b5cf6' },
  { id: 'bills', name: 'Bills & Utilities', emoji: '📄', color: '#ef4444' },
  { id: 'health', name: 'Health', emoji: '💊', color: '#10b981' },
  { id: 'education', name: 'Education', emoji: '📚', color: '#06b6d4' },
  { id: 'other', name: 'Other', emoji: '📦', color: '#6b7280' }
]

function App() {
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  const [filter, setFilter] = useState({
    category: 'all',
    dateRange: 'all', // all, week, month, year
    search: ''
  })
  const [view, setView] = useState('list') // list or chart

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('expensetracker_expenses')
    if (saved) {
      setExpenses(JSON.parse(saved))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expensetracker_expenses', JSON.stringify(expenses))
  }, [expenses])

  // Filtered expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      // Category filter
      if (filter.category !== 'all' && exp.category !== filter.category) return false

      // Search filter
      if (filter.search && !exp.title.toLowerCase().includes(filter.search.toLowerCase())) return false

      // Date range filter
      const expDate = new Date(exp.date)
      const now = new Date()
      if (filter.dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (expDate < weekAgo) return false
      } else if (filter.dateRange === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        if (expDate < monthAgo) return false
      } else if (filter.dateRange === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        if (expDate < yearAgo) return false
      }

      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, filter])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const byCategory = {}
    CATEGORIES.forEach(cat => {
      byCategory[cat.id] = filteredExpenses
        .filter(exp => exp.category === cat.id)
        .reduce((sum, exp) => sum + exp.amount, 0)
    })
    const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    const max = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0
    return { total, byCategory, avg, max, count: filteredExpenses.length }
  }, [filteredExpenses])

  const getCategory = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7]

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setForm({
        title: expense.title,
        amount: expense.amount.toString(),
        category: expense.category,
        date: expense.date,
        notes: expense.notes || ''
      })
    } else {
      setEditingExpense(null)
      setForm({
        title: '',
        amount: '',
        category: 'food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingExpense(null)
  }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.amount) return

    const expenseData = {
      ...form,
      amount: parseFloat(form.amount),
      id: editingExpense ? editingExpense.id : Date.now()
    }

    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? expenseData : exp))
    } else {
      setExpenses(prev => [...prev, expenseData])
    }
    closeModal()
  }

  const handleDelete = (id) => {
    setExpenses(prev => prev.filter(exp => exp.id !== id))
  }

  // Chart bar calculation
  const maxCategoryAmount = Math.max(...Object.values(stats.byCategory), 1)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <h1>💸 ExpenseFlow</h1>
          <span className="tagline">Track Your Spending</span>
        </div>
        <div className="header-right">
          <div className="view-toggle">
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              📋 List
            </button>
            <button className={view === 'chart' ? 'active' : ''} onClick={() => setView('chart')}>
              📊 Charts
            </button>
          </div>
          <button className="btn-add" onClick={() => openModal()}>
            + Add Expense
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-card total">
          <span className="stat-label">Total Spent</span>
          <span className="stat-value">${stats.total.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Transactions</span>
          <span className="stat-value">{stats.count}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average</span>
          <span className="stat-value">${stats.avg.toFixed(2)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Highest</span>
          <span className="stat-value">${stats.max.toFixed(2)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-box">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search expenses..."
            value={filter.search}
            onChange={(e) => setFilter(p => ({ ...p, search: e.target.value }))}
          />
        </div>
        <select
          value={filter.category}
          onChange={(e) => setFilter(p => ({ ...p, category: e.target.value }))}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
          ))}
        </select>
        <select
          value={filter.dateRange}
          onChange={(e) => setFilter(p => ({ ...p, dateRange: e.target.value }))}
        >
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {view === 'list' ? (
          /* Expense List */
          <div className="expense-list">
            {filteredExpenses.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No expenses yet</h3>
                <p>Start tracking by adding your first expense</p>
              </div>
            ) : (
              filteredExpenses.map(expense => {
                const cat = getCategory(expense.category)
                return (
                  <div key={expense.id} className="expense-card">
                    <div className="expense-icon" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                      {cat.emoji}
                    </div>
                    <div className="expense-details">
                      <h3>{expense.title}</h3>
                      <div className="expense-meta">
                        <span className="category-tag" style={{ backgroundColor: cat.color + '20', color: cat.color }}>
                          {cat.name}
                        </span>
                        <span className="date">📅 {new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      {expense.notes && <p className="expense-notes">{expense.notes}</p>}
                    </div>
                    <div className="expense-amount">
                      <span className="amount">-${expense.amount.toFixed(2)}</span>
                      <div className="expense-actions">
                        <button onClick={() => openModal(expense)} title="Edit">✏️</button>
                        <button onClick={() => handleDelete(expense.id)} title="Delete">🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          /* Charts View */
          <div className="charts-view">
            <div className="chart-section">
              <h2>Spending by Category</h2>
              <div className="bar-chart">
                {CATEGORIES.map(cat => {
                  const amount = stats.byCategory[cat.id]
                  const percentage = (amount / maxCategoryAmount) * 100
                  return (
                    <div key={cat.id} className="bar-row">
                      <div className="bar-label">
                        <span className="bar-emoji">{cat.emoji}</span>
                        <span className="bar-name">{cat.name}</span>
                      </div>
                      <div className="bar-container">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: cat.color
                          }}
                        />
                      </div>
                      <span className="bar-value">${amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="chart-section donut-section">
              <h2>Category Breakdown</h2>
              <div className="donut-container">
                <div className="donut-chart">
                  {/* SVG Donut Chart */}
                  <svg viewBox="0 0 100 100">
                    {(() => {
                      let offset = 0
                      return CATEGORIES.map(cat => {
                        const amount = stats.byCategory[cat.id]
                        const percentage = stats.total > 0 ? (amount / stats.total) * 100 : 0
                        const strokeDasharray = `${percentage} ${100 - percentage}`
                        const strokeDashoffset = -offset
                        offset += percentage
                        if (percentage === 0) return null
                        return (
                          <circle
                            key={cat.id}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="transparent"
                            stroke={cat.color}
                            strokeWidth="12"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            transform="rotate(-90 50 50)"
                            style={{ transition: 'all 0.5s ease' }}
                          />
                        )
                      })
                    })()}
                    <text x="50" y="50" textAnchor="middle" dy="0.3em" className="donut-total">
                      ${stats.total.toFixed(0)}
                    </text>
                  </svg>
                </div>
                <div className="donut-legend">
                  {CATEGORIES.filter(cat => stats.byCategory[cat.id] > 0).map(cat => (
                    <div key={cat.id} className="legend-item">
                      <span className="legend-dot" style={{ backgroundColor: cat.color }} />
                      <span className="legend-name">{cat.name}</span>
                      <span className="legend-percent">
                        {((stats.byCategory[cat.id] / stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="What did you spend on?"
                  required
                  autoFocus
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.amount}
                    onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Category</label>
                <div className="category-grid">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`category-btn ${form.category === cat.id ? 'active' : ''}`}
                      style={{
                        '--cat-color': cat.color,
                        borderColor: form.category === cat.id ? cat.color : 'transparent',
                        backgroundColor: form.category === cat.id ? cat.color + '20' : 'transparent'
                      }}
                      onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
                  placeholder="Add any additional details..."
                  rows={2}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-save">
                  {editingExpense ? 'Update' : 'Add Expense'}
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
