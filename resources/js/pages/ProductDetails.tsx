import { useState, useEffect } from 'react';
import { ArrowLeft, Check, Star, StarHalf, Briefcase, PiggyBank, GraduationCap, Calculator, Truck, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { JSX } from 'react';

interface SubscriptionTier {
  price: number;
  features: string;
}

interface ProductDetailsType {
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
  is_subscription: boolean;
  subscription_tiers: Record<string, SubscriptionTier> | null;
}

interface ProductDetailsProps {
  productId: number;
  onBack: () => void;
  onSelectPlan?: (productId: number, tier: string, price: number) => void;
}

function getProductIcon(categoryName: string) {
  const iconMap: { [key: string]: JSX.Element } = {
    'Payroll & HR': <Briefcase className='size-24 text-brand-blue' />,
    'SACCO Management': <PiggyBank className='size-24 text-brand-blue' />,
    'School Management': <GraduationCap className='size-24 text-brand-blue' />,
    'POS Systems': <ShoppingBag className='size-24 text-brand-blue' />,
    'Accounting': <Calculator className='size-24 text-brand-blue' />,
    'Inventory': <Truck className='size-24 text-brand-blue' />,
  };

  const iconClass = Object.entries(iconMap).find(([key]) =>
    categoryName.toLowerCase().includes(key.toLowerCase())
  )?.[1] || <Briefcase />;

  return iconClass;
}

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

export function ProductDetails({ productId, onBack, onSelectPlan }: ProductDetailsProps) {
  const [product, setProduct] = useState<ProductDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${productId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data.data);
        
        // Set default selected tier
        if (data.data.is_subscription && data.data.subscription_tiers) {
          setSelectedTier('basic');
        }
      } catch (err) {
        setError('Failed to load product details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-blue mb-6 hover:text-dark-blue transition"
        >
          <ArrowLeft size={20} />
          Back to Marketplace
        </button>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-brand-blue mb-6 hover:text-dark-blue transition"
        >
          <ArrowLeft size={20} />
          Back to Marketplace
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Product not found'}</p>
          <Button onClick={onBack} className="mt-4">Back to Marketplace</Button>
        </div>
      </div>
    );
  }

  const handleSelectTier = (tier: string) => {
    setSelectedTier(tier);
  };

  const handleSubscribe = (tier: string) => {
    if (product.subscription_tiers && onSelectPlan) {
      const tierData = product.subscription_tiers[tier];
      onSelectPlan(product.id, tier, tierData.price);
    }
  };

  const tierTitles: Record<string, string> = {
    free: 'Free',
    basic: 'Basic',
    premium: 'Premium'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-brand-blue mb-6 hover:text-dark-blue transition font-semibold"
      >
        <ArrowLeft size={20} />
        Back to Marketplace
      </button>

      {/* Product Info Section */}
      <div className="bg-card-color rounded-lg shadow-sm p-6 md:p-8 mb-8 border border-border-color">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Product Image/Icon */}
          <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-white rounded-lg p-12 border border-border-color h-fit">
            <div className="text-brand-blue">
              {getProductIcon(product.category.name)}
            </div>
          </div>

          {/* Right: Product Details */}
          <div>
            <div className="mb-4">
              <Badge className="bg-blue-100 text-brand-blue border-brand-blue text-sm mb-4">
                {product.category.name}
              </Badge>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-dark-blue mb-4">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-1">
                {renderStars(product.rating)}
              </div>
              <span className="text-gray-600 font-medium">
                {product.rating} ({product.rating_count.toLocaleString()} reviews)
              </span>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed text-lg">
              {product.description}
            </p>

            {/* Note */}
            {product.note && (
              <div className="bg-blue-50 border-l-4 border-brand-blue p-4 rounded-r">
                <p className="text-dark-blue font-semibold">{product.note}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Subscription Tiers Section */}
      {product.is_subscription && product.subscription_tiers ? (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-dark-blue mb-2">Choose Your Plan</h2>
          <p className="text-gray-600 mb-8">Select a subscription tier that fits your needs</p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {Object.entries(product.subscription_tiers).map(([tier, tierData]) => {
              const isSelected = selectedTier === tier;

              return (
                <div
                  key={tier}
                  onClick={() => handleSelectTier(tier)}
                  className={`rounded-lg border-2 transition cursor-pointer p-6 ${
                    isSelected
                      ? 'border-brand-blue bg-blue-50'
                      : 'border-border-color bg-card-color hover:border-brand-blue'
                  }`}
                >
                  {/* Tier Title */}
                  <h3 className="text-xl font-bold text-dark-blue mb-4">
                    {tierTitles[tier]}
                  </h3>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-bold text-brand-blue">
                      KSh {tierData.price.toLocaleString()}
                    </div>
                    <p className="text-gray-600 text-sm">per month</p>
                  </div>

                  {/* Features */}
                  <div className="mb-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {tierData.features}
                    </p>
                  </div>

                  {/* Select Button */}
                  {isSelected ? (
                    <button
                      className="w-full bg-brand-blue text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-dark-blue transition"
                    >
                      <Check size={20} />
                      Selected
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectTier(tier)}
                      className="w-full border-2 border-brand-blue text-brand-blue py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Subscribe Button */}
          {selectedTier && (
            <div className="flex gap-4">
              <Button
                onClick={() => handleSubscribe(selectedTier)}
                className="flex-1 bg-brand-blue hover:bg-dark-blue text-white py-4 rounded-lg font-bold text-lg"
              >
                Subscribe to {tierTitles[selectedTier]}
              </Button>
              <Button
                onClick={onBack}
                variant="outline"
                className="px-8 border-2 border-brand-blue text-brand-blue hover:bg-blue-50"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card-color rounded-lg shadow-sm p-8 text-center border border-border-color">
          <p className="text-gray-600">This product is currently not available as a subscription</p>
        </div>
      )}
    </div>
  );
}

export default ProductDetails;