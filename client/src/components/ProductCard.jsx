import React from 'react';
import { Plus, Eye } from 'lucide-react';

export function ProductCard({ product, onSelect, onAddToCart }) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div className="product-card">
      <div className="product-img-wrap" onClick={() => onSelect(product)} style={{ cursor: 'pointer' }}>
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80'}
          alt={product.title}
          className="product-img"
          loading="lazy"
        />
        <span className="product-category-tag">{product.category}</span>
      </div>

      <div className="product-info">
        <h3
          className="product-title"
          onClick={() => onSelect(product)}
          style={{ cursor: 'pointer' }}
        >
          {product.title}
        </h3>
        <p className="product-desc">{product.description}</p>

        <div className="product-footer">
          <div>
            <div className="product-price">${parseFloat(product.price).toFixed(2)}</div>
            <div className={`stock-status ${isOutOfStock ? 'out-of-stock' : isLowStock ? 'low-stock' : 'in-stock'}`}>
              {isOutOfStock ? 'Out of Stock' : isLowStock ? `Only ${product.stock} left!` : `${product.stock} in stock`}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => onSelect(product)}
              className="btn btn-icon"
              style={{ width: '2.4rem', height: '2.4rem' }}
              title="Quick view"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="btn btn-primary"
              style={{ padding: '0.5rem 0.9rem', opacity: isOutOfStock ? 0.5 : 1 }}
              title="Add to Cart"
            >
              <Plus size={18} />
              <span>Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
