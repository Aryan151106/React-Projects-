import { useState, useEffect, useMemo } from 'react'
import './index.css'

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
    title: '', amount: '', category: 'food',
    date: new Date().toISOString().split('T')[0], notes: ''
  })
  const [filter, setFilter] = useState({ category: 'all', dateRange: 'all', search: '' })
  const [view, setView] = useState('list')

  useEffect(() => {
    const saved = localStorage.getItem('expensetracker_expenses')
    if (saved) setExpenses(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('expensetracker_expenses', JSON.stringify(expenses))
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      if (filter.category !== 'all' && exp.category !== filter.category) return false
      if (filter.search && !exp.title.toLowerCase().includes(filter.search.toLowerCase())) return false
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

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0)
    const byCategory = {}
    CATEGORIES.forEach(cat => {
      byCategory[cat.id] = filteredExpenses.filter(exp => exp.category === cat.id).reduce((sum, exp) => sum + exp.amount, 0)
    })
    const avg = filteredExpenses.length > 0 ? total / filteredExpenses.length : 0
    const max = filteredExpenses.length > 0 ? Math.max(...filteredExpenses.map(e => e.amount)) : 0
    return { total, byCategory, avg, max, count: filteredExpenses.length }
  }, [filteredExpenses])

  const getCategory = (id) => CATEGORIES.find(c => c.id === id) || CATEGORIES[7]

  const openModal = (expense = null) => {
    if (expense) {
      setEditingExpense(expense)
      setForm({ title: expense.title, amount: expense.amount.toString(), category: expense.category, date: expense.date, notes: expense.notes || '' })
    } else {
      setEditingExpense(null)
      setForm({ title: '', amount: '', category: 'food', date: new Date().toISOString().split('T')[0], notes: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingExpense(null) }

  const handleSave = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.amount) return
    const expenseData = { ...form, amount: parseFloat(form.amount), id: editingExpense ? editingExpense.id : Date.now() }
    if (editingExpense) {
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? expenseData : exp))
    } else {
      setExpenses(prev => [...prev, expenseData])
    }
    closeModal()
  }

  const handleDelete = (id) => setExpenses(prev => prev.filter(exp => exp.id !== id))
  const maxCategoryAmount = Math.max(...Object.values(stats.byCategory), 1)

  return (
    <div className="max-w-[1200px] mx-auto p-6 max-sm:p-4">
      {/* Header */}
      <header className="flex max-sm:flex-col justify-between items-center mb-6 p-5 px-6 bg-bg-glass backdrop-blur-[12px] border border-border rounded-2xl max-sm:gap-4">
        <div>
          <h1 className="text-[1.6rem] font-bold gradient-text-green">💸 ExpenseFlow</h1>
          <span className="text-[0.85rem] text-text-secondary mt-1 block">Track Your Spending</span>
        </div>
        <div className="flex items-center gap-4 max-sm:w-full max-sm:flex-wrap max-sm:justify-center">
          <div className="flex bg-bg-secondary rounded-[10px] p-1">
            <button className={`py-2.5 px-4 border-none text-[0.85rem] cursor-pointer rounded-lg transition-all duration-300 ${view === 'list' ? 'bg-accent-primary text-white' : 'bg-transparent text-text-secondary'}`} onClick={() => setView('list')}>📋 List</button>
            <button className={`py-2.5 px-4 border-none text-[0.85rem] cursor-pointer rounded-lg transition-all duration-300 ${view === 'chart' ? 'bg-accent-primary text-white' : 'bg-transparent text-text-secondary'}`} onClick={() => setView('chart')}>📊 Charts</button>
          </div>
          <button className="py-3 px-5 gradient-green border-none rounded-[10px] text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(16,185,129,0.35)]" onClick={() => openModal()}>+ Add Expense</button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))] backdrop-blur-[10px] border border-accent-primary/30 rounded-2xl p-5 text-center">
          <span className="block text-[0.8rem] text-text-secondary mb-2">Total Spent</span>
          <span className="text-2xl font-bold text-accent-primary">${stats.total.toFixed(2)}</span>
        </div>
        {[{ label: 'Transactions', value: stats.count }, { label: 'Average', value: `$${stats.avg.toFixed(2)}` }, { label: 'Highest', value: `$${stats.max.toFixed(2)}` }].map(s => (
          <div key={s.label} className="bg-bg-glass backdrop-blur-[10px] border border-border rounded-2xl p-5 text-center">
            <span className="block text-[0.8rem] text-text-secondary mb-2">{s.label}</span>
            <span className="text-2xl font-bold">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] flex items-center gap-2.5 px-4 bg-bg-secondary border border-border rounded-[10px]">
          <span>🔍</span>
          <input type="text" placeholder="Search expenses..." value={filter.search} onChange={(e) => setFilter(p => ({ ...p, search: e.target.value }))} className="flex-1 py-3.5 bg-transparent border-none text-text-primary text-[0.9rem] focus:outline-none placeholder:text-text-secondary" />
        </div>
        <select value={filter.category} onChange={(e) => setFilter(p => ({ ...p, category: e.target.value }))} className="py-3.5 px-4 bg-bg-secondary border border-border rounded-[10px] text-text-primary text-[0.9rem] cursor-pointer focus:outline-none focus:border-accent-primary">
          <option value="all">All Categories</option>
          {CATEGORIES.map(cat => <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>)}
        </select>
        <select value={filter.dateRange} onChange={(e) => setFilter(p => ({ ...p, dateRange: e.target.value }))} className="py-3.5 px-4 bg-bg-secondary border border-border rounded-[10px] text-text-primary text-[0.9rem] cursor-pointer focus:outline-none focus:border-accent-primary">
          <option value="all">All Time</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Main Content */}
      <main>
        {view === 'list' ? (
          <div className="flex flex-col gap-3">
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-20 px-5 bg-bg-glass border border-dashed border-border rounded-2xl">
                <span className="text-6xl mb-4 block">📝</span>
                <h3 className="text-xl mb-2">No expenses yet</h3>
                <p className="text-text-secondary">Start tracking by adding your first expense</p>
              </div>
            ) : (
              filteredExpenses.map(expense => {
                const cat = getCategory(expense.category)
                return (
                  <div key={expense.id} className="flex max-sm:flex-wrap items-center gap-4 py-4 px-5 bg-bg-glass backdrop-blur-[10px] border border-border rounded-2xl transition-all duration-300 hover:translate-x-1 hover:border-accent-primary group">
                    <div className="w-12 h-12 flex items-center justify-center text-xl rounded-xl shrink-0" style={{ backgroundColor: cat.color + '20', color: cat.color }}>{cat.emoji}</div>
                    <div className="flex-1">
                      <h3 className="text-base font-semibold mb-1.5">{expense.title}</h3>
                      <div className="flex items-center gap-3 text-[0.8rem]">
                        <span className="py-1 px-2.5 rounded-xl text-[0.75rem] font-medium" style={{ backgroundColor: cat.color + '20', color: cat.color }}>{cat.name}</span>
                        <span className="text-text-secondary">📅 {new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                      {expense.notes && <p className="mt-2 text-[0.85rem] text-text-secondary">{expense.notes}</p>}
                    </div>
                    <div className="text-right max-sm:w-full max-sm:flex max-sm:justify-between max-sm:items-center max-sm:mt-3 max-sm:pt-3 max-sm:border-t max-sm:border-border">
                      <span className="block text-xl font-bold text-accent-red mb-2">-${expense.amount.toFixed(2)}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 max-sm:opacity-100 transition-opacity duration-200">
                        <button onClick={() => openModal(expense)} title="Edit" className="bg-transparent border-none text-[0.9rem] cursor-pointer p-1">✏️</button>
                        <button onClick={() => handleDelete(expense.id)} title="Delete" className="bg-transparent border-none text-[0.9rem] cursor-pointer p-1">🗑️</button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-6">
            <div className="bg-bg-glass backdrop-blur-[10px] border border-border rounded-2xl p-6">
              <h2 className="text-base font-semibold mb-6 text-text-secondary">Spending by Category</h2>
              <div className="flex flex-col gap-3.5">
                {CATEGORIES.map(cat => {
                  const amount = stats.byCategory[cat.id]
                  const percentage = (amount / maxCategoryAmount) * 100
                  return (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-[140px] shrink-0">
                        <span className="text-lg">{cat.emoji}</span>
                        <span className="text-[0.8rem] text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{cat.name}</span>
                      </div>
                      <div className="flex-1 h-6 bg-white/5 rounded-md overflow-hidden">
                        <div className="h-full rounded-md transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: cat.color }} />
                      </div>
                      <span className="w-[70px] text-right text-[0.85rem] font-semibold text-text-secondary">${amount.toFixed(2)}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-bg-glass backdrop-blur-[10px] border border-border rounded-2xl p-6 flex flex-col">
              <h2 className="text-base font-semibold mb-6 text-text-secondary">Category Breakdown</h2>
              <div className="flex max-md:flex-col items-center gap-6 flex-1">
                <div className="w-[200px] h-[200px] shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    {(() => {
                      let offset = 0
                      return CATEGORIES.map(cat => {
                        const amount = stats.byCategory[cat.id]
                        const percentage = stats.total > 0 ? (amount / stats.total) * 100 : 0
                        const strokeDasharray = `${percentage} ${100 - percentage}`
                        const strokeDashoffset = -offset
                        offset += percentage
                        if (percentage === 0) return null
                        return <circle key={cat.id} cx="50" cy="50" r="40" fill="transparent" stroke={cat.color} strokeWidth="12" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} transform="rotate(-90 50 50)" style={{ transition: 'all 0.5s ease' }} />
                      })
                    })()}
                    <text x="50" y="50" textAnchor="middle" dy="0.3em" className="fill-text-primary text-[0.9rem] font-bold">${stats.total.toFixed(0)}</text>
                  </svg>
                </div>
                <div className="flex-1 flex flex-col gap-2.5">
                  {CATEGORIES.filter(cat => stats.byCategory[cat.id] > 0).map(cat => (
                    <div key={cat.id} className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                      <span className="flex-1 text-[0.85rem] text-text-secondary">{cat.name}</span>
                      <span className="text-[0.85rem] font-semibold">{((stats.byCategory[cat.id] / stats.total) * 100).toFixed(1)}%</span>
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-[4px] flex items-center justify-center z-[1000] p-5 animate-[fadeIn_0.2s_ease]" onClick={closeModal}>
          <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-[520px] max-h-[90vh] overflow-y-auto shadow-[0_8px_32px_rgba(0,0,0,0.4)] animate-[slideUp_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center py-5 px-6 border-b border-border">
              <h2 className="text-xl">{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>
              <button className="bg-transparent border-none text-text-secondary text-3xl cursor-pointer leading-none" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Title</label>
                <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="What did you spend on?" required autoFocus className="py-3.5 px-4 bg-black/30 border border-border rounded-[10px] text-text-primary text-base font-[inherit] focus:outline-none focus:border-accent-primary" />
              </div>
              <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-medium text-text-secondary">Amount ($)</label>
                  <input type="number" step="0.01" min="0" value={form.amount} onChange={(e) => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" required className="py-3.5 px-4 bg-black/30 border border-border rounded-[10px] text-text-primary text-base font-[inherit] focus:outline-none focus:border-accent-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[0.85rem] font-medium text-text-secondary">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm(p => ({ ...p, date: e.target.value }))} className="py-3.5 px-4 bg-black/30 border border-border rounded-[10px] text-text-primary text-base font-[inherit] focus:outline-none focus:border-accent-primary" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Category</label>
                <div className="grid grid-cols-4 max-md:grid-cols-2 gap-2">
                  {CATEGORIES.map(cat => (
                    <button key={cat.id} type="button" className={`flex flex-col items-center gap-1 py-3 px-2 border-2 rounded-[10px] text-text-primary text-[0.7rem] cursor-pointer transition-all duration-200 hover:bg-white/5 ${form.category === cat.id ? '' : 'border-border bg-transparent'}`}
                      style={{ borderColor: form.category === cat.id ? cat.color : undefined, backgroundColor: form.category === cat.id ? cat.color + '20' : undefined }}
                      onClick={() => setForm(p => ({ ...p, category: cat.id }))}>
                      <span className="text-xl">{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[0.85rem] font-medium text-text-secondary">Notes (optional)</label>
                <textarea value={form.notes} onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Add any additional details..." rows={2} className="py-3.5 px-4 bg-black/30 border border-border rounded-[10px] text-text-primary text-base font-[inherit] focus:outline-none focus:border-accent-primary" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="py-3 px-6 bg-transparent border border-border rounded-[10px] text-text-secondary text-[0.9rem] cursor-pointer hover:bg-white/5" onClick={closeModal}>Cancel</button>
                <button type="submit" className="py-3 px-6 gradient-green border-none rounded-[10px] text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)]">{editingExpense ? 'Update' : 'Add Expense'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
