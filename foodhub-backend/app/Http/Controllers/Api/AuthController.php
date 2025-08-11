<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use App\Services\GeolocationService;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'address' => 'required|string|max:255',
            'account_type' => 'required|in:client,vendor',
            // Validation conditionnelle pour les vendeurs
            'restaurant_name' => 'required_if:account_type,vendor|string|max:255',
            'cuisine_type' => 'required_if:account_type,vendor|string|max:100',
            'business_hours' => 'required_if:account_type,vendor|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Créer l'utilisateur
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'account_type' => $request->account_type,
            'status' => 'active', // Tous les utilisateurs sont actifs par défaut
        ]);

        // Si c'est un client, créer l'enregistrement client
        if ($request->account_type === 'client') {
            $clientData = [
                'user_id' => $user->id,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => 'Abidjan', // Valeur par défaut
                'postal_code' => '00000', // Valeur par défaut
            ];

            // Ajouter les coordonnées géographiques si l'adresse est fournie
            if ($request->address) {
                $coordinates = GeolocationService::geocode($request->address);
                if ($coordinates) {
                    $clientData['latitude'] = $coordinates['latitude'];
                    $clientData['longitude'] = $coordinates['longitude'];
                }
            }

            \App\Models\Client::create($clientData);
        }

        // Si c'est un vendeur, créer une demande de vendeur ET un profil vendeur
        if ($request->account_type === 'vendor') {
            // Obtenir les coordonnées géographiques
            $coordinates = null;
            if ($request->address) {
                $coordinates = GeolocationService::geocode($request->address);
            }

            // Créer la demande de vendeur
            $applicationData = [
                'user_id' => $user->id,
                'restaurant_name' => $request->restaurant_name,
                'description' => 'Restaurant ' . $request->restaurant_name . ' - ' . $request->cuisine_type,
                'cuisine_type' => $request->cuisine_type,
                'opening_hours' => $request->business_hours,
                'address' => $request->address,
                'phone' => $request->phone,
                'city' => 'Abidjan', // Valeur par défaut
                'postal_code' => '00000', // Valeur par défaut
                'status' => 'pending',
            ];

            if ($coordinates) {
                $applicationData['latitude'] = $coordinates['latitude'];
                $applicationData['longitude'] = $coordinates['longitude'];
            }

            \App\Models\VendorApplication::create($applicationData);

            // Créer le profil vendeur actif
            $vendorData = [
                'user_id' => $user->id,
                'name' => $request->restaurant_name,
                'description' => 'Restaurant ' . $request->restaurant_name . ' - ' . $request->cuisine_type,
                'email' => $user->email,
                'phone' => $request->phone,
                'address' => $request->address,
                'city' => 'Abidjan',
                'postal_code' => '00000',
                'opening_time' => '08:00',
                'closing_time' => '22:00',
                'is_open' => true,
                'delivery_fee' => 500,
                'delivery_time' => 30,
                'minimum_order' => 1000,
                'is_verified' => false,
                'is_featured' => false,
            ];

            if ($coordinates) {
                $vendorData['latitude'] = $coordinates['latitude'];
                $vendorData['longitude'] = $coordinates['longitude'];
            }

            \App\Models\Vendor::create($vendorData);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => $request->account_type === 'client' ? 'Client registered successfully' : 'Vendor application submitted successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 201);
    }

    /**
     * Login user.
     */
    public function login(Request $request)
    {
        \Log::info('Tentative de connexion', [
            'email' => $request->email,
            'request_data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            \Log::error('Erreur de validation', ['errors' => $validator->errors()]);
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        // Vérifier si l'utilisateur existe
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            \Log::error('Utilisateur non trouvé', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        \Log::info('Utilisateur trouvé', [
            'user_id' => $user->id,
            'email' => $user->email,
            'account_type' => $user->account_type,
            'is_admin' => $user->is_admin
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            \Log::error('Échec de l\'authentification', ['email' => $request->email]);
            return response()->json([
                'success' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        \Log::info('Connexion réussie', [
            'user_id' => $user->id,
            'email' => $user->email
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully'
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $request->user()
            ]
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'avatar' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only(['name', 'phone', 'address', 'city', 'postal_code', 'avatar']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'user' => $user
            ]
        ]);
    }

    /**
     * Change password.
     */
    public function changePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Current password is incorrect'
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully'
        ]);
    }
}
