const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all products with search, category filtering & sorting
router.get('/', async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let queryText = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category && category !== 'All') {
      params.push(category);
      queryText += ' AND category = ?';
    }

    if (search) {
      params.push(`%${search}%`);
      params.push(`%${search}%`);
      queryText += ' AND (title LIKE ? OR description LIKE ?)';
    }

    if (sort === 'price-asc') {
      queryText += ' ORDER BY price ASC';
    } else if (sort === 'price-desc') {
      queryText += ' ORDER BY price DESC';
    } else {
      queryText += ' ORDER BY id DESC';
    }

    const products = await db.queryAll(queryText, params);
    res.json({ products });
  } catch (err) {
    console.error('Products fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get unique categories
router.get('/categories', async (req, res) => {
  try {
    const rows = await db.queryAll('SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category ASC');
    const categories = rows.map((r) => r.category);
    res.json({ categories });
  } catch (err) {
    console.error('Categories fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await db.queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ product });
  } catch (err) {
    console.error('Product fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Admin: Create product
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, category, image_url, stock } = req.body;
    if (!title || price === undefined || !category) {
      return res.status(400).json({ error: 'Title, price, and category are required' });
    }

    const img = image_url || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80';
    const result = await db.queryRun(
      'INSERT INTO products (title, description, price, category, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [title.trim(), description || '', parseFloat(price), category.trim(), img, parseInt(stock, 10) || 0]
    );

    const product = await db.queryGet('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json({ product });
  } catch (err) {
    console.error('Product create error:', err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Admin: Update product
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { title, description, price, category, image_url, stock } = req.body;
    const existing = await db.queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    await db.queryRun(
      `UPDATE products
       SET title = ?, description = ?, price = ?, category = ?, image_url = ?, stock = ?
       WHERE id = ?`,
      [
        title !== undefined ? title.trim() : existing.title,
        description !== undefined ? description : existing.description,
        price !== undefined ? parseFloat(price) : existing.price,
        category !== undefined ? category.trim() : existing.category,
        image_url !== undefined ? image_url : existing.image_url,
        stock !== undefined ? parseInt(stock, 10) : existing.stock,
        req.params.id,
      ]
    );

    const product = await db.queryGet('SELECT * FROM products WHERE id = ?', [req.params.id]);
    res.json({ product });
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Admin: Delete product
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await db.queryRun('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (err) {
    console.error('Product delete error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;
