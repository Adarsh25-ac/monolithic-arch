import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onProceedCheckout,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingBag size={20} className="gradient-text" />
            <h2 className="modal-title">Shopping Cart ({cartItems.reduce((acc, i) => acc + i.quantity, 0)})</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div className="drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <h3>Your cart is empty</h3>
              <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Discover our products and add your favorites to get started.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <img src={item.image_url} alt={item.title} className="cart-item-img" />
                <div className="cart-item-details">
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {item.title}
                    </h4>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                    <div className="qty-control">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="qty-btn"
                        title="Decrease"
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '1.2rem', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="qty-btn"
                        title="Increase"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="btn-danger"
                      style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer' }}
                      title="Remove item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700, color: '#fff', fontSize: '1.2rem' }}>${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Shipping & Taxes</span>
              <span>Calculated at checkout</span>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={onClearCart} className="btn btn-secondary" style={{ flex: 1 }}>
                Clear
              </button>
              <button
                onClick={() => {
                  onClose();
                  onProceedCheckout();
                }}
                className="btn btn-primary"
                style={{ flex: 2 }}
              >
                <span>Checkout</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
