import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { ProductCard } from '@/components/marketplace/product-card';
import { ProductDetails } from './ProductDetails'
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';

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
}

interface ApiResponse {
    success: boolean;
    data: Product[];
    count: number;
    message: string;
}

type CurrentPage = 'marketplace' | 'product-details';

export default function Marketplace() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState<CurrentPage>('marketplace');
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const { logout, checkAuth, user } = useAuth();

    // Fetch products on mount
    useEffect(() => {
        fetchProducts();
        checkAuth();
    }, []);

    // Update filtered products when products, search, or category changes
    useEffect(() => {
        filterProducts();
    }, [products, searchQuery, selectedCategory]);

    const fetchProducts = async (params?: string) => {
        try {
            setIsLoading(true);
            setError(null);

            const url = `/api/products${params ? `?${params}` : ''}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse = await response.json();

            if (data.success) {
                setProducts(data.data);
                setFilteredProducts(data.data);
            } else {
                throw new Error(data.message || 'Failed to fetch products');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch products';
            setError(errorMessage);
            console.error('Failed to fetch products:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = [...products];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(product =>
                product.title.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.name.toLowerCase().includes(query)
            );
        }

        // Apply category filter
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(product =>
                product.category.id.toString() === selectedCategory
            );
        }

        setFilteredProducts(filtered);
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

    const handleCategoryFilter = (categoryId: string) => {
        setSelectedCategory(categoryId);
    };

    const handleCartClick = () => {
        router.visit('/cart');
    };

    const handleLoginClick = () => {
        user ? logout() : router.visit('/login');
    };

    const handleAddToCart = (product: Product) => {
        toast.success(`Added to cart: ${product.title}`);
    };

    const handleViewDetails = (productId: number) => {
        setSelectedProductId(productId);
        setCurrentPage('product-details');
    };

    const handleBackToMarketplace = () => {
        setCurrentPage('marketplace');
        setSelectedProductId(null);
    };

    const handleSelectPlan = (productId: number, tier: string, price: number) => {
        console.log(`Selected ${tier} tier for product ${productId} at KSh ${price}/month`);
        toast.success(`Selected ${tier} tier - Proceeding to checkout`);
        // Add subscription to cart logic here
        handleBackToMarketplace();
    };

    const renderProductGrid = () => {
        const sortedProducts = filteredProducts.sort((a, b) => a.id - b.id);

        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="space-y-4">
                            <Skeleton className="h-48 w-full rounded-lg" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return (
                <Alert className="max-w-md mx-auto">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {error}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => fetchProducts()}
                            className="ml-4"
                        >
                            Try Again
                        </Button>
                    </AlertDescription>
                </Alert>
            );
        }

        if (sortedProducts.length === 0) {
            return (
                <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'No products found'
                            : 'No products available'
                        }
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {searchQuery || selectedCategory !== 'all'
                            ? 'Try adjusting your search or filter criteria.'
                            : 'Please check back later for new products.'
                        }
                    </p>
                    {(searchQuery || selectedCategory !== 'all') && (
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProducts.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={handleAddToCart}
                        onViewDetails={handleViewDetails}
                    />
                ))}
            </div>
        );
    };

    if (currentPage === 'product-details' && selectedProductId) {
        return (
            <MarketplaceLayout
                onSearch={handleSearch}
                onCategoryFilter={handleCategoryFilter}
                onCartClick={handleCartClick}
                onLoginClick={handleLoginClick}
            >
                <ProductDetails
                    productId={selectedProductId}
                    onBack={handleBackToMarketplace}
                    onSelectPlan={handleSelectPlan}
                />
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout
            onSearch={handleSearch}
            onCategoryFilter={handleCategoryFilter}
            onCartClick={handleCartClick}
            onLoginClick={handleLoginClick}
        >
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="bg-gradient-to-r from-brand-blue to-dark-blue rounded-lg p-8 mb-8 text-card-color text-center md:h-[300px] flex items-center justify-center">
                    <div className="max-w-3xl mx-auto">
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Lixnet Software Marketplace
                        </h1>
                        <p className="text-lg md:text-xl opacity-90">
                            Software solutions for your business needs
                        </p>
                    </div>
                </div>

                {/* Products Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-dark-blue border-b-2 border-brand-blue pb-1">
                            Most Popular in Kenya
                        </h2>
                        {!isLoading && (
                            <span className="text-gray-500 text-sm">
                                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                            </span>
                        )}
                    </div>

                    {renderProductGrid()}
                </div>
            </div>
        </MarketplaceLayout>
    );
}