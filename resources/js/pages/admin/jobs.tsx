import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Search, Edit, Trash2, Eye, MapPin, Clock, DollarSign, Briefcase } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';

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
    applications_count?: number;
}

export default function Jobs() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await axios.get('/api/admin/jobs');
            if (response.data.success) {
                setJobs(response.data.data.data);
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
        const matchesStatus = statusFilter === 'all' ||
                            (statusFilter === 'active' && job.is_active) ||
                            (statusFilter === 'inactive' && !job.is_active);
        const matchesType = typeFilter === 'all' || job.job_type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
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

    const handleCreateJob = () => {
        router.visit('/admin/jobs/create');
    };

    const handleEditJob = (jobId: number) => {
        router.visit(`/admin/jobs/${jobId}/edit`);
    };

    const handleViewJob = (jobId: number) => {
        router.visit(`/careers/${jobId}`);
    };

    const handleDeleteJob = async (jobId: number) => {
        try {
            const response = await axios.delete(`/api/admin/jobs/${jobId}`);
            if (response.data.success) {
                toast.success('Job deleted successfully');
                fetchJobs(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to delete job:', error);
            toast.error('Failed to delete job');
        } finally {
            setDeleteJobId(null);
        }
    };

    const toggleJobStatus = async (job: Job) => {
        try {
            const response = await axios.put(`/api/admin/jobs/${job.id}`, {
                ...job,
                is_active: !job.is_active
            });

            if (response.data.success) {
                toast.success(`Job ${job.is_active ? 'deactivated' : 'activated'} successfully`);
                fetchJobs(); // Refresh the list
            }
        } catch (error) {
            console.error('Failed to update job status:', error);
            toast.error('Failed to update job status');
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading jobs...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-dark-blue">Job Management</h1>
                        <p className="text-gray-600 mt-2">
                            Manage job postings and applications
                        </p>
                    </div>
                    <Button
                        onClick={handleCreateJob}
                        className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Job
                    </Button>
                </div>

                {/* Filters */}
                <Card className="mb-6 bg-card-color border border-border-color">
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

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="bg-background-color border-border-color">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
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

                            {/* Results Count */}
                            <div className="flex items-center text-sm text-gray-600">
                                {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jobs Table */}
                <Card className="bg-card-color border border-border-color">
                    <CardHeader>
                        <CardTitle>Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredJobs.length === 0 ? (
                            <div className="text-center py-16">
                                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                                <p className="text-gray-600 mb-6">
                                    {jobs.length === 0
                                        ? "You haven't created any jobs yet."
                                        : "Try adjusting your search criteria."
                                    }
                                </p>
                                {jobs.length === 0 && (
                                    <Button
                                        onClick={handleCreateJob}
                                        className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Your First Job
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Job Title</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Applications</TableHead>
                                        <TableHead>Deadline</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredJobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-dark-blue">{job.title}</div>
                                                    <div className="text-sm text-gray-500 line-clamp-1">
                                                        {job.description.substring(0, 60)}...
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getJobTypeColor(job.job_type)}>
                                                    {job.job_type.replace('-', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center text-sm">
                                                    <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                                                    {job.location}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleJobStatus(job)}
                                                    className={job.is_active ? 'text-green-600' : 'text-gray-400'}
                                                >
                                                    {job.is_active ? 'Active' : 'Inactive'}
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {job.applications_count || 0} applications
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {job.application_deadline ? (
                                                    <div className="flex items-center text-sm">
                                                        <Clock className="w-3 h-3 mr-1 text-orange-400" />
                                                        {formatDate(job.application_deadline)}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-400">No deadline</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewJob(job.id)}
                                                        className="text-brand-blue hover:text-dark-blue"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditJob(job.id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-800"
                                                                onClick={() => setDeleteJobId(job.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-card-color border border-border-color">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Job</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete "{job.title}"? This action cannot be undone and will also delete all associated applications.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteJob(job.id)}
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
