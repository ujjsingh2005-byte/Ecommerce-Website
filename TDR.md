# Technical Design Requirements (TDR)
## Production E-Commerce Web Application Platform

**Document Version:** 1.0.0  
**Status:** Approved Technical Design Architecture  
**System Classification:** Full-Stack Distributed Transaction Platform  
**Target Roles:** Software Architects, System Designers, Full-Stack Engineers, Database Architects, Security Engineers, DevOps Engineers, QA Engineers

---

## 1. System Objective & Design Scope

The objective of this Technical Design Document (TDR) is to define the modular architecture, detailed component interactions, data flow diagrams (DFDs), database schemas, concurrency controls, security subsystems, and operational patterns for **NexStore**, an enterprise-grade digital retail platform.

The system is architected to eliminate fragile demo practices by providing:
- **Zero-Trust Backend Design:** Authoritative pricing and inventory logic residing solely on the server.
- **Atomic Concurrency Handling:** Race-condition-free stock allocation using atomic database operators.
- **Strict Role-Based Access Control (RBAC):** Cryptographically enforced permissions across public, customer, and administrative tiers.
- **Asynchronous & Resilient Payment Processing:** Decoupled multi-stage payment verification with automatic inventory rollback on failure.
- **Chronological Lifecycle Tracking:** State machine preventing illegal transition jumps.
- **Comprehensive Asset Management:** Sandboxed local/cloud file storage pipelines with MIME verification and cleanup.

---

## 2. High-Level System Architecture

```
                    ┌──────────────────────────────┐
                    │            CLIENT            │
                    │   React 18 SPA + Vite +      │
                    │   Tailwind CSS Design System │
                    └──────────────┬───────────────┘
                                   │
                                   │ HTTPS / REST (JSON & Multipart)
                                   ▼
                    ┌──────────────────────────────┐
                    │      EXPRESS.JS SERVER       │
                    │  (Port 5000 / Cluster Node)  │
                    └──────────────┬───────────────┘
                                   │
        ┌──────────────────────────┼──────────────────────────┐
        ▼                          ▼                          ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│AUTHENTICATION │          │  CONTROLLERS  │          │  MIDDLEWARE   │
│ JWT Sign/Verify          │ Auth, Product,│          │ RBAC Guard,   │
│ bcrypt Hashing│          │ Cart, Order,  │          │ Multer Filter,│
│ Session Check │          │ User, Admin   │          │ Error Normal. │
└───────┬───────┘          └───────┬───────┘          └───────┬───────┘
        └──────────────────────────┼──────────────────────────┘
                                   ▼
                    ┌──────────────────────────────┐
                    │        SERVICE LAYER         │
                    │ - Backend Pricing Engine     │
                    │ - Atomic Stock Validator     │
                    │ - Payment Gateway Adapter    │
                    │ - Order State Machine        │
                    │ - File Asset Sanitizer       │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │      DATA ACCESS LAYER       │
                    │ (Mongoose Models & Schemas)  │
                    │  User, Product, Cart, Order  │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │       DATABASE ENGINE        │
                    │    MongoDB Server / Atlas    │
                    └──────────────────────────────┘
                                   ▲
                                   │
      ┌────────────────────────────┴────────────────────────────┐
      ▼                                                         ▼
┌─────────────────────────┐                           ┌───────────────────┐
│ EXTERNAL PAYMENT GATEWAY│                           │FILE/ASSET STORAGE │
│ (Stripe/Razorpay/Sim)   │                           │(Local/Cloudinary) │
└─────────────────────────┘                           └───────────────────┘
```

---

## 3. Subsystem & Module Design

### 3.1 Authentication & RBAC Authorization Subsystem
- **Component ID:** `MOD-AUTH`
- **Core Files:** `src/controllers/authController.js`, `src/middleware/auth.js`, `src/utils/generateToken.js`, `src/models/User.js`
- **Design Pattern:** Token-Based Stateless Authentication with Salted Hashes.

```
[Incoming Request]
       │
       ▼
[Route Middleware: protect]
       │
       ├───► [Header contains 'Bearer <token>'?]
       │         │
       │         ├───► NO  ──► HTTP 401 Unauthorized ("No token provided")
       │         │
       │         └───► YES ──► Verify HMAC-SHA256 with JWT_SECRET
       │                            │
       │                            ├───► Invalid/Expired ──► HTTP 401 Unauthorized
       │                            │
       │                            └───► Valid ──► Query User DB (.select('-password'))
       │                                               │
       │                                               └──► Attach user to req.user
       │
       ▼
[Optional Route Middleware: admin]
       │
       ├───► [req.user.role === 'admin'?]
       │         │
       │         ├───► NO  ──► HTTP 403 Forbidden ("Admin privileges required")
       │         │
       │         └───► YES ──► Proceed to Controller
       ▼
[Controller Action Executed]
```

