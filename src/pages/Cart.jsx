import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ArrowRight, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeItem, clearCart, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Your Cart is Waiting</h2>
        <p className="text-xs text-gray-500">Sign in to retrieve your saved cart items and complete your purchase.</p>
        <Link
          to="/login"
          className="inline-block w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
        >
          Sign In to ShopSphere
        </Link>
      </div>
    );
  }

  const items = cart?.items || [];
  const itemsPrice = cart?.totalAmount || 0;
  const shippingPrice = itemsPrice > 50 || items.length === 0 ? 0 : 10;
  const taxPrice = Math.round((itemsPrice * 0.18) * 100) / 100;
  const finalTotal = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-gray-100 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900">Your Cart is Empty</h2>
        <p className="text-xs text-gray-500">Explore our catalog and find the products that fit your lifestyle.</p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Shopping Cart</h1>
          <p className="text-xs text-gray-500 mt-0.5">{cart.totalItems} items in your bag</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-red-500 hover:underline font-semibold"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.productId}
              className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              <img
                src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop&q=80'}
                alt={item.name}
                className="w-20 h-20 rounded-xl object-cover bg-gray-50 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <Link
                  to={`/products/${item.productId}`}
                  className="text-sm font-bold text-gray-900 hover:text-emerald-600 truncate block"
                >
                  {item.name}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">Unit Price: ${Number(item.price).toFixed(2)}</p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition rounded-l-lg"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-bold text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-1 text-gray-600 hover:bg-gray-200 transition rounded-r-lg"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-400 hover:text-red-500 transition p-1"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-xs text-gray-400">Subtotal</span>
                <p className="text-base font-bold text-gray-900">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-gray-900">${itemsPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Estimated Shipping</span>
              <span className="font-semibold text-gray-900">
                {shippingPrice === 0 ? <span className="text-emerald-600">FREE</span> : `$${shippingPrice.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax (18% GST)</span>
              <span className="font-semibold text-gray-900">${taxPrice.toFixed(2)}</span>
            </div>

            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-bold text-gray-900">
              <span>Grand Total</span>
              <span className="text-xl text-emerald-600 font-extrabold">${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Encrypted 256-bit checkout through API Gateway &amp; Microservices.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
