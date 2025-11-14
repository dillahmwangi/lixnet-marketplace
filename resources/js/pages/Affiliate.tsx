import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    DollarSign,
    TrendingUp,
    Share2,
    BarChart3,
    Gift,
    CheckCircle,
    Star,
    ArrowRight,
    Calculator
} from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';

export default function Affiliate() {
    const benefits = [
        {
            icon: <DollarSign className="w-8 h-8 text-green-600" />,
            title: "High Commission Rates",
            description: "Earn up to 15% commission on every successful referral with our tiered commission structure."
        },
        {
            icon: <TrendingUp className="w-8 h-8 text-blue-600" />,
            title: "Unlimited Earnings",
            description: "No caps on your earnings. The more you promote, the more you earn. Scale your income potential."
        },
        {
            icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
            title: "Real-time Tracking",
            description: "Monitor your performance with detailed analytics, conversion tracking, and payout reports."
        },
        {
            icon: <Gift className="w-8 h-8 text-orange-600" />,
            title: "Bonus Rewards",
            description: "Unlock additional bonuses and incentives as you reach new performance milestones."
        }
    ];

    const features = [
        "Custom affiliate links and tracking",
        "Marketing materials and banners",
        "Real-time commission dashboard",
        "Monthly and quarterly bonuses",
        "Dedicated affiliate manager",
        "Multi-level referral program",
        "Performance-based incentives",
        "Flexible payout options"
    ];

    const commissionTiers = [
        {
            level: "Bronze",
            commission: "8%",
            requirement: "0 - 50 referrals",
            color: "bg-amber-100 text-amber-800"
        },
        {
            level: "Silver",
            commission: "12%",
            requirement: "51 - 200 referrals",
            color: "bg-gray-100 text-gray-800"
        },
        {
            level: "Gold",
            commission: "15%",
            requirement: "201+ referrals",
            color: "bg-yellow-100 text-yellow-800"
        }
    ];

    const steps = [
        {
            step: "1",
            title: "Join Program",
            description: "Sign up for our affiliate program and get your unique affiliate link."
        },
        {
            step: "2",
            title: "Promote Products",
            description: "Share your affiliate links across your networks and marketing channels."
        },
        {
            step: "3",
            title: "Earn Commissions",
            description: "Get paid for every successful sale generated through your referrals."
        }
    ];

    const testimonials = [
        {
            name: "Michael Oduya",
            earnings: "KSh 45,000/month",
            rating: 5,
            text: "The affiliate program changed my life. I'm now earning more than my previous job salary!"
        },
        {
            name: "Ann Nyambura",
            earnings: "KSh 28,000/month",
            rating: 5,
            text: "Easy to use platform with excellent support. The commissions are paid on time every month."
        },
        {
            name: "Peter Kamau",
            earnings: "KSh 67,000/month",
            rating: 5,
            text: "Best affiliate program I've joined. The tools and resources provided are top-notch."
        }
    ];

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-dark-blue mb-6">Lixnet Affiliate Program</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Join our affiliate program and earn commissions by promoting quality business solutions.
                        Turn your influence into income with Kenya's leading business marketplace.
                    </p>
                    <div className="mt-8">
                        <Button
                            size="lg"
                            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 text-lg"
                            onClick={() => router.visit('/register')}
                        >
                            Join Affiliate Program
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Why Join Our Affiliate Program?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Discover the benefits of becoming a Lixnet affiliate partner.
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

                {/* Commission Tiers */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Commission Structure</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Earn more as you grow your referral network with our tiered commission system.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {commissionTiers.map((tier, index) => (
                            <Card key={index} className={`text-center border-2 ${index === 2 ? 'border-yellow-300 bg-yellow-50' : 'bg-card-color border-border-color'}`}>
                                <CardContent className="p-6">
                                    <Badge className={`${tier.color} mb-4`}>
                                        {tier.level}
                                    </Badge>
                                    <div className="text-4xl font-bold text-green-600 mb-2">{tier.commission}</div>
                                    <div className="text-gray-600 mb-4">Commission Rate</div>
                                    <div className="text-sm text-gray-500">{tier.requirement}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Features Section */}
                <div className="mb-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-dark-blue mb-6">Powerful Tools & Resources</h2>
                            <p className="text-gray-600 mb-6">
                                Everything you need to succeed as an affiliate marketer, from tracking tools
                                to marketing materials and dedicated support.
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

                        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                            <CardContent className="p-8">
                                <div className="text-center">
                                    <Calculator className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                                    <h3 className="text-2xl font-bold text-dark-blue mb-4">Earnings Calculator</h3>
                                    <p className="text-gray-600 mb-6">
                                        Estimate your potential earnings
                                    </p>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-600">15%</div>
                                            <div className="text-sm text-gray-600">Max Commission</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">$50</div>
                                            <div className="text-sm text-gray-600">Avg. Sale Value</div>
                                        </div>
                                    </div>
                                    <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                        Calculate Potential
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
                            Start earning commissions in three simple steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {steps.map((step, index) => (
                            <Card key={index} className="text-center bg-card-color border border-border-color relative">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 bg-orange-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
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
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Success Stories</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Hear from our top-performing affiliates who have built successful businesses with Lixnet.
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
                                    <div className="mb-2">
                                        <div className="font-semibold text-dark-blue">{testimonial.name}</div>
                                        <div className="text-sm text-green-600 font-medium">{testimonial.earnings}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <div className="text-center">
                    <Card className="bg-gradient-to-r from-orange-600 to-red-600 text-white border-none">
                        <CardContent className="p-8">
                            <h2 className="text-3xl font-bold mb-4">Start Earning Today</h2>
                            <p className="text-orange-100 mb-6 max-w-2xl mx-auto">
                                Join thousands of successful affiliates earning commissions on Lixnet.
                                Your journey to passive income starts here.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-white text-orange-600 hover:bg-gray-100 px-8"
                                    onClick={() => router.visit('/register')}
                                >
                                    Become an Affiliate
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-white text-white hover:bg-white hover:text-orange-600 px-8"
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
