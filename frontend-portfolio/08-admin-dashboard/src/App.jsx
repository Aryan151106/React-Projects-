import { useState } from 'react'
import './App.css'

// Admin Dashboard
// Sidebar, Metrics Cards, Charts (simulated), Recent Orders Table

const METRICS = [
  { id: 1, title: 'Total Revenue', value: '$54,239', change: '+12.5%', isPositive: true },
  { id: 2, title: 'Active Users', value: '2,543', change: '+5.2%', isPositive: true },
  { id: 3, title: 'New Orders', value: '456', change: '-2.4%', isPositive: false },
  { id: 4, title: 'Bounce Rate', value: '42.3%', change: '-0.8%', isPositive: true }, // Lower bounce rate is good
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

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo-area">
          <span className="logo-icon">⚡</span>
          {isSidebarOpen && <h1>NexusAdmin</h1>}
        </div>

        <nav className="nav-menu">
          {['Overview', 'Analytics', 'Customers', 'Orders', 'Products', 'Settings'].map(item => (
            <button
              key={item}
              className={`nav-item ${activeTab === item ? 'active' : ''}`}
              onClick={() => setActiveTab(item)}
            >
              <span className="icon">
                {item === 'Overview' && '🏠'}
                {item === 'Analytics' && '📊'}
                {item === 'Customers' && '👥'}
                {item === 'Orders' && '📦'}
                {item === 'Products' && '🏷️'}
                {item === 'Settings' && '⚙️'}
              </span>
              {isSidebarOpen && <span className="label">{item}</span>}
            </button>
          ))}
        </nav>

        <div className="user-profile">
          <div className="avatar">A</div>
          {isSidebarOpen && (
            <div className="user-info">
              <span className="name">Admin User</span>
              <span className="role">Super Admin</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <button className="menu-btn" onClick={toggleSidebar}>☰</button>
          <div className="header-right">
            <button className="icon-btn">🔔</button>
            <button className="icon-btn">✉️</button>
          </div>
        </header>

        <div className="dashboard-content">
          <div className="page-header">
            <h2>{activeTab}</h2>
            <div className="date-filter">Last 30 Days ▼</div>
          </div>

          {activeTab === 'Overview' && (
            <>
              {/* Metrics Grid */}
              <div className="metrics-grid">
                {METRICS.map(metric => (
                  <div key={metric.id} className="metric-card">
                    <div className="metric-header">
                      <span className="metric-title">{metric.title}</span>
                      <span className={`metric-change ${metric.isPositive ? 'positive' : 'negative'}`}>
                        {metric.change}
                      </span>
                    </div>
                    <div className="metric-value">{metric.value}</div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="charts-grid">
                <div className="chart-card large">
                  <h3>Revenue Overview</h3>
                  <div className="chart-placeholder bar-chart">
                    {/* Simulated Bar Chart */}
                    {[40, 60, 45, 70, 50, 80, 65, 85, 90, 75, 60, 95].map((h, i) => (
                      <div key={i} className="bar" style={{ height: `${h}%` }}></div>
                    ))}
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Sales by Category</h3>
                  <div className="chart-placeholder donut-chart">
                    <div className="donut-segment s1"></div>
                    <div className="donut-segment s2"></div>
                    <div className="donut-segment s3"></div>
                    <div className="donut-center"></div>
                  </div>
                  <div className="legend">
                    <div className="legend-item"><span className="dot c1"></span>Electronics</div>
                    <div className="legend-item"><span className="dot c2"></span>Fashion</div>
                    <div className="legend-item"><span className="dot c3"></span>Home</div>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="table-card">
                <h3>Recent Orders</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ORDERS.map(order => (
                      <tr key={order.id}>
                        <td className="order-id">{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.date}</td>
                        <td>{order.amount}</td>
                        <td>
                          <span className={`status-badge ${order.status.toLowerCase()}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {activeTab !== 'Overview' && (
            <div className="empty-tab">
              <h3>{activeTab} Module</h3>
              <p>This section is under development.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
