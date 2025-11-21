import { useState } from 'react';
import { CartProvider } from './context/cart-context';
import { AuthProvider } from './context/auth-context';
import Marketplace from './pages/Marketplace';
import Cart from './pages/Cart';

type CurrentPage = 'marketplace' | 'cart';

export function MarketplaceApp() {
    const [currentPage, setCurrentPage] = useState<CurrentPage>('marketplace');

    const navigateToCart = () => {
        setCurrentPage('cart');
    };

    const navigateToMarketplace = () => {
        setCurrentPage('marketplace');
    };

    const renderCurrentPage = () => {
        switch (currentPage) {
            case 'cart':
                return <Cart onContinueShopping={navigateToMarketplace} />;
            case 'marketplace':
            default:
                return <Marketplace />;
        }
    };

    return (
        <AuthProvider>
            <CartProvider>
                <div className="min-h-screen">
                    {renderCurrentPage()}
                </div>
            </CartProvider>
        </AuthProvider>
    );
}

export default MarketplaceApp;