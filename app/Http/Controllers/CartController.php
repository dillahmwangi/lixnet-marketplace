<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class CartController extends Controller
{
    /**
     * Get the authenticated user's cart.
     */
    public function index(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            
            // Explicitly load items with ALL fields including subscription_tier
            $items = $cart->items()
                ->with('product.category')
                ->get(['id', 'cart_id', 'product_id', 'quantity', 'subscription_tier', 'created_at', 'updated_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'cart' => $cart,
                    'items' => $items,
                    'total_items' => $items->sum('quantity'),
                    'total_value' => $items->sum(fn($item) => $item->product->price * $item->quantity)
                ],
                'message' => 'Cart retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving cart: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Add item to cart.
     */
    public function addItem(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'integer|min:1|max:99',
            'subscription_tier' => 'nullable|string|in:free,basic,premium'
        ]);

        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            $product = Product::find($request->product_id);
            $quantity = $request->get('quantity', 1);
            $subscriptionTier = $request->get('subscription_tier');

            // Check if item already exists in cart
            $query = $cart->items()->where('product_id', $product->id);

            // If subscription product, also match tier
            if ($product->is_subscription && $subscriptionTier) {
                $query->where('subscription_tier', $subscriptionTier);
            }

            $existingItem = $query->first();

            if ($existingItem) {
                // Update quantity
                $newQuantity = $existingItem->quantity + $quantity;
                $existingItem->updateQuantity($newQuantity);
                $cartItem = $existingItem;
            } else {
                // Create new cart item
                $cartItem = $cart->items()->create([
                    'product_id' => $product->id,
                    'quantity' => $quantity,
                    'subscription_tier' => $subscriptionTier
                ]);
            }

            // Get fresh cart data with subscription_tier
            $items = $cart->items()
                ->with('product.category')
                ->get(['id', 'cart_id', 'product_id', 'quantity', 'subscription_tier', 'created_at', 'updated_at']);

            Log::info('Item added to cart', [
                'product_id' => $product->id,
                'quantity' => $quantity,
                'subscription_tier' => $subscriptionTier,
                'user_id' => $user->id
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'cart_item' => $cartItem,
                    'items' => $items,
                    'total_items' => $items->sum('quantity'),
                    'total_value' => $items->sum(fn($item) => $item->product->price * $item->quantity)
                ],
                'message' => 'Item added to cart successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error adding item to cart: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update cart item quantity.
     */
    public function updateItem(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'quantity' => 'required|integer|min:0|max:99'
        ]);

        try {
            // Verify cart ownership
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to cart item'
                ], 403);
            }

            $cartItem->updateQuantity($request->quantity);

            // Get fresh cart data
            $cart = $cartItem->cart;
            $items = $cart->items()
                ->with('product.category')
                ->get(['id', 'cart_id', 'product_id', 'quantity', 'subscription_tier', 'created_at', 'updated_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items,
                    'total_items' => $items->sum('quantity'),
                    'total_value' => $items->sum(fn($item) => $item->product->price * $item->quantity)
                ],
                'message' => $request->quantity > 0
                    ? 'Cart item updated successfully'
                    : 'Cart item removed successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating cart item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update subscription tier for a cart item.
     */
    public function updateSubscriptionTier(Request $request, CartItem $cartItem): JsonResponse
    {
        $request->validate([
            'subscription_tier' => 'required|string|in:free,basic,premium'
        ]);

        try {
            // Verify cart ownership
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to cart item'
                ], 403);
            }

            // Verify this is a subscription product
            if (!$cartItem->product->is_subscription) {
                return response()->json([
                    'success' => false,
                    'message' => 'This product is not a subscription product'
                ], 400);
            }

            $cartItem->updateSubscriptionTier($request->subscription_tier);
            
            // Get fresh cart data
            $cart = $cartItem->cart;
            $items = $cart->items()
                ->with('product.category')
                ->get(['id', 'cart_id', 'product_id', 'quantity', 'subscription_tier', 'created_at', 'updated_at']);

            Log::info('Cart item subscription tier updated', [
                'cart_item_id' => $cartItem->id,
                'subscription_tier' => $request->subscription_tier,
                'user_id' => Auth::id()
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'cart_item' => $cartItem,
                    'items' => $items,
                    'total_items' => $items->sum('quantity'),
                    'total_value' => $items->sum(fn($item) => $item->product->price * $item->quantity)
                ],
                'message' => 'Subscription tier updated successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating subscription tier: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to update subscription tier',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove item from cart.
     */
    public function removeItem(CartItem $cartItem): JsonResponse
    {
        try {
            // Verify cart ownership
            if ($cartItem->cart->user_id !== Auth::id()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized access to cart item'
                ], 403);
            }

            $cart = $cartItem->cart;
            $cartItem->delete();

            // Get fresh cart data
            $items = $cart->items()
                ->with('product.category')
                ->get(['id', 'cart_id', 'product_id', 'quantity', 'subscription_tier', 'created_at', 'updated_at']);

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => $items,
                    'total_items' => $items->sum('quantity'),
                    'total_value' => $items->sum(fn($item) => $item->product->price * $item->quantity)
                ],
                'message' => 'Item removed from cart successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error removing cart item: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Clear all items from cart.
     */
    public function clear(): JsonResponse
    {
        try {
            $user = Auth::user();
            $cart = Cart::findOrCreateForUser($user->id);
            $cart->items()->delete();

            return response()->json([
                'success' => true,
                'data' => [
                    'items' => [],
                    'total_items' => 0,
                    'total_value' => 0
                ],
                'message' => 'Cart cleared successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error clearing cart: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}