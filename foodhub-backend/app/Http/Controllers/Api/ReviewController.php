<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Dish;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Display a listing of reviews.
     */
    public function index(Request $request)
    {
        $query = Review::with(['user', 'dish', 'vendor']);

        // Filter by rating
        if ($request->has('rating')) {
            $query->where('rating', $request->rating);
        }

        // Filter by verified
        if ($request->has('verified')) {
            $query->verified();
        }

        // Filter by helpful
        if ($request->has('helpful')) {
            $query->helpful();
        }

        $reviews = $query->orderBy('created_at', 'desc')
                        ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Store a newly created review.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'dish_id' => 'nullable|exists:dishes,id',
            'vendor_id' => 'nullable|exists:vendors,id',
            'order_id' => 'nullable|exists:orders,id',
            'rating' => 'required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Check if at least one of dish_id, vendor_id, or order_id is provided
        if (!$request->dish_id && !$request->vendor_id && !$request->order_id) {
            return response()->json([
                'success' => false,
                'message' => 'At least one of dish_id, vendor_id, or order_id is required'
            ], 422);
        }

        $user = $request->user();

        // Check if user has already reviewed this dish/vendor
        $existingReview = Review::where('user_id', $user->id)
                               ->where(function($query) use ($request) {
                                   if ($request->dish_id) {
                                       $query->where('dish_id', $request->dish_id);
                                   }
                                   if ($request->vendor_id) {
                                       $query->where('vendor_id', $request->vendor_id);
                                   }
                               })
                               ->first();

        if ($existingReview) {
            return response()->json([
                'success' => false,
                'message' => 'You have already reviewed this item'
            ], 400);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'dish_id' => $request->dish_id,
            'vendor_id' => $request->vendor_id,
            'order_id' => $request->order_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'images' => $request->images,
        ]);

        // Update dish/vendor rating
        if ($request->dish_id) {
            $this->updateDishRating($request->dish_id);
        }
        if ($request->vendor_id) {
            $this->updateVendorRating($request->vendor_id);
        }

        $review->load(['user', 'dish', 'vendor']);

        return response()->json([
            'success' => true,
            'message' => 'Review created successfully',
            'data' => $review
        ], 201);
    }

    /**
     * Display the specified review.
     */
    public function show($id)
    {
        $review = Review::with(['user', 'dish', 'vendor'])
                       ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $review
        ]);
    }

    /**
     * Update the specified review.
     */
    public function update(Request $request, $id)
    {
        $user = $request->user();
        $review = Review::where('user_id', $user->id)
                       ->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'rating' => 'sometimes|required|integer|between:1,5',
            'comment' => 'nullable|string|max:1000',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $review->update($request->only(['rating', 'comment', 'images']));

        // Update dish/vendor rating
        if ($review->dish_id) {
            $this->updateDishRating($review->dish_id);
        }
        if ($review->vendor_id) {
            $this->updateVendorRating($review->vendor_id);
        }

        $review->load(['user', 'dish', 'vendor']);

        return response()->json([
            'success' => true,
            'message' => 'Review updated successfully',
            'data' => $review
        ]);
    }

    /**
     * Remove the specified review.
     */
    public function destroy($id)
    {
        $user = request()->user();
        $review = Review::where('user_id', $user->id)
                       ->findOrFail($id);

        $dishId = $review->dish_id;
        $vendorId = $review->vendor_id;

        $review->delete();

        // Update dish/vendor rating
        if ($dishId) {
            $this->updateDishRating($dishId);
        }
        if ($vendorId) {
            $this->updateVendorRating($vendorId);
        }

        return response()->json([
            'success' => true,
            'message' => 'Review deleted successfully'
        ]);
    }

    /**
     * Get reviews by dish.
     */
    public function byDish($dishId)
    {
        $reviews = Review::where('dish_id', $dishId)
                        ->with(['user'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get reviews by vendor.
     */
    public function byVendor($vendorId)
    {
        $reviews = Review::where('vendor_id', $vendorId)
                        ->with(['user', 'dish'])
                        ->orderBy('created_at', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Verify a review (admin only).
     */
    public function verify($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_verified' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review verified successfully',
            'data' => $review
        ]);
    }

    /**
     * Mark review as helpful (admin only).
     */
    public function markHelpful($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_helpful' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Review marked as helpful',
            'data' => $review
        ]);
    }

    /**
     * Update dish rating and review count.
     */
    private function updateDishRating($dishId)
    {
        $dish = Dish::find($dishId);
        if ($dish) {
            $avgRating = Review::where('dish_id', $dishId)->avg('rating');
            $reviewCount = Review::where('dish_id', $dishId)->count();
            
            $dish->update([
                'rating' => round($avgRating, 2),
                'review_count' => $reviewCount
            ]);
        }
    }

    /**
     * Update vendor rating and review count.
     */
    private function updateVendorRating($vendorId)
    {
        $vendor = Vendor::find($vendorId);
        if ($vendor) {
            $avgRating = Review::where('vendor_id', $vendorId)->avg('rating');
            $reviewCount = Review::where('vendor_id', $vendorId)->count();
            
            $vendor->update([
                'rating' => round($avgRating, 2),
                'review_count' => $reviewCount
            ]);
        }
    }
}
