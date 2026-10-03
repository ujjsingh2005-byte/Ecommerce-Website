# Technical Requirements Document (TRD)
## Production Full-Stack E-Commerce Web Application

**Document Version:** 1.0.0  
**Status:** Approved Technical Architecture & Implementation Blueprint  
**System Classification:** Production-Grade Digital Retail Platform  
**Target Roles:** Full-Stack Architects, Backend Engineers, Frontend Engineers, Database Engineers, Security Engineers, DevOps & QA Engineers

---

## 1. Executive Technical Overview

This Technical Requirements Document (TRD) defines the comprehensive architectural, backend, database, frontend, security, and deployment specifications for the production E-Commerce Web Application (**NexStore**).

The system is designed as a decoupled, multi-tier, transactional web application that strictly eliminates demo-level compromises (such as trusting client calculations, client-side-only authentication, plain text secrets, and unprotected inventory mutations). It delivers high availability, atomic consistency, end-to-end data integrity, and strict Role-Based Access Control (RBAC).

---

## 2. Technology Stack & Architectural Specifications

### 2.1 Technology Stack Matrix

| Tier / Component | Technology Selected | Version / Specification | Architectural Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React.js | `^18.3.1` (Vite `^5.4.8`) | Component-based modular client with fast HMR and optimized production bundling. |
| **Client Routing** | React Router DOM | `^6.26.2` | Declarative client-side routing with guarded route wrappers (`ProtectedRoute`, `AdminRoute`). |
| **Styling & Design System** | Tailwind CSS + PostCSS | `^3.4.13` | Utility-first responsive design, modern typography, glassmorphism, and accessible layouts. |
| **Icons & Visuals** | Lucide React | `^0.453.0` | Lightweight SVG icons for intuitive user feedback and status iconography. |
| **HTTP / API Client** | Axios | `^1.7.7` | Configured instance with automatic JWT injection interceptors and centralized error handling. |
| **Backend Runtime** | Node.js | `>= 18.0.0` (v24 LTS compatible) | Asynchronous, non-blocking I/O runtime powering high-concurrency micro-transactions. |
| **Web Application Server** | Express.js | `^4.21.0` | REST API architecture, custom middleware pipelines, and static asset streaming. |
| **Database Engine** | MongoDB Server | `>= 6.0` (Community / Atlas) | Document database with compound indexing, atomic operators, and horizontal scalability. |
| **ODM / Data Layer** | Mongoose | `^8.7.0` | Schema-driven data validation, reference population, indexes, and pre/post hooks. |
| **Authentication & Cryptography** | JWT + bcryptjs | `jsonwebtoken: ^9.0.2`, `bcryptjs: ^2.4.3` | Cryptographically signed access tokens (HMAC-SHA256) and salted password hashing (10 rounds). |
| **File Handling** | Multer | `^1.4.5-lts.1` | Multipart form-data parser with disk storage, MIME verification, and strict file size boundaries. |
| **Logging & Diagnostics** | Morgan | `^1.10.0` | Structured HTTP request and performance diagnostics logging for development and production. |

---

## 3. High-Level System Architecture

The application adopts a clean, layered architectural pattern:

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             PRESENTATION TIER                            │
│                  React 18 SPA + Tailwind CSS + Context API               │
│      (Public Catalog, Dynamic Cart, Multi-Step Checkout, Admin Portal)   │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │ HTTPS / REST (JSON + Multipart)
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            API GATEWAY / ROUTING                         │
│                     Express Router + CORS + Morgan Logger                │
│            (/api/auth, /api/users, /api/products, /api/cart, /api/orders)│
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         MIDDLEWARE & SECURITY TIER                       │
│    verifyToken (JWT) ──► requireAdmin (RBAC) ──► Multer Filter (MIME)    │
│    Rate Limiter ───────► Request Validator ────► Error Boundary Handler │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                         CONTROLLER & SERVICE TIER                        │
│    Auth Service ───► Product Catalog Engine ───► Cart Stock Validator    │
│    Order Engine ───► Backend Pricing Engine ───► Payment Gateway Handler │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            DATA ACCESS LAYER                             │
│       Mongoose ODM Schemas (User, Product, Category, Cart, Order)       │
│     Atomic Mutators ($inc, $set, $gte) & Query Projections & Indexes     │
└────────────────────────────────────┬─────────────────────────────────────┘
                                     │
                                     ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             DATABASE TIER                                │
