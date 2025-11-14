import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    User,
    ShoppingBag,
    Heart,
    CreditCard,
    Settings,
    HelpCircle,
    LogOut,
    ChevronRight,
    Mail,
    Phone,
    MapPin,
    Calendar
} from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';

export default function Account() {
    const { user } = useAuth();

    const accountSections = [
        {
            title: "Account Overview",
            icon: <User className="w-6 h-6" />,
            items: [
                {
                    label: "Personal Information",
                    description: "Update your name, email, and contact details",
                    action: () => router.visit('/profile'),
                    icon: <User className="w-5 h-5" />
                },
                {
                    label: "Account Settings",
                    description: "Manage your account preferences and security",
                    action: () => router.visit('/settings'),
                    icon: <Settings className="w-5 h-5" />
                }
            ]
        },
        {
            title: "Orders & Purchases",
            icon: <ShoppingBag className="w-6 h-6" />,
            items: [
                {
                    label: "Order History",
                    description: "View and track your orders",
                    action: () => router.visit('/orders'),
                    icon: <ShoppingBag className="w-5 h-5" />
                },
                {
                    label: "Wishlist",
                    description: "Products you've saved for later",
                    action: () => router.visit('/wishlist'),
                    icon: <Heart className="w-5 h-5" />
                }
            ]
        },
        {
            title: "Payment & Billing",
            icon: <CreditCard className="w-6 h-6" />,
            items: [
                {
                    label: "Payment Methods",
                    description: "Manage your saved payment methods",
                    action: () => router.visit('/payment-methods'),
                    icon: <CreditCard className="w-5 h-5" />
                },
                {
                    label: "Billing History",
                    description: "View your payment and billing history",
                    action: () => router.visit('/billing'),
                    icon: <CreditCard className="w-5 h-5" />
                }
            ]
        },
        {
            title: "Support & Help",
            icon: <HelpCircle className="w-6 h-6" />,
            items: [
                {
                    label: "Help Center",
                    description: "Find answers to common questions",
                    action: () => router.visit('/help'),
                    icon: <HelpCircle className="w-5 h-5" />
                },
                {
                    label: "Contact Support",
                    description: "Get in touch with our support team",
                    action: () => window.open('mailto:support@lixnet.net', '_blank'),
                    icon: <Mail className="w-5 h-5" />
                }
            ]
        }
    ];

    const quickStats = [
        { label: "Total Orders", value: "12", icon: <ShoppingBag className="w-5 h-5" /> },
        { label: "Wishlist Items", value: "8", icon: <Heart className="w-5 h-5" /> },
        { label: "Support Tickets", value: "2", icon: <HelpCircle className="w-5 h-5" /> },
        { label: "Account Age", value: "6 months", icon: <Calendar className="w-5 h-5" /> }
    ];

    if (!user) {
        return (
            <MarketplaceLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <Card className="max-w-md mx-auto">
                        <CardContent className="p-8 text-center">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-dark-blue mb-4">Sign In Required</h2>
                            <p className="text-gray-600 mb-6">
                                Please sign in to access your account information.
                            </p>
                            <Button
                                onClick={() => router.visit('/login')}
                                className="w-full bg-brand-blue hover:bg-dark-blue text-white"
                            >
                                Sign In
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-dark-blue mb-2">My Account</h1>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                {/* User Info Card */}
                <Card className="mb-8 bg-gradient-to-r from-brand-blue to-dark-blue text-white border-none">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-4">
                                    <User className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold">{user.name}</h2>
                                    <p className="text-blue-100">{user.email}</p>
                                    <div className="flex items-center mt-2">
                                        <Badge className="bg-white bg-opacity-20 text-white border-white border-opacity-30">
                                            {user.role || 'Customer'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="border-white text-white hover:bg-white hover:text-brand-blue"
                                onClick={() => router.visit('/profile')}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {quickStats.map((stat, index) => (
                        <Card key={index} className="bg-card-color border border-border-color">
                            <CardContent className="p-4 text-center">
                                <div className="flex justify-center mb-2 text-brand-blue">
                                    {stat.icon}
                                </div>
                                <div className="text-2xl font-bold text-dark-blue">{stat.value}</div>
                                <div className="text-sm text-gray-600">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Account Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {accountSections.map((section, sectionIndex) => (
                        <Card key={sectionIndex} className="bg-card-color border border-border-color">
                            <CardHeader>
                                <CardTitle className="flex items-center text-dark-blue">
                                    <span className="text-brand-blue mr-3">{section.icon}</span>
                                    {section.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {section.items.map((item, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className="flex items-center justify-between p-4 border border-border-color rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={item.action}
                                    >
                                        <div className="flex items-center">
                                            <span className="text-brand-blue mr-3">{item.icon}</span>
                                            <div>
                                                <div className="font-medium text-dark-blue">{item.label}</div>
                                                <div className="text-sm text-gray-600">{item.description}</div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Support Section */}
                <div className="mt-12">
                    <Card className="bg-card-color border border-border-color">
                        <CardContent className="p-8 text-center">
                            <HelpCircle className="w-16 h-16 text-brand-blue mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-dark-blue mb-4">Need Help?</h3>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Our support team is here to help you with any questions or issues you may have.
                                Contact us through any of the channels below.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                <div className="flex flex-col items-center">
                                    <Mail className="w-8 h-8 text-brand-blue mb-2" />
                                    <div className="font-medium text-dark-blue">Email Support</div>
                                    <div className="text-sm text-gray-600">support@lixnet.net</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <Phone className="w-8 h-8 text-brand-blue mb-2" />
                                    <div className="font-medium text-dark-blue">Phone Support</div>
                                    <div className="text-sm text-gray-600">+254 XXX XXX XXX</div>
                                </div>
                                <div className="flex flex-col items-center">
                                    <MapPin className="w-8 h-8 text-brand-blue mb-2" />
                                    <div className="font-medium text-dark-blue">Visit Us</div>
                                    <div className="text-sm text-gray-600">Nairobi, Kenya</div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.visit('/help')}
                                className="bg-brand-blue hover:bg-dark-blue text-white"
                            >
                                Visit Help Center
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sign Out Section */}
                <div className="mt-8 text-center">
                    <Button
                        variant="outline"
                        onClick={() => router.post('/logout')}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
