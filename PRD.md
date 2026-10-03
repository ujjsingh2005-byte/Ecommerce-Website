# Product Requirements Document (PRD)
## Production-Grade Full-Stack E-Commerce Web Application

**Document Version:** 1.0.0  
**Status:** Approved for Implementation  
**Target Roles:** Product Managers, Full-Stack Engineers, Backend Architects, Database Engineers, UI/UX Designers, QA & Security Engineers  
**Target Stack:** Node.js, Express.js, MongoDB (Mongoose), React.js / Next.js, Tailwind CSS / Modern CSS, JWT Auth, REST APIs

---

## 1. Executive Summary & Product Vision

### 1.1 Objective
The goal is to architect, develop, test, and deploy a secure, robust, production-quality, full-stack E-Commerce Web Application. The application must not serve as a static template or mocked prototype; it must operate as a fully dynamic, transaction-safe online retail platform.

Key capabilities include:
- Multi-role access control (Public Guests, Authenticated Customers, Platform Administrators).
- End-to-end purchasing lifecycle: Product discovery, search/filtering, real-time stock-aware shopping cart, atomic checkout, simulated/live payment gateway integration, and chronological visual order tracking.
- Self-service customer portal with profile management and secure document/photo uploads.
- Secure Admin Command Center for inventory management, catalog updates, user management, and order lifecycle transitions.
- High resilience against concurrency race conditions, stock depletion anomalies, price tampering, and backend security threats.

---

## 2. User Roles & Access Control Architecture (RBAC)

The system enforces strict multi-tier Role-Based Access Control (RBAC) on both the client (for UX navigation) and server-side middleware (for absolute security).

| Role | Access Permissions & Responsibilities |
| :--- | :--- |
| **Guest / Public** | Browse home page, explore product catalog, search/filter/sort, view product details, register account, log in. |
| **Customer (`user`)** | All Guest capabilities + Maintain cart across sessions, checkout, place orders, view order history, track order status, update profile photo, upload resume/documents, remove uploaded assets. |
| **Administrator (`admin`)** | All Customer capabilities + Access Admin Dashboard, CRUD products, adjust stock levels, upload product imagery, manage categories, inspect all customer orders, execute state transitions on orders, view system metrics and user lists. |

### 2.1 RBAC Enforcement Principles
- **Backend Is Single Source of Truth:** Direct URL manipulation (e.g. hitting `/admin/*`) or spoofed client payloads must be rejected by backend authentication (`verifyToken`) and authorization (`requireRole('admin')`) middleware with `401 Unauthorized` or `403 Forbidden`.
- **Stateless Tokens:** Access tokens issued via JWT with cryptographic signing.
- **Resource Ownership Verification:** Normal users can only inspect and modify their own carts, profile documents, and orders (`req.user._id === resource.userId`).

---

## 3. Detailed Functional Specifications

### 3.1 Authentication & Authorization Module

#### 3.1.1 Customer & Admin Registration
- **Input Fields:**
  - Full Name (`string`, required, 2–60 chars)
  - Email (`string`, required, valid email format, unique, lowercase)
  - Password (`string`, required, min 8 chars with upper, lower, numeric, and special character)
  - Confirm Password (`string`, required, must match Password)
  - Profile Photo (`file`, optional, image formats: jpeg, png, webp, max 5MB)
- **Backend Rules & Validation:**
  - Hash password via `bcryptjs` with minimum work factor of 10–12 salt rounds.
  - Reject duplicate emails with `409 Conflict`.
  - Strip sensitive fields (`passwordHash`) from all response payloads.
  - Return validation error array with specific field keys for inline UI feedback.

#### 3.1.2 Login & Session Management
- **Input Fields:** Email, Password.
- **Security Features:**
  - Standardized invalid credential message: *"Invalid email or password"* (prevents account enumeration).
  - Issue JWT access token containing `{ id, role }` with standard expiration.
  - Support logout by invalidating client storage / clearing secure HTTP-only cookies.
  - Persistence: User session state maintained on refresh via `/api/auth/me`.

---

### 3.2 Public Discovery & Product Catalog

