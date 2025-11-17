<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page (Inertia).
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        $request->authenticate();

        $user = Auth::user();

        // For API requests (mobile), return JSON with JWT token
        if ($request->expectsJson()) {
            $token = $user->createToken('mobile-app')->plainTextToken;

            return response()->json([
                'success' => true,
                'user' => $user,
                'token' => $token,
                'redirect' => $user->role === 'admin'
                    ? route('dashboard')
                    : ($user->role === 'agent'
                        ? route('agent.dashboard')
                        : route('marketplace')),
            ]);
        }

        // For web requests, handle session
        $request->session()->regenerate();

        $redirectRoute = null;

        switch ($user->role) {
            case 'admin':
                $redirectRoute = 'dashboard';
                break;
            case 'agent':
                $redirectRoute = 'agent.dashboard';
                break;
            default:
                $redirectRoute = 'marketplace';
                break;
        }

        return redirect()->intended(route($redirectRoute, absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        if ($request->expectsJson()) {
            return response()->json([
                'success' => true,
                'message' => 'Logged out',
                'redirect' => route('login')
            ]);
        }

        return redirect('/');
    }
}
