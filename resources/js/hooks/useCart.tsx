import { useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export interface SubscriptionTier {
  price: number;
  features: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  rating: number;
  rating_count: number;
  note?: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  is_subscription: boolean;
  subscription_tiers?: Record<string, SubscriptionTier>;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  subscription_tier?: string;
  created_at: string;
  updated_at: string;
}

export interface Cart {
  id: number;
  user_id: number;
  total_items: number;
  total_value: number;
  items?: CartItem[];
  created_at: string;
  updated_at: string;
}

export function useCart() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/api/cart/get');

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems(response.data.data.items || []);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to fetch cart';
      setError(message);
      console.error('Cart fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (
    productId: number,
    quantity: number = 1,
    subscriptionTier?: string
  ) => {
    try {
      setError(null);
      const payload: any = {
        product_id: productId,
        quantity
      };

      if (subscriptionTier) {
        payload.subscription_tier = subscriptionTier;
      }

      const response = await axios.post('/api/cart/add', payload);

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems(response.data.data.items || []);
        toast.success(response.data.message);
        return response.data.data;
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to add to cart';
      setError(message);
      toast.error(message);
      throw err;
    }
  }, []);

  const updateItemQuantity = useCallback(async (cartItemId: number, quantity: number) => {
    try {
      setError(null);
      const response = await axios.put(`/api/cart/items/${cartItemId}`, { quantity });

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems(response.data.data.items || []);
        toast.success(response.data.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update item';
      setError(message);
      toast.error(message);
    }
  }, []);

  const updateSubscriptionTier = useCallback(async (cartItemId: number, tier: string) => {
    try {
      setError(null);
      const response = await axios.put(
        `/api/cart/items/${cartItemId}/subscription-tier`,
        { subscription_tier: tier }
      );

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems(response.data.data.items || []);
        toast.success(response.data.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update tier';
      setError(message);
      toast.error(message);
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: number) => {
    try {
      setError(null);
      const response = await axios.delete(`/api/cart/items/${cartItemId}`);

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems(response.data.data.items || []);
        toast.success(response.data.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to remove item';
      setError(message);
      toast.error(message);
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      setError(null);
      const response = await axios.post('/api/cart/clear');

      if (response.data.success) {
        setCart(response.data.data.cart);
        setItems([]);
        toast.success(response.data.message);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to clear cart';
      setError(message);
      toast.error(message);
    }
  }, []);

  return {
    cart,
    items,
    loading,
    error,
    fetchCart,
    addToCart,
    updateItemQuantity,
    updateSubscriptionTier,
    removeItem,
    clearCart
  };
}