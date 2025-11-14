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

interface Category {
    id: number;
    name: string;
    slug: string;
    products_count: number;
    created_at: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
    },
];

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await axios.get(`/api/categories?${params}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            setCategories(response.data.data);
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch categories';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [search]);

    const handleDelete = async (categoryId: number, categoryName: string) => {
        try {
            await axios.delete(`/api/admin/categories/${categoryId}`, {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            toast.success(`Category "${categoryName}" deleted successfully`);
            fetchCategories(); // Refresh the list
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete category';
            toast.error(errorMessage);
        }
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
            <Head title="Categories Management" />

            <div className="space-y-6 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Categories Management</h2>
                        <p className="text-muted-foreground">
                            Manage product categories
                        </p>
                    </div>
                    <Button asChild>
                        <a href="/admin/categories/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Category
                        </a>
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Search</CardTitle>
                        <CardDescription>Search categories by name</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search categories..."
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
                                <Button onClick={fetchCategories} className="mt-4">
                                    Try Again
                                </Button>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-12 text-center">
                                <p className="text-muted-foreground">No categories found</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="border-b">
                                        <tr className="text-sm">
                                            <th className="px-6 py-3 text-left font-medium">Name</th>
                                            <th className="px-6 py-3 text-left font-medium">Slug</th>
                                            <th className="px-6 py-3 text-right font-medium">Products</th>
                                            <th className="px-6 py-3 text-left font-medium">Created</th>
                                            <th className="px-6 py-3 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {categories.map((category) => (
                                            <tr key={category.id} className="hover:bg-muted/50">
                                                <td className="px-6 py-4 font-medium">
                                                    {category.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {category.slug}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm">
                                                    {category.products_count}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    {formatDate(category.created_at)}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            asChild
                                                        >
                                                            <a href={`/admin/categories/${category.id}/edit`}>
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
                                                                    <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        Are you sure you want to delete "{category.name}"?
                                                                        This action cannot be undone and will affect {category.products_count} products.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() => handleDelete(category.id, category.name)}
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