│                     MongoDB Engine (Port: 27017)                         │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Scalable Project Directory Layout

```
ecommerce-web-application/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB Mongoose connection lifecycle & events
│   │   ├── controllers/
│   │   │   ├── authController.js     # User registration, login, session token validation
│   │   │   ├── userController.js     # User profile, photo & resume uploads/deletion, Admin users
│   │   │   ├── productController.js  # Catalog search, filter, sort, pagination, Admin CRUD
│   │   │   ├── cartController.js     # Cart persistence, live stock checks, dynamic calculation
│   │   │   └── orderController.js    # Atomic order creation, payment verification, tracking, KPIs
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT protect and requireAdmin RBAC middlewares
│   │   │   ├── upload.js             # Multer engine for avatars, resumes & product media
│   │   │   └── errorHandler.js       # Centralized error normalizer and HTTP response formatter
│   │   ├── models/
│   │   │   ├── User.js               # User model with bcrypt pre-save hook & methods
│   │   │   ├── Product.js            # Product model with compound search & rating indexes
│   │   │   ├── Category.js           # Category taxonomy model
│   │   │   ├── Cart.js               # User cart model with populated item references
│   │   │   └── Order.js              # Order model with status timeline, address snapshot & ledger
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth routes
│   │   │   ├── userRoutes.js         # /api/users routes
│   │   │   ├── productRoutes.js      # /api/products routes
│   │   │   ├── cartRoutes.js         # /api/cart routes
│   │   │   └── orderRoutes.js        # /api/orders routes
│   │   ├── utils/
│   │   │   ├── generateToken.js      # JWT signing utility with expiration policy
│   │   │   └── seed.js               # Database population script with realistic catalog & accounts
│   │   └── server.js                 # Express bootstrap, CORS, uploads static route, error binding
│   ├── uploads/                      # Isolated local storage directories for uploaded assets
│   │   ├── photos/
│   │   ├── resumes/
│   │   └── products/
│   ├── .env                          # Local environment secrets (not committed to Git)
│   ├── .env.example                  # Environment template for deployment
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js          # Axios instance with request token and error response interceptors
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx        # Navigation bar, responsive search, cart badge & user menu
│   │   │   │   ├── Footer.jsx        # Trust badges, sitemap links, microservice status
│   │   │   │   ├── Loader.jsx        # Loading spinners & skeleton card loaders
│   │   │   │   ├── EmptyState.jsx    # Illustrated empty views for catalog, cart, and orders
│   │   │   │   └── ConfirmModal.jsx  # Accessible confirmation modal for destructive operations
│   │   │   ├── product/
│   │   │   │   └── ProductCard.jsx   # Product card with image zoom, price/discount tags & stock badge
│   │   │   ├── cart/
│   │   │   │   └── SteppedOrderTracker.jsx # Visual milestone progression bar & status timestamps
│   │   │   └── admin/
│   │   │       └── AdminLayout.jsx   # Admin tabbed layout with storefront switch button
│   │   ├── context/
│   │   │   ├── AuthContext.jsx       # Global auth state, login/register/logout, profile mutations
│   │   │   ├── CartContext.jsx       # Real-time cart state, quantity bounds, totals synchronization
│   │   │   └── ToastContext.jsx      # Animated, non-blocking toast alert notifications
│   │   ├── pages/
│   │   │   ├── Home.jsx              # Hero banner, category highlights, featured products, promo deals
│   │   │   ├── Products.jsx          # Catalog browser with price filter, search, sort, and pagination
│   │   │   ├── ProductDetails.jsx    # Image gallery, quantity selector, customer reviews, Add/Buy now
│   │   │   ├── Cart.jsx              # Shopping cart manager with live stock clamping and order summary
│   │   │   ├── Checkout.jsx          # Address autofill, payment mode selector & payment simulator
│   │   │   ├── Orders.jsx            # Order history view with quick tracking links
│   │   │   ├── OrderDetails.jsx      # Itemized invoice, tracking timeline, customer cancellation
│   │   │   ├── Profile.jsx           # Profile photo upload/delete, resume upload/download/delete
│   │   │   ├── Login.jsx             # Credentials login with 1-click Demo Admin & Customer shortcuts
│   │   │   ├── Register.jsx          # Account registration with password verification & photo upload
│   │   │   ├── NotFound.jsx          # 404 Route recovery view
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx    # KPI metrics (Revenue, Total Orders, Users, Low Stock Alerts)
│   │   │       ├── AdminProducts.jsx     # Inventory table with stock level alerts and delete modal
│   │   │       ├── AdminProductForm.jsx  # Product creation and editing with image upload support
│   │   │       ├── AdminOrders.jsx       # Order fulfillment manager with live status transitions
│   │   │       └── AdminUsers.jsx        # Registered platform user directory with resume inspect links
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx    # ProtectedRoute and AdminRoute authorization guards
│   │   ├── App.jsx                   # Central routing declarations & context nesting
│   │   ├── main.jsx                  # React DOM bootstrap
│   │   └── index.css                 # Tailwind base directives & custom scrollbars
│   ├── index.html
│   ├── vite.config.js                # Vite config with backend proxy on /api and /uploads
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── .gitignore                        # Git exclusion rules (node_modules, .env, dist, uploads)
├── PRD.md                            # Comprehensive Product Requirements Document
├── TRD.md                            # Complete Technical Requirements Document (this document)
├── README.md                         # Project documentation and quick-start instructions
└── package.json                      # Root convenience scripts (seed, backend, frontend, build)
```

