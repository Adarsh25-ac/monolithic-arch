# 🛒 AuraStore - Simple Monolithic E-Commerce Application

A clean, fast, and simple monolithic full-stack e-commerce application built with **Node.js (Express)**, **React (Vite)**, and **Embedded SQLite**.

---

## 🌟 Key Features

- **Storefront & Catalog**:
  - Live search by product keywords.
  - Category filters (Electronics, Apparel, Home & Kitchen, Office).
  - Price sorting (Low to High, High to Low, Newest).
  - Product quick view modal with stock status.
- **Cart & Checkout**:
  - Slide-over cart drawer with quantity adjustments and persistent storage.
  - Express checkout with simulated payment and instant order confirmation.
- **Customer & Admin Experience**:
  - Authentication (JWT login & register) with 1-click demo autofill buttons.
  - Customer order history tracking.
  - Admin dashboard: add new products, delete products, view all customer orders, and update order fulfillment status.
- **Monolithic Architecture**:
  - Single repository and unified Express server serving both REST API and compiled frontend assets.
  - Zero external database required — runs instantly out of the box with embedded SQLite.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# In the root folder:
npm run install:all
```

### 2. Build Frontend & Run Monolith
```bash
# Build frontend assets
npm run build:client

# Start monolithic server
npm start
```
Open your browser and navigate to: **[http://localhost:5000](http://localhost:5000)**

---

## 💻 Development Mode

To run with live reload for both backend and frontend:
```bash
# Terminal 1 (Backend API on :5000)
npm run dev:server

# Terminal 2 (Frontend on :3000 with proxy)
npm run dev:client
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `admin123` |
| **Customer** | `user@example.com` | `user123` |

*(You can also use the 1-click quick-fill buttons in the Sign In modal).*

---

## 📁 Project Structure

```
ecom-mono/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI components (Navbar, Cart, Modals, etc.)
│   │   ├── App.jsx         # Main application container
│   │   ├── index.css       # Design system & dark glassmorphism styling
│   │   ├── api.js          # REST client
│   │   └── main.jsx        # App entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── routes/             # API routes (auth, products, orders)
│   ├── middleware/         # JWT authentication & admin protection
│   ├── db.js               # SQLite database & auto-seeding
│   ├── index.js            # Monolith entry point
│   └── package.json
├── package.json            # Root scripts & workspaces
└── README.md
```
