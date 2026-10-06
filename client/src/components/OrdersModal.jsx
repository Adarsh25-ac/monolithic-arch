import React, { useEffect, useState } from 'react';
import { X, Package, Calendar, Clock, Loader2 } from 'lucide-react';
import { api } from '../api';

export function OrdersModal({ isOpen, onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={22} className="gradient-text" />
            <h2 className="modal-title">My Orders</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--accent-primary)', margin: '0 auto' }} />
            <p style={{ marginTop: '0.75rem', color: 'var(--text-secondary)' }}>Loading your orders...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <Package size={48} />
            <h3>No orders yet</h3>
            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Place your first order to see it tracked here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Order #{ord.id}</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
                      <Calendar size={13} />
                      <span>{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem',
                        borderRadius: 'var(--radius-full)',
                        background: ord.status === 'completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: ord.status === 'completed' ? 'var(--success)' : 'var(--warning)',
                        border: `1px solid ${ord.status === 'completed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      }}
                    >
                      {ord.status}
                    </span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
                      ${parseFloat(ord.total_amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Items Ordered:</div>
                  <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {ord.items && ord.items.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.quantity}x {item.title}</span>
                        <span style={{ fontWeight: 600 }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