---

## 5. Environment & Configuration Specifications

### 5.1 Environment Variable Schema

All secrets and system variables are strictly isolated in environment variables.

| Variable Name | Environment | Default / Format | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | All | `5000` | Express HTTP server listener port. |
| `NODE_ENV` | Dev / Prod | `development` / `production` | Controls verbose logging and stack trace leakage in errors. |
| `MONGODB_URI` | All | `mongodb://localhost:27017/ecommerce_db` | Connection string to MongoDB instance or Atlas cluster. |
| `JWT_SECRET` | All | `[cryptographic-hex-string]` | 256-bit symmetric secret key used for signing JWT tokens. |
| `JWT_EXPIRES_IN`| All | `7d` | Access token lifespan before forced re-authentication. |
| `CLIENT_URL` | All | `http://localhost:5173` | Allowed CORS origin for cross-origin API interactions. |
| `PAYMENT_SECRET`| All | `simulated_payment_secret_gateway_key_2026` | Secret key used for cryptographic payment webhook verification. |

### 5.2 File `.env.example`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ecommerce_db
JWT_SECRET=replace_with_a_secure_random_256_bit_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
PAYMENT_SECRET=replace_with_payment_gateway_secret_key
```

---

## 6. Database Models & Schema Specifications

### 6.1 `User` Schema
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
    maxlength: [60, 'Name cannot exceed 60 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email address'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Never returned in default queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
    index: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  resume: {
    url: { type: String, default: '' },
    originalName: { type: String, default: '' },
    uploadedAt: { type: Date }
  },
  addresses: [{
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }]
}, {
  timestamps: true
});
```

### 6.2 `Product` Schema
```javascript
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    index: true
  },
  slug: {
    type: String,
    lowercase: true,
    index: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    min: [0, 'Price cannot be negative'],
    index: true
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: String,
    required: [true, 'Please enter product category'],
    index: true
  },
  brand: {
    type: String,
    default: 'Generic'
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
    index: true
  },
  images: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5,
    index: true
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Full-text Compound Index
productSchema.index({ name: 'text', description: 'text', brand: 'text', category: 'text' });
```

### 6.3 `Cart` Schema
```javascript
const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
      default: 1
    }
  }]
}, {
  timestamps: true
});
```

### 6.4 `Order` Schema
```javascript
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderItems: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' }
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['Card', 'UPI', 'NetBanking', 'COD', 'Stripe', 'Razorpay', 'Demo Gateway'],
    default: 'Demo Gateway'
  },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
    default: 'Pending',
    index: true
  },
  pricing: {
    itemsPrice: { type: Number, required: true, default: 0.0 },
    discountAmount: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    totalPrice: { type: Number, required: true, default: 0.0 }
  },
  orderStatus: {
    type: String,
    required: true,
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Payment Failed'],
    default: 'Pending',
    index: true
  },
  timeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String, default: '' }
  }],
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date }
}, {
  timestamps: true
});
```

