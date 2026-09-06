# 🌟 NEXUS Commerce | Multi-Vendor Marketplace Ecosystem

---

## 📖 Overview

**NEXUS Commerce** is an enterprise-grade, full-stack MERN multi-vendor marketplace platform. It consists of **4 independent frontend applications** synchronized with a high-performance **Node.js/Express + Socket.IO REST & Real-Time Engine**.

The platform provides end-to-end multi-vendor commerce: from multi-merchant cart checkouts and vendor order fulfillment, to real-time dispatch, turn-by-turn live GPS delivery tracking, and 4-digit customer delivery OTP verification.

---

## 🏛️ Ecosystem Architecture & Portals

| Portal | Port (Local) | Target Audience | Primary Features |
| :--- | :---: | :--- | :--- |
| **🛒 Customer Storefront** (`/client`) | `5173` | End Shoppers | Product Catalog, Live City Delivery Selector, Multi-Vendor Checkout, Wishlist, per-product order stage tracking |
| **🏪 Vendor & Seller Hub** (`/vendor`) | `5176` | Merchants / Brands | Store Analytics, Product Catalog CRUD, Order Confirmation & Packing, Ready-for-Pickup Dispatch |
| **👑 Admin Command Center** (`/admin`) | `5174` | Platform Superadmins | Multi-Vendor Approval / Onboarding, Revenue & Commission Analytics, Global Order & User Moderation |
| **🚴 Delivery Fleet App** (`/delivery`) | `5175` | Delivery Partners | Real-Time Pickup Radar, Live Leaflet/OSM Route Map, Turn-by-Turn GPS navigation, 4-digit OTP Verification |
| **⚙️ Unified API & Real-time Engine** (`/server`) | `5000` | All 4 Frontends | Central REST API, MongoDB Database Models, Socket.IO Real-Time Dispatch & Location Broadcaster |

---

## 📁 Project Directory Structure

```text
Commerce platform/
├── ⚙️ server/                     # Unified Backend API & Socket.IO Real-Time Server
│   ├── config/db.js              # MongoDB Connection & Auto-Reconnection Logic
│   ├── controllers/              # Vendor, Admin, Product, Order, Delivery Controllers
│   ├── middleware/               # Role Guards (vendorOnly, adminOnly, protect, rateLimit)
│   ├── models/                   # User, Product, Category, Order, Review, Chat, Coupon
│   ├── routes/                   # Dual REST Endpoints (/auth, /api/auth, /vendor, /api/vendor...)
│   ├── seed/                     # Multi-vendor database seeder script
│   ├── server.js                 # Express Application & WebSocket Gateway
│   └── vercel.json               # Serverless backend configuration
│
├── 🛒 client/                     # Customer Storefront (Vite + React + Tailwind)
│   ├── src/components/           # Navbar, Footer, ProductCard, LiveRouteMap, CartDrawer
│   ├── src/pages/                # HomePage, ShopPage, ProductPage, Checkout, OrdersPage
│   ├── src/context/              # Auth, Cart, Wishlist, Toast Context Providers
│   └── vercel.json               # SPA Client Rewrite Config
│
├── 🏪 vendor/                     # Standalone Merchant Hub (Vite + React)
│   ├── src/pages/                # VendorDashboard, ProductManager, OrderFulfillment, Profile
│   ├── src/context/              # VendorAuthContext, ToastContext
│   └── vercel.json               # SPA Vendor Rewrite Config
│
├── 👑 admin/                      # Super Admin Command Center (Vite + React)
│   ├── src/pages/                # AdminDashboard, VendorApprovals, ProductCatalog, Orders, Users
│   ├── src/context/              # AdminAuthContext, ToastContext
│   └── vercel.json               # SPA Admin Rewrite Config
│
└── 🚴 delivery/                   # Delivery Partner Dispatch Portal (Vite + React)
    ├── src/pages/                # AvailableTrips, ActiveInTransitPage, CompletedHistory, Profile
    ├── src/components/           # LiveRouteMap, OtpVerificationModal
    ├── src/context/              # DeliveryAuthContext, SocketContext, ToastContext
    └── vercel.json               # SPA Delivery Rewrite Config
```

---

## ⚡ Quick Start Guide (Local Setup)

### 1. Clone & Install Dependencies

```bash
# 1. Setup Backend
cd server
npm install

# 2. Setup Client (Customer)
cd ../client
npm install

# 3. Setup Vendor Portal
cd ../vendor
npm install

# 4. Setup Admin Portal
cd ../admin
npm install

# 5. Setup Delivery App
cd ../delivery
npm install
```

---

### 2. Run Development Servers

Open separate terminal tabs or run them together:

| Application | Command | Local URL |
| :--- | :--- | :--- |
| **Backend Server** | `cd server && npm run dev` | `http://localhost:5000` |
| **Customer Store** | `cd client && npm run dev` | `http://localhost:5173` |
| **Admin Command** | `cd admin && npm run dev` | `http://localhost:5174` |
| **Delivery Portal** | `cd delivery && npm run dev` | `http://localhost:5175` |
| **Vendor Hub** | `cd vendor && npm run dev` | `http://localhost:5176` |

