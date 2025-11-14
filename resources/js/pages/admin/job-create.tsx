import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Save } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';

interface JobFormData {
    title: string;
    description: string;
    requirements: string;
    location: string;
    job_type: string;
    salary_range: string;
    application_deadline: string;
    contact_email: string;
    contact_phone: string;
    is_active: boolean;
}

export default function JobCreate() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<JobFormData>({
        title: '',
        description: '',
        requirements: '',
        location: 'Remote',
        job_type: 'full-time',
        salary_range: '',
        application_deadline: '',
        contact_email: '',
        contact_phone: '',
        is_active: true
    });

    const handleInputChange = (field: keyof JobFormData, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/admin/jobs', formData);

            if (response.data.success) {
                toast.success('Job created successfully!');
                router.visit('/admin/jobs');
            } else {
                toast.error(response.data.message || 'Failed to create job');
            }
        } catch (error: any) {
            console.error('Job creation error:', error);
            if (error.response?.data?.errors) {
                // Handle validation errors
                const errors = Object.values(error.response.data.errors).flat();
                errors.forEach((error: any) => toast.error(error));
            } else {
                toast.error(error.response?.data?.message || 'Failed to create job');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.visit('/admin/jobs');
    };

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-4 mb-4">
                        <Button
                            variant="ghost"
                            onClick={handleBack}
                            className="text-brand-blue hover:text-dark-blue"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Jobs
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-dark-blue">Create New Job</h1>
                    <p className="text-gray-600 mt-2">
                        Add a new job posting to attract qualified candidates.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Form */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="title" className="text-dark-blue font-medium">Job Title *</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => handleInputChange('title', e.target.value)}
                                            placeholder="e.g. Senior Software Developer"
                                            required
                                            className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="description" className="text-dark-blue font-medium">Job Description *</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                                            required
                                            className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            rows={6}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="requirements" className="text-dark-blue font-medium">Requirements</Label>
                                        <Textarea
                                            id="requirements"
                                            value={formData.requirements}
                                            onChange={(e) => handleInputChange('requirements', e.target.value)}
                                            placeholder="List the required skills, experience, and qualifications..."
                                            className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Job Details */}
                            <Card className="bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Job Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="location" className="text-dark-blue font-medium">Location *</Label>
                                            <Input
                                                id="location"
                                                value={formData.location}
                                                onChange={(e) => handleInputChange('location', e.target.value)}
                                                placeholder="e.g. Nairobi, Kenya or Remote"
                                                required
                                                className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="job_type" className="text-dark-blue font-medium">Job Type *</Label>
                                            <Select
                                                value={formData.job_type}
                                                onValueChange={(value) => handleInputChange('job_type', value)}
                                            >
                                                <SelectTrigger className="bg-card-color border-border-color text-dark-blue">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full-time">Full Time</SelectItem>
                                                    <SelectItem value="part-time">Part Time</SelectItem>
                                                    <SelectItem value="contract">Contract</SelectItem>
                                                    <SelectItem value="internship">Internship</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="salary_range" className="text-dark-blue font-medium">Salary Range</Label>
                                            <Input
                                                id="salary_range"
                                                value={formData.salary_range}
                                                onChange={(e) => handleInputChange('salary_range', e.target.value)}
                                                placeholder="e.g. KSh 100,000 - 150,000"
                                                className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="application_deadline" className="text-dark-blue font-medium">Application Deadline</Label>
                                            <Input
                                                id="application_deadline"
                                                type="date"
                                                value={formData.application_deadline}
                                                onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                                                className="bg-card-color border-border-color text-dark-blue"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Contact Information */}
                            <Card className="bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Contact Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="contact_email" className="text-dark-blue font-medium">Contact Email</Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                value={formData.contact_email}
                                                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                                                placeholder="hr@company.com"
                                                className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="contact_phone" className="text-dark-blue font-medium">Contact Phone</Label>
                                            <Input
                                                id="contact_phone"
                                                value={formData.contact_phone}
                                                onChange={(e) => handleInputChange('contact_phone', e.target.value)}
                                                placeholder="+254 XXX XXX XXX"
                                                className="bg-card-color border-border-color text-dark-blue placeholder:text-gray-500"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-4 bg-card-color border border-border-color">
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="is_active"
                                            checked={formData.is_active}
                                            onCheckedChange={(checked) => handleInputChange('is_active', checked as boolean)}
                                        />
                                        <Label htmlFor="is_active" className="text-sm">
                                            Publish job immediately
                                        </Label>
                                    </div>

                                    <div className="pt-4 border-t border-border-color">
                                        <Button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                                        >
                                            <Save className="w-4 h-4 mr-2" />
                                            {isSubmitting ? 'Creating...' : 'Create Job'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