#### 3.2.1 Homepage
- **Navigation Bar:** Brand logo, global search input, category navigation dropdown, cart icon with dynamic badge count, user avatar / auth buttons (Login / Register / Dashboard).
- **Hero Section:** Value proposition banner, promotional CTA linking to seasonal collections.
- **Curated Sections:** Featured Products, Popular Categories, Best Sellers, Limited Time Offers.
- **Footer:** Informational links, customer support, trust badges, payment partner logos, copyright notice.

#### 3.2.2 Product Catalog & Search/Filter Engine
- **Product Card Display:**
  - Primary image with fallback placeholder
  - Product title & brand/category badge
  - Pricing (Original price, discounted price, calculated % off tag)
  - Customer rating (stars + review count)
  - Stock badge (`In Stock`, `Low Stock: X left`, `Out of Stock`)
  - Fast action buttons: `Add to Cart` and `View Details`
- **Catalog Controls:**
  - **Search:** Case-insensitive search on `name`, `description`, and `tags`.
  - **Category Filter:** Multi-select or single category pills.
  - **Price Range Filter:** Min and Max price sliders/inputs.
  - **Sorting:** Price (Low-to-High, High-to-Low), Newest Arrivals, Highest Rated, Popularity.
  - **Pagination:** Server-driven pagination (`page`, `limit`, `totalCount`, `totalPages`).
  - **Empty State:** Illustrated *"No products found"* with option to clear active filters.

#### 3.2.3 Product Details Page
- **Visuals:** Responsive image gallery with thumbnail selection and zoom support.
- **Metadata:** Title, category breadcrumb, rating summary, SKU, formatted markdown/HTML description.
- **Inventory & Pricing:** Live stock counter, discount calculation, unit price.
- **Actions:**
  - Quantity selector (bounded between `1` and `availableStock`).
  - `Add to Cart` button (disabled if `stock === 0`).
  - `Buy Now` button (bypasses to direct checkout with selected item).

---

### 3.3 Shopping Cart Engine

- **Persistence:** Database-backed cart for authenticated users; persistent across devices.
- **Item Schema in Cart:** Product ID reference, snapshot title, snapshot image, snapshot price, chosen quantity, calculated subtotal.
- **Cart Calculations:**
  $$\text{Subtotal} = \sum (\text{item.price} \times \text{item.quantity})$$
  $$\text{Discount Total} = \sum (\text{item.discountAmount} \times \text{item.quantity})$$
  $$\text{Shipping Fee} = \text{Subtotal} > \text{Threshold} \ ? \ 0 : \text{StandardRate}$$
  $$\text{Final Total} = \text{Subtotal} - \text{Discount Total} + \text{Shipping Fee}$$
- **Real-Time Dynamic Constraints:**
  - Increasing quantity validates against real-time backend inventory.
  - Display inline warning: *"Only X items available in stock"* if requested quantity exceeds stock.
  - Auto-recalculate financial summaries whenever quantity changes or items are removed.
  - `Clear Cart` action with modal confirmation.

---

### 3.4 Checkout & Payment Pipeline

#### 3.4.1 Checkout Workflow
1. **Customer Information:** Auto-populated from profile (Name, Email, Verified Phone Number).
2. **Shipping Address Form:**
   - Full Name, Mobile Number, Street Address, Apartment/Suite, City, State/Province, Postal Code/Pincode, Country.
   - Server-side validation for address format and mandatory inputs.
3. **Order Review Summary:** Non-editable line item verification, shipping cost, tax, final payable amount.
4. **Backend Price & Stock Integrity Guarantee:**
   - Client sends **ONLY** shipping address, payment method choice, and cart intent.
   - **Backend fetches products directly from the database**, confirms stock availability, applies current verified prices, and computes the authoritative total amount.
   - Frontend price parameters are explicitly ignored to prevent client tampering.