---

## 7. Authentication & Authorization Pipeline

### 7.1 Registration & Login Flow

```
[Registration Request]
         │
         ▼
[Body Validation: Name, Email, Password, File]
         │
         ├───► [Email Exists?] ──► YES ──► Return 409 Conflict
         │
         ▼ NO
[bcrypt.genSalt(10) ──► bcrypt.hash(password)]
         │
         ▼
[Create User Document] ──► [Sign JWT(userId)] ──► Return 201 Created (Token + Profile)

-------------------------------------------------------------------------------------

[Login Request]
         │
         ▼
[Find User by Email (+password select)]
         │
         ├───► [User Not Found OR !bcrypt.compare(enteredPassword, hash)]
         │         │
         │         ▼
         │     Return 401 Unauthorized ("Invalid email or password")
         │
         ▼ Validated
[Sign JWT(userId)] ──► Return 200 OK (Token + User Object without password)
```

### 7.2 Authorization Middleware (`protect` & `admin`)
- `protect`: Extracts `Authorization: Bearer <token>`, decodes payload with `JWT_SECRET`, retrieves user from DB without password (`.select('-password')`), and attaches it to `req.user`. If invalid, rejects with `401 Unauthorized`.
- `admin`: Inspects `req.user.role === 'admin'`. If false, rejects with `403 Forbidden`.

---

## 8. Backend Checkout Engine & Atomic Concurrency

### 8.1 Zero-Trust Price & Stock Validation
The backend does **NOT** trust line prices, discounts, taxes, or total amount sent by the client.

```
[Client Submits Checkout: { orderItems, shippingAddress, paymentMethod }]
                                 │
                                 ▼
         ┌───────────────────────────────────────────────┐
         │ For each item in orderItems:                  │
         │ 1. Fetch Product by ID directly from MongoDB  │
         │ 2. Verify Product Exists                      │
         │ 3. Check stock >= requestedQuantity           │
         │ 4. Fetch DB price & DB discountPercentage     │
         │ 5. Compute line price & line subtotal         │
         └───────────────────────┬───────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │ Are all items in stock?       │
                 └───────┬───────────────┬───────┘
                         │               │
                     NO  │               │ YES
                         ▼               ▼
          [Return 400 Bad Request]   [Compute Authoritative Financials:
           "Insufficient stock for    Subtotal = Σ(DB Price * Qty)
            item X. Only Y left."]    Discount = Σ(DB Discount * Qty)
                                      Shipping = Subtotal > 999 ? 0 : 50
                                      Tax = 5% of Net Total
                                      Total = Net + Shipping + Tax]
                                                 │
                                                 ▼
                                     [Execute Atomic Stock Reduction:
                                      Product.findByIdAndUpdate(id, {
                                        $inc: { stock: -quantity }
                                      })]
                                                 │
                                                 ▼
                                     [Create Order in MongoDB]
                                                 │
                                                 ▼
                                     [Clear Active User Cart]
```

### 8.2 Atomic Inventory Protection
By using MongoDB's `$inc: { stock: -quantity }` in combination with query criteria or conditional execution, concurrent race conditions on low-stock items are prevented.

---

## 9. Payment Architecture & State Rollback

### 9.1 Payment Lifecycle

```
[Checkout Executed] ──► [Order Created with status: 'Pending']
                              │
                              ▼
                [Open Payment Gateway Modal]
                              │
             ┌────────────────┴────────────────┐
             │                                 │
             ▼ Success                         ▼ Failure / Abort
[POST /api/orders/:id/verify-payment]   [POST /api/orders/:id/verify-payment]
  Payload: { paymentStatus: 'Paid' }       Payload: { paymentStatus: 'Failed' }
             │                                 │
             ▼                                 ▼
[Order.paymentStatus = 'Paid']          [Order.paymentStatus = 'Failed']
[Order.orderStatus = 'Confirmed']       [Order.orderStatus = 'Payment Failed']
[Order.paymentResult = { txnId }]       [Atomic Stock Restoration:
[Timeline.push('Confirmed')]             Product.findByIdAndUpdate(id, {
                                           $inc: { stock: +quantity }
                                         })]
                                        [Timeline.push('Payment Failed')]
```

