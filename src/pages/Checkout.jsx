import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Truck, ShieldCheck, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = () => {
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });

  const [paymentMethod, setPaymentMethod] = useState('card');
  const [simulateFail, setSimulateFail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = cart?.items || [];
  const itemsPrice = cart?.totalAmount || 0;
  const shippingPrice = itemsPrice > 50 || items.length === 0 ? 0 : 10;
  const taxPrice = Math.round((itemsPrice * 0.18) * 100) / 100;
  const totalAmount = Math.round((itemsPrice + shippingPrice + taxPrice) * 100) / 100;

  // Load user saved addresses
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await api.get('/users/addresses');
        if (res.data.success && res.data.addresses?.length) {
          setAddresses(res.data.addresses);
        } else {
          setUseNewAddress(true);
        }
      } catch (err) {
        setUseNewAddress(true);
      }
    };
    loadAddresses();
  }, []);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError('');

    let finalAddress;
    if (useNewAddress || addresses.length === 0) {
      if (!newAddress.street || !newAddress.city || !newAddress.postalCode) {
        setError('Please complete all required shipping address fields');
        return;
      }
      finalAddress = newAddress;
    } else {
      finalAddress = addresses[selectedAddressIndex];
    }

    try {
      setLoading(true);

      // 1. Create order via Order Service (proxied by Gateway)
      const orderPayload = {
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: finalAddress.street,
          city: finalAddress.city,
          state: finalAddress.state || 'Karnataka',
          postalCode: finalAddress.postalCode,
          country: finalAddress.country || 'India'
        },
        paymentMethod
      };

      const orderRes = await api.post('/orders', orderPayload);
      const createdOrder = orderRes.data.order;

      // 2. Process mock payment via Payment Service
      if (paymentMethod !== 'cod') {
        try {
          await api.post('/payments/process', {
            orderId: createdOrder._id,
            amount: createdOrder.totalAmount,
            paymentMethod,
            simulateFail,
            cardLastFour: '4242'
          });
        } catch (payErr) {
          // If payment was simulated to fail
          await fetchCart();
          navigate('/orders', {
            state: { message: 'Order created, but payment failed as simulated!', type: 'error' }
          });
          return;
        }
      }

      await fetchCart();
      navigate('/orders', {
        state: { message: 'Order placed and paid successfully!', type: 'success' }
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error completing checkout');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl text-center space-y-4 shadow-sm border border-gray-100">
        <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto" />
        <h2 className="text-xl font-bold text-gray-800">Your Cart is Empty</h2>
        <button
          onClick={() => navigate('/products')}
          className="bg-emerald-600 text-white font-bold py-2.5 px-6 rounded-xl hover:bg-emerald-700 transition"
        >
          Go to Products
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Secure Checkout</h1>
        <p className="text-xs text-gray-500 mt-1">Review your order details, delivery address, and payment method</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-emerald-600" /> 1. Shipping Address
              </h2>
              {addresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  className="text-xs text-emerald-600 font-semibold hover:underline"
                >
                  {useNewAddress ? 'Use Saved Address' : '+ Add New Address'}
                </button>
              )}
            </div>

            {!useNewAddress && addresses.length > 0 ? (
              <div className="space-y-3">
                {addresses.map((addr, idx) => (
                  <label
                    key={addr._id || idx}
                    className={`block p-4 rounded-2xl border-2 cursor-pointer transition ${
                      selectedAddressIndex === idx
                        ? 'border-emerald-600 bg-emerald-50/30'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="addressRadio"
                        checked={selectedAddressIndex === idx}
                        onChange={() => setSelectedAddressIndex(idx)}
                        className="mt-1 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="text-sm">
                        <p className="font-bold text-gray-800">{user?.name} <span className="text-xs font-normal text-gray-400">({addr.label || 'Home'})</span></p>
                        <p className="text-gray-600">{addr.street}</p>
                        <p className="text-gray-600">{addr.city}, {addr.state} - {addr.postalCode}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{addr.country}</p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    placeholder="House number, apartment, street name"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karnataka"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 560001"
                    value={newAddress.postalCode}
                    onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Country</label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full mt-1 px-3 py-2 text-sm border border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Method Section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" /> 2. Payment Method
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'card' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-gray-800">Credit / Debit Card</span>
                  <input
                    type="radio"
                    name="payRadio"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="text-emerald-600"
                  />
                </div>
                <p className="text-xs text-gray-500">Instant Mock Gateway simulation (Visa / Mastercard)</p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'upi' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-gray-800">UPI / QR</span>
                  <input
                    type="radio"
                    name="payRadio"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="text-emerald-600"
                  />
                </div>
                <p className="text-xs text-gray-500">Instant simulated UPI authorization</p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition ${
                  paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/20' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-gray-800">Cash on Delivery</span>
                  <input
                    type="radio"
                    name="payRadio"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-emerald-600"
                  />
                </div>
                <p className="text-xs text-gray-500">Pay cash upon delivery at your doorstep</p>
              </label>
            </div>

            {/* Test Simulation Controls */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-amber-900">
                <input
                  type="checkbox"
                  checked={simulateFail}
                  onChange={(e) => setSimulateFail(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Simulate Payment Gateway Failure (To test rollback / failed status handling)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Preview & Submit */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6 sticky top-24">
          <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Review ({items.length} Items)</h2>

          {/* Quick list */}
          <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 text-xs">
                <img
                  src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover bg-gray-50 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-gray-400">Qty: {item.quantity} &times; ${Number(item.price).toFixed(2)}</p>
                </div>
                <span className="font-bold text-gray-800">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Total</span>
              <span className="font-medium text-gray-900">${itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span className="font-medium text-gray-900">{shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Taxes (18%)</span>
              <span className="font-medium text-gray-900">${taxPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-extrabold text-gray-900">
              <span>Total Payable</span>
              <span className="text-emerald-600 text-xl">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" /> Place Order (${totalAmount.toFixed(2)})
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Bank-level 256-bit encryption</span>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
