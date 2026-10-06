import React, { useState } from 'react';
import { X, CheckCircle2, CreditCard, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../api';

export function CheckoutModal({ isOpen, onClose, cartItems, user, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    customer_name: user ? user.name : '',
    customer_email: user ? user.email : '',
    shipping_address: '',
    card_number: '•••• •••• •••• 4242',
    exp_date: '12/28',
    cvv: '123',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + parseFloat(item.price) * item.quantity, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const orderPayload = {
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        shipping_address: formData.shipping_address,
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
      };

      const res = await api.createOrder(orderPayload);
      setConfirmedOrder(res.order);
      onOrderSuccess();
    } catch (err) {
      setError(err.message || 'Checkout failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        {confirmedOrder ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <CheckCircle2 size={64} style={{ color: 'var(--success)', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed!</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Thank you, <strong>{confirmedOrder.customer_name}</strong>. Your order <strong>#{confirmedOrder.id}</strong> for <strong>${parseFloat(confirmedOrder.total_amount).toFixed(2)}</strong> has been confirmed.
            </p>

            <div style={{ background: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', textAlign: 'left', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Delivering to:</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{confirmedOrder.shipping_address}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Notification sent to: {confirmedOrder.customer_email}</div>
            </div>

            <button onClick={onClose} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Express Checkout</h2>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Safe & Encrypted 256-bit Mock Payment</div>
              </div>
              <button onClick={onClose} className="close-btn"><X size={20} /></button>
            </div>

            {error && (
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="e.g. john@example.com"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <textarea
                  required
                  rows={2}
                  className="form-input"
                  placeholder="Street address, city, state, postal code..."
                  value={formData.shipping_address}
                  onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  <CreditCard size={16} />
                  <span>Payment Card (Demo Simulator)</span>
                </div>

                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.card_number}
                    onChange={(e) => setFormData({ ...formData, card_number: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.exp_date}
                    onChange={(e) => setFormData({ ...formData, exp_date: e.target.value })}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={formData.cvv}
                    onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order Total:</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem' }}
              >
                {loading ? <Loader2 className="spinner" size={20} /> : <Lock size={18} />}
                <span>Pay ${total.toFixed(2)} Now</span>
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
