import { useState, useEffect, createContext, useContext } from 'react'
import './index.css'

const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('auth_token')
        if (token) { try { setUser(JSON.parse(atob(token))) } catch (e) { localStorage.removeItem('auth_token') } }
        setLoading(false)
    }, [])

    const login = (email, password) => new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === 'demo@example.com' && password === 'password') {
                const userData = { id: 1, name: 'Demo User', email, role: 'user' }
                localStorage.setItem('auth_token', btoa(JSON.stringify(userData))); setUser(userData); resolve(userData)
            } else { reject(new Error('Invalid credentials')) }
        }, 1000)
    })

    const register = (name, email, password) => new Promise((resolve) => {
        setTimeout(() => { const userData = { id: Date.now(), name, email, role: 'user' }; localStorage.setItem('auth_token', btoa(JSON.stringify(userData))); setUser(userData); resolve(userData) }, 1000)
    })

    const logout = () => { localStorage.removeItem('auth_token'); setUser(null) }

    return <AuthContext.Provider value={{ user, login, register, logout, loading }}>{children}</AuthContext.Provider>
}

const useAuth = () => useContext(AuthContext)

const Login = ({ setView }) => {
    const { login } = useAuth()
    const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => { e.preventDefault(); setError(''); setIsSubmitting(true); try { await login(email, password) } catch (err) { setError(err.message) } finally { setIsSubmitting(false) } }

    return (
        <div className="w-full max-w-[360px]">
            <h2 className="text-[2rem] font-bold mb-2">Welcome Back</h2>
            <p className="text-text-muted mb-8">Please sign in to continue</p>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-[0.9rem] mb-5 border border-red-200">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label className="block text-[0.9rem] font-medium mb-2 text-text-main">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="demo@example.com" required className="w-full py-3 px-4 border border-border rounded-lg text-base transition-all duration-200 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                </div>
                <div className="mb-5">
                    <label className="block text-[0.9rem] font-medium mb-2 text-text-main">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" required className="w-full py-3 px-4 border border-border rounded-lg text-base transition-all duration-200 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-dark disabled:bg-blue-300 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                </button>
            </form>
            <div className="mt-6 text-center text-[0.9rem] text-text-muted">
                Don't have an account? <span className="text-primary font-semibold cursor-pointer" onClick={() => setView('register')}>Sign Up</span>
            </div>
        </div>
    )
}

const Register = ({ setView }) => {
    const { register } = useAuth()
    const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e) => { e.preventDefault(); setIsSubmitting(true); await register(name, email, password); setIsSubmitting(false) }

    return (
        <div className="w-full max-w-[360px]">
            <h2 className="text-[2rem] font-bold mb-2">Create Account</h2>
            <p className="text-text-muted mb-8">Get started with your free account</p>
            <form onSubmit={handleSubmit}>
                {[{ l: 'Full Name', t: 'text', v: name, s: setName, p: 'John Doe' }, { l: 'Email', t: 'email', v: email, s: setEmail, p: 'name@company.com' }, { l: 'Password', t: 'password', v: password, s: setPassword, p: 'Create a strong password' }].map(f => (
                    <div key={f.l} className="mb-5">
                        <label className="block text-[0.9rem] font-medium mb-2 text-text-main">{f.l}</label>
                        <input type={f.t} value={f.v} onChange={(e) => f.s(e.target.value)} placeholder={f.p} required className="w-full py-3 px-4 border border-border rounded-lg text-base transition-all duration-200 outline-none focus:border-primary focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)]" />
                    </div>
                ))}
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-primary text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-colors duration-200 hover:bg-primary-dark disabled:bg-blue-300 disabled:cursor-not-allowed">
                    {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>
            </form>
            <div className="mt-6 text-center text-[0.9rem] text-text-muted">
                Already have an account? <span className="text-primary font-semibold cursor-pointer" onClick={() => setView('login')}>Log In</span>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const { user, logout } = useAuth()
    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white h-[70px] px-10 flex justify-between items-center border-b border-border shadow-sm">
                <div className="font-extrabold text-xl text-primary flex items-center gap-2">🔒 SecureApp</div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold text-lg">{user.name[0]}</div>
                    <button onClick={logout} className="py-2 px-4 border border-border bg-white rounded-lg cursor-pointer font-medium transition-all duration-200 hover:bg-gray-100 hover:border-gray-300">Log Out</button>
                </div>
            </nav>
            <div className="max-w-[800px] mx-auto mt-10 px-5">
                <div className="mb-10">
                    <h1 className="text-[2.5rem] font-extrabold mb-2">Hello, {user.name}! 👋</h1>
                    <p className="text-text-muted text-lg">You have successfully authenticated.</p>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm mb-8">
                    <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">Your Profile</h3>
                    <div className="flex flex-col gap-4">
                        {[{ l: 'User ID', v: user.id }, { l: 'Email', v: user.email }].map(d => (
                            <div key={d.l} className="flex justify-between items-center py-2">
                                <span className="text-text-muted font-medium">{d.l}</span>
                                <span className="font-semibold">{d.v}</span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center py-2">
                            <span className="text-text-muted font-medium">Role</span>
                            <span className="bg-blue-100 text-primary py-1 px-3 rounded-xl text-[0.9rem] uppercase font-semibold">{user.role}</span>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-2xl border border-border shadow-sm mb-8">
                    <h3 className="text-xl font-bold mb-6 pb-4 border-b border-border">🔐 Protected Content</h3>
                    <p className="text-text-muted">This content is only visible to logged-in users. Here is your secret token:</p>
                    <code className="block bg-gray-900 text-emerald-400 p-4 rounded-lg font-mono mt-4 break-all">{localStorage.getItem('auth_token').substring(0, 20)}...</code>
                </div>
            </div>
        </div>
    )
}

function App() {
    const [view, setView] = useState('login')
    return <AuthProvider><MainContent view={view} setView={setView} /></AuthProvider>
}

const MainContent = ({ view, setView }) => {
    const { user, loading } = useAuth()
    if (loading) return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xl font-semibold text-primary">Loading...</div>
    if (user) return <Dashboard />

    return (
        <div className="min-h-screen flex items-center justify-center p-5">
            <div className="flex w-[1000px] h-[600px] max-md:w-full max-md:h-auto max-md:max-w-[450px] max-md:flex-col bg-white rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)]">
                <div className="flex-1 bg-[linear-gradient(135deg,var(--color-bg-left),#2563eb)] text-white p-[60px] flex flex-col justify-center relative overflow-hidden max-md:hidden">
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(255,255,255,0.1)_0%,transparent_60%)] animate-[rotate_20s_linear_infinite]" />
                    <h1 className="text-[3.5rem] font-extrabold leading-[1.1] mb-6 relative z-10">Global<br />Security<br />Systems.</h1>
                    <p className="text-lg opacity-90 max-w-[300px] leading-relaxed relative z-10">Enterprise-grade authentication implementation securely built for React.</p>
                </div>
                <div className="flex-1 bg-white p-[60px] max-md:p-10 flex items-center justify-center">
                    {view === 'login' ? <Login setView={setView} /> : <Register setView={setView} />}
                </div>
            </div>
        </div>
    )
}

export default App
