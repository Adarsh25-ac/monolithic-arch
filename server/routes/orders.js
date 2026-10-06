const express = require('express');
const db = require('../db');
const { authenticateToken, optionalToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', optionalToken, async (req, res) => {
  try {
    const { customer_name, customer_email, shipping_address, items } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required order fields or empty cart' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Check stock for all items
    for (const item of items) {
      const product = await db.queryGet('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (!product) {
        return res.status(400).json({ error: `Product ID ${item.product_id} no longer exists` });
      }

      const qty = parseInt(item.quantity, 10) || 1;
      if (product.stock < qty) {
        return res.status(400).json({ error: `Insufficient stock for '${product.title}' (only ${product.stock} left)` });
      }

      const itemTotal = parseFloat(product.price) * qty;
      calculatedTotal += itemTotal;

      verifiedItems.push({
        product_id: product.id,
        title: product.title,
        price: parseFloat(product.price),
        quantity: qty,
      });
    }

    // Decrement stock
    for (const vItem of verifiedItems) {
      await db.queryRun('UPDATE products SET stock = stock - ? WHERE id = ?', [vItem.quantity, vItem.product_id]);
    }

    const userId = req.user ? req.user.id : null;

    const orderRes = await db.queryRun(
      'INSERT INTO orders (user_id, customer_name, customer_email, shipping_address, total_amount, status) VALUES (?, ?, ?, ?, ?, "completed")',
      [userId, customer_name.trim(), customer_email.toLowerCase().trim(), shipping_address.trim(), calculatedTotal]
    );

    const orderId = orderRes.lastID;

    for (const vItem of verifiedItems) {
      await db.queryRun(
        'INSERT INTO order_items (order_id, product_id, title, price, quantity) VALUES (?, ?, ?, ?, ?)',
        [orderId, vItem.product_id, vItem.title, vItem.price, vItem.quantity]
      );
    }

    const order = await db.queryGet('SELECT * FROM orders WHERE id = ?', [orderId]);

    res.status(201).json({
      order: {
        ...order,
        items: verifiedItems,
      },
    });
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Get user orders
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await db.queryAll(
      'SELECT * FROM orders WHERE user_id = ? OR customer_email = ? ORDER BY id DESC',
      [req.user.id, req.user.email]
    );

    for (const ord of orders) {
      ord.items = await db.queryAll('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
    }

    res.json({ orders });
  } catch (err) {
    console.error('User orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch your orders' });
  }
});

// Admin: Get all orders
router.get('/admin/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await db.queryAll('SELECT * FROM orders ORDER BY id DESC');

    for (const ord of orders) {
      ord.items = await db.queryAll('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
    }

    res.json({ orders });
  } catch (err) {
    console.error('Admin orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch all orders' });
  }
});

// Admin: Update order status
router.patch('/admin/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await db.queryRun('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
    const order = await db.queryGet('SELECT * FROM orders WHERE id = ?', [req.params.id]);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order });
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

module.exports = router;