---

## 10. Order State Machine & Chronological Tracking

### 10.1 Allowed Transitions

```
                    ┌───────────────────────────────┐
                    │            Pending            │
                    └───────┬───────────────┬───────┘
                            │               │
                 Payment OK │               │ Customer Cancel / Payment Fail
                            ▼               ▼
                    ┌───────────────┐ ┌───────────────────┐
                    │   Confirmed   │ │ Cancelled / Fail  │
                    └───────┬───────┘ └───────────────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Packed     │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │    Shipped    │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │Out for Deliv. │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │   Delivered   │
                    └───────────────┘
```

- **Stock Restoration on Cancellation:** When a customer or admin cancels an order in `Pending`, `Confirmed`, or `Packed` states, the server iterates through `orderItems` and increments stock back into the database.

---

## 11. File Upload Pipeline & Storage Management

### 11.1 Multipart Upload Specifications

| Asset Type | Field Name | Max File Size | Permitted MIME Types | Storage Destination |
| :--- | :--- | :--- | :--- | :--- |
| **Profile Photos** | `photo` / `profilePhoto` | 5 MB | `image/jpeg`, `image/jpg`, `image/png`, `image/webp` | `backend/uploads/photos/` |
| **Resumes / Documents**| `resume` | 10 MB | `application/pdf`, `.doc`, `.docx` | `backend/uploads/resumes/` |
| **Product Media** | `images` | 5 MB / image (max 5) | `image/jpeg`, `image/jpg`, `image/png`, `image/webp` | `backend/uploads/products/` |

### 11.2 Orphaned Asset Cleanup
When a user replaces or deletes their profile photo or resume, the backend immediately unlinks the corresponding physical file from the local storage disk using `fs.unlinkSync()`, preventing disk bloat.

---

## 12. RESTful API Contract & Status Codes

### 12.1 Authentication Endpoints (`/api/auth`)

#### `POST /api/auth/register`
- **Access:** Public
- **Content-Type:** `multipart/form-data` or `application/json`
- **Request Body:** `{ name, email, password, profilePhoto? }`
- **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Account registered successfully",
    "data": {
      "_id": "66fe...81",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "profilePhoto": "/uploads/photos/photo-123.jpg",
      "token": "eyJhbGciOi..."
    }
  }
  ```
- **Error Codes:** `400 Bad Request`, `409 Conflict` (Email already in use).

#### `POST /api/auth/login`
- **Access:** Public
- **Request Body:** `{ email, password }`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "_id": "66fe...81",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "token": "eyJhbGciOi..."
    }
  }
  ```
- **Error Codes:** `400 Bad Request`, `401 Unauthorized` ("Invalid email or password").

#### `GET /api/auth/me`
- **Access:** Authenticated (`Bearer <token>`)
- **Response (200 OK):** Current user object without password hash.

---

### 12.2 Product Catalog Endpoints (`/api/products`)

