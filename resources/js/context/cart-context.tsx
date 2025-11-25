import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Types
interface SubscriptionTier {
    price: number;
    features: string;
}

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    rating_count: number;
    note: string;
    category: {
        id: number;
        name: string;
        slug: string;
    };
    is_subscription?: boolean;
    subscription_tiers?: Record<string, SubscriptionTier> | null;
}

interface CartItem {
    id: string | number;
    product: Product;
    quantity: number;
    subscription_tier?: string;
}

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalValue: number;
    isLoading: boolean;
    isSyncing: boolean;
}

interface CartContextType {
    state: CartState;
    addItem: (product: Product, quantity?: number, subscriptionTier?: string) => Promise<void>;
    removeItem: (itemId: string | number) => Promise<void>;
    updateQuantity: (itemId: string | number, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    getItemQuantity: (productId: number) => number;
    loadCart: (isAuthenticated: boolean) => Promise<void>;
    syncLocalCartToDatabase: () => Promise<void>;
}

// Cart Actions
type CartAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_SYNCING'; payload: boolean }
    | { type: 'SET_CART'; payload: CartItem[] }
    | { type: 'ADD_ITEM_LOCAL'; payload: { product: Product; quantity: number; subscriptionTier?: string } }
    | { type: 'REMOVE_ITEM_LOCAL'; payload: string | number }
    | { type: 'UPDATE_QUANTITY_LOCAL'; payload: { id: string | number; quantity: number } }
    | { type: 'CLEAR_CART_LOCAL' };

// Initial state
const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalValue: 0,
    isLoading: false,
    isSyncing: false,
};

// Helper to get item price based on tier
const getItemPrice = (item: CartItem): number => {
    if (item.subscription_tier && item.product.is_subscription && item.product.subscription_tiers) {
        const tierData = item.product.subscription_tiers[item.subscription_tier];
        return tierData ? tierData.price : item.product.price;
    }
    return item.product.price;
};

// Helper to calculate totals with tier-based pricing
const calculateTotals = (items: CartItem[]) => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = items.reduce((sum, item) => {
        const itemPrice = getItemPrice(item);
        return sum + (itemPrice * item.quantity);
    }, 0);
    return { totalItems, totalValue };
};

// Cart reducer
function cartReducer(state: CartState, action: CartAction): CartState {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };

        case 'SET_SYNCING':
            return { ...state, isSyncing: action.payload };

        case 'SET_CART': {
            const items = action.payload;
            const { totalItems, totalValue } = calculateTotals(items);
            return { ...state, items, totalItems, totalValue, isLoading: false, isSyncing: false };
        }

        case 'ADD_ITEM_LOCAL': {
            const { product, quantity, subscriptionTier } = action.payload;
            const existingItemIndex = state.items.findIndex(
                item => item.product.id === product.id && item.subscription_tier === subscriptionTier
            );

            let newItems: CartItem[];
            if (existingItemIndex >= 0) {
                newItems = state.items.map((item, index) =>
                    index === existingItemIndex
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                const newItem: CartItem = {
                    id: `temp-${product.id}-${subscriptionTier || 'base'}-${Date.now()}`,
                    product,
                    quantity,
                    subscription_tier: subscriptionTier,
                };
                newItems = [...state.items, newItem];
            }

            const { totalItems, totalValue } = calculateTotals(newItems);
            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'REMOVE_ITEM_LOCAL': {
            const newItems = state.items.filter(item => item.id !== action.payload);
            const { totalItems, totalValue } = calculateTotals(newItems);
            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'UPDATE_QUANTITY_LOCAL': {
            const { id, quantity } = action.payload;

            if (quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_ITEM_LOCAL', payload: id });
            }

            const newItems = state.items.map(item =>
                item.id === id ? { ...item, quantity } : item
            );

            const { totalItems, totalValue } = calculateTotals(newItems);
            return { ...state, items: newItems, totalItems, totalValue };
        }

        case 'CLEAR_CART_LOCAL':
            return { ...state, items: [], totalItems: 0, totalValue: 0 };

        default:
            return state;
    }
}

// Cart Context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Local storage helpers
const CART_STORAGE_KEY = 'lixnet-cart';

const saveCartToStorage = (items: CartItem[]) => {
    try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
        console.warn('Failed to save cart to localStorage:', error);
    }
};

const loadCartFromStorage = (): CartItem[] => {
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.warn('Failed to load cart from localStorage:', error);
        return [];
    }
};

const clearCartFromStorage = () => {
    try {
        localStorage.removeItem(CART_STORAGE_KEY);
    } catch (error) {
        console.warn('Failed to clear cart from localStorage:', error);
    }
};

// Setup axios defaults
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.withCredentials = true;

// API helpers
const isAuthenticated = async (): Promise<boolean> => {
    try {
        const response = await axios.get('/api/cart/get');
        return response.status === 200;
    } catch (error: any) {
        return error.response?.status !== 401;
    }
};

// Cart Provider
interface CartProviderProps {
    children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart on mount
    useEffect(() => {
        loadCart(false);
    }, []);

    // Save to localStorage whenever items change (for guest users)
    useEffect(() => {
        saveCartToStorage(state.items);
    }, [state.items]);