---

### 3.2 Product Catalog & Search/Filtering Subsystem
- **Component ID:** `MOD-CATALOG`
- **Core Files:** `src/controllers/productController.js`, `src/models/Product.js`, `src/models/Category.js`
- **Design Responsibilities:**
  - Full-text search on compound index `(name, description, brand, category)`.
  - Filter criteria aggregation: Regex category matching, price bounding (`$gte`, `$lte`), minimum customer rating, and availability toggle (`stock > 0`).
  - Server-side sorting with pagination projection (`skip`, `limit`, `totalCount`).
  - Admin-controlled CRUD operations with multi-image asset upload handlers.

---

### 3.3 Dynamic Shopping Cart Engine
- **Component ID:** `MOD-CART`
- **Core Files:** `src/controllers/cartController.js`, `src/models/Cart.js`
- **Design Responsibilities:**
  - Persists authenticated cart states across multi-device sessions.
  - Dynamically inspects underlying product documents upon retrieval.
  - Automatically identifies and purges orphaned items (products deleted from catalog while in active carts).
  - Enforces quantity clamping against live inventory with descriptive notifications (*"Only X items are available in stock"*).

---

### 3.4 Checkout & Concurrency-Safe Order Subsystem
- **Component ID:** `MOD-CHECKOUT`
- **Core Files:** `src/controllers/orderController.js`, `src/models/Order.js`, `src/models/Product.js`
- **Design Responsibilities:**
  - **Zero-Trust Principle:** Recalculates product prices, discounts, shipping fees, and taxes directly from the database; discards all client-calculated values.
  - **Atomic Stock Deduction:** Executes atomic conditional update statements (`$inc: { stock: -quantity }`).
  - **Payment Verification:** Processes gateway responses and manages state rollback upon failure.
  - **Inventory Restoration:** Automatically returns items to inventory when orders are cancelled or payments fail.

---

### 3.5 File Storage & Sandboxing Subsystem
- **Component ID:** `MOD-STORAGE`
- **Core Files:** `src/middleware/upload.js`, `backend/uploads/`
- **Design Responsibilities:**
  - Enforces strict whitelist validation on file extensions and MIME headers.
  - Enforces maximum file size boundaries (5MB for images, 10MB for resumes).
  - Generates collision-proof file names (`field-timestamp-random.ext`).
  - Implements synchronous file removal on replacement/deletion to prevent disk bloat.

---

## 4. Detailed Data Flow Diagrams (DFDs)

### 4.1 DFD Level 0: Context Diagram

```
                 ┌──────────────────────────────────────────────┐
                 │                                              │
                 │              CUSTOMER (USER)                 │
                 │                                              │
                 └──────┬────────────────────────────────▲──────┘
                        │                                │
      Browse / Search / │                                │ Order Tracking /
      Add Cart / Pay    │                                │ Invoices / Profiles
                        ▼                                │
                 ┌──────────────────────────────────────┴───────┐
                 │                                              │
                 │             NEXSTORE E-COMMERCE              │
                 │                 APPLICATION                  │
                 │                                              │
                 └──────┬────────────────────────────────▲──────┘
                        │                                │
      Manage Inventory /│                                │ Dashboard KPIs /
      Fulfill Orders    │                                │ User Audits
                        ▼                                │
                 ┌──────────────────────────────────────┴───────┐
                 │                                              │
                 │             ADMINISTRATOR (ADMIN)            │
                 │                                              │
                 └──────────────────────────────────────────────┘
```

---

### 4.2 DFD Level 1: Checkout & Payment Lifecycle

