import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, MapPin, Clock, DollarSign, Search, Filter } from 'lucide-react';
import { MarketplaceLayout } from '@/layouts/marketplace-layout';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';

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

export default function Careers() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
    const [locationFilter, setLocationFilter] = useState<string>('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get('/api/jobs');
            if (response.data.success) {
                setJobs(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch jobs:', error);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesJobType = jobTypeFilter === 'all' || job.job_type === jobTypeFilter;
        const matchesLocation = locationFilter === 'all' || job.location.toLowerCase().includes(locationFilter.toLowerCase());

        return matchesSearch && matchesJobType && matchesLocation;
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

    const handleViewJob = (jobId: number) => {
        router.visit(`/careers/${jobId}`);
    };

    if (loading) {
        return (
            <MarketplaceLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading careers...</p>
                    </div>
                </div>
            </MarketplaceLayout>
        );
    }

    return (
        <MarketplaceLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-dark-blue mb-4">Join Our Team</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        We're looking for talented individuals to help us build the future of business solutions.
                        Explore our current opportunities and apply today.
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <Card className="bg-card-color border border-border-color">
                        <CardContent className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search jobs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 bg-background-color border-border-color"
                                    />
                                </div>

                                {/* Job Type Filter */}
                                <Select value={jobTypeFilter} onValueChange={setJobTypeFilter}>
                                    <SelectTrigger className="bg-background-color border-border-color">
                                        <SelectValue placeholder="Job Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="full-time">Full Time</SelectItem>
                                        <SelectItem value="part-time">Part Time</SelectItem>
                                        <SelectItem value="contract">Contract</SelectItem>
                                        <SelectItem value="internship">Internship</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Location Filter */}
                                <Select value={locationFilter} onValueChange={setLocationFilter}>
                                    <SelectTrigger className="bg-background-color border-border-color">
                                        <SelectValue placeholder="Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Locations</SelectItem>
                                        <SelectItem value="remote">Remote</SelectItem>
                                        <SelectItem value="nairobi">Nairobi</SelectItem>
                                        <SelectItem value="mombasa">Mombasa</SelectItem>
                                        <SelectItem value="kisumu">Kisumu</SelectItem>
                                    </SelectContent>
                                </Select>

                                {/* Clear Filters */}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setJobTypeFilter('all');
                                        setLocationFilter('all');
                                    }}
                                    className="text-card-color bg-brand-blue hover:bg-dark-blue hover:text-card-color border-none"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Clear Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Jobs List */}
                {filteredJobs.length === 0 ? (
                    <div className="text-center py-16">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                        <p className="text-gray-600">
                            {jobs.length === 0
                                ? "There are no open positions at the moment. Please check back later."
                                : "Try adjusting your search criteria."
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <Card key={job.id} className="bg-card-color border border-border-color hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className={getJobTypeColor(job.job_type)}>
                                            {job.job_type.replace('-', ' ').toUpperCase()}
                                        </Badge>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(job.created_at)}
                                        </span>
                                    </div>
                                    <CardTitle className="text-xl text-dark-blue mb-2">{job.title}</CardTitle>
                                    <div className="flex items-center text-gray-600 mb-2">
                                        <MapPin className="w-4 h-4 mr-1" />
                                        <span className="text-sm">{job.location}</span>
                                    </div>
                                    {job.salary_range && (
                                        <div className="flex items-center text-gray-600 mb-2">
                                            <DollarSign className="w-4 h-4 mr-1" />
                                            <span className="text-sm">{job.salary_range}</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {job.description.length > 150
                                            ? `${job.description.substring(0, 150)}...`
                                            : job.description
                                        }
                                    </p>

                                    {job.application_deadline && (
                                        <div className="flex items-center text-orange-600 mb-4">
                                            <Clock className="w-4 h-4 mr-1" />
                                            <span className="text-sm">
                                                Apply by {formatDate(job.application_deadline)}
                                            </span>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleViewJob(job.id)}
                                        className="w-full bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                                    >
                                        View Details & Apply
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Call to Action */}
                {jobs.length > 0 && (
                    <div className="mt-16 text-center">
                        <Card className="bg-gradient-to-r from-brand-blue to-dark-blue text-white border-none">
                            <CardContent className="p-8">
                                <h3 className="text-2xl font-bold mb-4">Don't see the right fit?</h3>
                                <p className="text-blue-100 mb-6">
                                    We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
                                </p>
                                <Button
                                    variant="secondary"
                                    className="bg-white text-dark-blue hover:bg-gray-100"
                                >
                                    Send General Application
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </MarketplaceLayout>
    );
}
