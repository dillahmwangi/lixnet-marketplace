<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AdminUserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query()
            ->withCount('orders')
            ->with(['orders' => function ($query) {
                $query->select('user_id')
                    ->selectRaw('SUM(CASE WHEN status IN ("completed", "paid") THEN total_amount ELSE 0 END) as total_spent')
                    ->groupBy('user_id');
            }]);

        // Apply search filter
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('company', 'like', "%{$search}%");
            });
        }

        // Apply role filter
        if ($request->filled('role')) {
            $query->where('role', $request->role);
        }

        // Apply verification filter
        if ($request->filled('verified')) {
            if ($request->verified === 'true') {
                $query->verified();
            } else {
                $query->whereNull('email_verified_at');
            }
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $users = $query->paginate($request->get('per_page', 15))
            ->withQueryString();

        // Transform users data
        $users->getCollection()->transform(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'company' => $user->company,
                'role' => $user->role,
                'email_verified_at' => $user->email_verified_at,
                'created_at' => $user->created_at,
                'orders_count' => $user->orders_count,
                'total_spent' => $user->orders->first()->total_spent ?? 0,
                'display_name' => $user->display_name,
            ];
        });

        return response()->json([
            'users' => $users,
            'filters' => [
                'search' => $request->search,
                'role' => $request->role,
                'verified' => $request->verified,
                'sort_by' => $sortBy,
                'sort_order' => $sortOrder,
            ],
        ]);
    }

    /**
     * Display the specified user.
     */
    public function show(User $user)
    {
        $user->load([
            'orders' => function ($query) {
                $query->latest()->take(10);
            },
        ]);

        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone,
            'company' => $user->company,
            'role' => $user->role,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'display_name' => $user->display_name,
            'stats' => [
                'total_orders' => $user->total_orders,
                'total_spent' => $user->total_spent,
                'completed_orders_count' => $user->completedOrders()->count(),
                'pending_orders_count' => $user->pendingOrders()->count(),
            ],
            'recent_orders' => $user->orders->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number ?? '#' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at,
                ];
            }),
        ];

        return response()->json([
            'user' => $userData,
        ]);
    }

    /**
     * Get user's complete order history.
     */
    public function orders(Request $request, User $user)
    {
        $query = $user->orders();

        // Apply status filter
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Sort
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        $orders = $query->paginate($request->get('per_page', 10))
            ->withQueryString();

        // Transform orders data
        $orders->getCollection()->transform(function ($order) {
            return [
                'id' => $order->id,
                'order_number' => $order->order_number ?? '#' . str_pad($order->id, 6, '0', STR_PAD_LEFT),
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'created_at' => $order->created_at,
                'updated_at' => $order->updated_at,
            ];
        });

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Update the specified user.
     */
    public function update(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:admin,agent,user',
        ]);

        $user->update([
            'role' => $request->role,
        ]);

        return response()->json([
            'message' => 'User role updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }

    /**
     * Create a new user with admin role.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:admin,agent,user',
            'phone' => 'nullable|string|max:20',
            'company' => 'nullable|string|max:255',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
            'company' => $request->company,
        ]);

        return response()->json([
            'message' => 'User created successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'company' => $user->company,
                'created_at' => $user->created_at,
            ],
        ], 201);
    }
}