```
[Customer Client] ──(1) Submit Checkout Intent { items, address, payMethod }──► [Order Controller]
                                                                                       │
                                                                   (2) Query DB Products
                                                                                       ▼
                                                                             [Product Model]
                                                                                       │
                                                               (3) Return Verified Stock & Price
                                                                                       ▼
[Order Controller] ◄───────────────────────────────────────────────────────────────────┘
       │
       ├───► [Check: stock < requestedQty?] ──► YES ──► Return 400 Bad Request
       │
       ▼ NO
[Calculate Authoritative Totals: Subtotal, Discount, Shipping, Tax, Total]
       │
       ▼
[Atomic Stock Decrement ($inc: -qty)] ──► [Product Collection Updated]
       │
       ▼
[Create Order (Status: 'Pending')] ──► [Order Collection Inserted]
       │
       ▼
[Clear User Cart] ──► [Cart Collection Reset]
       │
       ▼
[Return Order Payload to Client] ──► (Customer Opens Payment Gateway Simulator)
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    │                                             │
             Payment Succeeded                             Payment Failed
                    │                                             │
                    ▼                                             ▼
       [POST /orders/:id/verify-payment]             [POST /orders/:id/verify-payment]
         { paymentStatus: 'Paid' }                     { paymentStatus: 'Failed' }
                    │                                             │
                    ▼                                             ▼
       [Order.status = 'Confirmed']                  [Order.status = 'Payment Failed']
       [Order.payment = 'Paid']                      [Order.payment = 'Failed']
       [Timeline.push('Confirmed')]                  [Atomic Stock Restoration ($inc: +qty)]
                                                     [Timeline.push('Payment Failed')]
```

---

## 5. Database Architecture & Relational Mapping (MongoDB)

### 5.1 Entity Relationship Diagram

```
┌────────────────────────┐                   ┌────────────────────────┐
│         USER           │                   │        PRODUCT         │
├────────────────────────┤                   ├────────────────────────┤
│ _id (ObjectId, PK)     │                   │ _id (ObjectId, PK)     │
│ name (String)          │                   │ name (String, Index)   │
│ email (String, Unique) │                   │ slug (String, Unique)  │
│ password (Hash)        │                   │ description (String)   │
│ role (user|admin)      │                   │ price (Number)         │
│ profilePhoto (String)  │                   │ discountPercentage (Num│
│ resume (Object)        │                   │ category (String)      │
│ addresses (Array)      │                   │ brand (String)         │
│ createdAt (Date)       │                   │ stock (Number, Index)  │
└───────────┬────────────┘                   │ images (Array)         │
            │                                │ rating (Number)        │
            │ 1:1                            │ numReviews (Number)    │
            ▼                                │ reviews (Array)        │
┌────────────────────────┐                   │ isFeatured (Boolean)   │
│          CART          │                   │ createdAt (Date)       │
├────────────────────────┤                   └───────────▲────────────┘
│ _id (ObjectId, PK)     │                               │
│ user (ObjectId, Ref)   │                               │
│ items: [               │                               │
│   productId (Ref) ─────┼───────────────────────────────┤
│   quantity (Number)    │                               │
│ ]                      │                               │
│ updatedAt (Date)       │                               │
└────────────────────────┘                               │
            │                                            │
            │ 1:N                                        │
            ▼                                            │
┌────────────────────────┐                               │
│         ORDER          │                               │
├────────────────────────┤                               │
│ _id (ObjectId, PK)     │                               │
│ orderNumber (String)   │                               │
│ user (ObjectId, Ref)   │                               │
│ orderItems: [          │                               │
│   productId (Ref) ─────┼───────────────────────────────┘
│   name (String)        │
│   image (String)       │
│   price (Number)       │
│   quantity (Number)    │
│   subtotal (Number)    │
│ ]                      │
│ shippingAddress (Obj)  │
│ paymentMethod (String) │
│ paymentStatus (String) │
│ pricing (Object)       │
│ orderStatus (String)   │
│ timeline (Array)       │
│ createdAt (Date)       │
└────────────────────────┘
```

### 5.2 MongoDB Indexing Strategy

| Collection | Index Fields | Index Type | Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `email` | Unique B-Tree | Fast credential lookup and duplicate registration prevention. |
| `users` | `role` | Standard B-Tree | Filtering users in administrative queries. |
| `products` | `slug` | Unique B-Tree | Direct SEO-friendly URL querying. |
| `products` | `category`, `price`, `stock` | Compound B-Tree | Ultra-fast multi-facet catalog filtering and sorting. |
| `products` | `name`, `description`, `brand`, `category` | Compound Text Index | Full-text relevance searching across keyword queries. |
| `carts` | `user` | Unique B-Tree | Instant single cart lookup per authenticated customer. |
| `orders` | `orderNumber` | Unique B-Tree | Fast lookup for tracking and invoice generation. |
| `orders` | `user`, `createdAt` | Compound B-Tree | Sorted retrieval of customer order history. |
| `orders` | `orderStatus`, `paymentStatus` | Compound B-Tree | Fast admin fulfillment filtering and aggregation metrics. |