#### 3.4.2 Payment Gateway Flow & Error Handling
```
[User on Checkout] 
       │
       ▼
[POST /api/orders/initiate] ──► (Backend locks inventory & creates Pending Order)
       │
       ▼
[Payment Gateway Request (Stripe/Razorpay/Simulated)]
       │
       ├───► [Payment Succeeded] ──► [POST /api/orders/verify-payment]
       │                                     │
       │                                     ▼
       │                            [Backend Verifies Signature / Webhook]
       │                                     │
       │                                     ▼
       │                            [Order: Confirmed | Payment: Paid]
       │                                     │
       │                                     ▼
       │                            [Deduct Inventory | Clear Cart]
       │
       └───► [Payment Failed / Aborted]
                     │
                     ▼
            [Order: Payment Failed | Payment: Failed]
                     │
                     ▼
            [Release Reserved Inventory | Retain Items in Cart]
                     │
                     ▼
            [Display Error Screen with 'Retry Payment' CTA]
```

---

### 3.5 Order Management & Tracking

#### 3.5.1 Order Data Representation
Each order is assigned an immutable alphanumeric Order ID (e.g. `ORD-20261003-9821`) containing:
- Customer ID reference & full customer snapshot.
- Array of purchased items (Product ID, snapshot name, image, unit price, quantity).
- Financial ledger (subtotal, discount, shipping, tax, total paid).
- Shipping address snapshot.
- Payment details (Method, Transaction ID, Payment Status).
- Order Status and audit log timestamps (`placedAt`, `confirmedAt`, `packedAt`, `shippedAt`, `deliveredAt`, `cancelledAt`).

#### 3.5.2 Order Lifecycle State Machine
```
[ Pending ] ──► [ Confirmed ] ──► [ Packed ] ──► [ Shipped ] ──► [ Out for Delivery ] ──► [ Delivered ]
     │               │
     └──► [ Cancelled / Payment Failed ]
```
- **Allowed Transitions:** Strict directional forward progression; non-admins cannot advance status; cancelled orders release inventory back to stock.

#### 3.5.3 Chronological Stepped Order Tracking UI
- Interactive milestone progress bar highlighting completed steps (green checkmark), current active state (pulsing blue node), and upcoming states (grey node).
- Timestamps associated with each transition.
- Courier tracking number and carrier details when status is `Shipped` or `Out for Delivery`.

---

### 3.6 User Profile & Asset Management

- **Personal Information:** View and edit full name, phone number, and default delivery addresses.
- **Profile Photo Management:**
  - Upload avatar (`.jpg`, `.jpeg`, `.png`, `.webp`, max 5MB).
  - Preview before upload with crop/thumbnail generation.
  - Dedicated `Remove Photo` button that deletes file from server/storage and resets to default avatar.
- **Resume / Document Upload:**
  - Upload candidate/vendor resume (`.pdf`, `.doc`, `.docx`, max 10MB).
  - Secure download and in-app viewing link.
  - Dedicated `Delete Resume` action with confirmation.

---

### 3.7 Admin Command Center

#### 3.7.1 Analytical Dashboard
- **KPI Metrics Cards:** Total Revenue ($), Total Orders, Total Registered Users, Total Active Products.
- **Operational Metrics:** Pending Orders requiring fulfillment, Low-stock alerts (`stock <= 5`).
- **Recent Activity Tables:** Latest 10 orders with quick status badges and direct customer links.

#### 3.7.2 Product Catalog Management (CRUD)
- **Create Product:** Form with validation for name, SKU, category, brand, description, cost price, selling price, discount percentage, stock count, and multi-file image uploader.
- **Edit Product:** Real-time updates with instantaneous stock replenishment/reduction.
- **Delete Product:** Soft/Hard delete with destructive confirmation modal (*"Are you sure you want to delete this product? This action cannot be undone."*).

#### 3.7.3 Order Management
- Tabular view of all platform orders with searchable filters: Order ID, customer email, payment status (`Paid`, `Pending`, `Failed`), order status (`Pending`, `Confirmed`, `Packed`, `Shipped`, `Delivered`, `Cancelled`), date range.
- Order details inspector with dropdown to execute legal order status updates.

#### 3.7.4 User Directory
- List of all registered accounts with role tags (`user`, `admin`), registration date, order count, and total spend.

---

## 4. Real-World Concurrency & Edge-Case Engineering

