# 🛒 NexStore — Production Full-Stack E-Commerce Platform

NexStore is a production-grade, full-stack online shopping platform engineered with **Node.js, Express, MongoDB (Mongoose), React.js, Tailwind CSS, and JSON Web Tokens (JWT)**.

It includes strict Role-Based Access Control (RBAC), stock-aware cart mechanics, atomic checkout with backend pricing integrity, multi-stage payment simulation with failure rollback, stepped shipment tracking, admin command center with KPI analytics, and user self-service asset management (profile photo and resume uploads).

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **MongoDB** running locally on `mongodb://localhost:27017` or a MongoDB Atlas URI

### 2. Install & Seed Database
From the root directory:
```bash
# Seed the MongoDB database with test accounts & realistic catalog
npm run seed
```

### 3. Run Backend & Frontend

In Terminal 1 (Start Backend on port 5000):
```bash
npm run backend
```

In Terminal 2 (Start Frontend on port 5173):
```bash
npm run frontend
```

Open **`http://localhost:5173`** in your browser.

---

## 🔑 Pre-Configured Test Credentials

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@ecommerce.com` | `Admin@123456` | Full access to Admin Dashboard, Product CRUD, Order Fulfillment & Status Updating, and User Directory. |
| **Customer** | `user@ecommerce.com` | `User@123456` | Shopping, Dynamic Cart, Checkout, Order History, Visual Order Tracking, Profile & Resume Management. |

*(The login screen also includes convenient **1-Click Demo Login** buttons for instant testing).*

---

## 🌟 Key Architecture & Features

### 1. Robust Security & Role-Based Access Control (RBAC)
- Strict server-side verification: unauthorized requests to `/api/products` (POST/PUT/DELETE) or `/api/orders` (Admin routes) are rejected with `401 Unauthorized` or `403 Forbidden`.
- Passwords salted and hashed with `bcryptjs`.
- JWT access tokens with expiration.
- File upload filters enforcing MIME types and file size restrictions (5MB for images, 10MB for resumes).

### 2. Real-Time Stock & Pricing Integrity
- **Atomic Stock Checks:** Uses conditional database operations to eliminate race conditions when multiple users attempt to purchase the last available unit.
- **Backend Price Calculation:** All subtotal, discount, shipping, tax, and grand totals are calculated server-side from current database values; frontend prices are never trusted.
- **Dynamic Inventory Clamping:** Cart interface automatically restricts quantities to available stock with real-time feedback (*"Only X items are available in stock"*).

### 3. Multi-Stage Payment Gateway Flow & Failure Rollback
- Checkout initiates a pending order and reserves stock.
- Interactive payment simulator tests both **"Payment Succeeded"** (confirms order, clears cart) and **"Simulate Payment Failure"** (marks order as failed, restores stock, and offers retry).

### 4. Visual Chronological Order Tracking
- Stepped interactive visual milestone bar:
  `Order Placed` $\rightarrow$ `Confirmed` $\rightarrow$ `Packed` $\rightarrow$ `Shipped` $\rightarrow$ `Out for Delivery` $\rightarrow$ `Delivered`.
- Event activity log with exact transition timestamps.
- Customer-initiated order cancellation with instant inventory restoration.

### 5. Profile & Document Management
- Upload, preview, and remove profile avatars.
- Upload, download, and delete resumes (`.pdf`, `.doc`, `.docx`) for career/vendor verification.
- Address book management for fast checkout.

### 6. Admin Command Center
- Real-time KPI summary cards: Total Net Revenue, Total Orders, Pending Fulfillment, Registered Users, and Low Stock Alerts.
- Product Management with confirmation modal before deletion.
- Order Fulfillment Manager with legal status progression.
- User Directory with role inspector.

---

## 📡 REST API Summary

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register customer with optional avatar
- `POST /api/auth/login` — Authenticate and return JWT
- `GET /api/auth/me` — Restore authenticated session

### User Profile (`/api/users`)
- `PUT /api/users/profile` — Update name and addresses
- `POST /api/users/profile/photo` — Upload profile photo
- `DELETE /api/users/profile/photo` — Remove profile photo
- `POST /api/users/profile/resume` — Upload resume document
- `DELETE /api/users/profile/resume` — Remove resume document
- `GET /api/users` — Admin: List platform users

### Products (`/api/products`)
- `GET /api/products` — Search, filter by category/price/stock, sort & paginate
- `GET /api/products/categories` — Distinct category list
- `GET /api/products/:id` — Single product details & reviews
- `POST /api/products` — Admin: Create new product
- `PUT /api/products/:id` — Admin: Update product details & stock
- `DELETE /api/products/:id` — Admin: Delete product
- `POST /api/products/:id/reviews` — Submit verified customer review

### Shopping Cart (`/api/cart`)
- `GET /api/cart` — Get active user cart with live inventory verification
- `POST /api/cart` — Add item with stock limit checks
- `PUT /api/cart/:productId` — Update item quantity
- `DELETE /api/cart/:productId` — Remove line item
- `DELETE /api/cart` — Clear all items

### Orders & Tracking (`/api/orders`)
- `POST /api/orders` — Atomic checkout & inventory deduction
- `POST /api/orders/:id/verify-payment` — Confirm or fail payment with stock rollback
- `GET /api/orders/my-orders` — Customer order history
- `GET /api/orders/:id` — Stepped tracking & invoice breakdown
- `PUT /api/orders/:id/cancel` — Cancel order and restore stock
- `GET /api/orders` — Admin: List and filter all orders
- `PUT /api/orders/:id/status` — Admin: Transition order status
- `GET /api/orders/admin/stats` — Admin: Analytics and KPIs

---

## 📂 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection
│   │   ├── controllers/        # Request handlers (auth, user, product, cart, order)
│   │   ├── middleware/         # JWT auth, RBAC admin check, Multer upload, Error handler
│   │   ├── models/             # Mongoose schemas (User, Product, Category, Cart, Order)
│   │   ├── routes/             # Express API routes
│   │   ├── utils/              # Token generator, Database seeder
│   │   └── server.js           # Express app bootstrap
│   ├── uploads/                # Local storage for avatars, resumes & product photos
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios instance & error normalization
│   │   ├── components/         # Navbar, Footer, ProductCard, SteppedTracker, Modals, Loaders
│   │   ├── context/            # AuthContext, CartContext, ToastContext
│   │   ├── pages/              # Home, Products, ProductDetails, Cart, Checkout, Orders, Profile
│   │   ├── pages/admin/        # AdminDashboard, AdminProducts, AdminProductForm, AdminOrders, AdminUsers
│   │   ├── routes/             # ProtectedRoute, AdminRoute
│   │   └── App.jsx             # Main Router
│   └── package.json
│
├── PRD.md                      # Comprehensive Product Requirements Document
└── package.json                # Root package scripts
```
