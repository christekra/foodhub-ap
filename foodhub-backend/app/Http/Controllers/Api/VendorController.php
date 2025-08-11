<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vendor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Services\GeolocationService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class VendorController extends Controller
{
    /**
     * Display a listing of the vendors.
     */
    public function index(Request $request)
    {
        try {
            // Paramètres de pagination et filtres
            $perPage = $request->get('per_page', 15);
            $search = $request->get('search');
            $city = $request->get('city');
            $minRating = $request->get('min_rating');
            $maxDeliveryFee = $request->get('max_delivery_fee');
            $isOpen = $request->get('is_open');
            $featured = $request->get('featured');
            $verified = $request->get('verified');

            // Créer une clé de cache unique basée sur les paramètres
            $cacheKey = "vendors_" . md5(serialize($request->all()));

            // Vérifier le cache
            if (Cache::has($cacheKey)) {
                return response()->json([
                    'success' => true,
                    'data' => Cache::get($cacheKey)
                ]);
            }

            $query = Vendor::with(['dishes.category', 'reviews'])
                          ->where('is_verified', true);

            // Appliquer les filtres
            if ($search) {
                $query->where(function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%")
                      ->orWhere('city', 'like', "%{$search}%");
                });
            }

            if ($city) {
                $query->where('city', 'like', "%{$city}%");
            }

            if ($minRating) {
                $query->where('rating', '>=', $minRating);
            }

            if ($maxDeliveryFee) {
                $query->where('delivery_fee', '<=', $maxDeliveryFee);
            }

            if ($isOpen !== null) {
                $query->where('is_open', $isOpen);
            }

            if ($featured) {
                $query->where('is_featured', true);
            }

            if ($verified) {
                $query->where('is_verified', true);
            }

            // Trier par popularité (note et nombre de reviews)
            $query->orderByRaw('(rating * review_count) DESC')
                  ->orderBy('is_featured', 'desc')
                  ->orderBy('name', 'asc');

            $vendors = $query->paginate($perPage);

            // Mettre en cache pour 15 minutes
            Cache::put($cacheKey, $vendors, 900);

            return response()->json([
                'success' => true,
                'data' => $vendors
            ]);

        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération des vendeurs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la récupération des vendeurs',
                'status' => 500
            ], 500);
        }
    }

    /**
     * Store a newly created vendor.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'required|email|unique:vendors',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'delivery_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|integer|min:1',
            'minimum_order' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $vendor = Vendor::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vendor created successfully',
            'data' => $vendor
        ], 201);
    }

    /**
     * Display the specified vendor.
     */
    public function show($id)
    {
        $vendor = Vendor::with(['dishes.category', 'reviews.user'])
                       ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vendor
        ]);
    }

    /**
     * Update the specified vendor.
     */
    public function update(Request $request, $id)
    {
        $vendor = Vendor::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'email' => 'sometimes|required|email|unique:vendors,email,' . $id,
            'phone' => 'nullable|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|string',
            'cover_image' => 'nullable|string',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'is_open' => 'nullable|boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|integer|min:1',
            'minimum_order' => 'nullable|numeric|min:0',
            'is_verified' => 'nullable|boolean',
            'is_featured' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $vendor->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Vendor updated successfully',
            'data' => $vendor
        ]);
    }

    /**
     * Remove the specified vendor.
     */
    public function destroy($id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Vendor deleted successfully'
        ]);
    }

    /**
     * Get featured vendors.
     */
    public function featured()
    {
        $vendors = Vendor::featured()
                        ->with(['dishes.category'])
                        ->orderBy('rating', 'desc')
                        ->take(10)
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    /**
     * Get vendors by city.
     */
    public function byCity($city)
    {
        $vendors = Vendor::where('city', 'like', '%' . $city . '%')
                        ->open()
                        ->with(['dishes.category'])
                        ->orderBy('rating', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    /**
     * Search vendors.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        $vendors = Vendor::where('name', 'like', '%' . $query . '%')
                        ->orWhere('description', 'like', '%' . $query . '%')
                        ->orWhere('city', 'like', '%' . $query . '%')
                        ->open()
                        ->with(['dishes.category'])
                        ->orderBy('rating', 'desc')
                        ->get();

        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    /**
     * Get the authenticated vendor's profile.
     */
    public function profile(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        // Ajouter les heures formatées
        $vendorData = $vendor->toArray();
        $vendorData['formatted_opening_time'] = $vendor->formatted_opening_time;
        $vendorData['formatted_closing_time'] = $vendor->formatted_closing_time;

        return response()->json([
            'success' => true,
            'data' => $vendorData
        ]);
    }

    /**
     * Update the authenticated vendor's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'address' => 'sometimes|required|string|max:255',
            'city' => 'sometimes|required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'opening_time' => 'nullable|date_format:H:i',
            'closing_time' => 'nullable|date_format:H:i',
            'is_open' => 'nullable|boolean',
            'delivery_fee' => 'nullable|numeric|min:0',
            'delivery_time' => 'nullable|integer|min:1',
            'minimum_order' => 'nullable|numeric|min:0',
            'logo' => 'nullable|string|max:1000000', // Base64 image, max 1MB
            'cover_image' => 'nullable|string|max:1000000', // Base64 image, max 1MB
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Préparer les données à mettre à jour
            $updateData = $request->all();
            
            // Gérer les images base64
            if ($request->has('logo') && $request->logo) {
                // Vérifier si c'est une image base64 valide
                if (strlen($request->logo) > 1000000) {
                    return response()->json([
                        'success' => false,
                        'message' => 'L\'image du logo est trop volumineuse. Taille maximum : 1MB'
                    ], 422);
                }
                
                // Vérifier le format base64
                if (!preg_match('/^data:image\/(jpeg|jpg|png|gif);base64,/', $request->logo)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Format d\'image invalide. Utilisez JPG, PNG ou GIF'
                    ], 422);
                }
            }
            
            if ($request->has('cover_image') && $request->cover_image) {
                // Vérifier si c'est une image base64 valide
                if (strlen($request->cover_image) > 1000000) {
                    return response()->json([
                        'success' => false,
                        'message' => 'L\'image de couverture est trop volumineuse. Taille maximum : 1MB'
                    ], 422);
                }
                
                // Vérifier le format base64
                if (!preg_match('/^data:image\/(jpeg|jpg|png|gif);base64,/', $request->cover_image)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Format d\'image invalide. Utilisez JPG, PNG ou GIF'
                    ], 422);
                }
            }
            
            $vendor->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Profil mis à jour avec succès',
                'data' => $vendor
            ]);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour du profil vendeur: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors de la mise à jour du profil. Veuillez réessayer.'
            ], 500);
        }
    }

    /**
     * Get vendors near a specific location
     */
    public function nearby(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'radius' => 'nullable|numeric|min:0.1|max:50', // km
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $latitude = $request->latitude;
        $longitude = $request->longitude;
        $radius = $request->get('radius', 10); // 10km par défaut

        // Obtenir les vendeurs dans le rayon spécifié
        $vendorsInRadius = GeolocationService::getVendorsInRadius($latitude, $longitude, $radius);

        // Formater la réponse
        $vendors = collect($vendorsInRadius)->map(function ($vendor) {
            return [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'description' => $vendor->description,
                'address' => $vendor->address,
                'city' => $vendor->city,
                'latitude' => $vendor->latitude,
                'longitude' => $vendor->longitude,
                'distance' => round($vendor->distance, 2), // km
                'rating' => $vendor->rating,
                'review_count' => $vendor->review_count,
                'delivery_fee' => $vendor->delivery_fee,
                'delivery_time' => $vendor->delivery_time,
                'minimum_order' => $vendor->minimum_order,
                'is_open' => $vendor->is_open,
                'is_verified' => $vendor->is_verified,
                'is_featured' => $vendor->is_featured,
                'logo' => $vendor->logo,
                'cover_image' => $vendor->cover_image,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'vendors' => $vendors,
                'total' => $vendors->count(),
                'radius' => $radius,
                'center' => [
                    'latitude' => $latitude,
                    'longitude' => $longitude,
                ]
            ]
        ]);
    }

    /**
     * Get vendors by distance from current user location
     */
    public function nearbyByAddress(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'address' => 'required|string|max:500',
            'radius' => 'nullable|numeric|min:0.1|max:50', // km
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $address = $request->address;
        $radius = $request->get('radius', 10); // 10km par défaut

        // Geocoder l'adresse
        $coordinates = GeolocationService::geocode($address);

        if (!$coordinates) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de localiser cette adresse'
            ], 400);
        }

        // Obtenir les vendeurs dans le rayon spécifié
        $vendorsInRadius = GeolocationService::getVendorsInRadius(
            $coordinates['latitude'], 
            $coordinates['longitude'], 
            $radius
        );

        // Formater la réponse
        $vendors = collect($vendorsInRadius)->map(function ($vendor) {
            return [
                'id' => $vendor->id,
                'name' => $vendor->name,
                'description' => $vendor->description,
                'address' => $vendor->address,
                'city' => $vendor->city,
                'latitude' => $vendor->latitude,
                'longitude' => $vendor->longitude,
                'distance' => round($vendor->distance, 2), // km
                'rating' => $vendor->rating,
                'review_count' => $vendor->review_count,
                'delivery_fee' => $vendor->delivery_fee,
                'delivery_time' => $vendor->delivery_time,
                'minimum_order' => $vendor->minimum_order,
                'is_open' => $vendor->is_open,
                'is_verified' => $vendor->is_verified,
                'is_featured' => $vendor->is_featured,
                'logo' => $vendor->logo,
                'cover_image' => $vendor->cover_image,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'vendors' => $vendors,
                'total' => $vendors->count(),
                'radius' => $radius,
                'search_address' => $address,
                'center' => [
                    'latitude' => $coordinates['latitude'],
                    'longitude' => $coordinates['longitude'],
                    'display_name' => $coordinates['display_name'],
                ]
            ]
        ]);
    }
}
