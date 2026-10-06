import React from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';

export function ProductModal({ product, onClose, onAddToCart }) {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="product-category-tag" style={{ position: 'static' }}>{product.category}</span>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <img
            src={product.image_url}
            alt={product.title}
            style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>{product.title}</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                {product.description}
              </p>
            </div>

            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                ${parseFloat(product.price).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.85rem', color: isOutOfStock ? 'var(--danger)' : 'var(--success)', marginBottom: '1.25rem' }}>
                {isOutOfStock ? '● Currently Out of Stock' : `● In Stock (${product.stock} units available)`}
              </div>

              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={isOutOfStock}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem' }}
              >
                <ShoppingCart size={18} />
                <span>{isOutOfStock ? 'Out of Stock' : 'Add to Shopping Cart'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
