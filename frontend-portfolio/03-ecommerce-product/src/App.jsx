import { useState, useEffect } from 'react'
import './index.css'

const PRODUCT = {
  id: 1, name: 'Premium Wireless Headphones', brand: 'AudioTech Pro',
  price: 299.99, originalPrice: 399.99, rating: 4.8, reviews: 2847,
  description: 'Experience crystal-clear audio with our flagship wireless headphones. Featuring advanced noise cancellation, 40-hour battery life, and premium comfort for all-day wear.',
  features: ['40-hour battery life', 'Active Noise Cancellation', 'Hi-Res Audio certified', 'Bluetooth 5.3', 'Foldable design', 'Premium leather cushions'],
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600'
  ],
  colors: [
    { id: 'black', name: 'Midnight Black', hex: '#1a1a2e' },
    { id: 'white', name: 'Pearl White', hex: '#f5f5f5' },
    { id: 'navy', name: 'Navy Blue', hex: '#1e3a5f' },
    { id: 'gold', name: 'Rose Gold', hex: '#b76e79' }
  ],
  sizes: ['Standard', 'Compact']
}

const REVIEWS = [
  { id: 1, user: 'Sarah M.', rating: 5, date: '2024-01-15', text: 'Best headphones I\'ve ever owned! The noise cancellation is incredible.', avatar: '👩' },
  { id: 2, user: 'James K.', rating: 5, date: '2024-01-10', text: 'Battery life is amazing. I use them for work calls all day.', avatar: '👨' },
  { id: 3, user: 'Emily R.', rating: 4, date: '2024-01-05', text: 'Great sound quality, very comfortable for long listening sessions.', avatar: '👩‍🦰' }
]

