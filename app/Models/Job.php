<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Job extends Model
{
    protected $table = 'job_postings';

    protected $fillable = [
        'title',
        'description',
        'requirements',
        'location',
        'job_type',
        'salary_range',
        'application_deadline',
        'contact_email',
        'contact_phone',
        'is_active',
    ];

    protected $casts = [
        'application_deadline' => 'date',
        'is_active' => 'boolean',
    ];

    public function applications()
    {
        return $this->hasMany(JobApplication::class);
    }

    // Scope for active jobs
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope for jobs not past deadline
    public function scopeNotExpired($query)
    {
        return $query->where(function ($q) {
            $q->whereNull('application_deadline')
              ->orWhere('application_deadline', '>=', now()->toDateString());
        });
    }
}
