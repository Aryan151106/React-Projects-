import { useState, useEffect, useMemo } from 'react'
import './index.css'

const parseMarkdown = (md) => {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/^---$/gim, '<hr />')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br />')
  return '<p>' + html + '</p>'
}

const SAMPLE_POSTS = [
  { id: 1, title: 'Getting Started with React', content: `# Getting Started with React\n\nReact is a powerful JavaScript library for building user interfaces.\n\n## Why React?\n\n- **Component-Based**: Build encapsulated components\n- **Declarative**: Design simple views for each state\n- **Learn Once, Write Anywhere**: Use Node and render on the server\n\n## Quick Example\n\n\`\`\`javascript\nfunction Welcome(props) {\n  return <h1>Hello, {props.name}</h1>;\n}\n\`\`\`\n\n> React makes it painless to create interactive UIs.\n\nHappy coding! 🚀`, createdAt: '2024-01-15', tags: ['React', 'JavaScript', 'Tutorial'] },
  { id: 2, title: 'CSS Tips and Tricks', content: `# CSS Tips and Tricks\n\nHere are some modern CSS techniques to level up your designs.\n\n## 1. CSS Grid\n\n\`\`\`css\n.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}\n\`\`\`\n\n## 2. Glassmorphism\n\nUse \`backdrop-filter: blur()\` for beautiful glass effects.\n\n## 3. Custom Scrollbars\n\nStyle your scrollbars with \`::-webkit-scrollbar\` pseudo-elements.\n\n---\n\n*Master these techniques to create stunning UIs!*`, createdAt: '2024-01-10', tags: ['CSS', 'Design', 'Tips'] }
]

