import { useState, useEffect, useMemo } from 'react'
import './App.css'

// Markdown Blog Platform with Editor and Preview

// Simple markdown parser
const parseMarkdown = (md) => {
  let html = md
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and Italic
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    // Links and Images
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    // Horizontal rules
    .replace(/^---$/gim, '<hr />')
    // Paragraphs
    .replace(/\n\n/gim, '</p><p>')
    // Line breaks
    .replace(/\n/gim, '<br />')

  return '<p>' + html + '</p>'
}

const SAMPLE_POSTS = [
  {
    id: 1,
    title: 'Getting Started with React',
    content: `# Getting Started with React

React is a powerful JavaScript library for building user interfaces.

## Why React?

- **Component-Based**: Build encapsulated components
- **Declarative**: Design simple views for each state
- **Learn Once, Write Anywhere**: Use Node and render on the server

## Quick Example

\`\`\`javascript
function Welcome(props) {
  return <h1>Hello, {props.name}</h1>;
}
\`\`\`

> React makes it painless to create interactive UIs.

Happy coding! 🚀`,
    createdAt: '2024-01-15',
    tags: ['React', 'JavaScript', 'Tutorial']
  },
  {
    id: 2,
    title: 'CSS Tips and Tricks',
    content: `# CSS Tips and Tricks

Here are some modern CSS techniques to level up your designs.

## 1. CSS Grid

\`\`\`css
.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
\`\`\`

## 2. Glassmorphism

Use \`backdrop-filter: blur()\` for beautiful glass effects.

## 3. Custom Scrollbars

Style your scrollbars with \`::-webkit-scrollbar\` pseudo-elements.

---

*Master these techniques to create stunning UIs!*`,
    createdAt: '2024-01-10',
    tags: ['CSS', 'Design', 'Tips']
  }
]

function App() {
  const [posts, setPosts] = useState([])
  const [view, setView] = useState('list') // list, view, edit
  const [selectedPost, setSelectedPost] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorTitle, setEditorTitle] = useState('')
  const [editorTags, setEditorTags] = useState('')
  const [search, setSearch] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  // Load posts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('markdownblog_posts')
    if (saved) {
      setPosts(JSON.parse(saved))
    } else {
      setPosts(SAMPLE_POSTS)
    }
  }, [])

  // Save posts to localStorage
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('markdownblog_posts', JSON.stringify(posts))
    }
  }, [posts])

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    )
  }, [posts, search])

  const openEditor = (post = null) => {
    if (post) {
      setSelectedPost(post)
      setEditorTitle(post.title)
      setEditorContent(post.content)
      setEditorTags(post.tags.join(', '))
    } else {
      setSelectedPost(null)
      setEditorTitle('')
      setEditorContent('')
      setEditorTags('')
    }
    setIsPreview(false)
    setView('edit')
  }

  const viewPost = (post) => {
    setSelectedPost(post)
    setView('view')
  }

  const savePost = () => {
    if (!editorTitle.trim() || !editorContent.trim()) return

    const postData = {
      id: selectedPost ? selectedPost.id : Date.now(),
      title: editorTitle,
      content: editorContent,
      tags: editorTags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: selectedPost ? selectedPost.createdAt : new Date().toISOString().split('T')[0]
    }

    if (selectedPost) {
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? postData : p))
    } else {
      setPosts(prev => [postData, ...prev])
    }

    setView('list')
    setSelectedPost(null)
  }

  const deletePost = (id) => {
    if (confirm('Delete this post?')) {
      setPosts(prev => prev.filter(p => p.id !== id))
      setView('list')
    }
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-left" onClick={() => setView('list')} style={{ cursor: 'pointer' }}>
          <h1>📝 MarkdownHub</h1>
        </div>
        {view === 'list' && (
          <div className="header-center">
            <div className="search-box">
              <span>🔍</span>
              <input
                type="text"
                placeholder="Search posts or tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}
        <div className="header-right">
          {view === 'list' && (
            <button className="btn-new" onClick={() => openEditor()}>
              ✏️ New Post
            </button>
          )}
          {view === 'edit' && (
            <>
              <button
                className={`btn-toggle ${isPreview ? 'active' : ''}`}
                onClick={() => setIsPreview(!isPreview)}
              >
                {isPreview ? '📝 Edit' : '👁️ Preview'}
              </button>
              <button className="btn-save" onClick={savePost}>
                💾 Save
              </button>
              <button className="btn-cancel" onClick={() => setView('list')}>
                Cancel
              </button>
            </>
          )}
          {view === 'view' && (
            <>
              <button className="btn-edit" onClick={() => openEditor(selectedPost)}>
                ✏️ Edit
              </button>
              <button className="btn-delete" onClick={() => deletePost(selectedPost.id)}>
                🗑️ Delete
              </button>
              <button className="btn-back" onClick={() => setView('list')}>
                ← Back
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="main">
        {/* Post List */}
        {view === 'list' && (
          <div className="post-list">
            {filteredPosts.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📝</span>
                <h3>No posts yet</h3>
                <p>Start writing your first blog post!</p>
                <button className="btn-new" onClick={() => openEditor()}>
                  Create Post
                </button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <article key={post.id} className="post-card" onClick={() => viewPost(post)}>
                  <div className="post-header">
                    <h2>{post.title}</h2>
                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="post-excerpt">
                    {post.content.replace(/[#*`>\[\]!-]/g, '').substring(0, 150)}...
                  </p>
                  <div className="post-tags">
                    {post.tags.map(tag => (
                      <span key={tag} className="tag">#{tag}</span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Post View */}
        {view === 'view' && selectedPost && (
          <article className="post-view">
            <header className="post-view-header">
              <h1>{selectedPost.title}</h1>
              <div className="post-meta">
                <span className="date">📅 {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                <div className="tags">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="tag">#{tag}</span>
                  ))}
                </div>
              </div>
            </header>
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedPost.content) }}
            />
          </article>
        )}

        {/* Editor */}
        {view === 'edit' && (
          <div className="editor-container">
            <div className="editor-toolbar">
              <input
                type="text"
                className="title-input"
                placeholder="Post title..."
                value={editorTitle}
                onChange={(e) => setEditorTitle(e.target.value)}
              />
              <input
                type="text"
                className="tags-input"
                placeholder="Tags (comma separated)"
                value={editorTags}
                onChange={(e) => setEditorTags(e.target.value)}
              />
            </div>
            <div className="editor-main">
              {!isPreview ? (
                <textarea
                  className="editor"
                  placeholder="Write your markdown here..."
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                />
              ) : (
                <div
                  className="preview markdown-body"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(editorContent) }}
                />
              )}
            </div>
            <div className="editor-help">
              <span>**bold**</span>
              <span>*italic*</span>
              <span># Header</span>
              <span>`code`</span>
              <span>[link](url)</span>
              <span>- list item</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
