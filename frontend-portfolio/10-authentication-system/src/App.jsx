import { useState, useEffect, createContext, useContext } from 'react'
import './App.css'

// Auth System
// Login, Register, Protected Routes, Profile, Simulated JWT

// Mock Auth Context
const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Check for "token" in localStorage
        const token = localStorage.getItem('auth_token')
        if (token) {
            // Decode token (simulate)
            try {
                const userData = JSON.parse(atob(token))
                setUser(userData)
            } catch (e) {
                localStorage.removeItem('auth_token')
            }
        }
        setLoading(false)
    }, [])

    const login = (email, password) => {
        // Simulate API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === 'demo@example.com' && password === 'password') {
                    const userData = { id: 1, name: 'Demo User', email, role: 'user' }
                    const token = btoa(JSON.stringify(userData))
                    localStorage.setItem('auth_token', token)
                    setUser(userData)
                    resolve(userData)
                } else {
                    reject(new Error('Invalid credentials'))
                }
            }, 1000)
        })
    }

    const register = (name, email, password) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const userData = { id: Date.now(), name, email, role: 'user' }
                const token = btoa(JSON.stringify(userData))
                localStorage.setItem('auth_token', token)
                setUser(userData)
                resolve(userData)
            }, 1000)
        })
    }

    const logout = () => {
        localStorage.removeItem('auth_token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = () => useContext(AuthContext)

// Components
const Login = ({ setView }) => {
    const { login } = useAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)
        try {
            await login(email, password)
        } catch (err) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="auth-card">
            <h2>Welcome Back</h2>
            <p>Please sign in to continue</p>

            {error && <div className="alert error">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="demo@example.com"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="password"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <div className="auth-footer">
                Don't have an account? <span onClick={() => setView('register')}>Sign Up</span>
            </div>
        </div>
    )
}

const Register = ({ setView }) => {
    const { register } = useAuth()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        await register(name, email, password)
        setIsSubmitting(false)
    }

    return (
        <div className="auth-card">
            <h2>Create Account</h2>
            <p>Get started with your free account</p>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        required
                    />
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <div className="auth-footer">
                Already have an account? <span onClick={() => setView('login')}>Log In</span>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const { user, logout } = useAuth()

    return (
        <div className="dashboard">
            <nav className="navbar">
                <div className="logo">🔒 SecureApp</div>
                <div className="user-menu">
                    <div className="avatar">{user.name[0]}</div>
                    <button onClick={logout} className="btn-logout">Log Out</button>
                </div>
            </nav>

            <div className="container">
                <div className="welcome-banner">
                    <h1>Hello, {user.name}! 👋</h1>
                    <p>You have successfully authenticated.</p>
                </div>

                <div className="profile-section">
                    <h3>Your Profile</h3>
                    <div className="profile-details">
                        <div className="detail">
                            <span className="label">User ID</span>
                            <span className="value">{user.id}</span>
                        </div>
                        <div className="detail">
                            <span className="label">Email</span>
                            <span className="value">{user.email}</span>
                        </div>
                        <div className="detail">
                            <span className="label">Role</span>
                            <span className="value badge">{user.role}</span>
                        </div>
                    </div>
                </div>

                <div className="protected-content">
                    <h3>🔐 Protected Content</h3>
                    <p>This content is only visible to logged-in users. Here is your secret token:</p>
                    <code className="token-display">{localStorage.getItem('auth_token').substring(0, 20)}...</code>
                </div>
            </div>
        </div>
    )
}

function App() {
    const [view, setView] = useState('login') // login, register

    return (
        <AuthProvider>
            <MainContent view={view} setView={setView} />
        </AuthProvider>
    )
}

const MainContent = ({ view, setView }) => {
    const { user, loading } = useAuth()

    if (loading) return <div className="loading">Loading...</div>

    if (user) return <Dashboard />

    return (
        <div className="app">
            <div className="auth-container">
                <div className="auth-left">
                    <h1>Global<br />Security<br />Systems.</h1>
                    <p>Enterprise-grade authentication implementation securely built for React.</p>
                </div>
                <div className="auth-right">
                    {view === 'login' ? <Login setView={setView} /> : <Register setView={setView} />}
                </div>
            </div>
        </div>
    )
}

export default App
