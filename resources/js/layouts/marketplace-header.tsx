import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Globe, User, Menu, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import { useAuth } from '@/context/auth-context';
import { Link } from '@inertiajs/react';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface MarketplaceHeaderProps {
    categories: Category[];
    onSearch: (query: string) => void;
    onCategoryFilter: (categoryId: string) => void;
    onCartClick: () => void;
    onLoginClick: () => void;
}

export function MarketplaceHeader({
    categories,
    onSearch,
    onCategoryFilter,
    onCartClick,
    onLoginClick
}: MarketplaceHeaderProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showDropdown, setShowDropdown] = useState(false);

    const { state: cartState } = useCart();
    const { user, isAuthenticated, logout } = useAuth();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        onCategoryFilter(value);
    };

    const handleSignOut = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <header className="bg-brand-blue text-card-color">
            {/* Top Header */}
            <div className="px-4 py-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="h-20 w-20 overflow-hidden rounded">
                                <img
                                    src="/logo.JPG"
                                    alt="Lixnet Logo"
                                    className="w-full h-full object-cover mix-blend-multiply hover:scale-105 transition duration-300 ease-in-out"
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Location */}
                    <div className="flex items-center text-sm text-blue-100">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>Nairobi, Kenya</span>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
                        <div className="flex">
                            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="w-48 bg-gray-100 text-gray-900 border-r border-gray-300 rounded-l rounded-r-none">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map((category) => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Input
                                type="text"
                                placeholder="Search for software solutions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 bg-card-color text-gray-900 border-0 rounded-none"
                            />

                            <Button
                                type="submit"
                                className="bg-dark-blue hover:bg-blue-black px-4 rounded-l-none text-card-color"
                            >
                                <Search className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>

                    {/* Header Actions */}
                    <div className="flex items-center gap-4">
                        {/* Admin Tab - Only visible to admin users */}
                        {isAuthenticated && user?.role === 'admin' && (
                            <Button
                                variant="ghost"
                                onClick={() => window.location.href = '/dashboard'}
                                className="text-blue-100 hover:text-card-color hover:bg-[#0052a3] text-sm font-medium"
                            >
                                Admin
                            </Button>
                        )}

                        {/* Language */}
                        <div className="flex items-center text-sm text-blue-100 hover:text-card-color cursor-pointer">
                            <Globe className="w-4 h-4 mr-1" />
                            <span>EN</span>
                        </div>

                        {/* Auth Section */}
                        {isAuthenticated && user ? (
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    className="text-blue-100 hover:text-card-color hover:bg-[#0052a3] text-sm"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <User className="w-4 h-4 mr-1" />
                                    {user.name}
                                </Button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card-color rounded-md shadow-lg py-1 z-50">
                                        <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Profile
                                        </a>
                                        <a href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                            Orders
                                        </a>
                                        <button
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button
                                variant="ghost"
                                onClick={onLoginClick}
                                className="text-blue-100 hover:text-card-color hover:bg-[#0052a3] text-sm"
                            >
                                Sign In
                            </Button>
                        )}

                        {/* Cart */}
                        <Button
                            variant="ghost"
                            onClick={onCartClick}
                            className="text-blue-100 hover:text-card-color hover:bg-[#0052a3] text-sm relative"
                        >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            <span>Cart</span>
                            {cartState.totalItems > 0 && (
    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-white">
        {cartState.totalItems}
    </div>
)}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Navigation Bar */}
            <div className="bg-dark-blue px-4 py-2">
                <div className="max-w-7xl mx-auto flex items-center">
                    <div className="relative">
                        <Button
                            variant="ghost"
                            className="text-card-color hover:bg-blue-black font-medium"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            <Menu className="w-4 h-4 mr-2" />
                            All
                        </Button>

                        {/* Dropdown menu can be added here if needed */}
                    </div>
                </div>
            </div>
        </header>
    );
}