---

## 6. Detailed API Design & Contracts

### 6.1 Unified Response Envelope

All API responses follow a standardized JSON envelope structure:

#### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... }
}
```

#### Error Response
```json
{
  "success": false,
  "message": "Human-readable explanation of error condition",
  "stack": null
}
```

---

### 6.2 Complete REST Endpoint Contract

| Domain | Method | Endpoint | Auth Level | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/register` | Public | Register new user with optional profile photo. |
| **Auth** | `POST` | `/api/auth/login` | Public | Verify credentials and return signed JWT token. |
| **Auth** | `GET` | `/api/auth/me` | Customer | Re-authenticate active session and retrieve profile payload. |
| **User** | `PUT` | `/api/users/profile` | Customer | Update name, phone, and saved shipping addresses. |
| **User** | `POST` | `/api/users/profile/photo` | Customer | Upload avatar photo (multipart, max 5MB). |
| **User** | `DELETE`| `/api/users/profile/photo` | Customer | Delete avatar photo and unlink from disk storage. |
| **User** | `POST` | `/api/users/profile/resume`| Customer | Upload resume document (.pdf/.doc, max 10MB). |
| **User** | `DELETE`| `/api/users/profile/resume`| Customer | Delete resume file and unlink from disk storage. |
| **User** | `GET` | `/api/users` | Admin | Paginated list of registered customers. |
| **User** | `PUT` | `/api/users/:id` | Admin | Update user role or permissions. |
| **Products**| `GET` | `/api/products` | Public | Multi-facet catalog search, filter, sort, and pagination. |
| **Products**| `GET` | `/api/products/categories` | Public | Retrieve distinct list of active product categories. |
| **Products**| `GET` | `/api/products/:id` | Public | Retrieve complete product specifications and reviews. |
| **Products**| `POST` | `/api/products` | Admin | Create product listing with multi-image upload. |
| **Products**| `PUT` | `/api/products/:id` | Admin | Update product metadata, pricing, and stock. |
| **Products**| `DELETE`| `/api/products/:id` | Admin | Permanently delete product listing. |
| **Products**| `POST` | `/api/products/:id/reviews`| Customer | Submit verified rating (1-5) and feedback comment. |
| **Cart** | `GET` | `/api/cart` | Customer | Retrieve persistent cart with live price/stock validation. |
| **Cart** | `POST` | `/api/cart` | Customer | Add item to cart with stock clamping. |
| **Cart** | `PUT` | `/api/cart/:productId` | Customer | Update line item quantity within stock limits. |
| **Cart** | `DELETE`| `/api/cart/:productId` | Customer | Remove specific product from cart. |
| **Cart** | `DELETE`| `/api/cart` | Customer | Clear all items from active cart. |
| **Orders** | `POST` | `/api/orders` | Customer | Atomic stock deduction and pending order creation. |
| **Orders** | `POST` | `/api/orders/:id/verify-payment` | Customer | Finalize payment status or rollback stock on failure. |
| **Orders** | `GET` | `/api/orders/my-orders` | Customer | View customer's historical orders. |
| **Orders** | `GET` | `/api/orders/:id` | Customer/Admin | Inspect order invoice and stepped shipment timeline. |
| **Orders** | `PUT` | `/api/orders/:id/cancel` | Customer/Admin | Cancel order and atomically replenish inventory. |
| **Orders** | `GET` | `/api/orders` | Admin | Fulfillment manager: view all system orders with filters. |
| **Orders** | `PUT` | `/api/orders/:id/status` | Admin | Advance order lifecycle state (`Packed`, `Shipped`, etc.). |
| **Orders** | `GET` | `/api/orders/admin/stats` | Admin | Aggregate dashboard KPIs (Revenue, Orders, Low stock). |

---

## 7. Security Architecture & Threat Modeling

