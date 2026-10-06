import React, { useState, useEffect } from 'react';
import { Search, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { api } from './api';
import { Navbar } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { OrdersModal } from './components/OrdersModal';
import { AdminModal } from './components/AdminModal';

export function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Cart state persisted to localStorage
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ecom_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // User state
  const [user, setUser] = useState(null);

  // Modals state
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    localStorage.setItem('ecom_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    loadUser();
    loadCategories();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery, sortBy]);

  const loadUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await api.getProfile();
      setUser(res.user);
    } catch {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await api.getCategories();
      setCategories(['All', ...res.categories]);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sort = sortBy;

      const res = await api.getProducts(params);
      setProducts(res.products || []);
      setError('');
    } catch (err) {
      setError('Could not load products. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Cart actions
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Maximum stock reached for ${product.title}`);
          return prev;
        }
        showToast(`Updated quantity for ${product.title}`);
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      showToast(`Added ${product.title} to cart`);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId, newQty) => {
    if (newQty <= 0) {
      removeCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeCartItem = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('Logged out successfully');
  };

  const totalCartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div>
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            zIndex: 100,
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-primary)',
            boxShadow: 'var(--shadow-lg)',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <Sparkles size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      <main className="container">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            <Sparkles size={14} />
            <span>Modern Monolithic E-Commerce Platform</span>
          </div>
          <h1 className="hero-title">
            Curated Gear & Essentials for <br />
            <span className="gradient-text">Modern Living</span>
          </h1>
          <p className="hero-subtitle">
            Experience our lightning-fast monolithic store powered by Express & PostgreSQL in Docker.
          </p>
        </section>

        {/* Search & Filter Controls */}
        <div className="controls-bar">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              className="input-field"
              placeholder="Search products by title or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="category-chips">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <select
            className="select-field"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        {/* Product List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <Loader2 className="spinner" size={40} style={{ color: 'var(--accent-primary)', margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading catalog...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <AlertCircle size={48} style={{ color: 'var(--danger)' }} />
            <h3>Unable to fetch products</h3>
            <p style={{ marginTop: '0.5rem' }}>{error}</p>
          </div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p style={{ marginTop: '0.5rem' }}>Try clearing your search query or selecting another category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelect={(prod) => setSelectedProduct(prod)}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals & Drawers */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQty={updateCartQty}
        onRemoveItem={removeCartItem}
        onClearCart={clearCart}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        user={user}
        onOrderSuccess={() => {
          clearCart();
          fetchProducts();
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(u) => {
          setUser(u);
          showToast(`Welcome back, ${u.name}!`);
        }}
      />

      <OrdersModal
        isOpen={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onRefreshProducts={fetchProducts}
      />
    </div>
  );
}
export default App;
