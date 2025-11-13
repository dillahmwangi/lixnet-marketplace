import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import {
    Users,
    ShoppingCart,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Package,
    UserCheck,
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
} from 'lucide-react';
import axios from 'axios';

interface DashboardStats {
    total_users: number;
    total_orders: number;
    total_revenue: number;
    total_products: number;
    active_products: number;
    current_month_users: number;
    current_month_orders: number;
    current_month_revenue: number;
    user_growth: number;
    order_growth: number;
    revenue_growth: number;
}

interface AgentApplications {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
}

interface RecentOrder {
    id: number;
    order_reference: string;
    customer_name: string;
    total_amount: number;
    status: string;
    created_at: string;
    user_email: string;
}

interface UserRegistration {
    month: string;
    count: number;
}

interface MonthlyRevenue {
    month: string;
    revenue: number;
}

interface OrderStatusStat {
    status: string;
    count: number;
    [key: string]: any;
}

interface DashboardData {
    stats: DashboardStats;
    agent_applications: AgentApplications;
    recent_orders: RecentOrder[];
    user_registrations: UserRegistration[];
    monthly_revenue: MonthlyRevenue[];
    order_status_stats: OrderStatusStat[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('/api/admin/dashboard', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            setData(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch dashboard data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'KES',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusBadgeVariant = (status: string) => {
        const variants: Record<string, any> = {
            completed: 'default',
            paid: 'default',
            pending: 'secondary',
            cancelled: 'destructive',
        };
        return variants[status] || 'secondary';
    };

    const getOrderStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            completed: '#22c55e',
            paid: '#22c55e',
            pending: '#f59e0b',
            cancelled: '#ef4444',
        };
        return colors[status] || '#6b7280';
    };

    const StatCard = ({
        title,
        value,
        change,
        changeType,
        icon: Icon,
        color
    }: {
        title: string;
        value: string | number;
        change?: number;
        changeType?: 'positive' | 'negative';
        icon: any;
        color: string;
    }) => (
        <Card>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground">{title}</p>
                        <p className="text-2xl font-bold">{value}</p>
                        {change !== undefined && (
                            <div className="flex items-center mt-1">
                                {changeType === 'positive' ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
                                )}
                                <span className={`text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                                    {Math.abs(change)}%
                                </span>
                                <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className={`rounded-full p-3 ${color}`}>
                        <Icon className="h-5 w-5 text-white" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (loading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
                <div className="space-y-6 p-4">
                    <div className="grid gap-6 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <Skeleton key={i} className="h-32" />
                        ))}
                    </div>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[...Array(3)].map((_, i) => (
                            <Skeleton key={i} className="h-80" />
                        ))}
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </AppLayout>
        );
    }

    if (error || !data) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
                <div className="flex min-h-[400px] items-center justify-center p-4">
                    <div className="text-center">
                        <p className="text-muted-foreground">{error || 'Failed to load dashboard'}</p>
                        <Button onClick={fetchDashboardData} className="mt-4">
                            Try Again
                        </Button>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />

            <div className="space-y-6 p-4">
                {/* Welcome Section */}
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
                    <p className="text-muted-foreground">
                        Overview of your marketplace performance and management tools
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <StatCard
                        title="Total Users"
                        value={data.stats.total_users}
                        change={data.stats.user_growth}
                        changeType={data.stats.user_growth >= 0 ? 'positive' : 'negative'}
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Total Orders"
                        value={data.stats.total_orders}
                        change={data.stats.order_growth}
                        changeType={data.stats.order_growth >= 0 ? 'positive' : 'negative'}
                        icon={ShoppingCart}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Total Revenue"
                        value={formatCurrency(data.stats.total_revenue)}
                        change={data.stats.revenue_growth}
                        changeType={data.stats.revenue_growth >= 0 ? 'positive' : 'negative'}
                        icon={DollarSign}
                        color="bg-purple-500"
                    />
                    <StatCard
                        title="Active Products"
                        value={`${data.stats.active_products}/${data.stats.total_products}`}
                        icon={Package}
                        color="bg-orange-500"
                    />
                </div>

                {/* Agent Applications Overview */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-gray-100 p-3">
                                    <UserCheck className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Applications</p>
                                    <p className="text-2xl font-bold">{data.agent_applications.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-yellow-100 p-3">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Pending</p>
                                    <p className="text-2xl font-bold">{data.agent_applications.pending}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-green-100 p-3">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Approved</p>
                                    <p className="text-2xl font-bold">{data.agent_applications.approved}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                                <div className="rounded-full bg-red-100 p-3">
                                    <XCircle className="h-5 w-5 text-red-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                    <p className="text-2xl font-bold">{data.agent_applications.rejected}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Registrations</CardTitle>
                            <CardDescription>Monthly user registrations over the last 12 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={data.user_registrations}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Registrations"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ fill: '#8884d8', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Revenue</CardTitle>
                            <CardDescription>Revenue trends over the last 12 months</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={data.monthly_revenue}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) => formatCurrency(Number(value))}
                                    />
                                    <Legend />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#82ca9d"
                                        name="Revenue"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>

                {/* Order Status Distribution and Recent Orders */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Status Distribution</CardTitle>
                            <CardDescription>Current distribution of order statuses</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={data.order_status_stats}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ status, count }) => `${status}: ${count}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="count"
                                        nameKey="status"
                                    >
                                        {data.order_status_stats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={getOrderStatusColor(entry.status)} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>Latest orders in the system</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {data.recent_orders.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-muted-foreground">No recent orders</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-sm">
                                                <th className="px-6 py-3 text-left font-medium">Order</th>
                                                <th className="px-6 py-3 text-left font-medium">Customer</th>
                                                <th className="px-6 py-3 text-right font-medium">Amount</th>
                                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                                <th className="px-6 py-3 text-left font-medium">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {data.recent_orders.slice(0, 5).map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/50">
                                                    <td className="px-6 py-4 font-medium text-sm">
                                                        {order.order_reference}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <div>
                                                            <div>{order.customer_name}</div>
                                                            <div className="text-xs text-muted-foreground">{order.user_email}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium">
                                                        {formatCurrency(order.total_amount)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant={getStatusBadgeVariant(order.status)}>
                                                            {order.status}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(order.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                        <CardDescription>Common administrative tasks</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2"
                                onClick={() => window.location.href = '/admin/users-list'}
                            >
                                <Users className="h-6 w-6" />
                                Manage Users
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2"
                                onClick={() => window.location.href = '/admin/agent-applications'}
                            >
                                <UserCheck className="h-6 w-6" />
                                Review Applications
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2"
                                onClick={() => window.location.href = '/marketplace'}
                            >
                                <Package className="h-6 w-6" />
                                View Marketplace
                            </Button>
                            <Button
                                variant="outline"
                                className="h-20 flex-col gap-2"
                                onClick={() => window.location.href = '/admin/users-list'}
                            >
                                <TrendingUp className="h-6 w-6" />
                                View Analytics
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
