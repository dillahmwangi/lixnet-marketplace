import { JSX, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Trash2, ShoppingBag, MessageCircle, Briefcase, PiggyBank, GraduationCap, Calculator, Truck } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/context/cart-context';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/ui/user-breadcrumbs';
import React from 'react';
import axios from 'axios';

type CartProps = {
	onContinueShopping?: () => void;
};

interface SubscriptionTier {
    price: number;
    features: string;
}

interface CartItem {
	id: number | string;
	product: {
		id: number;
		title: string;
		description: string;
		price: number;
		category: {
			name: string;
		};
		note?: string;
		is_subscription?: boolean;
		subscription_tiers?: Record<string, SubscriptionTier> | null;
	};
	quantity: number;
}

interface CartItemWithTier extends CartItem {
	subscription_tier?: string;
}

export default function Cart({ onContinueShopping }: CartProps) {
    const { state, updateQuantity, removeItem, clearCart } = useCart();
    const { user, isLoading, logout } = useAuth();
    const [isUpdatingTier, setIsUpdatingTier] = useState<number | null>(null);

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    // Helper function to get tier-based price
    function getItemPrice(item: CartItemWithTier): number {
        // For subscription items with a tier, use tier-specific pricing
        if (item.subscription_tier && item.product.is_subscription && item.product.subscription_tiers) {
            const tierData = item.product.subscription_tiers[item.subscription_tier];
            return tierData ? tierData.price : item.product.price;
        }
        // For non-subscription items, use base price
        return item.product.price;
    }

    const onCheckoutClick = () => {
        if (isLoading) {
            toast("Checking authentication, please wait…");
            return;
        }

        if (!user) {
            toast.error("You must create an account to complete a purchase.");
            const redirectPath = encodeURIComponent("/checkout");
            router.visit(`/login?redirect=${redirectPath}`);
            return;
        }

        router.visit("/checkout");
    };

    const handleCartClick = () => {
        router.visit('/cart');
    };

    const handleLoginClick = () => {
        user ? logout() : router.visit('/login');
    };

    const handleQuantityChange = (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleChangeTier = async (cartItemId: number, currentTier: string) => {
        const newTier = currentTier === 'basic' ? 'premium' : currentTier === 'premium' ? 'free' : 'basic';
        
        setIsUpdatingTier(cartItemId);
        try {
            const response = await axios.put(`/api/cart/items/${cartItemId}/subscription-tier`, {
                subscription_tier: newTier
            });

            if (response.data.success) {
                toast.success(`Subscription tier changed to ${newTier}`);
                // Update local cart state
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Error updating tier:', error);
            toast.error('Failed to update subscription tier');
        } finally {
            setIsUpdatingTier(null);
        }
    };

    const handleContinueShopping = () => {
        if (onContinueShopping) {
            onContinueShopping();
        } else {
            router.visit('/');
        }
    };

    function getProductIcon(categoryName: string) {
        const iconMap: { [key: string]: JSX.Element } = {
            'Payroll & HR': <Briefcase className='size-8 text-brand-blue' />,
            'SACCO Management': <PiggyBank className='size-8 text-brand-blue' />,
            'School Management': <GraduationCap className='size-8 text-brand-blue' />,
            'POS Systems': <ShoppingBag className='size-8 text-brand-blue' />,
            'Accounting': <Calculator className='size-8 text-brand-blue' />,
            'Inventory': <Truck className='size-8 text-brand-blue' />,
        };

        const iconClass = Object.entries(iconMap).find(([key]) =>
            categoryName.toLowerCase().includes(key.toLowerCase())
        )?.[1] || <Briefcase />;

        return iconClass;
    }

    if (state.items.length === 0) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-6">
                            Discover our software solutions and add them to your cart.
                        </p>
                        <Button
                            onClick={handleContinueShopping}
                            className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                        >
                            Continue Shopping
                        </Button>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout
            onCartClick={handleCartClick}
            onLoginClick={handleLoginClick}
        >
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Cart' }
                        ]}
                    />
                </div>
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark-blue">Shopping Cart</h1>
                    <p className="text-gray-600 mt-2">
                        {state.totalItems} item{state.totalItems !== 1 ? 's' : ''} in your cart
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <Card className='bg-card-color text-text-dark border border-border-color'>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Cart Items</CardTitle>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCart}
                                    className="bg-background-color border border-border-color text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Clear Cart
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {state.items.map((item: CartItemWithTier, index) => (
                                    <div key={item.id}>
                                        {index > 0 && <Separator className="my-4 bg-border-color" />}

                                        <div className="flex items-start space-x-4">
                                            {/* Product Icon */}
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center border border-border-color">
                                                {getProductIcon(item.product.category.name)}
                                            </div>

                                            {/* Product Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-dark-blue mb-1">
                                                    {item.product.title}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                                                    {item.product.description}
                                                </p>
                                                <Badge variant="secondary" className="text-xs bg-background-color text-text-dark border border-border-color">
                                                    {item.product.category.name}
                                                </Badge>

                                                {/* Subscription Tier Info */}
                                                {item.subscription_tier && item.product.is_subscription && (
                                                    <div className="mt-2 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-green-100 text-green-800 border-green-300 text-xs font-semibold">
                                                                Plan: {item.subscription_tier.charAt(0).toUpperCase() + item.subscription_tier.slice(1)}
                                                            </Badge>
                                                            <button
                                                                onClick={() => handleChangeTier(Number(item.id), item.subscription_tier || 'basic')}
                                                                disabled={isUpdatingTier === Number(item.id)}
                                                                className="text-xs text-brand-blue hover:text-dark-blue underline"
                                                            >
                                                                {isUpdatingTier === Number(item.id) ? 'Changing...' : 'Change Plan'}
                                                            </button>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            Monthly subscription
                                                        </p>
                                                    </div>
                                                )}

                                                {item.product.note && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.product.note}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Price and Quantity */}
                                            <div className="text-right space-y-2">
                                                <div className="font-semibold text-dark-blue">
                                                    {formatPrice(getItemPrice(item))}
                                                    {item.subscription_tier && (
                                                        <div className="text-xs text-gray-500 font-normal">/month</div>
                                                    )}
                                                </div>

                                                {/* Quantity Controls */}
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleQuantityChange(Number(item.id), item.quantity - 1)}
                                                        className="w-8 h-8 p-0 bg-background-color border border-border-color"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </Button>

                                                    <span className="w-8 text-center font-medium">
                                                        {item.quantity}
                                                    </span>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleQuantityChange(Number(item.id), item.quantity + 1)}
                                                        className="w-8 h-8 p-0 bg-background-color border border-border-color"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </Button>
                                                </div>

                                                {/* Subtotal */}
                                                <div className="text-sm text-gray-500">
                                                    Subtotal: {formatPrice(getItemPrice(item) * item.quantity)}
                                                </div>

                                                {/* Remove Button */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => removeItem(Number(item.id))}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 bg-card-color border border-border-color text-gray-900">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Items ({state.totalItems}):</span>
                                        <span>{formatPrice(state.totalValue)}</span>
                                    </div>

                                    <Separator className='bg-border-color' />

                                    <div className="flex justify-between font-semibold text-lg">
                                        <span>Total:</span>
                                        <span className="text-dark-blue">{formatPrice(state.totalValue)}</span>
                                    </div>
                                </div>

                                <Alert className='bg-background-color border-border-color text-text-dark'>
                                    <MessageCircle className="h-4 w-4" />
                                    <AlertDescription className="text-sm text-gray-600">
                                        Review your subscription plans and pricing before checkout.
                                    </AlertDescription>
                                </Alert>

                                <div className="space-y-3">
                                    {/* Checkout button */}
                                    <Button
                                        onClick={onCheckoutClick}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
                                    >
                                        Proceed to Checkout
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={handleContinueShopping}
                                        className="w-full text-card-color bg-brand-blue hover:bg-dark-blue hover:text-card-color border-none"
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}