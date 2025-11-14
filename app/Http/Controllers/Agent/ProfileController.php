<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Models\Agent;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    /**
     * Get agent profile
     */
    public function show(): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $agent = Agent::where('user_id', $user->id)->with(['user', 'tier'])->first();

            if (!$agent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent profile not found'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'message' => 'Agent profile retrieved successfully',
                'data' => [
                    'id' => $agent->id,
                    'agent_code' => $agent->agent_code,
                    'is_active' => $agent->is_active,
                    'tier' => $agent->tier,
                    'bank_name' => $agent->bank_name,
                    'account_holder_name' => $agent->account_holder_name,
                    'account_number' => $agent->account_number,
                    'branch_code' => $agent->branch_code,
                    'swift_code' => $agent->swift_code,
                    'bank_address' => $agent->bank_address,
                    'user' => [
                        'id' => $agent->user->id,
                        'name' => $agent->user->name,
                        'email' => $agent->user->email,
                        'phone' => $agent->user->phone,
                        'company' => $agent->user->company,
                    ],
                    'created_at' => $agent->created_at->toISOString(),
                    'updated_at' => $agent->updated_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve agent profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update agent profile
     */
    public function update(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $agent = Agent::where('user_id', $user->id)->first();

            if (!$agent) {
                return response()->json([
                    'success' => false,
                    'message' => 'Agent profile not found'
                ], 404);
            }

            // Validate input
            $validator = Validator::make($request->all(), [
                'bank_name' => 'nullable|string|max:255',
                'account_holder_name' => 'nullable|string|max:255',
                'account_number' => 'nullable|string|max:50',
                'branch_code' => 'nullable|string|max:20',
                'swift_code' => 'nullable|string|max:20',
                'bank_address' => 'nullable|string|max:500',
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255|unique:users,email,' . $user->id,
                'phone' => 'nullable|string|max:20',
                'company' => 'nullable|string|max:255'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Update agent bank details
            $agent->update([
                'bank_name' => $request->bank_name,
                'account_holder_name' => $request->account_holder_name,
                'account_number' => $request->account_number,
                'branch_code' => $request->branch_code,
                'swift_code' => $request->swift_code,
                'bank_address' => $request->bank_address,
            ]);

            // Update user details
            $user->update([
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'company' => $request->company,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Agent profile updated successfully',
                'data' => [
                    'id' => $agent->id,
                    'agent_code' => $agent->agent_code,
                    'is_active' => $agent->is_active,
                    'tier' => $agent->tier,
                    'bank_name' => $agent->bank_name,
                    'account_holder_name' => $agent->account_holder_name,
                    'account_number' => $agent->account_number,
                    'branch_code' => $agent->branch_code,
                    'swift_code' => $agent->swift_code,
                    'bank_address' => $agent->bank_address,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'phone' => $user->phone,
                        'company' => $user->company,
                    ],
                    'created_at' => $agent->created_at->toISOString(),
                    'updated_at' => $agent->updated_at->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update agent profile',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
