import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    User,
    Edit3,
    Save,
    X,
    Mail,
    Phone,
    Building,
    Calendar,
    CreditCard,
    FileText,
    RefreshCw,
    AlertCircle,
    Shield,
    Banknote,
    Landmark,
    Hash,
    MapPin
} from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { router } from '@inertiajs/react';
import { useAuth } from '@/context/auth-context';
import toast from 'react-hot-toast';
import axios from 'axios';
import { type BreadcrumbItem } from '@/types';

interface AgentProfile {
    id: number;
    agent_code: string;
    is_active: boolean;
    tier: {
        id: number;
        name: string;
        commission_rate: number;
    } | null;
    bank_name: string | null;
    account_holder_name: string | null;
    account_number: string | null;
    branch_code: string | null;
    swift_code: string | null;
    bank_address: string | null;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string | null;
        company: string | null;
    };
    created_at: string;
    updated_at: string;
}

export default function Profile() {
    const { user, isLoading, checkAuth } = useAuth();
    const [agentProfile, setAgentProfile] = useState<AgentProfile | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        bank_name: '',
        account_holder_name: '',
        account_number: '',
        branch_code: '',
        swift_code: '',
        bank_address: ''
    });

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/agent/dashboard',
        },
        {
            title: 'Profile',
            href: '/agent/profile',
        },
    ];

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (!isLoading && !user) {
            toast.error("Please log in to view your profile");
            router.visit('/login');
            return;
        }

        if (user) {
            fetchAgentProfile();
        }
    }, [user, isLoading]);

    const fetchAgentProfile = async () => {
        try {
            setIsProfileLoading(true);
            setError(null);

            const response = await axios.get('/api/agent/profile', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            const profileData = response.data.data;
            setAgentProfile(profileData);
            setEditForm({
                name: profileData.user.name || '',
                email: profileData.user.email || '',
                phone: profileData.user.phone || '',
                company: profileData.user.company || '',
                bank_name: profileData.bank_name || '',
                account_holder_name: profileData.account_holder_name || '',
                account_number: profileData.account_number || '',
                branch_code: profileData.branch_code || '',
                swift_code: profileData.swift_code || '',
                bank_address: profileData.bank_address || ''
            });
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch profile';
            setError(errorMessage);
            console.error('Failed to fetch profile:', err);
        } finally {
            setIsProfileLoading(false);
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            // Reset form if canceling
            if (agentProfile) {
                setEditForm({
                    name: agentProfile.user.name || '',
                    email: agentProfile.user.email || '',
                    phone: agentProfile.user.phone || '',
                    company: agentProfile.user.company || '',
                    bank_name: agentProfile.bank_name || '',
                    account_holder_name: agentProfile.account_holder_name || '',
                    account_number: agentProfile.account_number || '',
                    branch_code: agentProfile.branch_code || '',
                    swift_code: agentProfile.swift_code || '',
                    bank_address: agentProfile.bank_address || ''
                });
            }
        } else {
            // Set current values when starting to edit
            if (agentProfile) {
                setEditForm({
                    name: agentProfile.user.name || '',
                    email: agentProfile.user.email || '',
                    phone: agentProfile.user.phone || '',
                    company: agentProfile.user.company || '',
                    bank_name: agentProfile.bank_name || '',
                    account_holder_name: agentProfile.account_holder_name || '',
                    account_number: agentProfile.account_number || '',
                    branch_code: agentProfile.branch_code || '',
                    swift_code: agentProfile.swift_code || '',
                    bank_address: agentProfile.bank_address || ''
                });
            }
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (field: string, value: string) => {
        setEditForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            setError(null);

            const response = await axios.put('/api/agent/profile', editForm, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            setAgentProfile(response.data.data);
            setIsEditing(false);
            toast.success('Profile updated successfully');
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to update profile';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <AppLayout breadcrumbs={breadcrumbs}>
                <div className="space-y-6 p-4">
                    <div className="flex items-center justify-center py-16">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading profile...</p>
                        </div>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="space-y-6 p-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-900">Agent Profile</h1>
                    <p className="text-slate-600 mt-2">
                        Manage your agent information and banking details for commission payouts
                    </p>
                </div>

                {/* Agent Status Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600 rounded-full">
                                    <User className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-blue-900">
                                        Agent Status
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant={agentProfile?.is_active ? 'default' : 'secondary'} className="text-sm">
                                            {agentProfile?.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                        {agentProfile?.tier && (
                                            <Badge variant="outline" className="text-sm border-blue-300 text-blue-700">
                                                {agentProfile.tier.name} Tier
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-blue-600">Agent Code</p>
                                <p className="text-lg font-bold text-blue-900">{agentProfile?.agent_code}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Profile Information */}
                <Card className="bg-white border border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200">
                        <div className="flex items-center gap-3">
                            <User className="w-6 h-6 text-blue-600" />
                            <CardTitle className="text-xl text-slate-900">Personal Information</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={fetchAgentProfile}
                                className="bg-white border-slate-200 hover:bg-slate-50"
                                disabled={isProfileLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isProfileLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleEditToggle}
                                    className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                                >
                                    <Edit3 className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleEditToggle}
                                        className="bg-white border-slate-200 hover:bg-slate-50"
                                        disabled={isSaving}
                                    >
                                        <X className="w-4 h-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveProfile}
                                        className="bg-green-600 hover:bg-green-700 text-white"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4 mr-2" />
                                        )}
                                        Save
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        {error && (
                            <Alert className="mb-6 border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-700">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}

                        {isProfileLoading ? (
                            <div className="space-y-6">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <div key={index} className="animate-pulse space-y-2">
                                        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                                        <div className="h-10 bg-slate-200 rounded"></div>
                                    </div>
                                ))}
                            </div>
                        ) : agentProfile ? (
                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editForm.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your full name"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {agentProfile.user.name || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address
                                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">
                                            <Shield className="w-3 h-3 mr-1" />
                                            Verified
                                        </Badge>
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="Enter your email address"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {agentProfile.user.email}
                                        </div>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {agentProfile.user.phone || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        <Building className="w-4 h-4 inline mr-2" />
                                        Company
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editForm.company}
                                            onChange={(e) => handleInputChange('company', e.target.value)}
                                            placeholder="Enter your company name"
                                            className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {agentProfile.user.company || 'Not provided'}
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-slate-200" />

                                {/* Banking Information */}
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
                                        <Landmark className="w-5 h-5 mr-2" />
                                        Banking Information
                                    </h3>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Provide your banking details for commission payouts. This information is securely stored and encrypted.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Bank Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Landmark className="w-4 h-4 inline mr-2" />
                                                Bank Name
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.bank_name}
                                                    onChange={(e) => handleInputChange('bank_name', e.target.value)}
                                                    placeholder="Enter your bank name"
                                                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                                    {agentProfile.bank_name || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Account Holder Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <User className="w-4 h-4 inline mr-2" />
                                                Account Holder Name
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.account_holder_name}
                                                    onChange={(e) => handleInputChange('account_holder_name', e.target.value)}
                                                    placeholder="Enter account holder name"
                                                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                                    {agentProfile.account_holder_name || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Account Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Hash className="w-4 h-4 inline mr-2" />
                                                Account Number
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.account_number}
                                                    onChange={(e) => handleInputChange('account_number', e.target.value)}
                                                    placeholder="Enter your account number"
                                                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono">
                                                    {agentProfile.account_number || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        {/* Branch Code */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <Building className="w-4 h-4 inline mr-2" />
                                                Branch Code
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.branch_code}
                                                    onChange={(e) => handleInputChange('branch_code', e.target.value)}
                                                    placeholder="Enter branch code"
                                                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                                    {agentProfile.branch_code || 'Not provided'}
                                                </div>
                                            )}
                                        </div>

                                        {/* SWIFT Code */}
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                <CreditCard className="w-4 h-4 inline mr-2" />
                                                SWIFT Code
                                            </label>
                                            {isEditing ? (
                                                <Input
                                                    value={editForm.swift_code}
                                                    onChange={(e) => handleInputChange('swift_code', e.target.value)}
                                                    placeholder="Enter SWIFT code"
                                                    className="bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                                                />
                                            ) : (
                                                <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono">
                                                    {agentProfile.swift_code || 'Not provided'}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bank Address */}
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            Bank Address
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={editForm.bank_address}
                                                onChange={(e) => handleInputChange('bank_address', e.target.value)}
                                                placeholder="Enter your bank address"
                                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-slate-900 focus:border-blue-500 focus:ring-blue-500 resize-none"
                                                rows={3}
                                            />
                                        ) : (
                                            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 whitespace-pre-wrap">
                                                {agentProfile.bank_address || 'Not provided'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Separator className="bg-slate-200" />

                                {/* Account Information */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <Calendar className="w-4 h-4 inline mr-2" />
                                            Member Since
                                        </label>
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900">
                                            {formatDate(agentProfile.created_at)}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            <FileText className="w-4 h-4 inline mr-2" />
                                            Last Updated
                                        </label>
                                        <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-slate-900 font-mono">
                                            {formatDate(agentProfile.updated_at)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                                    Unable to load profile
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    There was an error loading your agent profile information.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={fetchAgentProfile}
                                    className="bg-white border-slate-200 hover:bg-slate-50"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
