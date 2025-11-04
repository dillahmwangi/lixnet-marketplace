<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Order;
use App\Models\Product;
use App\Models\AgentApplication;
use Illuminate\Http\Request;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Get current month and last month dates
        $currentMonth = Carbon::now()->startOfMonth();
        $lastMonth = Carbon::now()->subMonth()->startOfMonth();

        // Basic stats
        $totalUsers = User::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::whereIn('status', ['completed', 'paid'])->sum('total_amount');
        $totalProducts = Product::count();
        $activeProducts = Product::where('created_at', '>=', Carbon::now()->subDays(30))->count();

        // Current month stats
        $currentMonthUsers = User::where('created_at', '>=', $currentMonth)->count();
        $currentMonthOrders = Order::where('created_at', '>=', $currentMonth)->count();
        $currentMonthRevenue = Order::whereIn('status', ['completed', 'paid'])
            ->where('created_at', '>=', $currentMonth)
            ->sum('total_amount');

        // Last month stats for growth calculation
        $lastMonthUsers = User::whereBetween('created_at', [$lastMonth, $currentMonth])->count();
        $lastMonthOrders = Order::whereBetween('created_at', [$lastMonth, $currentMonth])->count();
        $lastMonthRevenue = Order::whereIn('status', ['completed', 'paid'])
            ->whereBetween('created_at', [$lastMonth, $currentMonth])
            ->sum('total_amount');

        // Calculate growth percentages
        $userGrowth = $lastMonthUsers > 0 ? (($currentMonthUsers - $lastMonthUsers) / $lastMonthUsers) * 100 : 0;
        $orderGrowth = $lastMonthOrders > 0 ? (($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100 : 0;
        $revenueGrowth = $lastMonthRevenue > 0 ? (($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100 : 0;

        // Agent applications stats
        $agentApplications = [
            'total' => AgentApplication::count(),
            'pending' => AgentApplication::where('status', 'pending')->count(),
            'approved' => AgentApplication::where('status', 'approved')->count(),
            'rejected' => AgentApplication::where('status', 'rejected')->count(),
        ];

        // Recent orders (last 5)
        $recentOrders = Order::with('user')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_reference' => $order->order_reference,
                    'customer_name' => $order->full_name ?: ($order->user->name ?? 'N/A'),
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                    'user_email' => $order->user->email ?? $order->email,
                ];
            });

        // User registrations for the last 12 months
        $userRegistrations = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $count = User::whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->count();
            $userRegistrations[] = [
                'month' => $date->format('M Y'),
                'count' => $count,
            ];
        }

        // Monthly revenue for the last 12 months
        $monthlyRevenue = [];
        for ($i = 11; $i >= 0; $i--) {
            $date = Carbon::now()->subMonths($i);
            $revenue = Order::whereIn('status', ['completed', 'paid'])
                ->whereYear('created_at', $date->year)
                ->whereMonth('created_at', $date->month)
                ->sum('total_amount');
            $monthlyRevenue[] = [
                'month' => $date->format('M Y'),
                'revenue' => (float) $revenue,
            ];
        }

        // Order status distribution
        $orderStatusStats = Order::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->get()
            ->map(function ($item) {
                return [
                    'status' => $item->status,
                    'count' => $item->count,
                ];
            });

        return response()->json([
            'stats' => [
                'total_users' => $totalUsers,
                'total_orders' => $totalOrders,
                'total_revenue' => (float) $totalRevenue,
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'current_month_users' => $currentMonthUsers,
                'current_month_orders' => $currentMonthOrders,
                'current_month_revenue' => (float) $currentMonthRevenue,
                'user_growth' => round($userGrowth, 1),
                'order_growth' => round($orderGrowth, 1),
                'revenue_growth' => round($revenueGrowth, 1),
            ],
            'agent_applications' => $agentApplications,
            'recent_orders' => $recentOrders,
            'user_registrations' => $userRegistrations,
            'monthly_revenue' => $monthlyRevenue,
            'order_status_stats' => $orderStatusStats,
        ]);
    }
}