    // Main function to load cart
    const loadCart = async (forceAuthCheck?: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const userIsAuthenticated = forceAuthCheck ?? await isAuthenticated();

            if (userIsAuthenticated) {
                const response = await axios.get('/api/cart/get');
                if (response.data.success && response.data.data.items) {
                    const backendItems = response.data.data.items.map((item: any) => ({
                        id: item.id,
                        product: item.product,
                        quantity: item.quantity,
                        subscription_tier: item.subscription_tier,
                    }));
                    dispatch({ type: 'SET_CART', payload: backendItems });
                } else {
                    dispatch({ type: 'SET_CART', payload: [] });
                }
            } else {
                const localItems = loadCartFromStorage();
                dispatch({ type: 'SET_CART', payload: localItems });
            }
        } catch (error) {
            console.error('Failed to load cart:', error);
            const localItems = loadCartFromStorage();
            dispatch({ type: 'SET_CART', payload: localItems });
        }
    };

    // Sync localStorage cart to database
    const syncLocalCartToDatabase = async () => {
        dispatch({ type: 'SET_SYNCING', payload: true });

        try {
            const localItems = loadCartFromStorage();
            if (localItems.length === 0) {
                dispatch({ type: 'SET_SYNCING', payload: false });
                return;
            }

            await axios.delete('/api/cart/clear');

            for (const item of localItems) {
                await axios.post('/api/cart/add', {
                    product_id: item.product.id,
                    quantity: item.quantity,
                    subscription_tier: item.subscription_tier || null,
                });
            }

            clearCartFromStorage();
            await loadCart(true);

            toast.success('Cart synced successfully!');
        } catch (error) {
            console.error('Failed to sync cart:', error);
            toast.error('Failed to sync cart');
            dispatch({ type: 'SET_SYNCING', payload: false });
        }
    };

    // Add item to cart
    const addItem = async (product: Product, quantity = 1, subscriptionTier?: string) => {
        try {
            const userIsAuthenticated = await isAuthenticated();

            if (userIsAuthenticated) {
                const response = await axios.post('/api/cart/add', {
                    product_id: product.id,
                    quantity: quantity,
                    subscription_tier: subscriptionTier || null,
                });

                if (response.data.success) {
                    const backendItems = response.data.data.items.map((item: any) => ({
                        id: item.id,
                        product: item.product,
                        quantity: item.quantity,
                        subscription_tier: item.subscription_tier,
                    }));
                    dispatch({ type: 'SET_CART', payload: backendItems });
                    toast.success('Product added to cart successfully!');
                } else {
                    throw new Error(response.data.message || 'Failed to add item');
                }
            } else {
                dispatch({ 
                    type: 'ADD_ITEM_LOCAL', 
                    payload: { product, quantity, subscriptionTier } 
                });
                toast.success('Product added to cart successfully!');
            }
        } catch (error: any) {
            console.error('Failed to add item:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to add item to cart';
            toast.error(errorMsg);
            throw error;
        }
    };

    // Remove item from cart
    const removeItem = async (itemId: string | number) => {
        try {
            const userIsAuthenticated = await isAuthenticated();

            if (userIsAuthenticated && typeof itemId === 'number') {
                const response = await axios.delete(`/api/cart/items/${itemId}`);
                
                if (response.data.success) {
                    await loadCart(true);
                    toast.success('Product removed from cart successfully!');
                }
            } else {
                dispatch({ type: 'REMOVE_ITEM_LOCAL', payload: itemId });
                toast.success('Product removed from cart successfully!');
            }
        } catch (error) {
            console.error('Failed to remove item:', error);
            toast.error('Failed to remove item');
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: string | number, quantity: number) => {
        if (quantity <= 0) {
            await removeItem(itemId);
            return;
        }

        try {
            const userIsAuthenticated = await isAuthenticated();

            if (userIsAuthenticated && typeof itemId === 'number') {
                const response = await axios.put(`/api/cart/items/${itemId}`, { quantity });
                
                if (response.data.success) {
                    await loadCart(true);
                }
            } else {
                dispatch({ type: 'UPDATE_QUANTITY_LOCAL', payload: { id: itemId, quantity } });
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
            toast.error('Failed to update quantity');
        }
    };

    // Clear cart
    const clearCart = async () => {
        try {
            const userIsAuthenticated = await isAuthenticated();

            if (userIsAuthenticated) {
                await axios.delete('/api/cart/clear');
            }

            clearCartFromStorage();
            dispatch({ type: 'CLEAR_CART_LOCAL' });
            toast.success('Cart cleared successfully!');
        } catch (error) {
            console.error('Failed to clear cart:', error);
            clearCartFromStorage();
            dispatch({ type: 'CLEAR_CART_LOCAL' });
            toast.error('Failed to clear cart from server');
        }
    };

    // Get quantity of specific product
    const getItemQuantity = (productId: number): number => {
        const items = state.items.filter(item => item.product.id === productId);
        return items.reduce((sum, item) => sum + item.quantity, 0);
    };

    const value: CartContextType = {
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        loadCart,
        syncLocalCartToDatabase,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// Custom hook
export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}