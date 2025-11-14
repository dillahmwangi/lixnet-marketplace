import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Search, Download, Eye, Trash2, Mail, Phone, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import { router } from '@inertiajs/react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AppLayout from '@/layouts/app-layout';

interface JobApplication {
    id: number;
    job_id: number;
    full_name: string;
    email: string;
    phone: string | null;
    cover_letter: string | null;
    resume_path: string | null;
    status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
    notes: string | null;
    created_at: string;
    updated_at: string;
    job: {
        id: number;
        title: string;
        location: string;
        job_type: string;
    };
}

export default function JobApplications() {
    const [applications, setApplications] = useState<JobApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [showUpdateDialog, setShowUpdateDialog] = useState(false);
    const [updateForm, setUpdateForm] = useState({
        status: 'pending' as string,
        notes: '' as string
    });
    const [deleteApplicationId, setDeleteApplicationId] = useState<number | null>(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const response = await axios.get('/api/admin/job-applications');
            if (response.data.success) {
                setApplications(response.data.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch applications:', error);
            toast.error('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            app.job.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'reviewed': 'bg-blue-100 text-blue-800',
            'accepted': 'bg-green-100 text-green-800',
            'rejected': 'bg-red-100 text-red-800'
        };
        return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status: string) => {
        const icons = {
            'pending': <Clock className="w-3 h-3" />,
            'reviewed': <Eye className="w-3 h-3" />,
            'accepted': <CheckCircle className="w-3 h-3" />,
            'rejected': <XCircle className="w-3 h-3" />
        };
        return icons[status as keyof typeof icons] || null;
    };

    const handleViewDetails = (application: JobApplication) => {
        setSelectedApplication(application);
        setShowDetailsDialog(true);
    };

    const handleUpdateStatus = (application: JobApplication) => {
        setSelectedApplication(application);
        setUpdateForm({
            status: application.status,
            notes: application.notes || ''
        });
        setShowUpdateDialog(true);
    };

    const handleUpdateSubmit = async () => {
        if (!selectedApplication) return;

        try {
            const response = await axios.put(`/api/admin/job-applications/${selectedApplication.id}`, updateForm);

            if (response.data.success) {
                toast.success('Application updated successfully');
                fetchApplications();
                setShowUpdateDialog(false);
                setSelectedApplication(null);
            }
        } catch (error) {
            console.error('Failed to update application:', error);
            toast.error('Failed to update application');
        }
    };

    const handleDownloadResume = async (application: JobApplication) => {
        try {
            const response = await axios.get(`/api/admin/job-applications/${application.id}/download-resume`, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `resume_${application.full_name.replace(/\s+/g, '_')}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download resume:', error);
            toast.error('Failed to download resume');
        }
    };

    const handleDeleteApplication = async (applicationId: number) => {
        try {
            const response = await axios.delete(`/api/admin/job-applications/${applicationId}`);
            if (response.data.success) {
                toast.success('Application deleted successfully');
                fetchApplications();
            }
        } catch (error) {
            console.error('Failed to delete application:', error);
            toast.error('Failed to delete application');
        } finally {
            setDeleteApplicationId(null);
        }
    };

    if (loading) {
        return (
            <AppLayout>
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading applications...</p>
                    </div>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-dark-blue">Job Applications</h1>
                    <p className="text-gray-600 mt-2">
                        Review and manage job applications
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-6 bg-card-color border border-border-color">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search applications..."
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
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="reviewed">Reviewed</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Results Count */}
                            <div className="flex items-center text-sm text-gray-600">
                                {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applications Table */}
                <Card className="bg-card-color border border-border-color">
                    <CardHeader>
                        <CardTitle>Applications</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredApplications.length === 0 ? (
                            <div className="text-center py-16">
                                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
                                <p className="text-gray-600">
                                    {applications.length === 0
                                        ? "No job applications have been submitted yet."
                                        : "Try adjusting your search criteria."
                                    }
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Job Position</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Applied Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((application) => (
                                        <TableRow key={application.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-dark-blue">{application.full_name}</div>
                                                    <div className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-3 h-3 mr-1" />
                                                        {application.email}
                                                    </div>
                                                    {application.phone && (
                                                        <div className="text-sm text-gray-500 flex items-center">
                                                            <Phone className="w-3 h-3 mr-1" />
                                                            {application.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">{application.job.title}</div>
                                                    <div className="text-sm text-gray-500">{application.job.location}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${getStatusColor(application.status)} flex items-center w-fit`}>
                                                    {getStatusIcon(application.status)}
                                                    <span className="ml-1 capitalize">{application.status}</span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(application.created_at)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleViewDetails(application)}
                                                        className="text-brand-blue hover:text-dark-blue"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleUpdateStatus(application)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </Button>
                                                    {application.resume_path && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleDownloadResume(application)}
                                                            className="text-green-600 hover:text-green-800"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-800"
                                                                onClick={() => setDeleteApplicationId(application.id)}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent className="bg-card-color border border-border-color">
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Delete Application</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    Are you sure you want to delete the application from {application.full_name}? This action cannot be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() => handleDeleteApplication(application.id)}
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

                {/* Details Dialog */}
                <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                    <DialogContent className="max-w-2xl bg-card-color border border-border-color">
                        <DialogHeader>
                            <DialogTitle>Application Details</DialogTitle>
                        </DialogHeader>
                        {selectedApplication && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium">Full Name</Label>
                                        <p className="text-sm">{selectedApplication.full_name}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Email</Label>
                                        <p className="text-sm">{selectedApplication.email}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Phone</Label>
                                        <p className="text-sm">{selectedApplication.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium">Applied Date</Label>
                                        <p className="text-sm">{formatDate(selectedApplication.created_at)}</p>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm font-medium">Job Applied For</Label>
                                    <p className="text-sm">{selectedApplication.job.title}</p>
                                </div>

                                {selectedApplication.cover_letter && (
                                    <div>
                                        <Label className="text-sm font-medium">Cover Letter</Label>
                                        <div className="mt-1 p-3 bg-background-color rounded-md border border-border-color">
                                            <p className="text-sm whitespace-pre-line">{selectedApplication.cover_letter}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedApplication.notes && (
                                    <div>
                                        <Label className="text-sm font-medium">Admin Notes</Label>
                                        <div className="mt-1 p-3 bg-background-color rounded-md border border-border-color">
                                            <p className="text-sm whitespace-pre-line">{selectedApplication.notes}</p>
                                        </div>
                                    </div>
                                )}

                                {selectedApplication.resume_path && (
                                    <div>
                                        <Label className="text-sm font-medium">Resume</Label>
                                        <Button
                                            onClick={() => handleDownloadResume(selectedApplication)}
                                            variant="outline"
                                            size="sm"
                                            className="mt-1"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Download Resume
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Update Status Dialog */}
                <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
                    <DialogContent className="bg-card-color border border-border-color">
                        <DialogHeader>
                            <DialogTitle>Update Application Status</DialogTitle>
                        </DialogHeader>
                        {selectedApplication && (
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="status">Status</Label>
                                    <Select value={updateForm.status} onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}>
                                        <SelectTrigger className="bg-background-color border-border-color">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pending">Pending</SelectItem>
                                            <SelectItem value="reviewed">Reviewed</SelectItem>
                                            <SelectItem value="accepted">Accepted</SelectItem>
                                            <SelectItem value="rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="notes">Admin Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={updateForm.notes}
                                        onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                                        placeholder="Add notes about this application..."
                                        className="bg-background-color border-border-color"
                                        rows={3}
                                    />
                                </div>

                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdateSubmit} className="bg-dark-blue text-card-color hover:bg-[#001a33] hover:text-card-color">
                                        Update Status
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
