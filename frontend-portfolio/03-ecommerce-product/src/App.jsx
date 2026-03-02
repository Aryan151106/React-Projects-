import { useState, useEffect } from 'react'
import './App.css'

// E-Commerce Product Page with Image Gallery, Variants, and Cart

// Mock product data
const PRODUCT = {
  id: 1,
  name: 'Premium Wireless Headphones',
  brand: 'AudioTech Pro',
  price: 299.99,
  originalPrice: 399.99,
  rating: 4.8,
  reviews: 2847,
  description: 'Experience crystal-clear audio with our flagship wireless headphones. Featuring advanced noise cancellation, 40-hour battery life, and premium comfort for all-day wear.',
  features: [
    '40-hour battery life',
    'Active Noise Cancellation',
    'Hi-Res Audio certified',
    'Bluetooth 5.3',
    'Foldable design',
    'Premium leather cushions'
  ],
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

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ecommerce_cart')
    if (saved) setCart(JSON.parse(saved))
  }, [])

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('ecommerce_cart', JSON.stringify(cart))
  }, [cart])

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const addToCart = () => {
    const cartItem = {
      id: Date.now(),
      productId: PRODUCT.id,
      name: PRODUCT.name,
      price: PRODUCT.price,
      color: selectedColor,
      size: selectedSize,
      quantity,
      image: PRODUCT.images[0]
    }
    setCart(prev => [...prev, cartItem])
    showNotification('Added to cart!')
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id, newQty) => {
    if (newQty < 1) return
    setCart(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: newQty } : item
    ))
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const discount = Math.round(((PRODUCT.originalPrice - PRODUCT.price) / PRODUCT.originalPrice) * 100)

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="logo">🛍️ ShopLux</div>
        <nav className="nav">
          <a href="#">Home</a>
          <a href="#">Shop</a>
          <a href="#">Categories</a>
        </nav>
        <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </header>

      {/* Notification */}
      {notification && (
        <div className="notification">
          ✅ {notification}
        </div>
      )}

      {/* Product Section */}
      <main className="product-page">
        {/* Image Gallery */}
        <div className="gallery-section">
          <div className="main-image">
            <img
              src={PRODUCT.images[selectedImage]}
              alt={PRODUCT.name}
              onLoad={() => setImageLoaded(true)}
              className={imageLoaded ? 'loaded' : ''}
            />
            <span className="discount-badge">-{discount}%</span>
          </div>
          <div className="thumbnails">
            {PRODUCT.images.map((img, idx) => (
              <button
                key={idx}
                className={`thumbnail ${selectedImage === idx ? 'active' : ''}`}
                onClick={() => { setSelectedImage(idx); setImageLoaded(false) }}
              >
                <img src={img} alt={`${PRODUCT.name} view ${idx + 1}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="brand">{PRODUCT.brand}</span>
          <h1 className="product-name">{PRODUCT.name}</h1>

          <div className="rating-row">
            <div className="stars">
              {'★'.repeat(Math.floor(PRODUCT.rating))}
              {'☆'.repeat(5 - Math.floor(PRODUCT.rating))}
            </div>
            <span className="rating-text">{PRODUCT.rating}</span>
            <span className="reviews-count">({PRODUCT.reviews.toLocaleString()} reviews)</span>
          </div>

          <div className="price-row">
            <span className="current-price">${PRODUCT.price}</span>
            <span className="original-price">${PRODUCT.originalPrice}</span>
            <span className="discount-text">Save ${(PRODUCT.originalPrice - PRODUCT.price).toFixed(2)}</span>
          </div>

          <p className="description">{PRODUCT.description}</p>

          {/* Color Selection */}
          <div className="option-section">
            <label>Color: <strong>{selectedColor.name}</strong></label>
            <div className="color-options">
              {PRODUCT.colors.map(color => (
                <button
                  key={color.id}
                  className={`color-btn ${selectedColor.id === color.id ? 'active' : ''}`}
                  style={{ backgroundColor: color.hex }}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="option-section">
            <label>Size: <strong>{selectedSize}</strong></label>
            <div className="size-options">
              {PRODUCT.sizes.map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="option-section">
            <label>Quantity</label>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="btn-add-cart" onClick={addToCart}>
              🛒 Add to Cart
            </button>
            <button className="btn-buy-now">
              ⚡ Buy Now
            </button>
          </div>

          {/* Features */}
          <div className="features">
            <h3>✨ Key Features</h3>
            <ul>
              {PRODUCT.features.map((feature, idx) => (
                <li key={idx}>✓ {feature}</li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      {/* Reviews Section */}
      <section className="reviews-section">
        <h2>Customer Reviews</h2>
        <div className="reviews-grid">
          {REVIEWS.map(review => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="review-avatar">{review.avatar}</span>
                <div className="review-meta">
                  <span className="review-user">{review.user}</span>
                  <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                </div>
                <div className="review-stars">
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>
              <p className="review-text">{review.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-sidebar" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>🛒 Your Cart</h2>
              <button className="close-cart" onClick={() => setIsCartOpen(false)}>×</button>
            </div>

            {cart.length === 0 ? (
              <div className="cart-empty">
                <span>🛒</span>
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} />
                      <div className="cart-item-info">
                        <h4>{item.name}</h4>
                        <p>{item.color.name} • {item.size}</p>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <div className="cart-item-price">
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                        <button className="remove-item" onClick={() => removeFromCart(item.id)}>🗑️</button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total</span>
                    <span>${cartTotal.toFixed(2)}</span>
                  </div>
                  <button className="btn-checkout">
                    Checkout →
                  </button>
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
