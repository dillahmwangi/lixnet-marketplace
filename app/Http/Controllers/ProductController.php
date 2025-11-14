<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    /**
     * Display a listing of products.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Product::with('category');

            // Apply search filter
            if ($request->filled('search')) {
                $query->search($request->search);
            }

            // Apply category filter
            if ($request->filled('category')) {
                if (is_numeric($request->category)) {
                    $query->byCategory($request->category);
                } else {
                    // Handle category slug
                    $category = Category::findBySlug($request->category);
                    if ($category) {
                        $query->byCategory($category->id);
                    }
                }
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'title');
            $sortOrder = $request->get('sort_order', 'asc');

            $validSortColumns = ['title', 'price', 'rating', 'created_at'];
            if (in_array($sortBy, $validSortColumns)) {
                $query->orderBy($sortBy, $sortOrder);
            } else {
                $query->orderBy('title', 'asc');
            }

            $products = $query->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'message' => 'Products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Store a newly created product.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => 'required|string|max:255|unique:products,title',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'rating_count' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $product = Product::create($request->only([
                'category_id', 'title', 'description', 'price', 'rating', 'rating_count', 'note'
            ]));

            $product->load('category');

            return response()->json([
                'success' => true,
                'data' => $product,
                'message' => 'Product created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Search products by term.
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'q' => 'required|string|min:2|max:100'
        ]);

        try {
            $products = Product::with('category')
                ->search($request->q)
                ->orderBy('title')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $products,
                'count' => $products->count(),
                'message' => 'Products retrieved successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search products',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Update the specified product.
     */
    public function update(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'title' => ['required', 'string', 'max:255', Rule::unique('products')->ignore($product->id)],
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'rating' => 'nullable|numeric|min:0|max:5',
            'rating_count' => 'nullable|integer|min:0',
            'note' => 'nullable|string|max:500',
        ]);

        try {
            $product->update($request->only([
                'category_id', 'title', 'description', 'price', 'rating', 'rating_count', 'note'
            ]));

            $product->load('category');

            return response()->json([
                'success' => true,
                'data' => $product,
                'message' => 'Product updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }

    /**
     * Remove the specified product.
     */
    public function destroy(Product $product): JsonResponse
    {
        try {
            // Check if product is in any carts or orders
            if ($product->cartItems()->count() > 0 || $product->orderItems()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete product that is in carts or orders'
                ], 422);
            }

            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => config('app.debug') ? $e->getMessage() : 'Internal server error'
            ], 500);
        }
    }
}
