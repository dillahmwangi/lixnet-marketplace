import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { dashboard } from '@/routes';
import axios from 'axios';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    rating_count: number;
    category: {
        id: number;
        name: string;
    };
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Products',
        href: '/admin/products',
    },
];

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await axios.get(`/api/products?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            setProducts(response.data.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch products';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const handleDelete = async (productId: number, productTitle: string) => {
        try {
            await axios.delete(`/api/admin/products/${productId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            toast.success(`Product "${productTitle}" deleted successfully`);
            fetchProducts(); // Refresh the list
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete product';
            toast.error(errorMessage);
        }
    };

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Products Management" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Products Management</h2>
                        <p className="text-muted-foreground">
                            Manage marketplace products
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/admin/products/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Search</CardTitle>
                        <CardDescription>Search products by title or description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
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
                                <Button onClick={fetchProducts} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">No products found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr className="text-sm">
                                            <th className="px-6 py-3 text-left font-medium">Title</th>
                                            <th className="px-6 py-3 text-left font-medium">Category</th>
                                            <th className="px-6 py-3 text-right font-medium">Price</th>
                                            <th className="px-6 py-3 text-center font-medium">Rating</th>
                                            <th className="px-6 py-3 text-left font-medium">Created</th>
                                            <th className="px-6 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products.map((product) => (
                                            <tr key={product.id} className="hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">
                                                    <div className="max-w-xs truncate" title={product.title}>
                                                        {product.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {product.category?.name || 'No Category'}
                                                </td>
                                                <td className="px-6 py-4 text-right font-medium">
                                                    {formatPrice(product.price)}
                                                </td>
                                                <td className="px-6 py-4 text-center text-sm">
                                                    {product.rating > 0 ? (
                                                        <span>
                                                            {product.rating} ({product.rating_count})
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground">No ratings</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {formatDate(product.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            asChild
                                                        >
                                                            <a href={`/admin/products/${product.id}/edit`}>
                                                                <Edit className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <AlertDialog>
                                                            <AlertDialogTrigger asChild>
                                                                <Button size="sm" variant="ghost">
                                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                                </Button>
                                                            </AlertDialogTrigger>
                                                            <AlertDialogContent>
                                                                <AlertDialogHeader>
                                                                    <AlertDialogTitle>Delete Product</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{product.title}"?
                                                                        This action cannot be undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(product.id, product.title)}
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
