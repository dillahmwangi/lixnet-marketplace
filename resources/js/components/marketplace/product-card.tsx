import { Star, StarHalf, Plus, Check, Briefcase, PiggyBank, GraduationCap, Calculator, Truck, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { JSX } from 'react';

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

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product) => void;
    onViewDetails?: (productId: number) => void;
}

// Helper function to render stars
function renderStars(rating: number) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
        stars.push(<Star key={i} className="w-4 h-4 fill-current text-brand-blue" />);
    }

    if (hasHalfStar) {
        stars.push(<StarHalf key="half" className="w-4 h-4 fill-current text-brand-blue" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }

    return stars;
}

// Helper function to get product icon based on category
function getProductIcon(categoryName: string) {
    const iconMap: { [key: string]: JSX.Element } = {
        'Payroll & HR': <Briefcase className='size-16 text-brand-blue' />,
        'SACCO Management': <PiggyBank className='size-16 text-brand-blue' />,
        'School Management': <GraduationCap className='size-16 text-brand-blue' />,
        'POS Systems': <ShoppingBag className='size-16 text-brand-blue' />,
        'Accounting': <Calculator className='size-16 text-brand-blue' />,
        'Inventory': <Truck className='size-16 text-brand-blue' />,
    };

    // Find matching category or default
    const iconClass = Object.entries(iconMap).find(([key]) =>
        categoryName.toLowerCase().includes(key.toLowerCase())
    )?.[1] || <Briefcase />;

    return iconClass;
}

export function ProductCard({ product, onAddToCart, onViewDetails }: ProductCardProps) {
    const { addItem, getItemQuantity } = useCart();
    const itemQuantity = getItemQuantity(product.id);
    const iconClass = getProductIcon(product.category.name);

    const handleAddToCart = () => {
        addItem(product, 1);
        onAddToCart?.(product);
    };

    const handleViewDetails = () => {
        onViewDetails?.(product.id);
    };

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    return (
        <Card className="group bg-card-color py-0 hover:shadow-lg transition-all duration-300 border border-border-color hover:-translate-y-1">
            <CardContent className="p-5">
                {/* Product Image/Icon */}
                <div className="h-48 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center mb-4 border border-border-color">
                    {iconClass}
                </div>

                {/* Product Title */}
                <h3 className="text-lg font-semibold text-dark-blue mb-2 line-clamp-2 min-h-[3.5rem]">
                    {product.title}
                </h3>

                {/* Product Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
                    {product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center mb-3">
                    <div className="flex items-center mr-2">
                        {renderStars(product.rating)}
                    </div>
                    <span className="text-sm text-gray-500">
                        ({product.rating_count.toLocaleString()})
                    </span>
                </div>

                {/* Price */}
                <div className="mb-4">
                    <div className="text-2xl font-bold text-dark-blue">
                        {formatPrice(product.price)}{product.is_subscription ? '/mo' : ''}
                    </div>
                    {product.note && (
                        <div className="text-xs text-gray-500 mt-1">
                            {product.note}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleViewDetails}
                        variant="outline"
                        className="flex-1 border-2 border-brand-blue text-brand-blue hover:bg-blue-50 font-medium py-2.5 transition-colors"
                    >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                    </Button>
                    <Button
                        onClick={handleAddToCart}
                        className="flex-1 bg-brand-blue hover:bg-[#0052a3] text-white font-medium py-2.5 transition-colors"
                        disabled={false}
                    >
                        {itemQuantity > 0 ? (
                            <>
                                <Check className="w-4 h-4 mr-2" />
                                ({itemQuantity})
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Add
                            </>
                        )}
                    </Button>
                </div>

                {/* Category Badge */}
                <div className="mt-3">
                    <Badge variant="secondary" className="text-xs bg-background-color border border-border-color text-text-dark">
                        {product.category.name}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}