| Scenario / Edge Case | Production Threat | Architectural Solution |
| :--- | :--- | :--- |
| **Race Condition on Last Item** | Two users purchase the single remaining unit simultaneously; causes negative stock. | Use MongoDB atomic conditional updates: `Product.findOneAndUpdate({ _id: productId, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. If result is null, abort checkout and return `409 Conflict: Insufficient stock`. |
| **Price Tampering mid-session** | Admin raises price from \$50 to \$100 while item is in user's cart. | Server recalculates current price on checkout initiation from database. User is informed: *"Prices for some items have updated"*. |
| **Product Deletion with Active Cart** | Product is hard-deleted while present in active carts. | Cart query populates product reference; if product is `null`, filter out invalid item and alert user: *"An item in your cart is no longer available and was removed"*. |
| **Payment Abandonment / Timeout** | User opens payment window but closes browser tab. | Orders default to `Pending`. A background job / TTL expires unpaid orders after 30 minutes, freeing reserved stock. |
| **Database Server Downtime** | MongoDB connection drops or throws network timeout. | Global error-handling middleware catches connection faults, returns standardized `503 Service Unavailable` with friendly message: *"Our servers are currently under maintenance. Please try again shortly."* |
| **Malicious File Payload** | Attacker uploads executable script disguised as `.jpg`. | Backend validates file magic bytes via `file-type` or `multer` mime filter, sanitizes filename, and stores in secure storage / cloud bucket (e.g. Cloudinary/S3). |

---

## 5. Database Schema & Data Models (MongoDB/Mongoose)

### 5.1 `User` Model
```javascript
{
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  profilePhoto: {
    url: { type: String, default: null },
    publicId: { type: String, default: null }
  },
  resume: {
    url: { type: String, default: null },
    originalName: { type: String, default: null },
    publicId: { type: String, default: null },
    uploadedAt: { type: Date, default: null }
  },
  addresses: [{
    fullName: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    isDefault: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.2 `Product` Model
```javascript
{
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
  category: { type: String, required: true, index: true },
  brand: { type: String, default: 'Generic' },
  stock: { type: Number, required: true, min: 0, default: 0, index: true },
  images: [{
    url: { type: String, required: true },
    publicId: { type: String }
  }],
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isFeatured: { type: Boolean, default: false, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.3 `Cart` Model
```javascript
{
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    priceAtAddition: { type: Number, required: true }
  }],
  updatedAt: { type: Date, default: Date.now }
}
```

### 5.4 `Order` Model
```javascript
{
  orderNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true }
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentInfo: {
    method: { type: String, enum: ['Card', 'UPI', 'NetBanking', 'COD', 'Stripe', 'Razorpay'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending', index: true },
    transactionId: { type: String, default: null }
  },
  pricing: {
    subtotal: { type: Number, required: true },
    discountTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    finalTotal: { type: Number, required: true }
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  statusTimeline: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: { type: String }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

---

## 6. REST API Endpoints Specification

### 6.1 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account with optional avatar. |
| `POST` | `/api/auth/login` | Public | Authenticate credentials and issue JWT. |
| `POST` | `/api/auth/logout` | Authenticated | Invalidate user session. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve currently authenticated user payload. |

### 6.2 User Profile & Files (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Authenticated | Get full profile with document metadata. |
| `PUT` | `/api/users/profile` | Authenticated | Update personal info (name, addresses). |
| `POST` | `/api/users/profile/photo` | Authenticated | Upload new profile photo (`multipart/form-data`). |
| `DELETE` | `/api/users/profile/photo` | Authenticated | Remove existing profile photo. |
| `POST` | `/api/users/profile/resume` | Authenticated | Upload resume file (`pdf/doc`). |
| `DELETE` | `/api/users/profile/resume` | Authenticated | Remove existing resume. |
| `GET` | `/api/users` | Admin Only | Paginated list of all platform users. |
| `GET` | `/api/users/:id` | Admin Only | Single user drill-down. |

### 6.3 Products Catalog (`/api/products`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Public | Search, filter, sort, and paginate product catalog. |
| `GET` | `/api/products/categories` | Public | Get list of distinct product categories. |
| `GET` | `/api/products/:id` | Public | Get complete product details by ID or Slug. |
| `POST` | `/api/products` | Admin Only | Create new product with image uploads. |
| `PUT` | `/api/products/:id` | Admin Only | Update product details and inventory. |
| `DELETE` | `/api/products/:id` | Admin Only | Delete product from database. |

### 6.4 Cart Management (`/api/cart`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/cart` | Authenticated | Retrieve active user cart with live product details. |
| `POST` | `/api/cart` | Authenticated | Add item to cart with quantity validation. |
| `PUT` | `/api/cart/:productId` | Authenticated | Update quantity of a specific item. |
| `DELETE` | `/api/cart/:productId` | Authenticated | Remove single product from cart. |
| `DELETE` | `/api/cart` | Authenticated | Clear all items from cart. |

### 6.5 Orders & Checkout (`/api/orders`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/orders` | Authenticated | Process checkout, validate stock, create order. |
| `POST` | `/api/orders/verify-payment` | Authenticated | Confirm payment gateway status and settle stock. |
| `GET` | `/api/orders/my-orders` | Authenticated | Get order history of logged-in user. |
| `GET` | `/api/orders/:id` | Authenticated | Get detailed single order & tracking status. |
| `GET` | `/api/orders` | Admin Only | List all system orders with filters. |
| `PUT` | `/api/orders/:id/status` | Admin Only | Transition order status (`Confirmed`, `Shipped`, etc.). |
| `GET` | `/api/orders/admin/stats` | Admin Only | Aggregate KPIs: revenue, counts, order distributions. |

---

## 7. Frontend UI/UX Architecture & Page Sitemap

```
┌────────────────────────────────────────────────────────┐
│                      Public Pages                      │
├───────────────────┬───────────────────┬────────────────┤
│  /                │  /products        │  /products/:id │
│  (Homepage)       │  (Catalog/Search) │  (Details)     │
├───────────────────┼───────────────────┼────────────────┤
│  /login           │  /register        │                │
│  (Authentication) │  (Account Signup) │                │
└───────────────────┴───────────────────┴────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Customer Portal Pages                  │
├───────────────────┬───────────────────┬────────────────┤
│  /cart            │  /checkout        │  /profile      │
│  (Live Cart)      │  (Address & Pay)  │  (Docs/Photo)  │
├───────────────────┼───────────────────┼────────────────┤
│  /orders          │  /orders/:id      │                │
│  (Order History)  │  (Visual Tracking)│                │
└───────────────────┴───────────────────┴────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                 Admin Command Center                   │
├───────────────────┬───────────────────┬────────────────┤
│  /admin           │  /admin/products  │  /admin/orders │
│  (KPI Dashboard)  │  (Catalog CRUD)   │  (Fulfillment) │
├───────────────────┼───────────────────┼────────────────┤
│  /admin/users     │                   │                │
│  (User Directory) │                   │                │
└───────────────────┴───────────────────┴────────────────┘
```

### 7.1 Mandatory UI States for All Data Views
1. **Loading State:** Skeleton loaders and discreet top progress indicators. Never show un-styled white screens.
2. **Empty State:** Distinct illustrated empty states for Empty Cart, No Products Found, No Orders Placed, and No Users.
3. **Error State:** Non-blocking toast notifications for operational errors and full-screen recovery views for fatal errors.
4. **Success State:** Action confirmation toasts, confetti triggers on order confirmation, and modal alerts.

---

## 8. Security, Validation & Reliability Standards

- **Input Sanitization & Validation:** Implement centralized schemas using `zod` or `express-validator` on all route parameters and request bodies.
- **Password Security:** Salted hashing with `bcryptjs`. Minimum entropy rules enforced.
- **JWT Protection:** Short-lived access tokens with cryptographic verification.
- **CORS & Rate Limiting:** Enforce `express-rate-limit` on `/api/auth/*` (e.g. max 10 requests per 15 minutes per IP) to prevent brute-force attacks.
- **Environment Isolation:** Zero credentials or secrets in source code. All keys injected via `.env` (`PORT`, `MONGODB_URI`, `JWT_SECRET`, `PAYMENT_SECRET`, `CLOUDINARY_URL`).
- **File Upload Safety:** Strict MIME type whitelist (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`), size limits (5MB images, 10MB PDFs), and randomized storage paths.

---

## 9. Scalable Project Directory Structure

```
ecommerce-platform/
├── backend/
│   ├── src/
│   │   ├── config/             # DB connection, env loader, cloudinary/s3 config
│   │   ├── controllers/        # Request handlers (auth, product, cart, order, user)
│   │   ├── middleware/         # authMiddleware, adminMiddleware, uploadMiddleware, errorHandler
│   │   ├── models/             # Mongoose schemas (User, Product, Cart, Order)
│   │   ├── routes/             # Express route declarations
│   │   ├── services/           # Payment processing, calculation engines, email notifications
│   │   ├── utils/              # Custom ApiError, ApiResponse, asyncHander, validators
│   │   └── server.js           # Express app bootstrap & cluster setup
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/                # Axios instance, API client functions
│   │   ├── assets/             # Icons, logos, illustrations
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Button, Modal, Loader, Toast, Skeleton
│   │   │   ├── product/        # ProductCard, FilterSidebar, ImageGallery, RatingStars
│   │   │   ├── cart/           # CartItem, OrderSummaryCard
│   │   │   ├── checkout/       # AddressForm, PaymentSelector
│   │   │   └── admin/          # AdminSidebar, StatsCard, ProductTable, OrderStatusDropdown
│   │   ├── context/            # AuthContext, CartContext, NotificationContext
│   │   ├── hooks/              # useAuth, useCart, useDebounce, useFetch
│   │   ├── pages/              # Home, Catalog, ProductDetail, Cart, Checkout, Orders, Tracking, Profile, Admin
│   │   ├── routes/             # AppRoutes, ProtectedRoute, AdminRoute
│   │   ├── styles/             # Tailwind config, global CSS
│   │   └── App.jsx
│   ├── .env.example
│   └── package.json
│
└── README.md
```

---

## 10. Verification & Quality Assurance Matrix

| Test Domain | Test Case / Scenario | Expected Outcome |
| :--- | :--- | :--- |
| **Auth** | Attempt registration with existing email | Returns `409 Conflict` with clear error message. |
| **Auth** | Non-logged-in user tries to access `/cart` or `/profile` | Redirects to `/login` with return URL intact. |
| **RBAC** | Regular user attempts `POST /api/products` or visits `/admin` | Returns `403 Forbidden`; unauthorized screen displayed. |
| **Catalog** | Search "wireless" with price filter \$20-\$50 | Returns filtered subsets matching both criteria accurately. |
| **Cart** | Add quantity greater than available stock | Clamps to maximum available stock; shows explanatory alert. |
| **Checkout** | Manipulate client-side price payload before checkout | Backend computes price from DB; manipulated price has zero effect. |
| **Stock** | Complete purchase of 2 units of Product X (original stock: 5) | Product X stock immediately drops to 3 in database. |
| **Payment** | Payment gateway cancellation / failure trigger | Order marked `Payment Failed`; stock not decremented; cart intact. |
| **Tracking** | Admin transitions order from `Confirmed` to `Shipped` | Customer tracking page updates to step 4 with timestamp. |
| **Profile** | Upload 15MB `.exe` file as profile photo | Request rejected with `400 Bad Request: Invalid file type and size`. |

---

## 11. Definition of Done & Success Criteria

The system will be certified production-ready upon passing all criteria:
1. **Seamless User Lifecycle:** Functional registration, login, catalog search, cart operations, atomic checkout, and profile asset management.
2. **Bulletproof RBAC:** Total isolation of admin controls and endpoints.
3. **Data & Transaction Safety:** Guaranteed stock consistency under high concurrency with backend price calculation.
4. **Resilient UI/UX:** Responsive across Mobile, Tablet, and Desktop with complete loading, empty, and error states.
5. **Clean & Scalable Codebase:** Modular MVC architecture with complete separation of concerns and zero hardcoded secrets.
