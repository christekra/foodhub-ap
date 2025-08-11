<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DishController extends Controller
{
    /**
     * Display a listing of dishes.
     */
    public function index(Request $request)
    {
        $query = Dish::with(['vendor', 'category']);

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by price range
        if ($request->has('min_price')) {
            $query->where('price', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price', '<=', $request->max_price);
        }

        // Filter by availability - only show available dishes by default
        if ($request->has('available')) {
            $query->where('is_available', $request->available);
        } else {
            $query->where('is_available', true); // Only show available dishes
        }

        // Filter by popular
        if ($request->has('popular')) {
            $query->popular();
        }

        // Filter by featured
        if ($request->has('featured')) {
            $query->featured();
        }

        // Filter by dietary preferences
        if ($request->has('vegetarian')) {
            $query->vegetarian();
        }
        if ($request->has('vegan')) {
            $query->vegan();
        }
        if ($request->has('gluten_free')) {
            $query->glutenFree();
        }

        // Filter by cuisine type
        if ($request->has('cuisine_type')) {
            $query->where('cuisine_type', $request->cuisine_type);
        }

        // Filter by spice level
        if ($request->has('spice_level')) {
            $query->where('spice_level', $request->spice_level);
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }

        // Sort by
        $sortBy = $request->get('sort_by', 'name');
        $sortOrder = $request->get('sort_order', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Return all dishes without pagination
        $dishes = $query->get();

        \Log::info('Plats retournés par l\'API:', [
            'count' => $dishes->count(),
            'dishes' => $dishes->map(function($dish) {
                return [
                    'id' => $dish->id,
                    'name' => $dish->name,
                    'vendor' => $dish->vendor->name ?? 'N/A',
                    'is_available' => $dish->is_available
                ];
            })
        ]);

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Display a listing of dishes for the authenticated vendor.
     */
    public function vendorDishes(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        $query = Dish::where('vendor_id', $vendor->id)
                    ->with(['category']);

        // Filter by availability
        if ($request->has('available')) {
            $query->where('is_available', $request->available);
        }

        // Filter by category
        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Search by name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%");
        }

        $dishes = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Store a newly created dish.
     */
    public function store(Request $request)
    {
        // Log des données reçues pour déboguer
        \Log::info('Données reçues pour création de plat:', $request->all());

        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'is_available' => 'boolean',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'ingredients' => 'nullable|array',
            'allergens' => 'nullable|array',
            'preparation_time' => 'nullable|integer|min:1',
            'calories' => 'nullable|numeric|min:0',
            'cuisine_type' => 'nullable|string|max:100',
            'is_vegetarian' => 'boolean',
            'is_vegan' => 'boolean',
            'is_gluten_free' => 'boolean',
            'is_spicy' => 'boolean',
            'spice_level' => 'nullable|integer|between:0,5',
        ]);

        if ($validator->fails()) {
            \Log::error('Erreurs de validation:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $dish = Dish::create($request->all());
            \Log::info('Plat créé avec succès:', ['dish_id' => $dish->id]);

            return response()->json([
                'success' => true,
                'message' => 'Dish created successfully',
                'data' => $dish
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du plat:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du plat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created dish for the authenticated vendor.
     */
    public function storeForVendor(Request $request)
    {
        // Log des données reçues pour déboguer
        \Log::info('Données reçues pour création de plat vendeur:', $request->all());

        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'category_id' => 'required|exists:categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'is_available' => 'boolean',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'ingredients' => 'nullable|array',
            'allergens' => 'nullable|array',
            'preparation_time' => 'nullable|integer|min:1',
            'calories' => 'nullable|numeric|min:0',
            'cuisine_type' => 'nullable|string|max:100',
            'is_vegetarian' => 'boolean',
            'is_vegan' => 'boolean',
            'is_gluten_free' => 'boolean',
            'is_spicy' => 'boolean',
            'spice_level' => 'nullable|integer|between:0,5',
        ]);

        if ($validator->fails()) {
            \Log::error('Erreurs de validation:', $validator->errors()->toArray());
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Ajouter automatiquement le vendor_id
            $dishData = $request->all();
            $dishData['vendor_id'] = $vendor->id;
            
            // S'assurer que preparation_time a une valeur par défaut
            if (empty($dishData['preparation_time'])) {
                $dishData['preparation_time'] = 15;
            }
            
            $dish = Dish::create($dishData);
            \Log::info('Plat créé avec succès:', ['dish_id' => $dish->id, 'vendor_id' => $vendor->id]);

            return response()->json([
                'success' => true,
                'message' => 'Plat créé avec succès',
                'data' => $dish
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la création du plat:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la création du plat: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified dish.
     */
    public function show($id)
    {
        $dish = Dish::with(['vendor', 'category', 'reviews.user'])
                   ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $dish
        ]);
    }

    /**
     * Update the specified dish.
     */
    public function update(Request $request, $id)
    {
        $dish = Dish::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'vendor_id' => 'sometimes|required|exists:vendors,id',
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'image' => 'nullable|string',
            'images' => 'nullable|array',
            'is_available' => 'boolean',
            'is_popular' => 'boolean',
            'is_featured' => 'boolean',
            'ingredients' => 'nullable|array',
            'allergens' => 'nullable|array',
            'preparation_time' => 'nullable|integer|min:1',
            'calories' => 'nullable|numeric|min:0',
            'cuisine_type' => 'nullable|string|max:100',
            'is_vegetarian' => 'boolean',
            'is_vegan' => 'boolean',
            'is_gluten_free' => 'boolean',
            'is_spicy' => 'boolean',
            'spice_level' => 'nullable|integer|between:0,5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $dish->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Dish updated successfully',
            'data' => $dish
        ]);
    }

    /**
     * Remove the specified dish.
     */
    public function destroy($id)
    {
        $dish = Dish::findOrFail($id);
        $dish->delete();

        return response()->json([
            'success' => true,
            'message' => 'Dish deleted successfully'
        ]);
    }

    /**
     * Toggle dish availability.
     */
    public function toggleAvailability(Request $request, $id)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        $dish = Dish::where('id', $id)
                   ->where('vendor_id', $vendor->id)
                   ->firstOrFail();

        $dish->update([
            'is_available' => $request->is_available
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Disponibilité mise à jour avec succès',
            'data' => $dish
        ]);
    }

    /**
     * Get popular dishes.
     */
    public function popular()
    {
        $dishes = Dish::popular()
                     ->available()
                     ->with(['vendor', 'category'])
                     ->orderBy('order_count', 'desc')
                     ->take(10)
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Get featured dishes.
     */
    public function featured()
    {
        $dishes = Dish::featured()
                     ->available()
                     ->with(['vendor', 'category'])
                     ->orderBy('rating', 'desc')
                     ->take(10)
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Get dishes by vendor.
     */
    public function byVendor($vendorId)
    {
        $dishes = Dish::where('vendor_id', $vendorId)
                     ->available()
                     ->with(['category'])
                     ->orderBy('name')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Get dishes by category.
     */
    public function byCategory($categoryId)
    {
        $dishes = Dish::where('category_id', $categoryId)
                     ->available()
                     ->with(['vendor'])
                     ->orderBy('name')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Search dishes.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        $dishes = Dish::where('name', 'like', '%' . $query . '%')
                     ->orWhere('description', 'like', '%' . $query . '%')
                     ->available()
                     ->with(['vendor', 'category'])
                     ->orderBy('name')
                     ->get();

        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }
}
