import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { dashboard } from '@/routes';
import toast from 'react-hot-toast';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
    {
        title: 'Categories',
        href: '/admin/categories',
    },
    {
        title: 'Create Category',
        href: '/admin/categories/create',
    },
];

export default function AdminCategoryCreate() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        slug: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/api/admin/categories', {
            onSuccess: () => {
                toast.success('Category created successfully');
            },
            onError: (errors) => {
                toast.error('Failed to create category');
            },
        });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setData({
            name,
            slug: generateSlug(name),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Category" />

            <div className="space-y-6 p-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <a href="/admin/categories">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Categories
                        </a>
                    </Button>
                </div>

                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Create Category</h2>
                    <p className="text-muted-foreground">
                        Add a new product category
                    </p>
                </div>

                <Card className="max-w-2xl">
                    <CardHeader>
                        <CardTitle>Category Details</CardTitle>
                        <CardDescription>
                            Enter the details for the new category
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={handleNameChange}
                                    placeholder="Enter category name"
                                    required
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug</Label>
                                <Input
                                    id="slug"
                                    type="text"
                                    value={data.slug}
                                    onChange={(e) => setData('slug', e.target.value)}
                                    placeholder="category-slug"
                                    required
                                />
                                <p className="text-sm text-muted-foreground">
                                    URL-friendly version of the name. Auto-generated from name.
                                </p>
                                {errors.slug && (
                                    <p className="text-sm text-destructive">{errors.slug}</p>
                                )}
                            </div>

                            <div className="flex gap-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Category'}
                                </Button>
                                <Button type="button" variant="outline" asChild>
                                    <a href="/admin/categories">Cancel</a>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
