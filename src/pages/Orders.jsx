import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Truck, AlertCircle, ShoppingBag, CreditCard } from 'lucide-react';
import api from '../services/api';

const statusColors = {
  placed: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-amber-50 text-amber-700 border-amber-200',
  shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200'
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const location = useLocation();
  const [bannerMessage, setBannerMessage] = useState(location.state?.message || null);
  const [bannerType, setBannerType] = useState(location.state?.type || 'info');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/my-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setActionLoading(true);
      const res = await api.put(`/orders/${orderId}/cancel`);
      if (res.data.success) {
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error cancelling order');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayNow = async (order) => {
    try {
      setActionLoading(true);
      const res = await api.post('/payments/process', {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod || 'card',
        simulateFail: false
      });
      if (res.data.success) {
        alert('Payment completed successfully!');
        fetchOrders();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment simulation failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">My Orders</h1>
        <p className="text-xs text-gray-500 mt-1">Track lifecycle, review items, and manage delivery</p>
      </div>

      {bannerMessage && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-sm ${
          bannerType === 'error'
            ? 'bg-amber-50 text-amber-900 border border-amber-200'
            : 'bg-emerald-50 text-emerald-900 border border-emerald-200'
        }`}>
          <div className="flex items-center gap-2">
            {bannerType === 'error' ? <AlertCircle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600" />}
            <span>{bannerMessage}</span>
          </div>
          <button onClick={() => setBannerMessage(null)} className="text-xs font-bold hover:underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(n => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-gray-100 animate-pulse h-40"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="max-w-md mx-auto my-16 bg-white p-8 rounded-3xl border border-gray-100 text-center space-y-4">
          <Package className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-lg font-bold text-gray-800">No orders yet</h3>
          <p className="text-xs text-gray-500">You haven't placed any orders with ShopSphere yet.</p>
          <Link
            to="/products"
            className="inline-block bg-emerald-600 text-white font-bold text-xs py-2.5 px-6 rounded-full hover:bg-emerald-700 transition"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition"
            >
              {/* Card Header */}
              <div className="bg-gray-50/70 p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">#{order._id.substring(order._id.length - 8).toUpperCase()}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${statusColors[order.orderStatus] || 'bg-gray-100'}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-xs text-gray-400 block">Total Amount</span>
                    <span className="text-base font-extrabold text-gray-900">${order.totalAmount?.toFixed(2)}</span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 block">Payment</span>
                    <span className={`text-xs font-bold ${
                      order.paymentStatus === 'completed' ? 'text-emerald-600' : order.paymentStatus === 'failed' ? 'text-red-500' : 'text-amber-500'
                    }`}>
                      {order.paymentStatus?.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items in order */}
              <div className="p-4 sm:p-6 space-y-4">
                <div className="divide-y divide-gray-50">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-14 h-14 rounded-xl object-cover bg-gray-50 shrink-0"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.name}</p>
                          <p className="text-xs text-gray-400">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Delivery & Action details */}
                <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4 text-xs">
                  <div className="text-gray-500">
                    <span className="font-semibold text-gray-700">Shipping to:</span> {order.shippingAddress?.street}, {order.shippingAddress?.city} ({order.shippingAddress?.postalCode})
                  </div>

                  <div className="flex items-center gap-2">
                    {order.paymentStatus !== 'completed' && order.orderStatus !== 'cancelled' && (
                      <button
                        onClick={() => handlePayNow(order)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay Now
                      </button>
                    )}

                    {!['shipped', 'delivered', 'cancelled'].includes(order.orderStatus) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 font-semibold rounded-xl transition"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
