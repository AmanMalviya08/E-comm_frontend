# 🛍️ ShopSphere - Frontend Web Application

Modern, production-grade e-commerce frontend built with **React 18**, **Vite**, and **Tailwind CSS**. Connects to the ShopSphere Microservices ecosystem via an Express API Gateway.

---

## ✨ Features

- 🌟 **Home Page**: Hero banner, featured products, category highlights, trust features.
- 🔍 **Product Catalog**: Live search, category filters, price range, sorting, and pagination.
- 📦 **Product Details**: Image gallery, stock counters, ratings, add to cart, and instant purchase.
- 🛒 **Shopping Cart**: Real-time quantity controls, dynamic price calculation, and subtotal breakdown.
- 💳 **Secure Checkout**: Shipping address management, payment method selection (Card, UPI, COD), and simulation failure toggle.
- 📋 **Order Management**: Order lifecycle tracking (`placed` → `processing` → `shipped` → `delivered` → `cancelled`) with itemized invoices.
- 👤 **User Profile**: Personal info, saved delivery addresses with edit and delete support.
- 🛡️ **Admin Console**: Full CRUD operations for Products, Categories, Orders, and User Roles with live metrics.
- 🔐 **Authentication**: JWT token storage, automatic request header injection via Axios interceptors, 1-click demo login buttons.

---

## 🛠️ Tech Stack

- **Framework**: React 18
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Routing**: React Router DOM v6
- **State Management**: React Context API (`AuthContext`, `CartContext`)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root of the client directory:
```env
VITE_API_GATEWAY_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
