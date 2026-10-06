import React from 'react';
import { ShoppingBag, ShoppingCart, User, Shield, Package, LogOut } from 'lucide-react';

export function Navbar({
  cartCount,
  onOpenCart,
  user,
  onOpenAuth,
  onLogout,
  onOpenOrders,
  onOpenAdmin,
}) {
  return (
    <header className="navbar">
      <div className="nav-container">
        <a href="/" className="brand-logo">
          <div className="brand-icon">
            <ShoppingBag size={20} />
          </div>
          <span>Aura<span className="gradient-text">Store</span></span>
        </a>

        <div className="nav-actions">
          {user?.role === 'admin' && (
            <button
              onClick={onOpenAdmin}
              className="btn btn-secondary"
              title="Admin Inventory & Orders"
            >
              <Shield size={16} />
              <span>Admin</span>
            </button>
          )}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button onClick={onOpenOrders} className="btn btn-secondary" title="My Orders">
                <Package size={16} />
                <span>Orders</span>
              </button>
              <button
                onClick={onLogout}
                className="btn btn-secondary"
                title={`Signed in as ${user.name} (${user.email})`}
                style={{ padding: '0.6rem 0.8rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn btn-secondary">
              <User size={16} />
              <span>Sign In</span>
            </button>
          )}

          <button onClick={onOpenCart} className="btn btn-icon" title="Shopping Cart">
            <ShoppingCart size={20} />
            {cartCount > 0 && <span className="badge">{cartCount}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}
