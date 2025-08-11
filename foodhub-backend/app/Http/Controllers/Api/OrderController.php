<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Dish;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * Display a listing of orders for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Order::where('user_id', $user->id)
                     ->with(['vendor', 'orderItems.dish']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Display a listing of orders for the authenticated user (alias for index).
     */
    public function userOrders(Request $request)
    {
        return $this->index($request);
    }

    /**
     * Display a listing of orders for the authenticated vendor.
     */
    public function vendorOrders(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        $query = Order::where('vendor_id', $vendor->id)
                     ->with(['user', 'orderItems.dish']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search by order number or customer name
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%");
            });
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get vendor statistics.
     */
    public function vendorStats(Request $request)
    {
        $user = $request->user();
        $vendor = $user->vendor;
        
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun profil vendeur trouvé'
            ], 404);
        }

        // Statistiques des 30 derniers jours
        $thirtyDaysAgo = now()->subDays(30);
        
        $stats = [
            'total_orders' => (int) Order::where('vendor_id', $vendor->id)->count(),
            'pending_orders' => (int) Order::where('vendor_id', $vendor->id)
                                   ->where('status', 'pending')->count(),
            'total_revenue' => (float) (Order::where('vendor_id', $vendor->id)
                                   ->where('status', '!=', 'cancelled')
                                   ->sum('total') ?? 0),
            'recent_orders' => (int) Order::where('vendor_id', $vendor->id)
                                   ->where('created_at', '>=', $thirtyDaysAgo)
                                   ->count(),
            'recent_revenue' => (float) (Order::where('vendor_id', $vendor->id)
                                    ->where('status', '!=', 'cancelled')
                                    ->where('created_at', '>=', $thirtyDaysAgo)
                                    ->sum('total') ?? 0),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Store a newly created order.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'vendor_id' => 'required|exists:vendors,id',
            'items' => 'required|array|min:1',
            'items.*.dish_id' => 'required|exists:dishes,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.special_instructions' => 'nullable|string',
            'items.*.customizations' => 'nullable|array',
            'delivery_address' => 'required|string|max:255',
            'delivery_city' => 'required|string|max:100',
            'delivery_postal_code' => 'nullable|string|max:10',
            'delivery_latitude' => 'nullable|numeric|between:-90,90',
            'delivery_longitude' => 'nullable|numeric|between:-180,180',
            'customer_name' => 'required|string|max:255',
            'customer_phone' => 'required|string|max:20',
            'special_instructions' => 'nullable|string',
            'payment_method' => 'required|in:cash,card,mobile_money',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $user = $request->user();
            $vendor = \App\Models\Vendor::findOrFail($request->vendor_id);

            // Calculate order totals
            $subtotal = 0;
            $orderItems = [];

            foreach ($request->items as $item) {
                $dish = Dish::findOrFail($item['dish_id']);
                
                if (!$dish->is_available) {
                    throw new \Exception("Dish {$dish->name} is not available");
                }

                $price = $dish->final_price;
                $total = $price * $item['quantity'];
                $subtotal += $total;

                $orderItems[] = [
                    'dish_id' => $dish->id,
                    'dish_name' => $dish->name,
                    'price' => $price,
                    'quantity' => $item['quantity'],
                    'total' => $total,
                    'special_instructions' => $item['special_instructions'] ?? null,
                    'customizations' => $item['customizations'] ?? null,
                ];
            }

            // Calculate delivery fee and tax
            $deliveryFee = $vendor->delivery_fee;
            $tax = $subtotal * 0.18; // 18% tax
            $total = $subtotal + $deliveryFee + $tax;

            // Check minimum order
            if ($subtotal < $vendor->minimum_order) {
                throw new \Exception("Minimum order amount is {$vendor->minimum_order}");
            }

            // Create order
            $order = Order::create([
                'user_id' => $user->id,
                'vendor_id' => $vendor->id,
                'order_number' => 'ORD-' . time() . '-' . $user->id,
                'status' => 'pending',
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'tax' => $tax,
                'total' => $total,
                'delivery_address' => $request->delivery_address,
                'delivery_city' => $request->delivery_city,
                'delivery_postal_code' => $request->delivery_postal_code,
                'delivery_latitude' => $request->delivery_latitude,
                'delivery_longitude' => $request->delivery_longitude,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'special_instructions' => $request->special_instructions,
                'payment_method' => $request->payment_method,
                'payment_status' => 'pending',
                'estimated_delivery_time' => now()->addMinutes($vendor->delivery_time),
            ]);

            // Create order items
            foreach ($orderItems as $item) {
                $item['order_id'] = $order->id;
                OrderItem::create($item);
            }

            // Update dish order count
            foreach ($request->items as $item) {
                $dish = Dish::find($item['dish_id']);
                $dish->increment('order_count');
            }

            DB::commit();

            $order->load(['vendor', 'orderItems.dish']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Display the specified order.
     */
    public function show($id)
    {
        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $order = Order::where('user_id', $user->id)
                     ->with(['vendor', 'orderItems.dish'])
                     ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Cancel an order.
     */
    public function cancel($id)
    {
        $user = request()->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utilisateur non authentifié'
            ], 401);
        }
        
        $order = Order::where('user_id', $user->id)
                     ->findOrFail($id);

        if (!$order->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Order cannot be cancelled at this stage'
            ], 400);
        }

        $order->update(['status' => 'cancelled']);

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => $order
        ]);
    }

    /**
     * Update order status (for vendors/admins).
     */
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,confirmed,preparing,ready,out_for_delivery,delivered,cancelled,refunded',
            'notes' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation errors',
                'errors' => $validator->errors()
            ], 422);
        }

        $order = Order::findOrFail($id);
        $oldStatus = $order->status;
        $newStatus = $request->status;

        // Vérifier si le changement de statut est autorisé
        if (!in_array($newStatus, $order->next_possible_statuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Ce changement de statut n\'est pas autorisé',
                'current_status' => $order->status,
                'possible_next_statuses' => $order->next_possible_statuses
            ], 400);
        }

        $updateData = ['status' => $newStatus];
        
        // Ajouter des notes si fournies
        if ($request->has('notes')) {
            $updateData['status_notes'] = $request->notes;
        }

        // Mettre à jour delivered_at si livrée
        if ($newStatus === 'delivered') {
            $updateData['delivered_at'] = now();
        }

        $order->update($updateData);

        // Log du changement de statut
        \Log::info('Changement de statut de commande', [
            'order_id' => $order->id,
            'order_number' => $order->order_number,
            'old_status' => $oldStatus,
            'new_status' => $newStatus,
            'updated_by' => $request->user()->id,
            'notes' => $request->notes ?? null
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Statut de la commande mis à jour avec succès',
            'data' => $order->fresh(['user', 'vendor', 'orderItems.dish'])
        ]);
    }

    /**
     * Get all orders (for admins).
     */
    public function allOrders(Request $request)
    {
        $query = Order::with(['user', 'vendor', 'orderItems.dish']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by vendor
        if ($request->has('vendor_id')) {
            $query->where('vendor_id', $request->vendor_id);
        }

        // Filter by date range
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}
