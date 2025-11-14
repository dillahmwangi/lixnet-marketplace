import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    HelpCircle,
    ShoppingBag,
    CreditCard,
    Truck,
    RefreshCw,
    User,
    MessageSquare,
    Phone,
    Mail,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';

export default function Help() {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const faqCategories = [
        {
            title: "Getting Started",
            icon: <User className="w-6 h-6" />,
            questions: [
                {
                    question: "How do I create an account?",
                    answer: "Click the 'Sign Up' button in the top right corner and fill out the registration form with your details."
                },
                {
                    question: "Is registration free?",
                    answer: "Yes, creating an account on Lixnet is completely free. You only pay for products you purchase."
                },
                {
                    question: "How do I reset my password?",
                    answer: "Click 'Forgot Password' on the login page and follow the instructions sent to your email."
                }
            ]
        },
        {
            title: "Shopping & Orders",
            icon: <ShoppingBag className="w-6 h-6" />,
            questions: [
                {
                    question: "How do I place an order?",
                    answer: "Add items to your cart, proceed to checkout, fill in your details, and complete payment."
                },
                {
                    question: "Can I modify my order after placing it?",
                    answer: "Orders can be modified within 30 minutes of placement. Contact support for assistance."
                },
                {
                    question: "What payment methods do you accept?",
                    answer: "We accept M-Pesa, card payments, and bank transfers through our secure payment partners."
                }
            ]
        },
        {
            title: "Payment & Billing",
            icon: <CreditCard className="w-6 h-6" />,
            questions: [
                {
                    question: "Is my payment information secure?",
                    answer: "Yes, all payments are processed through secure, PCI-compliant gateways with bank-level encryption."
                },
                {
                    question: "When will I be charged?",
                    answer: "Payment is processed immediately upon order confirmation. You will receive a confirmation email."
                },
                {
                    question: "Do you offer refunds?",
                    answer: "Refunds are available within 7 days for most products. Contact support for refund requests."
                }
            ]
        },
        {
            title: "Shipping & Delivery",
            icon: <Truck className="w-6 h-6" />,
            questions: [
                {
                    question: "How long does delivery take?",
                    answer: "Delivery typically takes 2-5 business days within Kenya. International shipping varies by location."
                },
                {
                    question: "Do you ship internationally?",
                    answer: "Yes, we ship to select international destinations. Additional fees and customs duties may apply."
                },
                {
                    question: "How can I track my order?",
                    answer: "Track your order through your account dashboard or the tracking link sent via email."
                }
            ]
        },
        {
            title: "Returns & Exchanges",
            icon: <RefreshCw className="w-6 h-6" />,
            questions: [
                {
                    question: "What is your return policy?",
                    answer: "Items can be returned within 7 days if unused and in original packaging. Digital products are not returnable."
                },
                {
                    question: "How do I initiate a return?",
                    answer: "Contact our support team with your order number and reason for return. We'll guide you through the process."
                },
                {
                    question: "Who pays for return shipping?",
                    answer: "Return shipping costs are covered by the customer unless the item is defective or we made an error."
                }
            ]
        }
    ];

    const contactOptions = [
        {
            title: "Live Chat",
            description: "Chat with our support team instantly",
            icon: <MessageSquare className="w-6 h-6" />,
            action: () => {/* Open live chat */},
            available: "24/7"
        },
        {
            title: "Email Support",
            description: "Send us an email and we'll respond within 24 hours",
            icon: <Mail className="w-6 h-6" />,
            action: () => window.open('mailto:support@lixnet.net', '_blank'),
            available: "24/7"
        },
        {
            title: "Phone Support",
            description: "Speak directly with our customer service team",
            icon: <Phone className="w-6 h-6" />,
            action: () => window.open('tel:+254700000000', '_blank'),
            available: "Mon-Fri 8AM-6PM EAT"
        }
    ];

    const filteredFaqs = faqCategories.map(category => ({
        ...category,
        questions: category.questions.filter(q =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    const toggleFaq = (index: number) => {
        setExpandedFaq(expandedFaq === index ? null : index);
    };

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-dark-blue mb-4">Help Center</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Find answers to common questions or get in touch with our support team.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search for help..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-12 py-3 text-lg bg-card-color border-border-color"
                        />
                    </div>
                </div>

                {/* FAQ Categories */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-dark-blue text-center mb-8">Frequently Asked Questions</h2>

                    {filteredFaqs.length === 0 ? (
                        <div className="text-center py-12">
                            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600">Try adjusting your search terms or contact our support team.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {filteredFaqs.map((category, categoryIndex) => (
                                <Card key={categoryIndex} className="bg-card-color border border-border-color">
                                    <CardHeader>
                                        <CardTitle className="flex items-center text-dark-blue">
                                            <span className="text-brand-blue mr-3">{category.icon}</span>
                                            {category.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {category.questions.map((faq, faqIndex) => {
                                            const globalIndex = categoryIndex * 10 + faqIndex;
                                            const isExpanded = expandedFaq === globalIndex;

                                            return (
                                                <div key={faqIndex} className="border-b border-border-color last:border-b-0">
                                                    <button
                                                        onClick={() => toggleFaq(globalIndex)}
                                                        className="w-full flex items-center justify-between py-4 text-left hover:bg-gray-50 px-2 rounded"
                                                    >
                                                        <span className="font-medium text-dark-blue">{faq.question}</span>
                                                        {isExpanded ? (
                                                            <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 ml-2" />
                                                        )}
                                                    </button>
                                                    {isExpanded && (
                                                        <div className="pb-4 px-2 text-gray-600">
                                                            {faq.answer}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contact Options */}
                <div className="mb-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Contact Support</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Can't find what you're looking for? Our support team is here to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {contactOptions.map((option, index) => (
                            <Card key={index} className="text-center bg-card-color border border-border-color hover:shadow-lg transition-shadow cursor-pointer" onClick={option.action}>
                                <CardContent className="p-6">
                                    <div className="flex justify-center mb-4">
                                        <div className="w-12 h-12 bg-brand-blue bg-opacity-10 rounded-full flex items-center justify-center text-brand-blue">
                                            {option.icon}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-semibold text-dark-blue mb-2">{option.title}</h3>
                                    <p className="text-gray-600 mb-4">{option.description}</p>
                                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                                        {option.available}
                                    </Badge>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Popular Topics */}
                <div className="mb-16">
                    <Card className="bg-gradient-to-r from-brand-blue to-dark-blue text-white border-none">
                        <CardContent className="p-8 text-center">
                            <h2 className="text-3xl font-bold mb-4">Popular Help Topics</h2>
                            <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                                Quick access to our most frequently visited help articles and guides.
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue h-auto py-4">
                                    <div className="text-center">
                                        <ShoppingBag className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm">How to Order</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue h-auto py-4">
                                    <div className="text-center">
                                        <CreditCard className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm">Payment Issues</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue h-auto py-4">
                                    <div className="text-center">
                                        <Truck className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm">Shipping Info</div>
                                    </div>
                                </Button>
                                <Button variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue h-auto py-4">
                                    <div className="text-center">
                                        <RefreshCw className="w-6 h-6 mx-auto mb-2" />
                                        <div className="text-sm">Returns</div>
                                    </div>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Still Need Help */}
                <div className="text-center">
                    <Card className="bg-card-color border border-border-color">
                        <CardContent className="p-8">
                            <HelpCircle className="w-16 h-16 text-brand-blue mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-dark-blue mb-4">Still Need Help?</h3>
                            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                                Our comprehensive help center covers most topics, but if you can't find what you're looking for,
                                our support team is always ready to assist you personally.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    size="lg"
                                    className="bg-brand-blue hover:bg-dark-blue text-white px-8"
                                    onClick={() => window.open('mailto:support@lixnet.net', '_blank')}
                                >
                                    <Mail className="w-5 h-5 mr-2" />
                                    Email Support
                                </Button>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-8"
                                    onClick={() => window.open('tel:+254700000000', '_blank')}
                                >
                                    <Phone className="w-5 h-5 mr-2" />
                                    Call Support
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
