import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartQuantity as apiUpdateQuantity,
  removeFromCart as apiRemoveFromCart,
} from '../services/api';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cart on initial mount (if authenticated)
  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      if (data && Array.isArray(data.cart)) {
        setCartItems(data.cart);
      }
    } catch (err) {
      // 401 means not authenticated yet, keep cart empty
      if (err.response && err.response.status !== 401) {
        console.error('Failed to load cart:', err);
        setError('Unable to load your cart.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Add Product to Cart
  const addToCart = async (productId) => {
    setError(null);
    try {
      const response = await apiAddToCart(productId);
      if (response && Array.isArray(response.cart)) {
        setCartItems(response.cart);
      }
      return { success: true, message: response.message };
    } catch (err) {
      console.error('Error adding to cart:', err);
      const message =
        err.response?.data?.message || 'Failed to add product to cart';
      return { success: false, message, status: err.response?.status };
    }
  };

  // Update Product Quantity
  const updateQuantity = async (productId, quantity) => {
    setError(null);
    try {
      const response = await apiUpdateQuantity(productId, quantity);
      if (response && Array.isArray(response.cart)) {
        setCartItems(response.cart);
      }
      return { success: true };
    } catch (err) {
      console.error('Error updating quantity:', err);
      const message =
        err.response?.data?.message || 'Failed to update quantity';
      return { success: false, message };
    }
  };

  // Remove Product from Cart
  const removeFromCart = async (productId) => {
    setError(null);
    try {
      const response = await apiRemoveFromCart(productId);
      if (response && Array.isArray(response.cart)) {
        setCartItems(response.cart);
      }
      return { success: true };
    } catch (err) {
      console.error('Error removing from cart:', err);
      const message =
        err.response?.data?.message || 'Failed to remove from cart';
      return { success: false, message };
    }
  };

  // Derived Values (Task 15 - not stored in MongoDB, calculated on the fly)
  const { totalUnits, subtotal, itemCount } = useMemo(() => {
    let units = 0;
    let total = 0;

    cartItems.forEach((item) => {
      const qty = item.quantity || 0;
      const price = item.product?.price || 0;
      units += qty;
      total += price * qty;
    });

    return {
      totalUnits: units,
      subtotal: total,
      itemCount: cartItems.length,
    };
  }, [cartItems]);

  const value = {
    cartItems,
    loading,
    error,
    totalUnits,
    subtotal,
    itemCount,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