| Security Threat | Attack Vector | Technical Mitigation Strategy |
| :--- | :--- | :--- |
| **Broken Authentication** | Credential stuffing, weak passwords. | Salted hashes via `bcryptjs` (10 rounds); account enumeration defense with uniform error messages. |
| **Broken Object Level Auth (BOLA)** | User A inspects `/api/orders/orderB_id`. | Resource ownership verification: `req.user._id === order.user._id \|\| req.user.role === 'admin'`. |
| **Privilege Escalation** | Regular user sends `POST /api/products`. | Server-side `requireAdmin` middleware checking `req.user.role === 'admin'`. |
| **Client-Side Price Manipulation**| Tampered checkout JSON containing `price: 1`. | Server discards frontend financial values; re-computes subtotal from authoritative DB values. |
| **Inventory Depletion Race** | Rapid simultaneous checkout requests for last item. | Atomic MongoDB conditional increments (`$inc: { stock: -qty }`). |
| **Malicious File Execution** | Uploading `.php` / `.exe` disguised as image. | Multer strict MIME-type whitelist filter and randomized disk storage names. |
| **Cross-Origin Abuse** | Unauthorized domains requesting API resources. | Explicit CORS configuration restricting origins to trusted client URLs. |
| **NoSQL Injection** | Sending `{ "$gt": "" }` in login email body. | Mongoose strict schema casting and input sanitization. |
| **Information Disclosure** | Server stack trace returned to production client. | Centralized `errorHandler` strips `stack` whenever `NODE_ENV === 'production'`. |

---

## 8. Frontend Architecture & State Management Design

### 8.1 Context-Driven State Topology

```
┌────────────────────────────────────────────────────────┐
│                      ToastContext                      │
│   (Global notification queue: success, error, info)    │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      AuthContext                       │
│    (user, token, isAuthenticated, isAdmin, login,      │
│     register, logout, profile photo & resume handlers) │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                      CartContext                       │
│   (cart items, live totals, addToCart, updateQuantity, │
│    removeFromCart, clearCart, stock warnings)          │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  React Router Viewport                 │
│   - Public Routes (Home, Catalog, ProductDetails, Auth)│
│   - Protected Routes (Cart, Checkout, Orders, Profile) │
│   - Admin Routes (Dashboard, Products, Orders, Users)  │
└────────────────────────────────────────────────────────┘
```

### 8.2 Client-Side Route Protection Matrix

```
[Navigation Event]
        │
        ├──► Is Route Marked 'ProtectedRoute'?
        │        │
        │        ├──► !isAuthenticated ──► Redirect to /login?redirect=<target>
        │        │
        │        └──► isAuthenticated ──► Render Component
        │
        └──► Is Route Marked 'AdminRoute'?
                 │
                 ├──► !isAuthenticated ──► Redirect to /login?redirect=<target>
                 │
                 ├──► !isAdmin ──────────► Redirect to / (Unauthorized)
                 │
                 └──► isAdmin ───────────► Render Admin Layout & Component
```

---

## 9. Operational & DevOps Specifications

### 9.1 Build & Runtime Execution

- **Development Mode:**
  - Backend: `nodemon src/server.js` (Port 5000)
  - Frontend: `vite` (Port 5173 with proxy configuration)
- **Production Mode:**
  - Backend: `NODE_ENV=production node src/server.js`
  - Frontend: `vite build` $\rightarrow$ Outputs optimized static bundle to `frontend/dist/`.

### 9.2 Health Check & Diagnostic Probes
- **Endpoint:** `GET /api/health`
- **Response:**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-03T14:27:00.000Z",
    "service": "Ecommerce Production Backend API"
  }
  ```

---

## 10. Technical Acceptance & Quality Verification Matrix

| Area | Acceptance Test Requirement | Status |
| :--- | :--- | :--- |
| **DB Connectivity** | Successfully establishes connection to MongoDB on startup with graceful error handling. | Verified |
| **Authentication** | Registration, login, password hashing, and JWT issuance function without leaking credentials. | Verified |
| **RBAC Security** | Regular users cannot access `/admin` or invoke admin endpoints (`403 Forbidden`). | Verified |
| **Catalog Operations** | Full search, category filter, price range bounding, sorting, and pagination work seamlessly. | Verified |
| **Cart Synchronizer**| Cart accurately recalculates subtotals, discounts, taxes, and shipping; bounds to stock. | Verified |
| **Atomic Checkout** | Backend calculates final price; decrements inventory atomically; rejects over-subscription. | Verified |
| **Payment Flow** | Handles both payment confirmation and simulated failure with stock restoration. | Verified |
| **Order Tracking** | Chronological visual stepper correctly displays live status and transition audit timestamps. | Verified |
| **Asset Storage** | Photo and resume uploads enforce file type/size limits; deletions physically unlink files. | Verified |
| **Admin Operations** | Full product CRUD with delete confirmation, order status updates, and KPI analytics functional. | Verified |
| **Build Integrity** | Frontend production build completes with zero errors and clean bundle output. | Verified |
