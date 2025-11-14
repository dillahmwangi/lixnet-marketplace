<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class JobController extends Controller
{
    /**
     * Display a listing of jobs (public careers page).
     */
    public function index()
    {
        $jobs = Job::active()->notExpired()->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $jobs
        ]);
    }

    /**
     * Show the form for creating a new job (admin only).
     */
    public function create()
    {
        return Inertia::render('admin/job-create');
    }

    /**
     * Store a newly created job in storage (admin only).
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'location' => 'required|string|max:255',
            'job_type' => 'required|in:full-time,part-time,contract,internship',
            'salary_range' => 'nullable|string|max:255',
            'application_deadline' => 'nullable|date|after:today',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job = Job::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Job created successfully',
            'data' => $job
        ]);
    }

    /**
     * Display the specified job.
     */
    public function show(Job $job)
    {
        return Inertia::render('JobDetail', [
            'job' => $job,
        ]);
    }

    /**
     * Show the form for editing the specified job (admin only).
     */
    public function edit(Job $job)
    {
        return Inertia::render('admin/job-edit', [
            'job' => $job,
        ]);
    }

    /**
     * Update the specified job in storage (admin only).
     */
    public function update(Request $request, Job $job)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'location' => 'required|string|max:255',
            'job_type' => 'required|in:full-time,part-time,contract,internship',
            'salary_range' => 'nullable|string|max:255',
            'application_deadline' => 'nullable|date',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:20',
            'is_active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $job->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Job updated successfully',
            'data' => $job
        ]);
    }

    /**
     * Remove the specified job from storage (admin only).
     */
    public function destroy(Job $job)
    {
        $job->delete();

        return response()->json([
            'success' => true,
            'message' => 'Job deleted successfully'
        ]);
    }

    /**
     * Get jobs for admin management (admin only).
     */
    public function adminIndex()
    {
        $jobs = Job::latest()->paginate(15);

        return Inertia::render('admin/jobs', [
            'jobs' => $jobs,
        ]);
    }
}
