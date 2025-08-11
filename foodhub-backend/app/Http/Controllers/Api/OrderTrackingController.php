<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderTracking;
use App\Models\DeliveryLocation;
use App\Models\UserLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class OrderTrackingController extends Controller
{
    /**
     * Obtenir le suivi d'une commande
     */
    public function show($orderId)
    {
        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $order = Order::with(['tracking', 'deliveryLocations', 'vendor', 'orderItems.dish'])
                     ->where('user_id', $user->id)
                     ->findOrFail($orderId);

        return response()->json([
            'success' => true,
            'data' => [
                'order' => $order,
                'tracking_history' => $order->tracking()->with('updatedBy')->orderBy('created_at', 'desc')->get(),
                'delivery_locations' => $order->deliveryLocations()->orderBy('recorded_at', 'desc')->get(),
                'current_location' => $order->latestDeliveryLocation
            ]
        ]);
    }

    /**
     * Mettre à jour le statut d'une commande (pour vendeurs)
     */
    public function updateStatus(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,ready,out_for_delivery,delivered,cancelled,refunded',
            'notes' => 'nullable|string|max:500',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_address' => 'nullable|string|max:255',
            'estimated_arrival' => 'nullable|date'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($orderId);
        $user = request()->user();

        // Vérifier que l'utilisateur est le vendeur de la commande
        if ($order->vendor_id !== $user->vendor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Vérifier la progression logique des statuts
        if (!in_array($request->status, $order->next_possible_statuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce changement de statut n\'est pas autorisé',
                'current_status' => $order->status,
                'possible_next_statuses' => $order->next_possible_statuses
            ], 400);
        }

        // Créer un enregistrement de suivi
        $tracking = OrderTracking::create([
            'order_id' => $order->id,
            'status' => $request->status,
            'notes' => $request->notes,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'location_address' => $request->location_address,
            'estimated_arrival' => $request->estimated_arrival,
            'updated_by' => $user->id
        ]);

        // Mettre à jour le statut de la commande
        $order->update(['status' => $request->status]);

        // Si c'est "out_for_delivery" et qu'on a des coordonnées, enregistrer la position
        if ($request->status === 'out_for_delivery' && $request->latitude && $request->longitude) {
            DeliveryLocation::create([
                'order_id' => $order->id,
                'delivery_user_id' => $user->id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'location_address' => $request->location_address,
                'recorded_at' => now()
            ]);
        }

        Log::info('Mise à jour du statut de commande', [
            'order_id' => $order->id,
            'old_status' => $order->getOriginal('status'),
            'new_status' => $request->status,
            'updated_by' => $user->id,
            'notes' => $request->notes
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Statut mis à jour avec succès',
            'data' => $order->fresh(['tracking', 'deliveryLocations'])
        ]);
    }

    /**
     * Mettre à jour la position du livreur
     */
    public function updateDeliveryLocation(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'location_address' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($orderId);
        $user = request()->user();

        // Vérifier que l'utilisateur est le vendeur de la commande
        if ($order->vendor_id !== $user->vendor->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accès non autorisé'
            ], 403);
        }

        // Vérifier que la commande est en livraison
        if ($order->status !== 'out_for_delivery') {
            return response()->json([
                'success' => false,
                'message' => 'La commande doit être en livraison pour mettre à jour la position'
            ], 400);
        }

        $deliveryLocation = DeliveryLocation::create([
            'order_id' => $order->id,
            'delivery_user_id' => $user->id,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'location_address' => $request->location_address,
            'recorded_at' => now()
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Position mise à jour',
            'data' => $deliveryLocation
        ]);
    }

    /**
     * Obtenir les adresses sauvegardées d'un utilisateur
     */
    public function getUserLocations()
    {
        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        $locations = UserLocation::where('user_id', $user->id)
                                ->orderBy('is_default', 'desc')
                                ->orderBy('created_at', 'desc')
                                ->get();

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }

    /**
     * Sauvegarder une nouvelle adresse
     */
    public function saveUserLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:100',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'postal_code' => 'nullable|string|max:10',
            'instructions' => 'nullable|string|max:500',
            'is_default' => 'boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }

        // Si c'est l'adresse par défaut, retirer le statut par défaut des autres
        if ($request->is_default) {
            UserLocation::where('user_id', $user->id)
                       ->where('is_default', true)
                       ->update(['is_default' => false]);
        }

        $location = UserLocation::create([
            'user_id' => $user->id,
            'name' => $request->name,
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
            'address' => $request->address,
            'city' => $request->city,
            'postal_code' => $request->postal_code,
            'instructions' => $request->instructions,
            'is_default' => $request->is_default ?? false
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Adresse sauvegardée avec succès',
            'data' => $location
        ]);
    }
} 