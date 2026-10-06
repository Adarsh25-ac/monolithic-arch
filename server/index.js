require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// API Health Check
app.get('/health', async (req, res) => {
  try {
    await db.queryGet('SELECT 1');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Monolith: Serve static frontend build if present
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexHtml = path.join(clientBuildPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>E-Commerce Monolith API</title></head>
          <body style="font-family:sans-serif;padding:2rem;text-align:center;">
            <h1>🛒 E-Commerce Monolith API Server</h1>
            <p>API is running on port ${PORT}. Client assets build not detected or in development mode.</p>
            <p><a href="/api/products">View Products API</a> | <a href="/health">Health Check</a></p>
          </body>
        </html>
      `);
    }
  });
});

// Start Server
async function startServer() {
  await db.initDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Monolithic E-Commerce server running at http://localhost:${PORT}`);
    console.log(`📡 API Endpoints available at http://localhost:${PORT}/api/products`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is busy, retrying on port ${Number(PORT) + 1}...`);
      app.listen(Number(PORT) + 1, () => {
        console.log(`🚀 Monolithic E-Commerce server running at http://localhost:${Number(PORT) + 1}`);
      });
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer();
