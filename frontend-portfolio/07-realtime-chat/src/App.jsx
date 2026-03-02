import { useState, useEffect, useRef } from 'react'
import './index.css'

const USERS = [
  { id: 'user1', name: 'Alex', avatar: '👨‍💻', status: 'online' },
  { id: 'user2', name: 'Sarah', avatar: '👩‍🎨', status: 'online' },
  { id: 'user3', name: 'Mike', avatar: '🏃‍♂️', status: 'offline' },
  { id: 'user4', name: 'Emily', avatar: '📚', status: 'away' }
]

const INITIAL_MESSAGES = [
  { id: 1, senderId: 'user2', text: 'Hey Alex! How is the project coming along?', timestamp: Date.now() - 3600000, status: 'read' },
  { id: 2, senderId: 'user1', text: "Hi Sarah! It's going great. Just finishing up the chat module.", timestamp: Date.now() - 3500000, status: 'read' },
  { id: 3, senderId: 'user2', text: "That sounds awesome! Can't wait to see it.", timestamp: Date.now() - 3400000, status: 'read' }
]

function App() {
  const [currentUser, setCurrentUser] = useState(USERS[0])
  const [activeChat, setActiveChat] = useState(USERS[1])
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isTyping, otherTyping])

  useEffect(() => {
    const interval = setInterval(() => {
      if (!otherTyping && Math.random() < 0.05) {
        setOtherTyping(true)
        setTimeout(() => {
          setOtherTyping(false)
          const responses = ["That's interesting!", "Cool.", "Tell me more.", "I agree completely.", "Can we meet later?", "Lol 😂", "Sounds good to me."]
          setMessages(prev => [...prev, { id: Date.now(), senderId: activeChat.id, text: responses[Math.floor(Math.random() * responses.length)], timestamp: Date.now(), status: 'sent' }])
        }, 3000)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [activeChat, otherTyping])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    const message = { id: Date.now(), senderId: currentUser.id, text: newMessage, timestamp: Date.now(), status: 'sent' }
    setMessages(prev => [...prev, message]); setNewMessage(''); setIsTyping(false)
    setTimeout(() => { setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'delivered' } : m)) }, 1000)
    setTimeout(() => { setMessages(prev => prev.map(m => m.id === message.id ? { ...m, status: 'read' } : m)) }, 2500)
  }

  const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const statusColor = (s) => s === 'online' ? 'bg-online' : s === 'away' ? 'bg-away' : 'bg-offline'

  return (
    <div className="h-screen flex justify-center items-center p-5 max-md:p-0">
      <div className="w-full max-w-[1200px] h-[90vh] max-md:h-screen bg-white rounded-[20px] max-md:rounded-none shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 max-md:w-20 bg-bg-sidebar border-r border-border flex flex-col">
          <div className="p-5 border-b border-border flex items-center justify-between max-md:justify-center">
            <div className="flex items-center gap-3">
              <span className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-2xl border-2 border-white shadow-sm">{currentUser.avatar}</span>
              <div className="max-md:hidden">
                <h3 className="text-base font-semibold">{currentUser.name}</h3>
                <span className="text-[0.8rem] capitalize flex items-center gap-1 text-online">● {currentUser.status}</span>
              </div>
            </div>
            <select value={currentUser.id} onChange={(e) => setCurrentUser(USERS.find(u => u.id === e.target.value))} className="bg-transparent border border-border rounded text-[0.8rem] p-1 max-md:hidden">
              <option value="user1">Switch to Alex</option>
              <option value="user2">Switch to Sarah</option>
            </select>
          </div>

          <div className="py-4 px-5 max-md:hidden">
            <input type="text" placeholder="Search chats..." className="w-full py-2.5 px-4 bg-gray-50 border border-border rounded-[20px] text-[0.9rem] outline-none transition-all duration-200 focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_2px_rgba(59,130,246,0.1)]" />
          </div>

          <div className="flex-1 overflow-y-auto">
            {USERS.filter(u => u.id !== currentUser.id).map(user => (
              <div key={user.id} className={`flex gap-4 py-3 px-5 max-md:justify-center max-md:px-4 cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${activeChat.id === user.id ? 'bg-blue-50 border-r-[3px] border-r-blue-500' : ''}`} onClick={() => setActiveChat(user)}>
                <div className="relative">
                  <span className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">{user.avatar}</span>
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColor(user.status)}`} />
                </div>
                <div className="flex-1 min-w-0 max-md:hidden">
                  <div className="flex justify-between mb-1">
                    <h4 className="text-[0.95rem] font-semibold text-text-primary">{user.name}</h4>
                    <span className="text-[0.75rem] text-text-secondary">12:30</span>
                  </div>
                  <p className="text-[0.85rem] text-text-secondary whitespace-nowrap overflow-hidden text-ellipsis">{user.id === activeChat.id && otherTyping ? 'Typing...' : 'Click to chat'}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col bg-bg-chat">
          <header className="bg-white py-4 px-6 border-b border-border flex items-center gap-4">
            <div className="relative">
              <span className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-xl border-2 border-white shadow-sm">{activeChat.avatar}</span>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColor(activeChat.status)}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{activeChat.name}</h2>
              <span className="text-[0.85rem] text-text-secondary">{otherTyping ? 'Typing...' : activeChat.status.charAt(0).toUpperCase() + activeChat.status.slice(1)}</span>
            </div>
            <div className="flex gap-3">
              {['📞', '📹', 'ℹ️'].map(icon => (
                <button key={icon} title={icon} className="bg-transparent border-none text-xl cursor-pointer p-2 rounded-full transition-colors duration-200 hover:bg-gray-100">{icon}</button>
              ))}
            </div>
          </header>

          <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)
              return (
                <div key={msg.id} className={`flex gap-3 max-w-[70%] max-md:max-w-[85%] ${isMe ? 'self-end flex-row-reverse' : ''}`}>
                  {showAvatar && !isMe && <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[0.9rem] self-end mb-1">{activeChat.avatar}</span>}
                  <div className={`py-3 px-4 shadow-sm relative ${isMe ? 'bg-msg-me text-white rounded-[18px] rounded-br-[4px]' : 'bg-msg-them rounded-[18px] rounded-bl-[4px]'} ${!showAvatar && !isMe ? 'ml-11' : ''}`}>
                    <p className="leading-relaxed text-[0.95rem]">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 text-[0.7rem] ${isMe ? 'text-white/80' : 'text-text-secondary'}`}>
                      <span>{formatTime(msg.timestamp)}</span>
                      {isMe && <span>{msg.status === 'sent' ? '✓' : msg.status === 'delivered' ? '✓✓' : <span style={{ color: '#3b82f6' }}>✓✓</span>}</span>}
                    </div>
                  </div>
                </div>
              )
            })}

            {otherTyping && (
              <div className="flex gap-3 max-w-[70%]">
                <span className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-[0.9rem] self-end mb-1">{activeChat.avatar}</span>
                <div className="bg-msg-them rounded-[18px] rounded-bl-[4px] p-4">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_both]" style={{ animationDelay: `${-0.32 + i * 0.16}s` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="py-5 px-6 bg-white border-t border-border flex items-center gap-3" onSubmit={handleSendMessage}>
            {['📎', '😊'].map(icon => (
              <button key={icon} type="button" className="bg-transparent border-none text-xl cursor-pointer text-text-secondary transition-colors duration-200 hover:text-text-primary">{icon}</button>
            ))}
            <input type="text" value={newMessage} onChange={(e) => { setNewMessage(e.target.value); setIsTyping(true); setTimeout(() => setIsTyping(false), 2000) }} placeholder={`Message ${activeChat.name}...`}
              className="flex-1 py-3 px-4 bg-gray-50 border border-border rounded-3xl text-[0.95rem] outline-none font-[inherit] focus:bg-white focus:border-blue-500" />
            <button type="submit" disabled={!newMessage.trim()} className="w-11 h-11 rounded-full bg-blue-500 text-white border-none text-lg flex items-center justify-center cursor-pointer pl-1 transition-all duration-200 hover:bg-blue-600 active:scale-95 disabled:bg-blue-200 disabled:cursor-not-allowed">➤</button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default App
