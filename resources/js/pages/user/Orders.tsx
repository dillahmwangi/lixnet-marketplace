import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import {
    Search,
    Filter,
    Package,
    CheckCircle,
    Clock,
    X,
    Eye,
    Download,
    RefreshCw,
    Calendar,
    ShoppingBag,
    Briefcase,
    PiggyBank,
    GraduationCap,
    Calculator,
    Truck,
    AlertCircle,
    DollarSign,
    CreditCard
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
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

export default function Orders() {
    const { user, isLoading, checkAuth, logout } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isOrdersLoading, setIsOrdersLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<string | null>(null);

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
            toast.error("Please log in to view your orders");
            router.visit('/login');
            return;
        }

        if (user) {
            fetchOrders();
        }
    }, [user, isLoading]);

    useEffect(() => {
        filterOrders();
    }, [orders, searchQuery, statusFilter]);

    const fetchOrders = async () => {
        try {
            setIsOrdersLoading(true);
            setError(null);

            const response = await fetch('/api/orders/get', {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            const data = await response.json();
            setOrders(data.data.data);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders';
            setError(errorMessage);
            console.error('Failed to fetch orders:', err);
        } finally {
            setIsOrdersLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(order =>
                order.order_reference.toLowerCase().includes(query) ||
                order.items.some(item =>
                    item.product.title.toLowerCase().includes(query) ||
                    item.product.category.name.toLowerCase().includes(query)
                )
            );
        }

        if (statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        setFilteredOrders(filtered);
    };

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            processing: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: RefreshCw },
            completed: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            cancelled: { color: 'bg-red-100 text-red-800 border-red-200', icon: X },
            failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;

        return (
            <Badge className={`${config?.color} border capitalize`}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const handleLoginClick = () => {
        user ? logout() : router.visit('/login');
    };

    const handleCartClick = () => {
        router.visit('/cart');
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            paid: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
            failed: { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
            refunded: { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: X }
        };

        const config = statusConfig[status as keyof typeof statusConfig];
        const Icon = config?.icon || Clock;

        return (
            <Badge className={`${config?.color} border capitalize`}>
                <Icon className="w-3 h-3 mr-1" />
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

    const handleViewOrder = (order: Order) => {
        setSelectedOrder(order);
    };

    if (isLoading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading orders...</p>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout
            onLoginClick={handleLoginClick}
            onCartClick={handleCartClick}
        >
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Profile', href: '/profile' },
                            { label: 'Orders' }
                        ]}
                    />
                </div>
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">My Orders</h1>
                    <p className="text-slate-600 mt-2">
                        Track and manage your software purchases
                    </p>
                </div>

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
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
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

                {/* Filters */}
                <Card className="bg-white border border-slate-200 mb-6 shadow-sm">
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search orders by number or product..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            {/* Status Filter */}
                            <div className="md:w-48">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="processing">Processing</option>
                                    <option value="paid">Paid</option>
                                    <option value="cancelled">Cancelled</option>
                                    <option value="failed">Failed</option>
                                </select>
                            </div>
                            <Button
                                onClick={fetchOrders}
                                variant="outline"
                                className="bg-white border-slate-200 hover:bg-slate-50"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders List */}
                {isOrdersLoading ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="bg-white border border-slate-200">
                                <CardContent className="pt-6">
                                    <div className="animate-pulse space-y-4">
                                        <div className="flex justify-between">
                                            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                            <div className="h-6 bg-slate-200 rounded w-20"></div>
                                        </div>
                                        <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                                        <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Alert className="max-w-md mx-auto">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {error}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchOrders}
                                className="ml-4"
                            >
                                Try Again
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            {searchQuery || statusFilter !== 'all' ? 'No orders found' : 'No orders yet'}
                        </h3>
                        <p className="text-slate-500 mb-4">
                            {searchQuery || statusFilter !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'Start shopping to see your orders here.'
                            }
                        </p>
                        {!(searchQuery || statusFilter !== 'all') && (
                            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                Start Shopping
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <Card key={order.id} className="bg-white border border-slate-200 hover:shadow-lg transition-shadow duration-200">
                                <CardContent className="pt-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        {/* Order Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                                <h3 className="font-semibold text-slate-900">
                                                    Order #{order.order_reference}
                                                </h3>
                                                <div className="flex gap-2">
                                                    {getPaymentStatusBadge(order.status)}
                                                </div>
                                            </div>
                                            <div className="text-sm text-slate-600">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(order.created_at)}
                                                    </span>
                                                    <span>
                                                        {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <DollarSign className="w-4 h-4 mr-1" />
                                                        {order.currency}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Order Items Preview */}
                                            <div className="flex flex-wrap gap-2">
                                                {order.items.slice(0, 3).map((item) => (
                                                    <div key={item.id} className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-full border border-slate-200">
                                                        {getProductIcon(item.product.category.name)}
                                                        <span className="text-sm text-slate-700 truncate max-w-32">
                                                            {item.product.title}
                                                        </span>
                                                        {item.quantity > 1 && (
                                                            <Badge variant="secondary" className="bg-slate-200 text-slate-600 text-xs">
                                                                ×{item.quantity}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                                {order.items.length > 3 && (
                                                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                                        +{order.items.length - 3} more
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        {/* Order Total & Actions */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:text-right">
                                            <div>
                                                <div className="text-2xl font-bold text-slate-900">
                                                    {formatPrice(order.total_amount)}
                                                </div>
                                                {order.paid_at && (
                                                    <div className="text-sm text-green-600">
                                                        Paid on {formatDate(order.paid_at)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewOrder(order)}
                                                    className="bg-white border-slate-200 hover:bg-slate-50"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                                {order.status === 'completed' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Download
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Order Details Modal */}
                {selectedOrder && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <Card className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                                <CardTitle className="text-xl text-slate-900">
                                    Order Details - #{selectedOrder.order_reference}
                                </CardTitle>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedOrder(null)}
                                    className="hover:bg-slate-100"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6 p-6">
                                {/* Status Section */}
                                <div className="flex gap-4">
                                    {getPaymentStatusBadge(selectedOrder.status)}
                                </div>
                                {/* Customer Info */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Customer Information
                                    </h4>
                                    <div className="bg-slate-50 p-4 rounded-lg space-y-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                            <div><strong className="text-slate-700">Name:</strong> {selectedOrder.full_name}</div>
                                            <div><strong className="text-slate-700">Email:</strong> {selectedOrder.email}</div>
                                            <div><strong className="text-slate-700">Phone:</strong> {selectedOrder.phone}</div>
                                            {selectedOrder.company && (
                                                <div><strong className="text-slate-700">Company:</strong> {selectedOrder.company}</div>
                                            )}
                                        </div>
                                        {selectedOrder.notes && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <strong className="text-slate-700">Notes:</strong>
                                                <p className="text-sm text-slate-600 mt-1">{selectedOrder.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                {/* Order Items */}
                                <div>
                                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                        <Package className="w-4 h-4 mr-2" />
                                        Order Items
                                    </h4>
                                    <div className="space-y-3">
                                        {selectedOrder.items.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                    {getProductIcon(item.product.category.name)}
                                                    <div>
                                                        <p className="font-medium text-slate-900">{item.product.title}</p>
                                                        <p className="text-sm text-slate-500">
                                                            {item.product.category.name} • Qty: {item.quantity}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-slate-900">{formatPrice(item.unit_price * item.quantity)}</p>
                                                    {item.quantity > 0 && (
                                                        <p className="text-sm text-slate-500">{formatPrice(item.unit_price)} each</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <Separator className="bg-slate-200" />
                                {/* Order Summary */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-lg font-bold">
                                        <span className="text-slate-900">Total:</span>
                                        <span className="text-slate-900">{formatPrice(selectedOrder.total_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Currency:</span>
                                        <span>{selectedOrder.currency}</span>
                                    </div>
                                    {selectedOrder.payment_reference && (
                                        <div className="flex justify-between text-sm text-slate-600">
                                            <span>Payment Reference:</span>
                                            <span className="font-mono">{selectedOrder.payment_reference}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Order Date:</span>
                                        <span>{formatDate(selectedOrder.created_at)}</span>
                                    </div>
                                    {selectedOrder.paid_at && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Payment Date:</span>
                                            <span>{formatDate(selectedOrder.paid_at)}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Actions */}
                                {selectedOrder.status === 'completed' && (
                                    <div className="pt-4 border-t border-slate-200">
                                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Software
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}