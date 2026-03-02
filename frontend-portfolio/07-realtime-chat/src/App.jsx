import { useState, useEffect, useRef } from 'react'
import './App.css'

// Real-Time Chat App Simulation
// Features: multiple users, typing indicators, read receipts, emoji picker

const USERS = [
  { id: 'user1', name: 'Alex', avatar: '👨‍💻', status: 'online' },
  { id: 'user2', name: 'Sarah', avatar: '👩‍🎨', status: 'online' },
  { id: 'user3', name: 'Mike', avatar: '🏃‍♂️', status: 'offline' },
  { id: 'user4', name: 'Emily', avatar: '📚', status: 'away' }
]

const INITIAL_MESSAGES = [
  { id: 1, senderId: 'user2', text: 'Hey Alex! How is the project coming along?', timestamp: Date.now() - 3600000, status: 'read' },
  { id: 2, senderId: 'user1', text: 'Hi Sarah! It\'s going great. Just finishing up the chat module.', timestamp: Date.now() - 3500000, status: 'read' },
  { id: 3, senderId: 'user2', text: 'That sounds awesome! Can\'t wait to see it.', timestamp: Date.now() - 3400000, status: 'read' }
]

function App() {
  const [currentUser, setCurrentUser] = useState(USERS[0])
  const [activeChat, setActiveChat] = useState(USERS[1])
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherTyping, setOtherTyping] = useState(false)

  const messagesEndRef = useRef(null)

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, otherTyping])

  // Simulate receiving messages
  useEffect(() => {
    // Poll for "new" messages or simulate random incoming messages
    const interval = setInterval(() => {
      // 10% chance to receive a message if not typing
      if (!otherTyping && Math.random() < 0.05) {
        setOtherTyping(true)
        setTimeout(() => {
          setOtherTyping(false)
          const responses = [
            "That's interesting!",
            "Cool.",
            "Tell me more.",
            "I agree completely.",
            "Can we meet later?",
            "Lol 😂",
            "Sounds good to me."
          ]
          const randomResponse = responses[Math.floor(Math.random() * responses.length)]

          setMessages(prev => [...prev, {
            id: Date.now(),
            senderId: activeChat.id,
            text: randomResponse,
            timestamp: Date.now(),
            status: 'sent'
          }])
        }, 3000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [activeChat, otherTyping])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message = {
      id: Date.now(),
      senderId: currentUser.id,
      text: newMessage,
      timestamp: Date.now(),
      status: 'sent'
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
    setIsTyping(false)

    // Simulate "Read" status update
    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, status: 'delivered' } : m
      ))
    }, 1000)

    setTimeout(() => {
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, status: 'read' } : m
      ))
    }, 2500)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="app">
      <div className="chat-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="current-user-profile">
              <span className="avatar large">{currentUser.avatar}</span>
              <div className="user-info">
                <h3>{currentUser.name}</h3>
                <span className="status">● {currentUser.status}</span>
              </div>
            </div>
            {/* User Switcher for Demo */}
            <select
              value={currentUser.id}
              onChange={(e) => setCurrentUser(USERS.find(u => u.id === e.target.value))}
              className="user-switcher"
            >
              <option value="user1">Switch to Alex</option>
              <option value="user2">Switch to Sarah</option>
            </select>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search chats..." />
          </div>

          <div className="chat-list">
            {USERS.filter(u => u.id !== currentUser.id).map(user => {
              const lastMsg = messages.filter(m =>
                (m.senderId === user.id && m.receiverId === currentUser.id) ||
                (m.senderId === currentUser.id && m.receiverId === user.id) // Simplified logic
              ).pop() || { text: "No messages yet", timestamp: Date.now() } // Fallback

              // For this simple demo, we just show all messages in main chat, 
              // but highlighting logic acts like rooms
              return (
                <div
                  key={user.id}
                  className={`chat-item ${activeChat.id === user.id ? 'active' : ''}`}
                  onClick={() => setActiveChat(user)}
                >
                  <div className="avatar-container">
                    <span className="avatar">{user.avatar}</span>
                    <span className={`status-indicator ${user.status}`}></span>
                  </div>
                  <div className="chat-preview">
                    <div className="chat-preview-header">
                      <h4>{user.name}</h4>
                      <span className="time">12:30</span>
                    </div>
                    <p>{user.id === activeChat.id && otherTyping ? 'Typing...' : 'Click to chat'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-area">
          <header className="chat-header">
            <div className="avatar-container">
              <span className="avatar">{activeChat.avatar}</span>
              <span className={`status-indicator ${activeChat.status}`}></span>
            </div>
            <div className="header-info">
              <h2>{activeChat.name}</h2>
              <span className="status-text">
                {otherTyping ? 'Typing...' : activeChat.status.charAt(0).toUpperCase() + activeChat.status.slice(1)}
              </span>
            </div>
            <div className="header-actions">
              <button title="Voice Call">📞</button>
              <button title="Video Call">📹</button>
              <button title="Info">ℹ️</button>
            </div>
          </header>

          <div className="messages-list">
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === currentUser.id
              const showAvatar = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)

              // Only simulate conversation between these two
              // In real app, filter by room ID

              return (
                <div key={msg.id} className={`message-group ${isMe ? 'me' : 'them'}`}>
                  {showAvatar && !isMe && <span className="message-avatar">{activeChat.avatar}</span>}
                  <div className={`message-bubble ${!showAvatar && !isMe ? 'no-avatar' : ''}`}>
                    <p>{msg.text}</p>
                    <div className="message-meta">
                      <span className="timestamp">{formatTime(msg.timestamp)}</span>
                      {isMe && (
                        <span className="read-receipt">
                          {msg.status === 'sent' && '✓'}
                          {msg.status === 'delivered' && '✓✓'}
                          {msg.status === 'read' && <span style={{ color: '#3b82f6' }}>✓✓</span>}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {otherTyping && (
              <div className="message-group them">
                <span className="message-avatar">{activeChat.avatar}</span>
                <div className="message-bubble typing-bubble">
                  <div className="typing-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="message-input-area" onSubmit={handleSendMessage}>
            <button type="button" className="action-btn">📎</button>
            <button type="button" className="action-btn">😊</button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value)
                setIsTyping(true)
                // Debounce stop typing
                setTimeout(() => setIsTyping(false), 2000)
              }}
              placeholder={`Message ${activeChat.name}...`}
            />
            <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
              ➤
            </button>
          </form>
        </main>
      </div>
    </div>
  )
}

export default App
