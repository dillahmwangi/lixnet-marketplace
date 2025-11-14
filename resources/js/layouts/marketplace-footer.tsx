import { ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { router } from '@inertiajs/react';

export function MarketplaceFooter() {
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLinkClick = (link: string) => {
        if (link === 'Careers') {
            router.visit('/careers');
        }
        // Add other link handlers as needed
    };

    const footerLinks = {
        'Get to Know Us': [
            'Careers',
            'About Lixnet'
        ],
        'Make Money with Us': [
            'Sell products on Lixnet',
            'Become an Affiliate'
        ],
        'Contact Us': [
            'Email: info@lixnet.net',
            'Nairobi Office'
        ],
        'Let Us Help You': [
            'Your Account',
            'Help & Support'
        ]
    };

    return (
        <footer className="bg-[#00264d] text-white mt-12">
            {/* Back to Top */}
            <div
                className="bg-[#001a33] text-center py-4 cursor-pointer hover:bg-[#00111f] transition-colors font-medium"
                onClick={scrollToTop}
            >
                <div className="flex items-center justify-center">
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Back to top
                </div>
            </div>

            {/* Footer Content */}
            <div className="px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Object.entries(footerLinks).map(([title, links]) => (
                            <div key={title}>
                                <h3 className="text-lg font-medium mb-4 text-blue-300">
                                    {title}
                                </h3>
                                <ul className="space-y-2">
                                    {links.map((link, index) => (
                                        <li key={index}>
                                            <button
                                                onClick={() => handleLinkClick(link)}
                                                className="text-gray-300 text-sm hover:text-white hover:underline transition-colors text-left"
                                            >
                                                {link}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* Footer Bottom */}
                    <div className="border-t border-[#003366] mt-8 pt-6 text-center">
                        <p className="text-xs text-gray-400">
                            © 2023 Lixnet Technologies. All rights reserved. | Nairobi, Kenya | info@lixnet.net
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
