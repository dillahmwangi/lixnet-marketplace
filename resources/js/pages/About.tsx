import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Target, Award, Globe, Mail, MapPin } from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';

export default function About() {
    const values = [
        {
            icon: <Target className="w-8 h-8 text-brand-blue" />,
            title: "Innovation",
            description: "We continuously innovate to provide cutting-edge business solutions that drive growth and efficiency."
        },
        {
            icon: <Users className="w-8 h-8 text-brand-blue" />,
            title: "Collaboration",
            description: "We believe in the power of partnerships and working together to achieve mutual success."
        },
        {
            icon: <Award className="w-8 h-8 text-brand-blue" />,
            title: "Excellence",
            description: "We strive for excellence in everything we do, delivering high-quality products and services."
        },
        {
            icon: <Globe className="w-8 h-8 text-brand-blue" />,
            title: "Global Reach",
            description: "Our solutions are designed to serve businesses across Kenya and beyond."
        }
    ];

    const stats = [
        { number: "500+", label: "Active Sellers" },
        { number: "10K+", label: "Products Listed" },
        { number: "50K+", label: "Happy Customers" },
        { number: "98%", label: "Satisfaction Rate" }
    ];

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-dark-blue mb-6">About Lixnet</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Lixnet Technologies is Kenya's leading business solutions marketplace, connecting businesses
                        with innovative products and services that drive growth and success.
                    </p>
                </div>

                {/* Mission Section */}
                <div className="mb-16">
                    <Card className="bg-gradient-to-r from-brand-blue to-dark-blue text-white border-none">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
                                To empower Kenyan businesses by providing a comprehensive marketplace where they can
                                discover, purchase, and implement cutting-edge solutions that enhance productivity,
                                streamline operations, and accelerate growth.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center bg-card-color border border-border-color">
                            <CardContent className="p-6">
                                <div className="text-3xl font-bold text-brand-blue mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Values Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Our Values</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            The principles that guide everything we do and shape our company culture.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {values.map((value, index) => (
                            <Card key={index} className="text-center bg-card-color border border-border-color hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-dark-blue mb-3">{value.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* What We Do Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">What We Do</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We provide a comprehensive platform that serves businesses at every stage of their journey.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="bg-card-color border border-border-color">
                            <CardHeader>
                                <CardTitle className="text-2xl text-dark-blue">For Buyers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Discover innovative business solutions and software</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Compare products and read verified reviews</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Secure payment processing with multiple options</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>24/7 customer support and implementation assistance</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className="bg-card-color border border-border-color">
                            <CardHeader>
                                <CardTitle className="text-2xl text-dark-blue">For Sellers</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3 text-gray-600">
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Reach thousands of potential business customers</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Comprehensive seller dashboard and analytics</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Marketing support and promotional opportunities</span>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="w-2 h-2 bg-brand-blue rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <span>Dedicated account management and growth support</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Contact Section */}
                <div className="text-center">
                    <Card className="bg-card-color border border-border-color">
                        <CardContent className="p-8">
                            <h2 className="text-3xl font-bold text-dark-blue mb-6">Get In Touch</h2>
                            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                                Have questions about Lixnet? We'd love to hear from you.
                                Reach out to our team for support, partnerships, or general inquiries.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-brand-blue mr-3" />
                                    <span className="text-gray-600">info@lixnet.net</span>
                                </div>
                                <div className="flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-brand-blue mr-3" />
                                    <span className="text-gray-600">Nairobi, Kenya</span>
                                </div>
                            </div>

                            <Button className="bg-brand-blue hover:bg-dark-blue text-white">
                                Contact Us
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
