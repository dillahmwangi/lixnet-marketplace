import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Store,
    TrendingUp,
    Users,
    Shield,
    DollarSign,
    BarChart3,
    Headphones,
    CheckCircle,
    Star,
    ArrowRight
} from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';

export default function SellProducts() {
    const benefits = [
        {
            icon: <Store className="w-8 h-8 text-green-600" />,
            title: "Easy Setup",
            description: "Get your seller account up and running in minutes with our streamlined onboarding process."
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
            title: "Grow Your Business",
            description: "Reach thousands of potential customers actively looking for business solutions like yours."
        },
        {
            icon: <Users className="w-8 h-8 text-purple-600" />,
            title: "Dedicated Support",
            description: "Our seller success team provides personalized support to help you maximize your sales."
        },
        {
            icon: <Shield className="w-8 h-8 text-red-600" />,
            title: "Secure Platform",
            description: "Rest assured with our secure payment processing and buyer protection programs."
        }
    ];

    const features = [
        "Low commission rates starting at 5%",
        "Real-time sales analytics and reporting",
        "Marketing tools and promotional opportunities",
        "Multi-channel selling capabilities",
        "Integrated inventory management",
        "Mobile-optimized seller dashboard",
        "24/7 seller support hotline",
        "Performance-based seller badges"
    ];

    const steps = [
        {
            step: "1",
            title: "Create Account",
            description: "Sign up for a seller account and complete your business verification."
        },
        {
            step: "2",
            title: "List Products",
            description: "Add your products with detailed descriptions, images, and pricing."
        },
        {
            step: "3",
            title: "Start Selling",
            description: "Receive orders, process payments, and grow your business on Lixnet."
        }
    ];

    const testimonials = [
        {
            name: "Sarah Wanjiku",
            company: "TechSolutions Ltd",
            rating: 5,
            text: "Lixnet has transformed our business. We've increased our sales by 300% in just 6 months!"
        },
        {
            name: "David Kiprop",
            company: "Innovate Kenya",
            rating: 5,
            text: "The platform is incredibly user-friendly, and the support team is always there when we need them."
        },
        {
            name: "Grace Achieng",
            company: "Business Hub",
            rating: 5,
            text: "Best decision we made was joining Lixnet. The exposure and tools provided are unmatched."
        }
    ];

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-dark-blue mb-6">Sell on Lixnet</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Join thousands of successful sellers on Kenya's leading business marketplace.
                        Reach more customers, grow your revenue, and scale your business with Lixnet.
                    </p>
                    <div className="mt-8">
                        <Button
                            size="lg"
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
                            onClick={() => router.visit('/register')}
                        >
                            Start Selling Today
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Why Sell on Lixnet?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover the advantages of joining Kenya's most trusted business marketplace.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="text-center bg-card-color border border-border-color hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-dark-blue mb-3">{benefit.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-dark-blue mb-6">Everything You Need to Succeed</h2>
                            <p className="text-gray-600 mb-6">
                                Our comprehensive seller platform provides all the tools and features you need
                                to manage your business effectively and grow your sales.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {features.map((feature, index) => (
                                    <div key={index} className="flex items-start">
                                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                                        <span className="text-gray-600 text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <DollarSign className="w-16 h-16 text-green-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-dark-blue mb-4">Revenue Calculator</h3>
                                    <p className="text-gray-600 mb-6">
                                        See how much you could earn selling on Lixnet
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">5%</div>
                                            <div className="text-sm text-gray-600">Commission Rate</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">95%</div>
                                            <div className="text-sm text-gray-600">You Keep</div>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                        Calculate Earnings
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">How It Works</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Getting started is simple. Follow these three easy steps to begin selling.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <Card key={index} className="text-center bg-card-color border border-border-color relative">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-brand-blue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                                        {step.step}
                                    </div>
                                    <h3 className="text-xl font-semibold text-dark-blue mb-3">{step.title}</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                                </CardContent>
                                {index < steps.length - 1 && (
                                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                                        <ArrowRight className="w-8 h-8 text-gray-300" />
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">What Our Sellers Say</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Hear from successful sellers who have grown their businesses on Lixnet.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index} className="bg-card-color border border-border-color">
                                <CardContent className="p-6">
                                    <div className="flex mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                                        ))}
                                    </div>
                                    <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                                    <div>
                                        <div className="font-semibold text-dark-blue">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.company}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white border-none">
                        <CardContent className="p-8">
                            <h2 className="text-3xl font-bold mb-4">Ready to Start Selling?</h2>
                            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
                                Join thousands of successful sellers on Lixnet. Create your account today
                                and start reaching more customers than ever before.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-green-600 hover:bg-gray-100 px-8"
                                    onClick={() => router.visit('/register')}
                                >
                                    Create Seller Account
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-green-600 px-8"
                                    onClick={() => router.visit('/help')}
                                >
                                    Learn More
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