#### `GET /api/products`
- **Access:** Public
- **Query Parameters:** `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`, `sort`, `inStock`, `featured`
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "products": [...],
      "page": 1,
      "pages": 3,
      "total": 35,
      "limit": 12
    }
  }
  ```

#### `GET /api/products/:id`
- **Access:** Public
- **Response (200 OK):** Single product with images, descriptions, reviews, and stock count.

#### `POST /api/products`
- **Access:** Admin Only (`protect`, `admin`)
- **Content-Type:** `multipart/form-data`
- **Response (201 Created):** Created product document.

#### `PUT /api/products/:id`
- **Access:** Admin Only (`protect`, `admin`)
- **Response (200 OK):** Updated product document.

#### `DELETE /api/products/:id`
- **Access:** Admin Only (`protect`, `admin`)
- **Response (200 OK):** `{ "success": true, "message": "Product deleted successfully" }`.

---

### 12.3 Cart Endpoints (`/api/cart`)

#### `GET /api/cart`
- **Access:** Authenticated
- **Response (200 OK):** Populated items list with computed subtotal, discount, shipping, tax, and final total.

#### `POST /api/cart`
- **Access:** Authenticated
- **Request Body:** `{ productId, quantity }`
- **Response (200 OK):** Updated cart ledger.
- **Error (400 Bad Request):** `"Only X items are available in stock."`

#### `PUT /api/cart/:productId`
- **Access:** Authenticated
- **Request Body:** `{ quantity }`

#### `DELETE /api/cart/:productId` & `DELETE /api/cart`
- **Access:** Authenticated
- **Response (200 OK):** Removed item or cleared cart.

---

### 12.4 Order & Checkout Endpoints (`/api/orders`)

#### `POST /api/orders`
- **Access:** Authenticated
- **Request Body:**
  ```json
  {
    "orderItems": [{ "productId": "...", "quantity": 1 }],
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "+91 9876543210",
      "street": "123 Silicon Ave",
      "city": "Bangalore",
      "state": "Karnataka",
      "pincode": "560001",
      "country": "India"
    },
    "paymentMethod": "Demo Gateway"
  }
  ```
- **Response (201 Created):** Created order snapshot with generated `orderNumber`.

#### `POST /api/orders/:id/verify-payment`
- **Access:** Authenticated
- **Request Body:** `{ paymentStatus: "Paid" | "Failed", transactionId, paymentError? }`
- **Response (200 OK):** Updated order state.

#### `GET /api/orders/my-orders`
- **Access:** Authenticated
- **Response (200 OK):** List of orders belonging to the requester.

#### `GET /api/orders/:id`
- **Access:** Authenticated (Owner or Admin)
- **Response (200 OK):** Order details, line item invoice, and status timeline.

#### `PUT /api/orders/:id/cancel`
- **Access:** Authenticated (Owner or Admin)
- **Response (200 OK):** Cancelled order with restored stock.

#### `GET /api/orders/admin/stats`
- **Access:** Admin Only
- **Response (200 OK):** Aggregate KPIs (Total Revenue, Total Orders, Users, Low Stock Alerts, Recent Orders).

---

## 13. Real-World Edge Case Handling Matrix

| # | Edge Case | Architectural Defense | HTTP Response / UI Behavior |
| :- | :--- | :--- | :--- |
| **1** | **Product deleted while in cart** | `getCart` query automatically filters out items where `item.product === null` and syncs the DB. | Cart renders cleanly without crashing; orphaned items are removed. |
| **2** | **Price changed after item added to cart** | Checkout recalculates authoritative line price directly from MongoDB `Product` record. | Updated total is charged; user is billed accurate current price. |
| **3** | **Product becomes out of stock** | Backend checks `product.stock >= quantity` before finalizing checkout. | `400 Bad Request`: *"Insufficient stock for product X"*. |
| **4** | **Multiple users purchasing the last item** | MongoDB atomic conditional decrement (`$inc: { stock: -qty }`). | First request completes; second request is safely rejected with stock error. |
| **5** | **Payment failure on gateway** | Payment verification endpoint marks order `Payment Failed` and restores deducted stock. | User receives explanatory error and option to retry payment. |
| **6** | **Duplicate order submission** | Buttons disabled with loading spinner upon first click (`placingOrder=true`). | Prevents accidental duplicate HTTP submissions. |
| **7** | **Expired authentication token** | Axios interceptor catches 401, clears localStorage, and redirects to `/login?redirect=...`. | Clean re-authentication with return to previous workflow. |
| **8** | **Invalid MongoDB ObjectId format** | Centralized `errorHandler` catches `CastError` (kind `ObjectId`). | `400 Bad Request`: *"Resource not found: Invalid Identifier"*. |
| **9** | **Unauthorized access to Admin dashboard** | `requireAdmin` middleware inspects `req.user.role === 'admin'`. | `403 Forbidden`: *"Administrator privileges required"*. |
| **10**| **Database server down / disconnect** | Mongoose connection error caught in global error boundary. | Standardized `503 Service Unavailable` with friendly toast. |
| **11**| **Negative or zero quantity in cart** | Schema validation `min: [1]` and route handler rejection. | `400 Bad Request`: *"Quantity must be at least 1"*. |
| **12**| **Excessive file upload size** | Multer `limits: { fileSize: 5MB / 10MB }` catches `LIMIT_FILE_SIZE`. | `400 Bad Request`: *"File size is too large"*. |
| **13**| **Executable file upload disguise** | Multer file filter verifies permitted image & document MIME extensions. | `400 Bad Request`: *"Invalid file type"*. |
| **14**| **Duplicate email registration** | MongoDB unique index catches error code `11000`. | `409 Conflict`: *"An account with this email already exists"*. |
| **15**| **Cancelling already shipped order** | Backend rejects status transition if `orderStatus === 'Shipped'`. | `400 Bad Request`: *"Cannot cancel an order that has already shipped"*. |
| **16**| **Direct URL access to other user's order**| Backend checks `req.user._id === order.user._id || req.user.role === 'admin'`.| `403 Forbidden`: *"Not authorized to view this order"*. |

---

## 14. Frontend Architecture & UI/UX Technical Requirements

### 14.1 Component Hierarchy
```
App
 ├── ToastProvider (ToastContext)
 │    └── AuthProvider (AuthContext)
 │         └── CartProvider (CartContext)
 │              ├── Navbar
 │              ├── Routes
 │              │    ├── Public Routes (Home, Products, ProductDetails, Login, Register)
 │              │    ├── Protected Routes (Cart, Checkout, Orders, OrderDetails, Profile)
 │              │    └── Admin Routes (AdminDashboard, AdminProducts, AdminProductForm, AdminOrders, AdminUsers)
 │              └── Footer
