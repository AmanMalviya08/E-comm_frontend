import React, { useState, useEffect } from 'react';
import {
  DollarSign, Package, ShoppingCart, Plus, Edit2, Trash2,
  CheckCircle, AlertCircle, RefreshCw, ShieldCheck, Activity,
  Users, Eye, X, Star, ArrowUpDown
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'products' | 'categories' | 'users' | 'health'

  // Orders State
  const [orders, setOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);

  // Products State
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Categories State
  const [categories, setCategories] = useState([]);

  // Users State
  const [usersList, setUsersList] = useState([]);

  // Modals & form state
  const [productModalMode, setProductModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingProductId, setEditingProductId] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: 20,
    brand: 'ShopSphere',
    isFeatured: false,
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80']
  });

  const [categoryModalMode, setCategoryModalMode] = useState(null); // 'create' | 'edit' | null
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showToast = (msg, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    } else {
      setStatusMessage(msg);
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Load All Data
  const loadData = async () => {
    try {
      setLoading(true);
      const [ordRes, prodRes, catRes, userRes] = await Promise.all([
        api.get('/orders'),
        api.get('/products?limit=100'),
        api.get('/products/categories'),
        api.get('/auth/users').catch(() => ({ data: { success: false, users: [] } }))
      ]);

      if (ordRes.data.success) {
        setOrders(ordRes.data.orders);
        setTotalRevenue(ordRes.data.totalRevenue || 0);
        setTotalOrders(ordRes.data.total || ordRes.data.orders.length);
      }
      if (prodRes.data.success) {
        setProducts(prodRes.data.products);
      }
      if (catRes.data.success) {
        setCategories(catRes.data.categories);
        if (catRes.data.categories.length > 0 && !productForm.category) {
          setProductForm(f => ({ ...f, category: catRes.data.categories[0].name }));
        }
      }
      if (userRes.data?.success) {
        setUsersList(userRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      showToast('Error refreshing admin dashboard data', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- PRODUCT CRUD OPERATIONS ---
  const openCreateProductModal = () => {
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: categories[0]?.name || 'Electronics',
      stock: 20,
      brand: 'ShopSphere',
      isFeatured: false,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80']
    });
    setEditingProductId(null);
    setProductModalMode('create');
  };

  const openEditProductModal = (product) => {
    setEditingProductId(product._id);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      brand: product.brand || 'ShopSphere',
      isFeatured: Boolean(product.isFeatured),
      images: product.images && product.images.length ? product.images : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80']
    });
    setProductModalMode('edit');
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      if (productModalMode === 'create') {
        const res = await api.post('/products', productForm);
        if (res.data.success) {
          setProducts([res.data.product, ...products]);
          setProductModalMode(null);
          showToast(`Product "${res.data.product.name}" created successfully!`);
        }
      } else if (productModalMode === 'edit') {
        const res = await api.put(`/products/${editingProductId}`, productForm);
        if (res.data.success) {
          setProducts(products.map(p => p._id === editingProductId ? res.data.product : p));
          setProductModalMode(null);
          showToast(`Product "${res.data.product.name}" updated successfully!`);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving product', true);
    }
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${productName}"?`)) return;
    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setProducts(products.filter(p => p._id !== productId));
        showToast(`Product deleted successfully.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting product', true);
    }
  };

  // --- CATEGORY CRUD OPERATIONS ---
  const openCreateCategoryModal = () => {
    setCategoryForm({
      name: '',
      description: '',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
    });
    setEditingCategoryId(null);
    setCategoryModalMode('create');
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategoryId(cat._id);
    setCategoryForm({
      name: cat.name,
      description: cat.description || '',
      image: cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
    });
    setCategoryModalMode('edit');
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (categoryModalMode === 'create') {
        const res = await api.post('/products/categories', categoryForm);
        if (res.data.success) {
          setCategories([...categories, res.data.category]);
          setCategoryModalMode(null);
          showToast(`Category "${res.data.category.name}" created successfully!`);
        }
      } else if (categoryModalMode === 'edit') {
        const res = await api.put(`/products/categories/${editingCategoryId}`, categoryForm);
        if (res.data.success) {
          setCategories(categories.map(c => c._id === editingCategoryId ? res.data.category : c));
          setCategoryModalMode(null);
          showToast(`Category "${res.data.category.name}" updated successfully!`);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error saving category', true);
    }
  };

  const handleDeleteCategory = async (catId, catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      const res = await api.delete(`/products/categories/${catId}`);
      if (res.data.success) {
        setCategories(categories.filter(c => c._id !== catId));
        showToast(`Category "${catName}" deleted.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Error deleting category', true);
    }
  };

  // --- ORDER MANAGEMENT OPERATIONS ---
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      if (res.data.success) {
        setOrders(orders.map(o => o._id === orderId ? { ...o, orderStatus: newStatus } : o));
        if (selectedOrderDetails && selectedOrderDetails._id === orderId) {
          setSelectedOrderDetails({ ...selectedOrderDetails, orderStatus: newStatus });
        }
        showToast(`Order #${orderId.slice(-6).toUpperCase()} updated to "${newStatus}"`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update order status', true);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Delete order #${orderId.slice(-8).toUpperCase()} permanently?`)) return;
    try {
      const res = await api.delete(`/orders/${orderId}`);
      if (res.data.success) {
        setOrders(orders.filter(o => o._id !== orderId));
        if (selectedOrderDetails?._id === orderId) {
          setSelectedOrderDetails(null);
        }
        showToast(`Order #${orderId.slice(-8).toUpperCase()} deleted.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete order', true);
    }
  };

  // --- USER & AUTH ROLE OPERATIONS ---
  const handleToggleUserRole = async (targetUser) => {
    const newRole = targetUser.role === 'admin' ? 'customer' : 'admin';
    if (targetUser._id === currentAdmin?.id && newRole !== 'admin') {
      showToast('You cannot demote your own active admin account.', true);
      return;
    }
    if (!window.confirm(`Change role for ${targetUser.email} from "${targetUser.role}" to "${newRole}"?`)) return;

    try {
      const res = await api.put(`/auth/users/${targetUser._id}/role`, { role: newRole });
      if (res.data.success) {
        setUsersList(usersList.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
        showToast(`Updated ${targetUser.name}'s role to ${newRole}`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update user role', true);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser._id === currentAdmin?.id) {
      showToast('You cannot delete your own active admin account.', true);
      return;
    }
    if (!window.confirm(`Permanently delete user "${targetUser.name}" (${targetUser.email})?`)) return;

    try {
      const res = await api.delete(`/auth/users/${targetUser._id}`);
      if (res.data.success) {
        setUsersList(usersList.filter(u => u._id !== targetUser._id));
        showToast(`User ${targetUser.email} deleted.`);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete user', true);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.brand?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || p.category.toLowerCase() === productCategoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'all') return true;
    return o.orderStatus === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Admin Control Center</h1>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Complete platform management: Products CRUD, Categories CRUD, Order Lifecycle, and User Role Authorization
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Notifications */}
      {statusMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Paid Revenue</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Orders Placed</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{totalOrders}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Catalog Products</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{products.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Registered Users</p>
            <h3 className="text-2xl font-black text-gray-900 mt-1">{usersList.length}</h3>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-100 space-x-6 sm:space-x-8 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Orders Lifecycle ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'products'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Products CRUD ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'categories'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Categories CRUD ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          User Roles ({usersList.length})
        </button>
        <button
          onClick={() => setActiveTab('health')}
          className={`pb-3 text-sm font-bold border-b-2 transition whitespace-nowrap ${
            activeTab === 'health'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Architecture Health
        </button>
      </div>

      {/* ================= TAB 1: ORDERS ================= */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-gray-500 mr-1">Filter by Status:</span>
              {['all', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  className={`px-3 py-1 rounded-full font-bold capitalize transition ${
                    orderFilter === status
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Customer Email</th>
                    <th className="px-6 py-4">Total Amount</th>
                    <th className="px-6 py-4">Payment</th>
                    <th className="px-6 py-4">Lifecycle Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((ord) => (
                    <tr key={ord._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-gray-700">
                        #{ord._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {ord.userEmail || ord.userId}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">
                        ${ord.totalAmount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          ord.paymentStatus === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : ord.paymentStatus === 'failed'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord._id, e.target.value)}
                          className="text-xs font-semibold px-2.5 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-purple-600 shadow-xs cursor-pointer"
                        >
                          <option value="placed">Placed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrderDetails(ord)}
                            className="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="View Full Order Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(ord._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-xs text-gray-400 italic">
                        No orders match the selected filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: PRODUCTS CRUD ================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <input
                type="text"
                placeholder="Search products by title or brand..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl flex-1 focus:outline-none focus:border-emerald-500"
              />
              <select
                value={productCategoryFilter}
                onChange={(e) => setProductCategoryFilter(e.target.value)}
                className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="all">All Categories</option>
                {categories.map(c => (
                  <option key={c._id || c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={openCreateProductModal}
              className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Add New Product
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">Product Details</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Price</th>
                    <th className="px-6 py-4">Stock Inventory</th>
                    <th className="px-6 py-4">Featured</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={prod.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-gray-50 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <p className="font-semibold text-gray-800 truncate">{prod.name}</p>
                          <p className="text-[11px] text-gray-400">Brand: {prod.brand || 'ShopSphere'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">
                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-md">{prod.category}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900">${Number(prod.price).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold ${prod.stock > 5 ? 'text-emerald-600' : prod.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {prod.isFeatured ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3 fill-current" /> Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod._id, prod.name)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-xs text-gray-400 italic">
                        No products match the filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: CATEGORIES CRUD ================= */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={openCreateCategoryModal}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition"
            >
              <Plus className="w-4 h-4" /> Add New Category
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id || cat.name} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
                <div className="flex items-start gap-4">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-800 text-base">{cat.name}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1">{cat.description || 'No description provided'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-50 flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditCategoryModal(cat)}
                    className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat._id, cat.name)}
                    className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: USERS & AUTH ROLES ================= */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Current Role</th>
                    <th className="px-6 py-4">Registered Date</th>
                    <th className="px-6 py-4 text-right">Role Authorization &amp; Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersList.map((usr) => (
                    <tr key={usr._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {usr.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <span className="font-semibold text-gray-800">{usr.name}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-xs">{usr.email}</td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          usr.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-400">
                        {new Date(usr.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserRole(usr)}
                            disabled={usr._id === currentAdmin?.id}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                              usr.role === 'admin'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                            } ${usr._id === currentAdmin?.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Toggle User Role"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                            {usr.role === 'admin' ? 'Demote to Customer' : 'Promote to Admin'}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(usr)}
                            disabled={usr._id === currentAdmin?.id}
                            className={`p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ${
                              usr._id === currentAdmin?.id ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {usersList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-xs text-gray-400 italic">
                        No registered users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 5: ARCHITECTURE HEALTH ================= */}
      {activeTab === 'health' && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
            <Activity className="w-5 h-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-gray-900">Active Microservices Status &amp; Ports</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'API Gateway', port: '5000', db: 'None (Reverse Proxy)', desc: 'Routes traffic, intercepts tokens, enriches custom user headers' },
              { name: 'Auth Service', port: '5001', db: 'auth_db', desc: 'Registers users, hashes passwords, verifies JWT, manages roles' },
              { name: 'User Service', port: '5002', db: 'user_db', desc: 'Maintains user profile, addresses book, contact info' },
              { name: 'Product Service', port: '5003', db: 'product_db', desc: 'Catalog items, multi-category CRUD, stock management' },
              { name: 'Cart Service', port: '5004', db: 'cart_db', desc: 'Active shopping bag, item quantities, price recalculation' },
              { name: 'Order Service', port: '5005', db: 'order_db', desc: 'Order state machine, tax/shipping computation, stock deduction' },
              { name: 'Payment Service', port: '5006', db: 'payment_db', desc: 'Mock payment gateway simulation, card/UPI ledger' },
            ].map((svc) => (
              <div key={svc.name} className="p-4 rounded-2xl bg-gray-50 border border-gray-100 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-gray-900 text-sm">{svc.name}</h4>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Port {svc.port}
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{svc.desc}</p>
                <div className="text-[11px] font-mono text-gray-400 pt-1">
                  Database: <span className="font-semibold text-gray-700">{svc.db}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE OR EDIT PRODUCT ================= */}
      {productModalMode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {productModalMode === 'create' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={() => setProductModalMode(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Wireless Mouse"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Detailed specifications and key features..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="99.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Inventory Stock *</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Category *</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white"
                  >
                    {categories.map(c => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Brand</label>
                  <input
                    type="text"
                    value={productForm.brand}
                    onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Image URL</label>
                <input
                  type="text"
                  value={productForm.images[0] || ''}
                  onChange={(e) => setProductForm({ ...productForm, images: [e.target.value] })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.isFeatured}
                  onChange={(e) => setProductForm({ ...productForm, isFeatured: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>Featured Product (Highlighted on Home page)</span>
              </label>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setProductModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  {productModalMode === 'create' ? 'Create Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CREATE OR EDIT CATEGORY ================= */}
      {categoryModalMode && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {categoryModalMode === 'create' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button onClick={() => setCategoryModalMode(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gaming & VR"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Description</label>
                <input
                  type="text"
                  placeholder="Category description..."
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Cover Image URL</label>
                <input
                  type="text"
                  value={categoryForm.image}
                  onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                  className="w-full text-xs p-2.5 border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCategoryModalMode(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                >
                  {categoryModalMode === 'create' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ORDER DETAILS ================= */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Order #{selectedOrderDetails._id.slice(-8).toUpperCase()}
                </h3>
                <p className="text-xs text-gray-400">
                  Placed on {new Date(selectedOrderDetails.createdAt).toLocaleString()}
                </p>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                <span className="font-bold text-gray-500 uppercase tracking-wider block">Customer Info</span>
                <p className="font-semibold text-gray-800">{selectedOrderDetails.userEmail || 'Customer'}</p>
                <p className="text-gray-400">User ID: {selectedOrderDetails.userId}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl space-y-1">
                <span className="font-bold text-gray-500 uppercase tracking-wider block">Shipping Address</span>
                <p className="font-semibold text-gray-800">{selectedOrderDetails.shippingAddress?.street}</p>
                <p className="text-gray-600">
                  {selectedOrderDetails.shippingAddress?.city}, {selectedOrderDetails.shippingAddress?.state} - {selectedOrderDetails.shippingAddress?.postalCode}
                </p>
                <p className="text-gray-400">{selectedOrderDetails.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">Items Purchased</span>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl p-2 max-h-48 overflow-y-auto">
                {selectedOrderDetails.items?.map((item, idx) => (
                  <div key={idx} className="p-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-gray-400">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-purple-50/50 rounded-2xl space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Items Subtotal</span>
                <span>${selectedOrderDetails.itemsPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping Fee</span>
                <span>${selectedOrderDetails.shippingPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST)</span>
                <span>${selectedOrderDetails.taxPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-gray-900 border-t border-purple-100 pt-2">
                <span>Grand Total</span>
                <span className="text-purple-700">${selectedOrderDetails.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="text-[11px] text-gray-500 pt-1 flex justify-between">
                <span>Payment Method: <span className="font-bold uppercase">{selectedOrderDetails.paymentMethod}</span></span>
                <span>Status: <span className="font-bold uppercase text-emerald-600">{selectedOrderDetails.paymentStatus}</span></span>
              </div>
            </div>

            {/* Lifecycle Status Updater */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-700">Change Status:</span>
                <select
                  value={selectedOrderDetails.orderStatus}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrderDetails._id, e.target.value)}
                  className="text-xs font-bold px-3 py-1.5 border border-gray-200 rounded-xl bg-white focus:outline-none"
                >
                  <option value="placed">Placed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrderDetails(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