function App() {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedColor, setSelectedColor] = useState(PRODUCT.colors[0])
  const [selectedSize, setSelectedSize] = useState(PRODUCT.sizes[0])
  const [quantity, setQuantity] = useState(1)
  const [cart, setCart] = useState([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [imageLoaded, setImageLoaded] = useState(true)

  useEffect(() => { const saved = localStorage.getItem('ecommerce_cart'); if (saved) setCart(JSON.parse(saved)) }, [])
  useEffect(() => { localStorage.setItem('ecommerce_cart', JSON.stringify(cart)) }, [cart])

  const showNotification = (message) => { setNotification(message); setTimeout(() => setNotification(null), 3000) }

  const addToCart = () => {
    setCart(prev => [...prev, { id: Date.now(), productId: PRODUCT.id, name: PRODUCT.name, price: PRODUCT.price, color: selectedColor, size: selectedSize, quantity, image: PRODUCT.images[0] }])
    showNotification('Added to cart!')
  }

  const removeFromCart = (id) => setCart(prev => prev.filter(item => item.id !== id))
  const updateQuantity = (id, newQty) => { if (newQty < 1) return; setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item)) }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const discount = Math.round(((PRODUCT.originalPrice - PRODUCT.price) / PRODUCT.originalPrice) * 100)

  return (
    <div>
      {/* Header */}
      <header className="flex justify-between items-center py-4 px-10 max-sm:px-5 bg-bg-secondary border-b border-border sticky top-0 z-[100]">
        <div className="text-[1.4rem] font-bold gradient-text-purple">🛍️ ShopLux</div>
        <nav className="flex gap-8 max-sm:hidden">
          <a href="#" className="text-text-secondary no-underline text-[0.9rem] font-medium transition-colors duration-300 hover:text-accent-primary">Home</a>
          <a href="#" className="text-text-secondary no-underline text-[0.9rem] font-medium transition-colors duration-300 hover:text-accent-primary">Shop</a>
          <a href="#" className="text-text-secondary no-underline text-[0.9rem] font-medium transition-colors duration-300 hover:text-accent-primary">Categories</a>
        </nav>
        <button className="relative bg-transparent border-none text-2xl cursor-pointer p-2" onClick={() => setIsCartOpen(true)}>
          🛒
          {cartCount > 0 && <span className="absolute top-0 right-0 bg-accent-primary text-white text-[0.7rem] font-semibold w-[18px] h-[18px] rounded-full flex items-center justify-center">{cartCount}</span>}
        </button>
      </header>

      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-5 py-4 px-6 gradient-purple text-white rounded-[10px] font-medium z-[1000] animate-[slideIn_0.3s_ease] shadow-[0_10px_40px_rgba(0,0,0,0.12)]">
          ✅ {notification}
        </div>
      )}

      {/* Product Section */}
      <main className="grid grid-cols-2 max-lg:grid-cols-1 gap-[60px] max-w-[1400px] mx-auto p-10 max-lg:p-5">
        {/* Image Gallery */}
        <div className="sticky max-lg:static top-[100px] self-start">
          <div className="relative bg-bg-secondary rounded-2xl overflow-hidden aspect-square shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <img src={PRODUCT.images[selectedImage]} alt={PRODUCT.name} onLoad={() => setImageLoaded(true)} className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-50'}`} />
            <span className="absolute top-4 left-4 bg-red-500 text-white py-1.5 px-3 rounded-full text-[0.85rem] font-semibold">-{discount}%</span>
          </div>
          <div className="flex gap-3 mt-4">
            {PRODUCT.images.map((img, idx) => (
              <button key={idx} className={`w-20 h-20 border-2 rounded-[10px] overflow-hidden cursor-pointer bg-bg-secondary p-0 transition-all duration-300 ${selectedImage === idx ? 'border-accent-primary shadow-[0_0_0_3px_rgba(124,58,237,0.2)]' : 'border-border hover:border-text-secondary'}`}
                onClick={() => { setSelectedImage(idx); setImageLoaded(false) }}>
                <img src={img} alt={`${PRODUCT.name} view ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="py-5">
          <span className="text-[0.85rem] text-accent-primary font-semibold uppercase tracking-wider">{PRODUCT.brand}</span>
          <h1 className="text-[2.2rem] max-sm:text-[1.6rem] font-bold my-2 mb-4 leading-tight">{PRODUCT.name}</h1>

          <div className="flex items-center gap-2 mb-5">
            <div className="text-accent-gold text-lg tracking-widest">{'★'.repeat(Math.floor(PRODUCT.rating))}{'☆'.repeat(5 - Math.floor(PRODUCT.rating))}</div>
            <span className="font-semibold">{PRODUCT.rating}</span>
            <span className="text-text-secondary text-[0.9rem]">({PRODUCT.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-5 p-5 bg-[linear-gradient(135deg,rgba(124,58,237,0.05),rgba(139,92,246,0.05))] rounded-[10px]">
            <span className="text-[2rem] font-bold text-accent-primary">${PRODUCT.price}</span>
            <span className="text-xl text-text-secondary line-through">${PRODUCT.originalPrice}</span>
            <span className="bg-green-100 text-green-600 py-1 px-2.5 rounded-xl text-[0.8rem] font-semibold">Save ${(PRODUCT.originalPrice - PRODUCT.price).toFixed(2)}</span>
          </div>

          <p className="text-text-secondary leading-relaxed mb-7">{PRODUCT.description}</p>

          {/* Color Selection */}
          <div className="mb-6">
            <label className="block text-[0.9rem] text-text-secondary mb-3">Color: <strong className="text-text-primary">{selectedColor.name}</strong></label>
            <div className="flex gap-3">
              {PRODUCT.colors.map(color => (
                <button key={color.id} className={`w-10 h-10 rounded-full border-3 cursor-pointer transition-all duration-300 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.3)] ${selectedColor.id === color.id ? 'border-accent-primary scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color.hex }} onClick={() => setSelectedColor(color)} title={color.name} />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-6">
            <label className="block text-[0.9rem] text-text-secondary mb-3">Size: <strong className="text-text-primary">{selectedSize}</strong></label>
            <div className="flex gap-3">
              {PRODUCT.sizes.map(size => (
                <button key={size} className={`py-3 px-6 rounded-[10px] text-[0.9rem] font-medium cursor-pointer transition-all duration-300 ${selectedSize === size ? 'bg-accent-primary border-2 border-accent-primary text-white' : 'bg-bg-secondary border-2 border-border hover:border-accent-primary'}`}
                  onClick={() => setSelectedSize(size)}>{size}</button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-[0.9rem] text-text-secondary mb-3">Quantity</label>
            <div className="inline-flex items-center bg-bg-secondary border-2 border-border rounded-[10px] overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="py-3 px-5 bg-transparent border-none text-xl cursor-pointer text-text-primary hover:bg-bg-primary">−</button>
              <span className="py-3 px-5 font-semibold min-w-[60px] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="py-3 px-5 bg-transparent border-none text-xl cursor-pointer text-text-primary hover:bg-bg-primary">+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex max-sm:flex-col gap-4 my-7">
            <button className="flex-1 py-4 px-6 bg-bg-secondary border-2 border-accent-primary rounded-[10px] text-accent-primary text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-accent-primary/5" onClick={addToCart}>🛒 Add to Cart</button>
            <button className="flex-1 py-4 px-6 gradient-purple border-none rounded-[10px] text-white text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)]">⚡ Buy Now</button>
          </div>

          {/* Features */}
          <div className="bg-bg-secondary border border-border rounded-2xl p-6 mt-5">
            <h3 className="text-base mb-4">✨ Key Features</h3>
            <ul className="list-none grid grid-cols-2 max-sm:grid-cols-1 gap-3">
              {PRODUCT.features.map((feature, idx) => (
                <li key={idx} className="text-[0.9rem] text-text-secondary">✓ {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Reviews */}
      <section className="max-w-[1400px] mx-auto p-10">
        <h2 className="text-[1.4rem] mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-3 max-lg:grid-cols-1 gap-5">
          {REVIEWS.map(review => (
            <div key={review.id} className="bg-bg-secondary border border-border rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{review.avatar}</span>
                <div className="flex-1">
                  <span className="block font-semibold text-[0.9rem]">{review.user}</span>
                  <span className="text-[0.8rem] text-text-secondary">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="text-accent-gold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
              </div>
              <p className="text-text-secondary text-[0.9rem] leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-[1000] animate-[fadeIn_0.2s_ease]" onClick={() => setIsCartOpen(false)}>
          <div className="fixed top-0 right-0 w-[420px] max-lg:w-full h-screen bg-bg-secondary shadow-[0_10px_40px_rgba(0,0,0,0.12)] flex flex-col animate-[slideFromRight_0.3s_ease]" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center py-5 px-6 border-b border-border">
              <h2 className="text-xl">🛒 Your Cart</h2>
              <button className="bg-transparent border-none text-3xl cursor-pointer text-text-secondary leading-none" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-text-secondary">
                <span className="text-6xl mb-4 opacity-30">🛒</span>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-4">
                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 bg-bg-primary rounded-[10px] mb-3">
                      <img src={item.image} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h4 className="text-[0.9rem] mb-1">{item.name}</h4>
                        <p className="text-[0.8rem] text-text-secondary mb-2">{item.color.name} • {item.size}</p>
                        <div className="inline-flex items-center gap-2 bg-bg-secondary rounded-md text-[0.85rem]">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="py-1 px-2.5 bg-transparent border-none cursor-pointer text-base">−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="py-1 px-2.5 bg-transparent border-none cursor-pointer text-base">+</button>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-semibold mb-2">${(item.price * item.quantity).toFixed(2)}</span>
                        <button className="bg-transparent border-none cursor-pointer text-base opacity-50 hover:opacity-100" onClick={() => removeFromCart(item.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="py-5 px-6 border-t border-border">
                  <div className="flex justify-between text-xl font-bold mb-4">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="w-full py-4 gradient-purple border-none rounded-[10px] text-white text-base font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(124,58,237,0.35)]">Checkout →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
