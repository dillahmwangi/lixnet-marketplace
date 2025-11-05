import { useState, useEffect, JSX } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    ShoppingBag,
    User,
    CreditCard,
    Lock,
    CheckCircle,
    Briefcase,
    PiggyBank,
    GraduationCap,
    Calculator,
    Truck,
    ArrowLeft,
    Shield,
    Smartphone,
    Building2
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCart } from '@/context/cart-context';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import axios from 'axios';
import Breadcrumbs from '@/components/ui/user-breadcrumbs';

interface CheckoutFormData {
    fullName: string;
    email: string;
    phone: string;
    company: string;
    notes: string;
}

type PaymentMethod = 'mpesa' | 'card' | 'bank';

export default function Checkout() {
    const { state } = useCart();
    const { user, isLoading, checkAuth, logout } = useAuth();
    const [formData, setFormData] = useState<CheckoutFormData>({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        notes: ''
    });
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('mpesa');
    const [isProcessing, setIsProcessing] = useState(false);
    const [formErrors, setFormErrors] = useState<Partial<CheckoutFormData>>({});

    // Payment form states
    const [mpesaPhone, setMpesaPhone] = useState('');
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        accountName: '',
        bankName: ''
    });

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please log in to access checkout");
            const redirectPath = encodeURIComponent("/checkout");
            router.visit(`/login?redirect=${redirectPath}`);
            return;
        }

        if (user) {
            setFormData(prev => ({
                ...prev,
                fullName: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                company: user.company || ''
            }));
            setMpesaPhone(user.phone || '');
        }
    }, [user, isLoading]);

    useEffect(() => {
        if (state.items.length === 0) {
            toast.error("Your cart is empty");
            router.visit('/cart');
        }
    }, [state.items]);

    const formatPrice = (price: number) => {
        return `KSh ${price.toLocaleString()}`;
    };

    function getProductIcon(categoryName: string) {
        const iconMap: { [key: string]: JSX.Element } = {
            'Payroll & HR': <Briefcase className='size-6 text-brand-blue' />,
            'SACCO Management': <PiggyBank className='size-6 text-brand-blue' />,
            'School Management': <GraduationCap className='size-6 text-brand-blue' />,
            'POS Systems': <ShoppingBag className='size-6 text-brand-blue' />,
            'Accounting': <Calculator className='size-6 text-brand-blue' />,
            'Inventory': <Truck className='size-6 text-brand-blue' />,
        };

        return Object.entries(iconMap).find(([key]) =>
            categoryName.toLowerCase().includes(key.toLowerCase())
        )?.[1] || <Briefcase className='size-6 text-brand-blue' />;
    }

    const validateForm = () => {
        const errors: Partial<CheckoutFormData> = {};

        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^(\+254|0)[17]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
            errors.phone = 'Please enter a valid Kenyan phone number';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePaymentDetails = () => {
        if (selectedPaymentMethod === 'mpesa') {
            if (!mpesaPhone.trim()) {
                toast.error('M-Pesa phone number is required');
                return false;
            }
            if (!/^(\+254|0)[17]\d{8}$/.test(mpesaPhone.replace(/\s/g, ''))) {
                toast.error('Please enter a valid M-Pesa phone number');
                return false;
            }
        } else if (selectedPaymentMethod === 'card') {
            if (!cardDetails.cardNumber || !cardDetails.cardName || !cardDetails.expiryMonth || !cardDetails.expiryYear || !cardDetails.cvv) {
                toast.error('Please fill in all card details');
                return false;
            }
            if (cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
                toast.error('Please enter a valid 16-digit card number');
                return false;
            }
            if (cardDetails.cvv.length !== 3) {
                toast.error('Please enter a valid 3-digit CVV');
                return false;
            }
        } else if (selectedPaymentMethod === 'bank') {
            if (!bankDetails.accountNumber || !bankDetails.accountName || !bankDetails.bankName) {
                toast.error('Please fill in all bank transfer details');
                return false;
            }
        }
        return true;
    };

    const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleBackToCart = () => {
        router.visit('/cart');
    };

    const formatCardNumber = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        const chunks = cleaned.match(/.{1,4}/g);
        return chunks ? chunks.join(' ') : cleaned;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm() || !validatePaymentDetails()) {
            return;
        }

        setIsProcessing(true);

        try {
            const orderData = {
                full_name: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                company: formData.company,
                notes: formData.notes,
                items: state.items.map(item => ({
                    product_id: item.product.id,
                    quantity: item.quantity,
                    unit_price: item.product.price
                })),
                total_amount: state.totalValue,
                currency: 'KES',
                payment_method: selectedPaymentMethod,
                payment_details: selectedPaymentMethod === 'mpesa' ? { phone: mpesaPhone } :
                    selectedPaymentMethod === 'card' ? cardDetails :
                        bankDetails
            };

            const orderResponse = await axios.post('/api/orders', orderData);

            if (!orderResponse.data.success) {
                throw new Error(orderResponse.data.message || 'Failed to create order');
            }

            const order = orderResponse.data.data.order;
            toast.success("Order created successfully! Initiating payment...");

            const paymentResponse = await axios.post(`/api/orders/${order.id}/pay`);

            if (!paymentResponse.data.success) {
                throw new Error(paymentResponse.data.message || 'Failed to initiate payment');
            }

            const { payment_url } = paymentResponse.data.data;

            toast.success("Redirecting to payment...");
            window.location.href = payment_url;

        } catch (error: any) {
            console.error('Checkout error:', error);

            if (error.response?.status === 422) {
                const validationErrors = error.response.data.errors;
                if (validationErrors) {
                    Object.keys(validationErrors).forEach(field => {
                        toast.error(`${field}: ${validationErrors[field][0]}`);
                    });
                }
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to process order. Please try again.");
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLoginClick = () => {
        user ? logout() : router.visit('/login');
    };

    const handleCartClick = () => {
        router.visit('/cart');
    };

    if (isLoading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading checkout...</p>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout
            onLoginClick={handleLoginClick}
            onCartClick={handleCartClick}
        >
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-4">
                    <Breadcrumbs
                        items={[
                            { label: 'Cart', href: '/cart' },
                            { label: 'Checkout' }
                        ]}
                    />
                </div>

                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={handleBackToCart}
                        className="mb-4 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </Button>
                    <h1 className="text-3xl font-bold text-dark-blue">Checkout</h1>
                    <p className="text-gray-600 mt-2">
                        Complete your order for {state.totalItems} item{state.totalItems !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        {/* Customer Information */}
                        <Card className="bg-card-color text-text-dark border border-border-color">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2 text-brand-blue" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName">Full Name *</Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            className={`bg-background-color border-border-color ${formErrors.fullName ? 'border-red-500' : ''}`}
                                            placeholder="Enter your full name"
                                        />
                                        {formErrors.fullName && (
                                            <p className="text-sm text-red-600">{formErrors.fullName}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className={`bg-background-color border-border-color ${formErrors.email ? 'border-red-500' : ''}`}
                                            placeholder="Enter your email"
                                        />
                                        {formErrors.email && (
                                            <p className="text-sm text-red-600">{formErrors.email}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className={`bg-background-color border-border-color ${formErrors.phone ? 'border-red-500' : ''}`}
                                            placeholder="e.g., +254712345678"
                                        />
                                        {formErrors.phone && (
                                            <p className="text-sm text-red-600">{formErrors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company/Organization</Label>
                                        <Input
                                            id="company"
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            className="bg-background-color border-border-color"
                                            placeholder="Enter company name (optional)"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes">Special Requirements</Label>
                                    <Textarea
                                        id="notes"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        className="bg-background-color border-border-color min-h-[100px]"
                                        placeholder="Any special requirements or notes for your order..."
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Payment Method */}
                        <Card className="bg-card-color text-text-dark border border-border-color">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2 text-brand-blue" />
                                    Payment Method
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <RadioGroup value={selectedPaymentMethod} onValueChange={(value) => setSelectedPaymentMethod(value as PaymentMethod)}>
                                    {/* M-Pesa Option */}
                                    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'mpesa' ? 'border-green-500 bg-green-50' : 'border-border-color'}`}
                                        onClick={() => setSelectedPaymentMethod('mpesa')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="mpesa" id="mpesa" />
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                                    <Smartphone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="mpesa" className="font-semibold cursor-pointer">M-Pesa</Label>
                                                    <p className="text-xs text-gray-600">Pay with mobile money</p>
                                                </div>
                                            </div>
                                            {selectedPaymentMethod === 'mpesa' && <CheckCircle className="w-5 h-5 text-green-600" />}
                                        </div>
                                    </div>

                                    {/* Card Option */}
                                    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-border-color'}`}
                                        onClick={() => setSelectedPaymentMethod('card')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="card" id="card" />
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
                                                    <CreditCard className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="card" className="font-semibold cursor-pointer">Credit/Debit Card</Label>
                                                    <p className="text-xs text-gray-600">Visa, Mastercard, Amex</p>
                                                </div>
                                            </div>
                                            {selectedPaymentMethod === 'card' && <CheckCircle className="w-5 h-5 text-blue-600" />}
                                        </div>
                                    </div>

                                    {/* Bank Transfer Option */}
                                    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedPaymentMethod === 'bank' ? 'border-purple-500 bg-purple-50' : 'border-border-color'}`}
                                        onClick={() => setSelectedPaymentMethod('bank')}>
                                        <div className="flex items-center space-x-3">
                                            <RadioGroupItem value="bank" id="bank" />
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className="w-10 h-10 bg-[#374151] rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <Label htmlFor="bank" className="font-semibold cursor-pointer">Bank Transfer</Label>
                                                    <p className="text-xs text-gray-600">Direct bank payment</p>
                                                </div>
                                            </div>
                                            {selectedPaymentMethod === 'bank' && <CheckCircle className="w-5 h-5 text-purple-600" />}
                                        </div>
                                    </div>
                                </RadioGroup>

                                {/* Payment Details Forms */}
                                <div className="mt-4">
                                    {selectedPaymentMethod === 'mpesa' && (
                                        <div className="space-y-4 p-4 border border-green-200 rounded-lg bg-green-50">
                                            <div className="space-y-2">
                                                <Label htmlFor="mpesaPhone">M-Pesa Phone Number *</Label>
                                                <Input
                                                    id="mpesaPhone"
                                                    type="tel"
                                                    value={mpesaPhone}
                                                    onChange={(e) => setMpesaPhone(e.target.value)}
                                                    className="bg-white border-green-300"
                                                    placeholder="e.g., +254712345678"
                                                />
                                                <p className="text-xs text-green-700">Enter your M-Pesa registered phone number</p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'card' && (
                                        <div className="space-y-4 p-4 border border-blue-200 rounded-lg bg-blue-50">
                                            <div className="space-y-2">
                                                <Label htmlFor="cardNumber">Card Number *</Label>
                                                <Input
                                                    id="cardNumber"
                                                    type="text"
                                                    value={cardDetails.cardNumber}
                                                    onChange={(e) => {
                                                        const formatted = formatCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16));
                                                        setCardDetails({ ...cardDetails, cardNumber: formatted });
                                                    }}
                                                    className="bg-white border-blue-300"
                                                    placeholder="1234 5678 9012 3456"
                                                    maxLength={19}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="cardName">Cardholder Name *</Label>
                                                <Input
                                                    id="cardName"
                                                    type="text"
                                                    value={cardDetails.cardName}
                                                    onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                                                    className="bg-white border-blue-300"
                                                    placeholder="Name on card"
                                                />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryMonth">Month *</Label>
                                                    <Input
                                                        id="expiryMonth"
                                                        type="text"
                                                        value={cardDetails.expiryMonth}
                                                        onChange={(e) => setCardDetails({ ...cardDetails, expiryMonth: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                                                        className="bg-white border-blue-300"
                                                        placeholder="MM"
                                                        maxLength={2}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="expiryYear">Year *</Label>
                                                    <Input
                                                        id="expiryYear"
                                                        type="text"
                                                        value={cardDetails.expiryYear}
                                                        onChange={(e) => setCardDetails({ ...cardDetails, expiryYear: e.target.value.replace(/\D/g, '').slice(0, 2) })}
                                                        className="bg-white border-blue-300"
                                                        placeholder="YY"
                                                        maxLength={2}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="cvv">CVV *</Label>
                                                    <Input
                                                        id="cvv"
                                                        type="text"
                                                        value={cardDetails.cvv}
                                                        onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                                                        className="bg-white border-blue-300"
                                                        placeholder="123"
                                                        maxLength={3}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedPaymentMethod === 'bank' && (
                                        <div className="space-y-4 p-4 border border-purple-200 rounded-lg bg-purple-50">
                                            <div className="space-y-2">
                                                <Label htmlFor="bankName">Bank Name *</Label>
                                                <Input
                                                    id="bankName"
                                                    type="text"
                                                    value={bankDetails.bankName}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                                                    className="bg-white border-purple-300"
                                                    placeholder="e.g., Equity Bank"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="accountName">Account Name *</Label>
                                                <Input
                                                    id="accountName"
                                                    type="text"
                                                    value={bankDetails.accountName}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                                    className="bg-white border-purple-300"
                                                    placeholder="Account holder name"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="accountNumber">Account Number *</Label>
                                                <Input
                                                    id="accountNumber"
                                                    type="text"
                                                    value={bankDetails.accountNumber}
                                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                                    className="bg-white border-purple-300"
                                                    placeholder="Your bank account number"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <Lock className="h-4 w-4 text-blue-600" />
                                    <AlertDescription className="text-blue-800 text-sm">
                                        Your payment information is encrypted and secure.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="space-y-6">
                        <Card className="bg-card-color text-text-dark border border-border-color">
                            <CardHeader>
                                <CardTitle>Order Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {state.items.map((item, index) => (
                                    <div key={item.id}>
                                        {index > 0 && <Separator className="my-4 bg-border-color" />}

                                        <div className="flex items-center space-x-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-white rounded-lg flex items-center justify-center border border-border-color">
                                                {getProductIcon(item.product.category.name)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-dark-blue truncate">
                                                    {item.product.title}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    Qty: {item.quantity} × {formatPrice(item.product.price)}
                                                </p>
                                                <Badge variant="secondary" className="text-xs bg-background-color text-text-dark border border-border-color mt-1">
                                                    {item.product.category.name}
                                                </Badge>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-semibold text-dark-blue">
                                                    {formatPrice(item.product.price * item.quantity)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <Separator className="bg-border-color" />

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal ({state.totalItems} items):</span>
                                        <span>{formatPrice(state.totalValue)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm text-green-600">
                                        <span>Setup Fee:</span>
                                        <span>FREE</span>
                                    </div>

                                    <Separator className="bg-border-color" />

                                    <div className="flex justify-between font-bold text-lg">
                                        <span>Total:</span>
                                        <span className="text-dark-blue">{formatPrice(state.totalValue)}</span>
                                    </div>
                                </div>

                                <Alert className="bg-blue-50 border-blue-200">
                                    <AlertDescription className="text-sm text-blue-800">
                                        <strong>One Time Payment:</strong> Complete payment using {selectedPaymentMethod === 'mpesa' ? 'M-Pesa' : selectedPaymentMethod === 'card' ? 'your card' : 'bank transfer'}.
                                    </AlertDescription>
                                </Alert>

                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={isProcessing}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Processing...
                                        </div>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5 mr-2" />
                                            Complete Secure Payment
                                        </>
                                    )}
                                </Button>

                                <p className="text-xs text-gray-500 text-center">
                                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}