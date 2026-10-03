import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const { success, error: showError, info } = useToast();

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('guest_cart');
      return saved ? JSON.parse(saved) : {
        items: [],
        subtotal: 0,
        discountTotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
        totalCount: 0
      };
    } catch {
      return {
        items: [],
        subtotal: 0,
        discountTotal: 0,
        shippingFee: 0,
        tax: 0,
        total: 0,
        totalCount: 0
      };
    }
  });

  const [loading, setLoading] = useState(false);

  // Helper to calculate financials for guest cart
  const recalculateGuestCart = (items) => {
    let subtotal = 0;
    let discountTotal = 0;
    let totalCount = 0;

    const formattedItems = items.map((item) => {
      const originalPrice = item.originalPrice || item.price;
      const discount = item.discountPercentage || 0;
      const finalPrice = discount > 0 ? Math.round(originalPrice * (1 - discount / 100)) : originalPrice;
      const lineSubtotal = finalPrice * item.quantity;
      const lineDiscount = (originalPrice - finalPrice) * item.quantity;

      subtotal += originalPrice * item.quantity;
      discountTotal += lineDiscount;
      totalCount += item.quantity;

      return {
        ...item,
        price: finalPrice,
        originalPrice,
        subtotal: lineSubtotal
      };
    });

    const netPrice = subtotal - discountTotal;
    const shippingFee = netPrice > 999 || netPrice === 0 ? 0 : 50;
    const tax = Math.round(netPrice * 0.05 * 100) / 100;
    const total = Math.round((netPrice + shippingFee + tax) * 100) / 100;

    const newCart = {
      items: formattedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      discountTotal: Math.round(discountTotal * 100) / 100,
      shippingFee,
      tax,
      total,
      totalCount
    };

    localStorage.setItem('guest_cart', JSON.stringify(newCart));
    return newCart;
  };

  // Fetch cart from backend when authenticated
  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      const saved = localStorage.getItem('guest_cart');
      if (saved) {
        try {
          setCart(JSON.parse(saved));
        } catch {
          // ignore
        }
      }
      return;
    }

    try {
      setLoading(true);

      // Check if there is a guest cart to merge
      const guestCartRaw = localStorage.getItem('guest_cart');
      if (guestCartRaw) {
        try {
          const guestCart = JSON.parse(guestCartRaw);
          if (guestCart.items && guestCart.items.length > 0) {
            for (const gItem of guestCart.items) {
              await api.post('/cart', {
                productId: gItem.productId,
                quantity: gItem.quantity
              });
            }
            localStorage.removeItem('guest_cart');
          }
        } catch (e) {
          console.error('Error merging guest cart:', e);
        }
      }

      const res = await api.get('/cart');
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Error fetching cart:', err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add item to cart (supports both guest cart and authenticated user cart)
  const addToCart = async (productId, quantity = 1, productDetails = null) => {
    const qty = parseInt(quantity, 10) || 1;

    // If authenticated, sync directly with MongoDB backend
    if (isAuthenticated) {
      try {
        const res = await api.post('/cart', { productId, quantity: qty });
        if (res.success && res.data) {
          setCart(res.data);
          success('Added to cart!');
          return true;
        }
      } catch (err) {
        showError(err.message || 'Failed to add item to cart');
        return false;
      }
    }

    // Guest Cart support (when not signed in)
    try {
      // Fetch product info if not passed
      let prod = productDetails;
      if (!prod) {
        const res = await api.get(`/products/${productId}`);
        if (res.success && res.data) {
          prod = res.data;
        }
      }

      if (!prod) {
        showError('Product details unavailable');
        return false;
      }

      if (prod.stock <= 0) {
        showError('Sorry, this product is out of stock.');
        return false;
      }

      const currentItems = [...cart.items];
      const existingIdx = currentItems.findIndex((i) => i.productId === productId);

      if (existingIdx > -1) {
        const newQty = currentItems[existingIdx].quantity + qty;
        if (newQty > prod.stock) {
          showError(`Only ${prod.stock} items are available in stock.`);
          return false;
        }
        currentItems[existingIdx].quantity = newQty;
      } else {
        if (qty > prod.stock) {
          showError(`Only ${prod.stock} items are available in stock.`);
          return false;
        }
        currentItems.push({
          _id: 'guest_' + Date.now() + Math.random(),
          productId: prod._id,
          name: prod.name,
          image: prod.images?.[0] || '',
          price: prod.price,
          originalPrice: prod.price,
          discountPercentage: prod.discountPercentage || 0,
          quantity: qty,
          stock: prod.stock,
          subtotal: prod.price * qty
        });
      }

      const updated = recalculateGuestCart(currentItems);
      setCart(updated);
      success('Added to cart!');
      return true;
    } catch (err) {
      console.error('Guest cart error:', err);
      showError('Failed to add item to cart');
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (productId, quantity) => {
    const qty = parseInt(quantity, 10);
    if (qty <= 0) return;

    if (isAuthenticated) {
      try {
        const res = await api.put(`/cart/${productId}`, { quantity: qty });
        if (res.success && res.data) {
          setCart(res.data);
          return true;
        }
      } catch (err) {
        showError(err.message || 'Failed to update quantity');
        return false;
      }
    }

    // Guest cart update
    const currentItems = cart.items.map((item) => {
      if (item.productId === productId) {
        if (qty > item.stock) {
          showError(`Only ${item.stock} items available in stock.`);
          return item;
        }
        return { ...item, quantity: qty };
      }
      return item;
    });

    const updated = recalculateGuestCart(currentItems);
    setCart(updated);
    return true;
  };

  // Remove single item
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        const res = await api.delete(`/cart/${productId}`);
        if (res.success && res.data) {
          setCart(res.data);
          success('Item removed from cart.');
          return true;
        }
      } catch (err) {
        showError(err.message || 'Failed to remove item');
        return false;
      }
    }

    // Guest cart remove
    const currentItems = cart.items.filter((item) => item.productId !== productId);
    const updated = recalculateGuestCart(currentItems);
    setCart(updated);
    success('Item removed from cart.');
    return true;
  };

  // Clear entire cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        const res = await api.delete('/cart');
        if (res.success && res.data) {
          setCart(res.data);
          success('Cart cleared.');
          return true;
        }
      } catch (err) {
        showError(err.message || 'Failed to clear cart');
        return false;
      }
    }

    // Guest cart clear
    localStorage.removeItem('guest_cart');
    setCart({
      items: [],
      subtotal: 0,
      discountTotal: 0,
      shippingFee: 0,
      tax: 0,
      total: 0,
      totalCount: 0
    });
    success('Cart cleared.');
    return true;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
