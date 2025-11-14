<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class JobApplicationController extends Controller
{
    /**
     * Display a listing of job applications (admin only).
     */
    public function index()
    {
        $applications = JobApplication::with('job')->latest()->paginate(15);

        return Inertia::render('admin/job-applications', [
            'applications' => $applications,
        ]);
    }

    /**
     * Store a newly created job application.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|exists:job_postings,id',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cover_letter' => 'required|string|min:10',
            'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // 5MB max
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $request->only(['job_id', 'full_name', 'email', 'phone', 'cover_letter']);

        // Handle file upload
        if ($request->hasFile('resume')) {
            $resumePath = $request->file('resume')->store('resumes', 'public');
            $data['resume_path'] = $resumePath;
        }

        $application = JobApplication::create($data);

        return response()->json([
            'success' => true,
            'message' => 'Application submitted successfully',
            'data' => $application->load('job')
        ]);
    }

    /**
     * Display the specified job application (admin only).
     */
    public function show(JobApplication $application)
    {
        return response()->json([
            'success' => true,
            'data' => $application->load('job')
        ]);
    }

    /**
     * Update the specified job application (admin only).
     */
    public function update(Request $request, JobApplication $application)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,reviewed,accepted,rejected',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $application->update($request->only(['status', 'notes']));

        return response()->json([
            'success' => true,
            'message' => 'Application updated successfully',
            'data' => $application->load('job')
        ]);
    }

    /**
     * Remove the specified job application (admin only).
     */
    public function destroy(JobApplication $application)
    {
        // Delete resume file if exists
        if ($application->resume_path) {
            Storage::disk('public')->delete($application->resume_path);
        }

        $application->delete();

        return response()->json([
            'success' => true,
            'message' => 'Application deleted successfully'
        ]);
    }

    /**
     * Download resume file.
     */
    public function downloadResume(JobApplication $application)
    {
        if (!$application->resume_path || !Storage::disk('public')->exists($application->resume_path)) {
            return response()->json([
                'success' => false,
                'message' => 'Resume file not found'
            ], 404);
        }

        return Storage::disk('public')->download($application->resume_path);
    }
}
