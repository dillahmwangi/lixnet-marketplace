import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle,
    Clock,
    X,
    Download,
    ArrowLeft,
    Calendar,
    DollarSign,
    Briefcase,
    PiggyBank,
    GraduationCap,
    ShoppingBag,
    Calculator,
    Truck,
    AlertCircle,
    CreditCard,
    Package
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router, usePage } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/ui/user-breadcrumbs';

interface OrderItem {
    id: string;
    product: {
        id: number;
        title: string;
        category: {
            name: string;
        };
    };
    quantity: number;
    unit_price: number;
    subscription_tier?: string;
}

interface Order {
    id: string;
    order_reference: string;
    status: 'pending' | 'completed' | 'cancelled' | 'failed' | 'paid';
    total_amount: number;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
    full_name: string;
    email: string;
    phone: string;
    company?: string;
    notes?: string;
    currency: string;
    payment_reference?: string;
    paid_at?: string;
}

export default function OrderDetail() {
    const { user, isLoading, checkAuth, logout } = useAuth();
    const { props } = usePage();
    const [order, setOrder] = useState<Order | null>(null);
    const [isOrderLoading, setIsOrderLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

    // Get order ID from URL
    const orderId = window.location.pathname.split('/').pop();

    useEffect(() => {
        checkAuth();
    }, []);

    // Check for payment status in URL query params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('payment');
        
        if (status) {
            setPaymentStatus(status);
            
            // Show toast notification based on payment status
            if (status === 'success') {
                toast.success('✅ Payment successful! Your order has been processed.');
            } else if (status === 'failed') {
                toast.error('❌ Payment failed. Please try again.');
            } else if (status === 'cancelled') {
                toast.error('⚠️ Payment was cancelled.');
            } else if (status === 'pending') {
                toast.loading('⏳ Payment is still pending. Please wait...');
            }

            // Clear the query params from URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please log in to view this order");
            router.visit('/login');
            return;
        }

        if (user && orderId) {
            fetchOrder();
        }
    }, [user, isLoading, orderId]);

    const fetchOrder = async () => {
        try {
            setIsOrderLoading(true);
            setError(null);

            const response = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Order not found');
            }

            const data = await response.json();
            setOrder(data.data.order);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
            setError(errorMessage);
            console.error('Failed to fetch order:', err);
        } finally {
            setIsOrderLoading(false);
        }
    };

    const formatPrice = (price: number | string) => {
        return `KSh ${parseFloat(price as string).toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
            cancelled: { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: X },
            completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;

        return (
            <Badge className={`${config?.color} border capitalize`}>
                <Icon className="w-4 h-4 mr-2" />
                {status}
            </Badge>
        );
    };

    function getProductIcon(categoryName: string) {
        const iconMap: { [key: string]: any } = {
            'Payroll & HR': <Briefcase className='size-5 text-brand-blue' />,
            'SACCO Management': <PiggyBank className='size-5 text-brand-blue' />,
            'School Management': <GraduationCap className='size-5 text-brand-blue' />,
            'POS Systems': <ShoppingBag className='size-5 text-brand-blue' />,
            'Accounting': <Calculator className='size-5 text-brand-blue' />,
            'Inventory': <Truck className='size-5 text-brand-blue' />,
        };

        return Object.entries(iconMap).find(([key]) =>
            categoryName.toLowerCase().includes(key.toLowerCase())
        )?.[1] || <Briefcase className='size-5 text-brand-blue' />;
    }

    const handleLoginClick = () => {
        user ? logout() : router.visit('/login');
    };

    const handleCartClick = () => {
        router.visit('/cart');
    };

    if (isLoading || isOrderLoading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading order...</p>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    if (error) {
        return (
            <MarketplaceLayout onLoginClick={handleLoginClick} onCartClick={handleCartClick}>
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/orders')}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                    <Alert className="bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {error}
                        </AlertDescription>
                    </Alert>
                </div>
            </MarketplaceLayout>
        );
    }

    if (!order) {
        return (
            <MarketplaceLayout onLoginClick={handleLoginClick} onCartClick={handleCartClick}>
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <Button
                        variant="outline"
                        onClick={() => router.visit('/orders')}
                        className="mb-6"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Orders
                    </Button>
                    <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            Order not found
                        </AlertDescription>
                    </Alert>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout onLoginClick={handleLoginClick} onCartClick={handleCartClick}>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <Button
                    variant="outline"
                    onClick={() => router.visit('/orders')}
                    className="mb-6 bg-white border-slate-200 hover:bg-slate-50"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Orders
                </Button>

                {/* Payment Status Alert */}
                {paymentStatus === 'success' && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            ✅ Payment successful! Your order has been processed and is ready.
                        </AlertDescription>
                    </Alert>
                )}
                {paymentStatus === 'failed' && (
                    <Alert className="mb-6 bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            ❌ Payment failed. Please try again or contact support.
                        </AlertDescription>
                    </Alert>
                )}
                {paymentStatus === 'cancelled' && (
                    <Alert className="mb-6 bg-yellow-50 border-yellow-200">
                        <AlertCircle className="h-4 h-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                            ⚠️ Payment was cancelled. Please try again when ready.
                        </AlertDescription>
                    </Alert>
                )}
                {paymentStatus === 'pending' && (
                    <Alert className="mb-6 bg-blue-50 border-blue-200">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <AlertDescription className="text-blue-800">
                            ⏳ Payment is still pending. Please wait while we confirm your payment.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Order Header */}
                <Card className="bg-white border border-slate-200 mb-6 shadow-sm">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl text-slate-900">
                                    Order #{order.order_reference}
                                </CardTitle>
                                <p className="text-slate-600 mt-1">
                                    {formatDate(order.created_at)}
                                </p>
                            </div>
                            <div>
                                {getPaymentStatusBadge(order.status)}
                            </div>
                        </div>
                    </CardHeader>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer Information */}
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600">Full Name</p>
                                        <p className="font-medium text-slate-900">{order.full_name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Email</p>
                                        <p className="font-medium text-slate-900">{order.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600">Phone</p>
                                        <p className="font-medium text-slate-900">{order.phone}</p>
                                    </div>
                                    {order.company && (
                                        <div>
                                            <p className="text-sm text-slate-600">Company</p>
                                            <p className="font-medium text-slate-900">{order.company}</p>
                                        </div>
                                    )}
                                </div>
                                {order.notes && (
                                    <div className="pt-3 border-t border-slate-200">
                                        <p className="text-sm text-slate-600">Notes</p>
                                        <p className="text-slate-900 mt-1">{order.notes}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Order Items ({order.items.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="flex items-center gap-4 flex-1">
                                            {getProductIcon(item.product.category.name)}
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-900">{item.product.title}</p>
                                                <p className="text-sm text-slate-500">
                                                    {item.product.category.name}
                                                    {item.subscription_tier && ` • Tier: ${item.subscription_tier}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold text-slate-900">
                                                {formatPrice(item.unit_price)} × {item.quantity}
                                            </p>
                                            <p className="text-slate-600">
                                                {formatPrice(Number(item.unit_price) * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Order Summary */}
                        <Card className="bg-white border border-slate-200 sticky top-4">
                            <CardHeader>
                                <CardTitle className="text-lg">Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">Subtotal</span>
                                    <span className="font-medium">{formatPrice(order.total_amount)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Total</span>
                                    <span className="text-xl font-bold text-brand-blue">
                                        {formatPrice(order.total_amount)}
                                    </span>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-sm text-slate-600">Currency</p>
                                    <p className="font-medium">{order.currency}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Information */}
                        <Card className="bg-white border border-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg">Payment Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm text-slate-600">Status</p>
                                    <div className="mt-2">
                                        {getPaymentStatusBadge(order.status)}
                                    </div>
                                </div>
                                {order.payment_reference && (
                                    <div className="pt-3 border-t border-slate-200">
                                        <p className="text-sm text-slate-600">Payment Reference</p>
                                        <p className="font-mono text-xs text-slate-900 break-all mt-1">
                                            {order.payment_reference}
                                        </p>
                                    </div>
                                )}
                                {order.paid_at && (
                                    <div className="pt-3 border-t border-slate-200">
                                        <p className="text-sm text-slate-600">Paid Date</p>
                                        <p className="font-medium text-green-600">
                                            {formatDate(order.paid_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        {order.status === 'paid' && (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                <Download className="w-4 h-4 mr-2" />
                                Download License
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}