import { useState } from 'react'
import './index.css'

const METRICS = [
  { id: 1, title: 'Total Revenue', value: '$54,239', change: '+12.5%', isPositive: true },
  { id: 2, title: 'Active Users', value: '2,543', change: '+5.2%', isPositive: true },
  { id: 3, title: 'New Orders', value: '456', change: '-2.4%', isPositive: false },
  { id: 4, title: 'Bounce Rate', value: '42.3%', change: '-0.8%', isPositive: true },
]

const ORDERS = [
  { id: '#12345', customer: 'Alice Johnson', date: '2024-02-10', amount: '$120.50', status: 'Completed' },
  { id: '#12346', customer: 'Bob Smith', date: '2024-02-09', amount: '$85.00', status: 'Processing' },
  { id: '#12347', customer: 'Charlie Brown', date: '2024-02-09', amount: '$340.00', status: 'Shipped' },
  { id: '#12348', customer: 'Diana Ross', date: '2024-02-08', amount: '$54.20', status: 'Pending' },
  { id: '#12349', customer: 'Edward Stark', date: '2024-02-08', amount: '$210.00', status: 'Completed' },
]

function App() {
  const [activeTab, setActiveTab] = useState('Overview')
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen)

  const statusColor = (s) => {
    const map = { completed: 'bg-success/10 text-success', processing: 'bg-info/10 text-info', shipped: 'bg-primary/10 text-primary', pending: 'bg-warning/10 text-warning' }
    return map[s.toLowerCase()] || 'bg-gray-100 text-gray-500'
  }

  const NAV_ITEMS = [
    { name: 'Overview', icon: '🏠' }, { name: 'Analytics', icon: '📊' }, { name: 'Customers', icon: '👥' },
    { name: 'Orders', icon: '📦' }, { name: 'Products', icon: '🏷️' }, { name: 'Settings', icon: '⚙️' }
  ]

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-[260px]' : 'w-[72px]'} max-md:fixed max-md:z-[100] max-md:w-[260px] ${!isSidebarOpen ? 'max-md:-translate-x-full' : ''} bg-bg-sidebar text-white flex flex-col transition-all duration-300`}>
        <div className="h-[70px] flex items-center gap-3 px-6 border-b border-white/10 overflow-hidden">
          <span className="text-2xl flex items-center justify-center min-w-[32px]">⚡</span>
          {isSidebarOpen && <h1 className="text-xl font-bold whitespace-nowrap">NexusAdmin</h1>}
        </div>

        <nav className="flex-1 p-3 px-3 flex flex-col gap-1">
          {NAV_ITEMS.map(item => (
            <button key={item.name} className={`flex items-center py-3 px-3 gap-3 border-none rounded-lg text-[0.9rem] font-medium cursor-pointer transition-all duration-200 ${activeTab === item.name ? 'bg-primary text-white' : 'bg-transparent text-white/60 hover:bg-white/10 hover:text-white'}`}
              onClick={() => setActiveTab(item.name)}>
              <span className="text-lg flex items-center justify-center min-w-[24px]">{item.icon}</span>
              {isSidebarOpen && <span className="whitespace-nowrap">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="p-5 border-t border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center font-semibold text-[0.9rem] shrink-0">A</div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <span className="font-semibold text-[0.9rem] whitespace-nowrap">Admin User</span>
              <span className="text-[0.75rem] text-white/50 whitespace-nowrap">Super Admin</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-[70px] bg-bg-card border-b border-border flex items-center justify-between px-6 shrink-0">
          <button className="bg-transparent border-none text-xl cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100" onClick={toggleSidebar}>☰</button>
          <div className="flex gap-3">
            {['🔔', '✉️'].map(icon => (
              <button key={icon} className="bg-transparent border-none text-xl cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100">{icon}</button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 max-md:p-5">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{activeTab}</h2>
            <div className="py-2.5 px-4 bg-bg-card rounded-lg border border-border text-[0.9rem] font-medium text-text-muted cursor-pointer">Last 30 Days ▼</div>
          </div>

          {activeTab === 'Overview' && (
            <>
              {/* Metrics Grid */}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] max-md:grid-cols-1 gap-6 mb-8">
                {METRICS.map(metric => (
                  <div key={metric.id} className="bg-bg-card p-6 rounded-xl shadow-sm border border-border">
                    <div className="flex justify-between mb-3">
                      <span className="text-[0.85rem] text-text-muted">{metric.title}</span>
                      <span className={`text-[0.8rem] font-semibold py-1 px-2 rounded ${metric.isPositive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{metric.change}</span>
                    </div>
                    <div className="text-[1.8rem] font-bold">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-[2fr_1fr] max-md:grid-cols-1 gap-6 mb-8">
                <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border">
                  <h3 className="text-base font-semibold mb-5">Revenue Overview</h3>
                  <div className="flex items-end gap-2 h-[200px]">
                    {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75, 60, 95].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary rounded-t opacity-80 hover:opacity-100 transition-opacity duration-200" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-bg-card p-6 rounded-xl shadow-sm border border-border">
                  <h3 className="text-base font-semibold mb-5">Sales by Category</h3>
                  <div className="flex items-center justify-center h-[200px] relative">
                    <div className="donut-segment s1" />
                    <div className="donut-segment s2" />
                    <div className="donut-segment s3" />
                    <div className="donut-center" />
                  </div>
                  <div className="flex gap-5 justify-center mt-5">
                    {[{ c: 'bg-info', l: 'Electronics' }, { c: 'bg-primary', l: 'Fashion' }, { c: 'bg-warning', l: 'Home' }].map(i => (
                      <div key={i.l} className="flex items-center gap-2 text-[0.85rem] text-text-muted"><span className={`w-2.5 h-2.5 rounded-full ${i.c}`} />{i.l}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-bg-card rounded-xl shadow-sm border border-border overflow-x-auto max-md:overflow-x-auto">
                <h3 className="text-base font-semibold p-6 pb-4">Recent Orders</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Order ID', 'Customer', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} className="bg-gray-50 text-left py-3 px-6 text-[0.85rem] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map(order => (
                      <tr key={order.id} className="border-b border-border last:border-b-0 hover:bg-gray-50 transition-colors duration-200">
                        <td className="py-4 px-6 text-[0.95rem] font-mono font-semibold text-primary">{order.id}</td>
                        <td className="py-4 px-6 text-[0.95rem]">{order.customer}</td>
                        <td className="py-4 px-6 text-[0.95rem]">{order.date}</td>
                        <td className="py-4 px-6 text-[0.95rem]">{order.amount}</td>
                        <td className="py-4 px-6 text-[0.95rem]">
                          <span className={`py-1.5 px-3 rounded-full text-[0.8rem] font-medium ${statusColor(order.status)}`}>{order.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab !== 'Overview' && (
            <div className="text-center py-20 bg-bg-card rounded-xl border border-dashed border-border">
              <h3 className="text-xl mb-2">{activeTab} Module</h3>
              <p className="text-text-muted">This section is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
