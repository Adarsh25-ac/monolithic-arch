import React, { useEffect, useState } from 'react';
import { X, Shield, Plus, Trash2, Edit2, PackageCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export function AdminModal({ isOpen, onClose, onRefreshProducts }) {
  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'orders' | 'new-product'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // New product form
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    image_url: '',
    stock: '10',
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'products') {
        const data = await api.getProducts();
        setProducts(data.products || []);
      } else if (activeTab === 'orders') {
        const data = await api.getAllOrders();
        setOrders(data.orders || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.createProduct(newProduct);
      setSuccess('Product successfully created!');
      setNewProduct({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        image_url: '',
        stock: '10',
      });
      onRefreshProducts();
      setTimeout(() => {
        setActiveTab('products');
        setSuccess('');
      }, 1200);
    } catch (err) {
      setError(err.message || 'Failed to create product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      onRefreshProducts();
    } catch (err) {
      setError(err.message || 'Failed to delete product');
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
    } catch (err) {
      setError(err.message || 'Failed to update order status');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '840px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={22} style={{ color: 'var(--accent-primary)' }} />
            <h2 className="modal-title">Store Management Dashboard</h2>
          </div>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <button
            onClick={() => setActiveTab('products')}
            className={`btn ${activeTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            Manage Products ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`btn ${activeTab === 'orders' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            All Customer Orders
          </button>
          <button
            onClick={() => setActiveTab('new-product')}
            className={`btn ${activeTab === 'new-product' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.5rem 1rem' }}
          >
            <Plus size={16} />
            <span>Add Product</span>
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', color: 'var(--success)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        {/* Tab 1: Manage Products */}
        {activeTab === 'products' && (
          <div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img src={p.image_url} alt={p.title} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                          <span style={{ fontWeight: 600 }}>{p.title}</span>
                        </div>
                      </td>
                      <td><span className="product-category-tag" style={{ position: 'static' }}>{p.category}</span></td>
                      <td style={{ fontWeight: 700 }}>${parseFloat(p.price).toFixed(2)}</td>
                      <td>
                        <span style={{ color: p.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="btn-danger"
                          style={{ padding: '0.35rem 0.6rem', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                          title="Delete Product"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === 'orders' && (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 700 }}>#{o.id}</td>
                    <td>
                      <div>{o.customer_name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.customer_email}</div>
                    </td>
                    <td style={{ fontWeight: 700 }}>${parseFloat(o.total_amount).toFixed(2)}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '0.2rem 0.5rem',
                          borderRadius: 'var(--radius-full)',
                          background: o.status === 'completed' || o.status === 'Delivered' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: o.status === 'completed' || o.status === 'Delivered' ? 'var(--success)' : 'var(--warning)',
                        }}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <select
                        className="select-field"
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem' }}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: New Product */}
        {activeTab === 'new-product' && (
          <form onSubmit={handleCreateProduct}>
            <div className="form-group">
              <label className="form-label">Product Title</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ultra Ergonomic Wireless Mouse"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="form-input"
                  placeholder="49.99"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stock Units</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  placeholder="25"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Electronics, Apparel, Home & Kitchen..."
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://images.unsplash.com/..."
                value={newProduct.image_url}
                onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-input"
                placeholder="Detailed features and product benefits..."
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              <Plus size={18} />
              <span>Save & Publish Product</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