function App() {
  const [posts, setPosts] = useState([])
  const [view, setView] = useState('list')
  const [selectedPost, setSelectedPost] = useState(null)
  const [editorContent, setEditorContent] = useState('')
  const [editorTitle, setEditorTitle] = useState('')
  const [editorTags, setEditorTags] = useState('')
  const [search, setSearch] = useState('')
  const [isPreview, setIsPreview] = useState(false)

  useEffect(() => { const saved = localStorage.getItem('markdownblog_posts'); if (saved) { setPosts(JSON.parse(saved)) } else { setPosts(SAMPLE_POSTS) } }, [])
  useEffect(() => { if (posts.length > 0) localStorage.setItem('markdownblog_posts', JSON.stringify(posts)) }, [posts])

  const filteredPosts = useMemo(() => posts.filter(post => post.title.toLowerCase().includes(search.toLowerCase()) || post.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))), [posts, search])

  const openEditor = (post = null) => {
    if (post) { setSelectedPost(post); setEditorTitle(post.title); setEditorContent(post.content); setEditorTags(post.tags.join(', ')) }
    else { setSelectedPost(null); setEditorTitle(''); setEditorContent(''); setEditorTags('') }
    setIsPreview(false); setView('edit')
  }

  const viewPost = (post) => { setSelectedPost(post); setView('view') }

  const savePost = () => {
    if (!editorTitle.trim() || !editorContent.trim()) return
    const postData = { id: selectedPost ? selectedPost.id : Date.now(), title: editorTitle, content: editorContent, tags: editorTags.split(',').map(t => t.trim()).filter(Boolean), createdAt: selectedPost ? selectedPost.createdAt : new Date().toISOString().split('T')[0] }
    if (selectedPost) { setPosts(prev => prev.map(p => p.id === selectedPost.id ? postData : p)) } else { setPosts(prev => [postData, ...prev]) }
    setView('list'); setSelectedPost(null)
  }

  const deletePost = (id) => { if (confirm('Delete this post?')) { setPosts(prev => prev.filter(p => p.id !== id)); setView('list') } }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="flex max-md:flex-col justify-between items-center py-4 px-10 max-md:px-5 max-md:gap-4 bg-bg-primary border-b border-border sticky top-0 z-[100]">
        <div onClick={() => setView('list')} className="cursor-pointer">
          <h1 className="text-[1.4rem] font-bold gradient-text-blog">📝 MarkdownHub</h1>
        </div>
        {view === 'list' && (
          <div className="flex-1 max-w-[400px] mx-8 max-md:mx-0 max-md:w-full max-md:max-w-none">
            <div className="flex items-center gap-3 px-4 bg-bg-secondary border border-border rounded-3xl">
              <span>🔍</span>
              <input type="text" placeholder="Search posts or tags..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 py-3 bg-transparent border-none text-text-primary text-[0.9rem] focus:outline-none" />
            </div>
          </div>
        )}
        <div className="flex gap-3 max-md:w-full max-md:justify-center max-md:flex-wrap">
          {view === 'list' && (
            <button className="py-2.5 px-5 gradient-blog border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(14,165,233,0.3)]" onClick={() => openEditor()}>✏️ New Post</button>
          )}
          {view === 'edit' && (
            <>
              <button className={`py-2.5 px-5 border rounded-lg text-[0.9rem] font-medium cursor-pointer transition-all duration-300 ${isPreview ? 'bg-accent-primary border-accent-primary text-white' : 'bg-bg-secondary border-border text-text-secondary hover:bg-bg-primary hover:border-text-secondary'}`} onClick={() => setIsPreview(!isPreview)}>{isPreview ? '📝 Edit' : '👁️ Preview'}</button>
              <button className="py-2.5 px-5 gradient-blog border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(14,165,233,0.3)]" onClick={savePost}>💾 Save</button>
              <button className="py-2.5 px-5 bg-bg-secondary border border-border rounded-lg text-text-secondary text-[0.9rem] font-medium cursor-pointer transition-all duration-300 hover:bg-bg-primary hover:border-text-secondary" onClick={() => setView('list')}>Cancel</button>
            </>
          )}
          {view === 'view' && (
            <>
              <button className="py-2.5 px-5 gradient-blog border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5" onClick={() => openEditor(selectedPost)}>✏️ Edit</button>
              <button className="py-2.5 px-5 bg-transparent border border-red-300 rounded-lg text-red-500 text-[0.9rem] cursor-pointer hover:bg-red-50" onClick={() => deletePost(selectedPost.id)}>🗑️ Delete</button>
              <button className="py-2.5 px-5 bg-bg-secondary border border-border rounded-lg text-text-secondary text-[0.9rem] font-medium cursor-pointer transition-all duration-300 hover:bg-bg-primary hover:border-text-secondary" onClick={() => setView('list')}>← Back</button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-[900px] mx-auto p-10 max-md:p-5 w-full">
        {/* Post List */}
        {view === 'list' && (
          <div className="flex flex-col gap-5">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-20 px-5 bg-bg-primary border border-dashed border-border rounded-xl">
                <span className="text-6xl block mb-4">📝</span>
                <h3 className="text-xl mb-2">No posts yet</h3>
                <p className="text-text-secondary mb-6">Start writing your first blog post!</p>
                <button className="py-2.5 px-5 gradient-blog border-none rounded-lg text-white text-[0.9rem] font-semibold cursor-pointer" onClick={() => openEditor()}>Create Post</button>
              </div>
            ) : (
              filteredPosts.map(post => (
                <article key={post.id} className="bg-bg-primary border border-border rounded-xl p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_40px_rgba(0,0,0,0.1)] hover:border-accent-primary" onClick={() => viewPost(post)}>
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-semibold flex-1">{post.title}</h2>
                    <span className="text-[0.85rem] text-text-secondary">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-text-secondary leading-relaxed mb-4">{post.content.replace(/[#*`>\[\]!-]/g, '').substring(0, 150)}...</p>
                  <div className="flex gap-2 flex-wrap">
                    {post.tags.map(tag => (
                      <span key={tag} className="py-1 px-3 bg-[linear-gradient(135deg,rgba(14,165,233,0.1),rgba(139,92,246,0.1))] text-accent-primary rounded-xl text-[0.8rem] font-medium">#{tag}</span>
                    ))}
                  </div>
                </article>
              ))
            )}
          </div>
        )}

        {/* Post View */}
        {view === 'view' && selectedPost && (
          <article className="bg-bg-primary border border-border rounded-xl p-12 max-md:p-6">
            <header className="mb-8 pb-6 border-b border-border">
              <h1 className="text-[2.2rem] max-md:text-[1.6rem] font-bold mb-4 leading-tight">{selectedPost.title}</h1>
              <div className="flex items-center gap-6 flex-wrap">
                <span className="text-text-secondary text-[0.9rem]">📅 {new Date(selectedPost.createdAt).toLocaleDateString()}</span>
                <div className="flex gap-2">
                  {selectedPost.tags.map(tag => (
                    <span key={tag} className="py-1 px-3 bg-[linear-gradient(135deg,rgba(14,165,233,0.1),rgba(139,92,246,0.1))] text-accent-primary rounded-xl text-[0.8rem] font-medium">#{tag}</span>
                  ))}
                </div>
              </div>
            </header>
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(selectedPost.content) }} />
          </article>
        )}

        {/* Editor */}
        {view === 'edit' && (
          <div className="bg-bg-primary border border-border rounded-xl overflow-hidden flex flex-col h-[calc(100vh-180px)]">
            <div className="flex max-md:flex-col gap-4 p-4 px-5 border-b border-border">
              <input type="text" placeholder="Post title..." value={editorTitle} onChange={(e) => setEditorTitle(e.target.value)} className="flex-[2] py-3 px-4 bg-bg-secondary border border-border rounded-lg text-lg font-semibold text-text-primary focus:outline-none focus:border-accent-primary" />
              <input type="text" placeholder="Tags (comma separated)" value={editorTags} onChange={(e) => setEditorTags(e.target.value)} className="flex-1 py-3 px-4 bg-bg-secondary border border-border rounded-lg text-[0.9rem] text-text-primary focus:outline-none focus:border-accent-primary" />
            </div>
            <div className="flex-1 overflow-hidden">
              {!isPreview ? (
                <textarea className="w-full h-full p-6 bg-bg-primary border-none font-mono text-[0.95rem] leading-relaxed text-text-primary resize-none focus:outline-none placeholder:text-text-secondary" placeholder="Write your markdown here..." value={editorContent} onChange={(e) => setEditorContent(e.target.value)} />
              ) : (
                <div className="h-full p-6 overflow-y-auto markdown-body" dangerouslySetInnerHTML={{ __html: parseMarkdown(editorContent) }} />
              )}
            </div>
            <div className="flex max-md:flex-wrap gap-4 max-md:gap-3 py-3 px-5 bg-bg-secondary border-t border-border text-[0.8rem] text-text-secondary font-mono">
              <span>**bold**</span><span>*italic*</span><span># Header</span><span>`code`</span><span>[link](url)</span><span>- list item</span>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