> **Note on Database Seed:**
> To reset the database and seed realistic demo products, vendors, and categories, run:
> ```bash
> cd server && npm run seed
> ```
> *(Or trigger via API: `POST http://localhost:5000/api/seed/reset`)*

---

## 🔑 Pre-Configured Demo Credentials

All test accounts come pre-seeded with sample data:

| Portal | Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- | :--- |
| 👑 **Admin** | Super Administrator | `admin@nexus.com` | `password123` | Full control, vendor approvals, metrics, commissions |
| 🏪 **Vendor 1** | Apex Hardware Tools | `vendor@nexus.com` | `password123` | Manage power tools & equipment, pack & dispatch orders |
| 🏪 **Vendor 2** | Prime Interiors & Decor | `decor@nexus.com` | `password123` | Manage lighting & luxury home decor, fulfill orders |
| 🏪 **Vendor 3** | BuildCraft Materials | `materials@nexus.com` | `password123` | Manage structural supplies, cements, civil hardware |
| 🏪 **Vendor 4** | New Merchant *(Pending)* | `pending@nexus.com` | `password123` | Demo for Admin Onboarding/Approval workflow |
| 🚴 **Delivery 1** | Express Courier Rider | `rider@nexus.com` | `password123` | Claim vendor pickups, GPS navigation, OTP verify |
| 🚴 **Delivery 2** | Swift Cargo Rider | `rider2@nexus.com` | `password123` | Pickup trips across city coverage |
| 👤 **Customer 1** | Regular Shopper | `vikram@example.com` | `password123` | Multi-vendor cart, order stage tracking, profile |
| 👤 **Customer 2** | Verified Customer | `priya@example.com` | `password123` | Multi-item checkout, reviews & ratings |

---

## 🔄 End-to-End Fulfillment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Customer as 🛒 Customer (Client)
    participant Server as ⚙️ Nexus Backend
    actor Vendor as 🏪 Merchant (Vendor)
    actor Rider as 🚴 Delivery Partner
    actor Admin as 👑 Super Admin

    Customer->>Server: Places Multi-Vendor Order
    Server->>Server: Splits order line-items per Vendor
    Server-->>Vendor: Notifies Vendor of New Order (Socket.IO)
    Vendor->>Server: Confirms Order & Packs Items
    Vendor->>Server: Marks Order "Ready for Pickup"
    Server-->>Rider: Real-time broadcast "new_order_available"
    Rider->>Server: Claims Order (Atomic lock)
    Rider->>Vendor: Navigates to Vendor Store & Collects Package
    Rider->>Server: Updates status: "Out for Delivery"
    Rider->>Customer: Real-time GPS location stream on map
    Customer->>Rider: Provides 4-digit Delivery OTP
    Rider->>Server: Submits OTP & Confirms Payment (COD/Prepaid)
    Server-->>Customer: Marks Order "Delivered"
    Server-->>Admin: Updates Platform Revenue & Commission
```

---

## 🌐 Production Deployment (Vercel)

Every frontend and backend is configured with production-ready `vercel.json` configurations.

### 1. Environment Variables (`.env`)

#### ⚙️ Backend (`/server`):
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/nexus_db
JWT_SECRET=your_super_secret_jwt_key_here
RAZORPAY_KEY_ID=rzp_test_your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

#### 💻 Frontends (`/client`, `/admin`, `/vendor`, `/delivery`):
```env
VITE_API_URL=https://your-backend-api.vercel.app
```
*(The backend handles dual route mounting, meaning requests resolve seamlessly whether matching `/products` or `/api/products`)*

---

### 2. Vercel Deployment Steps

1. **Connect Repository:** Import this repository into Vercel (https://vercel.com).
2. **Deploy Backend (`server`):**
   - Under **Root Directory**, choose `server`.
   - Add backend Environment Variables (`MONGO_URI`, `JWT_SECRET`, `NODE_ENV`).
   - Click **Deploy** and note your deployed backend URL (`https://your-backend.vercel.app`).
3. **Deploy the 4 Frontends (`client`, `admin`, `vendor`, `delivery`):**
   - Create 4 separate Vercel projects from the same repository.
   - For each project, set the **Root Directory** to its folder (`client`, `admin`, `vendor`, or `delivery`).
   - Add the environment variable: `VITE_API_URL = https://your-backend.vercel.app`.
   - Click **Deploy**.

---

## 🛡️ Security & Performance Highlights

- **Role-Based Access Control (RBAC):** Dedicated middleware for Super Admin, Verified Vendors, Active Delivery Riders, and Authenticated Customers.
- **Atomic Locking on Order Dispatch:** Prevents multiple delivery riders from claiming the same order simultaneously.
- **Customer Delivery OTP Verification:** 4-digit dynamic OTP verification ensures packages are only marked delivered upon verified customer handoff.
- **Live GPS Broadcasting:** Low-latency Socket.IO room subscriptions for instant location sync without database polling overhead.
- **SPA Rewrites:** Pre-configured `vercel.json` files eliminate 404 errors on page refreshes.

---

## 📜 License

This project is licensed under the **MIT License** — feel free to customize and expand for your commercial or personal projects!
