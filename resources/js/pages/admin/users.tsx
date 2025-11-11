import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Eye, ChevronRight } from 'lucide-react';
import { dashboard } from '@/routes';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    role: string;
    email_verified_at: string | null;
    created_at: string;
    orders_count: number;
    total_spent: number;
    display_name: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Users',
        href: '/admin/users',
    },
];

export default function AdminUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [verifiedFilter, setVerifiedFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                per_page: '15',
            });

            if (search) params.append('search', search);
            if (roleFilter !== 'all') params.append('role', roleFilter);
            if (verifiedFilter !== 'all') params.append('verified', verifiedFilter);

            const response = await axios.get(`/admin/users?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const data = response.data;

            setUsers(data.users.data);
            setPagination({
                current_page: data.users.current_page,
                last_page: data.users.last_page,
                per_page: data.users.per_page,
                total: data.users.total,
                from: data.users.from,
                to: data.users.to,
            });
            setCurrentPage(data.users.current_page);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch users';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [search, roleFilter, verifiedFilter]);

    const handleSearch = (value: string) => {
        setSearch(value);
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const response = await axios.put(`/api/admin/users/${userId}`, {
                role: newRole,
            }, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            toast.success('User role updated successfully');

            // Update the user in the local state
            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRole } : user
                )
            );
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update user role';
            toast.error(errorMessage);
        }
    };

    const handleViewUser = (userId: number) => {
        window.location.href = `/admin/users-list/${userId}`;
    };

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

    const getRoleBadgeVariant = (role: string) => {
        const variants: Record<string, any> = {
            admin: 'destructive',
            agent: 'default',
            user: 'secondary',
        };
        return variants[role] || 'secondary';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users Management" />

            <div className="space-y-6 p-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Users Management</h2>
                    <p className="text-muted-foreground">
                        Manage and view all users in the system
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                        <CardDescription>Search and filter users</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, phone..."
                                    value={search}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="pl-9"
                                />
                            </div>

                            <Select value={roleFilter} onValueChange={setRoleFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="agent">Agent</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by verification" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Users</SelectItem>
                                    <SelectItem value="true">Verified</SelectItem>
                                    <SelectItem value="false">Unverified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="space-y-4 p-6">
                                {[...Array(5)].map((_, i) => (
                                    <Skeleton key={i} className="h-16 w-full" />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">{error}</p>
                                <Button onClick={() => fetchUsers(currentPage)} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">No users found</p>
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b">
                                            <tr className="text-sm">
                                                <th className="px-6 py-3 text-left font-medium">Name</th>
                                                <th className="px-6 py-3 text-left font-medium">Email</th>
                                                <th className="px-6 py-3 text-left font-medium">Role</th>
                                                <th className="px-6 py-3 text-left font-medium">Company</th>
                                                <th className="px-6 py-3 text-right font-medium">Orders</th>
                                                <th className="px-6 py-3 text-right font-medium">Total Spent</th>
                                                <th className="px-6 py-3 text-left font-medium">Status</th>
                                                <th className="px-6 py-3 text-left font-medium">Joined</th>
                                                <th className="px-6 py-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {users.map((user) => (
                                                <tr key={user.id} className="hover:bg-muted/50">
                                                    <td className="px-6 py-4 font-medium">
                                                        {user.display_name}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{user.email}</td>
                                                    <td className="px-6 py-4">
                                                        <Select
                                                            value={user.role}
                                                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                                                        >
                                                            <SelectTrigger className="w-24">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="user">User</SelectItem>
                                                                <SelectItem value="agent">Agent</SelectItem>
                                                                <SelectItem value="admin">Admin</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{user.company || '-'}</td>
                                                    <td className="px-6 py-4 text-right text-sm">
                                                        {user.orders_count}
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium">
                                                        {formatCurrency(user.total_spent)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {user.email_verified_at ? (
                                                            <Badge variant="outline" className="bg-green-50 text-green-700">
                                                                Verified
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                                                                Unverified
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">{formatDate(user.created_at)}</td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleViewUser(user.id)}
                                                        >
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            View
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {pagination && pagination.last_page > 1 && (
                                    <div className="flex items-center justify-between border-t px-6 py-4">
                                        <div className="text-sm text-muted-foreground">
                                            Showing {pagination.from} to {pagination.to} of {pagination.total} users
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchUsers(currentPage + 1)}
                                                disabled={currentPage === pagination.last_page}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4 ml-1" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
