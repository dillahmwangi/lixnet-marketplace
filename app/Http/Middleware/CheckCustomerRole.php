<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CheckCustomerRole
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check() && (Auth::user()->role === 'user' || Auth::user()->role === 'admin')) {
            return $next($request);
        }

        session()->flash('error', 'You do not have permission to access customer-only pages.');
        return redirect()->route('marketplace');
    }
}
