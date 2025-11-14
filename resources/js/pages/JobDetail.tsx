import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, MapPin, Clock, DollarSign, Mail, Phone, Upload, CheckCircle, ArrowLeft } from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { usePage } from '@inertiajs/react';

interface Job {
    id: number;
    title: string;
    description: string;
    requirements: string | null;
    location: string;
    job_type: 'full-time' | 'part-time' | 'contract' | 'internship';
    salary_range: string | null;
    application_deadline: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ApplicationFormData {
    full_name: string;
    email: string;
    phone: string;
    cover_letter: string;
    resume: File | null;
}

export default function JobDetail() {
    const { job: initialJob } = usePage().props as any;
    const [job, setJob] = useState<Job>(initialJob);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [applicationSubmitted, setApplicationSubmitted] = useState(false);

    const [formData, setFormData] = useState<ApplicationFormData>({
        full_name: '',
        email: '',
        phone: '',
        cover_letter: '',
        resume: null
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getJobTypeColor = (jobType: string) => {
        const colors = {
            'full-time': 'bg-green-100 text-green-800',
            'part-time': 'bg-blue-100 text-blue-800',
            'contract': 'bg-purple-100 text-purple-800',
            'internship': 'bg-orange-100 text-orange-800'
        };
        return colors[jobType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const handleInputChange = (field: keyof ApplicationFormData, value: string | File | null) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file && file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error('Resume file size must be less than 5MB');
            return;
        }
        handleInputChange('resume', file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const submitData = new FormData();
            submitData.append('job_id', job.id.toString());
            submitData.append('full_name', formData.full_name);
            submitData.append('email', formData.email);
            submitData.append('phone', formData.phone);
            submitData.append('cover_letter', formData.cover_letter);

            if (formData.resume) {
                submitData.append('resume', formData.resume);
            }

            const response = await axios.post('/api/job-applications', submitData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setApplicationSubmitted(true);
                toast.success('Application submitted successfully!');
            } else {
                toast.error(response.data.message || 'Failed to submit application');
            }
        } catch (error: any) {
            console.error('Application submission error:', error);
            toast.error(error.response?.data?.message || 'Failed to submit application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBackToCareers = () => {
        router.visit('/careers');
    };

    if (applicationSubmitted) {
        return (
            <MarketplaceLayout>
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-dark-blue mb-4">Application Submitted!</h2>
                        <p className="text-xl text-gray-600 mb-8">
                            Thank you for your interest in joining our team. We've received your application for the <strong>{job.title}</strong> position.
                        </p>
                        <div className="space-y-4">
                            <p className="text-gray-500">
                                We'll review your application and get back to you within 1-2 weeks.
                            </p>
                            <div className="flex justify-center space-x-4">
                                <Button
                                    onClick={handleBackToCareers}
                                    variant="outline"
                                    className="text-card-color bg-brand-blue hover:bg-dark-blue hover:text-card-color border-none"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Careers
                                </Button>
                                <Button
                                    onClick={() => router.visit('/')}
                                    className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                                >
                                    Return to Home
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Back Button */}
                <div className="mb-6">
                    <Button
                        variant="ghost"
                        onClick={handleBackToCareers}
                        className="text-brand-blue hover:text-dark-blue"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Careers
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Job Header */}
                        <Card className="bg-card-color border border-border-color">
                            <CardHeader>
                                <div className="flex justify-between items-start mb-4">
                                    <Badge className={getJobTypeColor(job.job_type)}>
                                        {job.job_type.replace('-', ' ').toUpperCase()}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                        Posted {formatDate(job.created_at)}
                                    </span>
                                </div>
                                <CardTitle className="text-3xl text-dark-blue mb-4">{job.title}</CardTitle>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="flex items-center text-gray-600">
                                        <MapPin className="w-5 h-5 mr-2 text-brand-blue" />
                                        <span>{job.location}</span>
                                    </div>
                                    {job.salary_range && (
                                        <div className="flex items-center text-gray-600">
                                            <DollarSign className="w-5 h-5 mr-2 text-brand-blue" />
                                            <span>{job.salary_range}</span>
                                        </div>
                                    )}
                                    {job.application_deadline && (
                                        <div className="flex items-center text-orange-600">
                                            <Clock className="w-5 h-5 mr-2" />
                                            <span>Apply by {formatDate(job.application_deadline)}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Job Description */}
                        <Card className="bg-card-color border border-border-color">
                            <CardHeader>
                                <CardTitle>Job Description</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Requirements */}
                        {job.requirements && (
                            <Card className="bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Requirements</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Information */}
                        {(job.contact_email || job.contact_phone) && (
                            <Card className="bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {job.contact_email && (
                                        <div className="flex items-center text-gray-600">
                                            <Mail className="w-4 h-4 mr-2 text-brand-blue" />
                                            <span>{job.contact_email}</span>
                                        </div>
                                    )}
                                    {job.contact_phone && (
                                        <div className="flex items-center text-gray-600">
                                            <Phone className="w-4 h-4 mr-2 text-brand-blue" />
                                            <span>{job.contact_phone}</span>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Application Form */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-4 bg-card-color border border-border-color">
                            <CardHeader>
                                <CardTitle>Apply for this Position</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="full_name">Full Name *</Label>
                                        <Input
                                            id="full_name"
                                            value={formData.full_name}
                                            onChange={(e) => handleInputChange('full_name', e.target.value)}
                                            required
                                            className="bg-background-color border-border-color"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email *</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            required
                                            className="bg-background-color border-border-color"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number</Label>
                                        <Input
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="bg-background-color border-border-color"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="cover_letter">Cover Letter *</Label>
                                        <Textarea
                                            id="cover_letter"
                                            value={formData.cover_letter}
                                            onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                                            placeholder="Tell us why you're interested in this position..."
                                            className="bg-background-color border-border-color text-gray-900"
                                            rows={4}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="resume">Resume/CV</Label>
                                        <div className="mt-1">
                                            <Input
                                                id="resume"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleFileChange}
                                                className="bg-background-color border-border-color text-gray-900"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                PDF, DOC, or DOCX files up to 5MB
                                            </p>
                                        </div>
                                    </div>

                                    <Alert className="bg-background-color border-border-color text-text-dark">
                                        <CheckCircle className="h-4 w-4" />
                                        <AlertDescription className="text-sm">
                                            By submitting this application, you agree to our privacy policy and terms of service.
                                        </AlertDescription>
                                    </Alert>

                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </MarketplaceLayout>
    );
}