```

### 14.2 Mandatory UI States
1. **Loading State:** Render `<SkeletonCard />` grids or animated `<Loader />` spinners.
2. **Empty State:** Illustrated `<EmptyState />` for empty carts, zero search matches, or empty order histories.
3. **Error State:** Non-intrusive toast alerts via `ToastContext.error()`.
4. **Success State:** Action toasts via `ToastContext.success()`.
5. **Confirmation Dialogs:** Modal dialogues for destructive actions (`ConfirmModal`).

---

## 15. Security Hardening Checklist

- [x] **No Secrets in Frontend:** Only public parameters are in the browser; all secrets (`JWT_SECRET`, `MONGODB_URI`, `PAYMENT_SECRET`) are in `backend/.env`.
- [x] **Salted Password Hashing:** 10 rounds of bcrypt hashing before saving to database.
- [x] **Protected API Endpoints:** Protected routes require valid Bearer JWT.
- [x] **Role-Based Authorization:** Admin routes require explicit `role: 'admin'`.
- [x] **CORS Configuration:** Configured to whitelist trusted origins (`http://localhost:5173`, `http://127.0.0.1:5173`).
- [x] **File Upload Whitelist:** Strict MIME type validation for `.jpg`, `.png`, `.webp`, and `.pdf`.
- [x] **Database Query Sanitization:** Prevents NoSQL injection by using Mongoose type casting and parameter isolation.
- [x] **Zero Plaintext Credentials:** Database seeder hashes passwords via Mongoose hooks.

---

## 16. Verification, Testing & Acceptance Criteria

### 16.1 Automated & Manual Acceptance Verification
- [x] **MongoDB Integration:** Connection established successfully on startup.
- [x] **Authentication Flow:** User registration, login, and JWT session persistence verified.
- [x] **Catalog Browsing:** Category filtering, keyword search, price range filtering, and sorting functional.
- [x] **Inventory Clamping:** Cart bounds quantity to `product.stock` with real-time feedback.
- [x] **Checkout Integrity:** Server-side price calculation and stock deduction verified.
- [x] **Payment Verification & Rollback:** Success confirms order; failure restores product stock.
- [x] **Order Tracking:** Chronological stepper displays live state and transition timestamps.
- [x] **Profile & Assets:** Profile photo upload/delete and resume upload/download/delete verified.
- [x] **Admin Controls:** Analytics KPIs, Product CRUD with delete confirmation, and Order status updater functional.
- [x] **Production Build:** `vite build` generates optimized production bundle with zero compilation errors.
