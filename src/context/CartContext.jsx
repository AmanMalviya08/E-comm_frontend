import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], totalAmount: 0, totalItems: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success && res.data.cart) {
        setCart(res.data.cart);
      }
    } catch (error) {
      console.warn('Error fetching cart:', error.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1, productDetails = {}) => {
    if (!isAuthenticated) {
      throw new Error('Please log in to add items to your cart.');
    }
    try {
      const payload = {
        productId,
        quantity,
        name: productDetails.name,
        price: productDetails.price,
        image: productDetails.images?.[0] || productDetails.image
      };
      const res = await api.post('/cart/items', payload);
      if (res.data.success) {
        setCart(res.data.cart);
        return res.data;
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to add item to cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      const res = await api.put(`/cart/items/${productId}`, { quantity });
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update quantity');
    }
  };

  const removeItem = async (productId) => {
    try {
      const res = await api.delete(`/cart/items/${productId}`);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      const res = await api.delete('/cart/clear');
      if (res.data.success) {
        setCart({ items: [], totalAmount: 0, totalItems: 0 });
      }
    } catch (error) {
      console.warn('Error clearing cart:', error.message);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      cartCount: cart.totalItems || 0
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
