<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Vendor;
use App\Models\Dish;
use App\Models\Order;
use App\Models\Category;
use App\Models\Review;
use App\Models\Client;
use App\Models\VendorApplication;
use App\Models\DishApplication;
use App\Models\ReviewApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    /**
     * Get admin dashboard statistics
     */
    public function dashboard()
    {
        // Statistiques générales - Utiliser les types de compte des utilisateurs
        $totalUsers = User::count();
        $totalClients = User::where('account_type', 'client')->count();
        $totalVendors = User::where('account_type', 'vendor')->count();
        $totalAdmins = User::where('account_type', 'admin')->count();
        $totalDishes = Dish::count();
        $totalOrders = Order::count();
        $totalRevenue = Order::where('status', 'delivered')->sum('total');
        
        // Commandes par statut
        $ordersByStatus = Order::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();
        
        // Revenus des 7 derniers jours
        $recentRevenue = Order::where('status', 'delivered')
            ->where('created_at', '>=', now()->subDays(7))
            ->sum('total');
        
        // Candidatures en attente
        $pendingVendorApplications = VendorApplication::pending()->count();
        $pendingDishApplications = DishApplication::pending()->count();
        $pendingReviewApplications = ReviewApplication::pending()->count();

        // Utilisateurs par statut
        $usersByStatus = User::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->get();

        // Utilisateurs par type de compte
        $usersByType = User::select('account_type', DB::raw('count(*) as count'))
            ->groupBy('account_type')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'overview' => [
                    'total_users' => $totalUsers,
                    'total_clients' => $totalClients,
                    'total_vendors' => $totalVendors,
                    'total_admins' => $totalAdmins,
                    'total_dishes' => $totalDishes,
                    'total_orders' => $totalOrders,
                    'total_revenue' => $totalRevenue,
                    'recent_revenue' => $recentRevenue,
                ],
                'pending' => [
                    'vendor_applications' => $pendingVendorApplications,
                    'dish_applications' => $pendingDishApplications,
                    'review_applications' => $pendingReviewApplications,
                ],
                'orders_by_status' => $ordersByStatus,
                'users_by_status' => $usersByStatus,
                'users_by_type' => $usersByType,
            ]
        ]);
    }

    /**
     * Get all users with pagination
     */
    public function users(Request $request)
    {
        $query = User::query();
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('type')) {
            $type = $request->get('type');
            if ($type === 'vendors') {
                $query->where('account_type', 'vendor');
            } elseif ($type === 'admins') {
                $query->where('account_type', 'admin');
            } elseif ($type === 'clients') {
                $query->where('account_type', 'client');
            }
        }

        if ($request->has('status')) {
            $status = $request->get('status');
            $query->where('status', $status);
        }
        
        $users = $query->with(['vendor', 'client'])
                      ->orderBy('created_at', 'desc')
                      ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get all clients with pagination
     */
    public function clients(Request $request)
    {
        $query = Client::with(['user', 'orders']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            $query->where('status', $status);
        }
        
        $clients = $query->orderBy('created_at', 'desc')
                        ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $clients
        ]);
    }

    /**
     * Update client status
     */
    public function updateClientStatus(Request $request, $id)
    {
        $client = Client::findOrFail($id);
        
        $request->validate([
            'status' => 'required|in:active,suspended,banned',
            'notes' => 'nullable|string',
        ]);
        
        $client->update([
            'status' => $request->status,
            'notes' => $request->notes,
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Statut du client mis à jour avec succès'
        ]);
    }

    /**
     * Get all vendors with pagination
     */
    public function vendors(Request $request)
    {
        $query = Vendor::with(['user', 'dishes']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'pending') {
                $query->where('is_verified', false);
            } elseif ($status === 'verified') {
                $query->where('is_verified', true);
            }
        }
        
        $vendors = $query->orderBy('created_at', 'desc')
                        ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $vendors
        ]);
    }

    /**
     * Get all vendor applications with pagination
     */
    public function vendorApplications(Request $request)
    {
        $query = VendorApplication::with(['user', 'reviewer']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('restaurant_name', 'like', "%{$search}%")
                  ->orWhereHas('user', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                  });
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            $query->where('status', $status);
        }
        
        $applications = $query->orderBy('created_at', 'desc')
                             ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Approve vendor application
     */
    public function approveVendorApplication(Request $request, $id)
    {
        $application = VendorApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->approve($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature vendeur approuvée avec succès'
        ]);
    }

    /**
     * Reject vendor application
     */
    public function rejectVendorApplication(Request $request, $id)
    {
        $application = VendorApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->reject($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature vendeur rejetée'
        ]);
    }

    /**
     * Put vendor application under review
     */
    public function reviewVendorApplication(Request $request, $id)
    {
        $application = VendorApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->putUnderReview($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature vendeur mise en révision'
        ]);
    }

    /**
     * Verify a vendor
     */
    public function verifyVendor($id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->update(['is_verified' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Vendeur vérifié avec succès'
        ]);
    }

    /**
     * Reject a vendor
     */
    public function rejectVendor($id)
    {
        $vendor = Vendor::findOrFail($id);
        $vendor->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Vendeur rejeté avec succès'
        ]);
    }

    /**
     * Get all dishes with pagination
     */
    public function dishes(Request $request)
    {
        $query = Dish::with(['vendor', 'category']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%");
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'available') {
                $query->where('is_available', true);
            } elseif ($status === 'unavailable') {
                $query->where('is_available', false);
            }
        }
        
        $dishes = $query->orderBy('created_at', 'desc')
                       ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $dishes
        ]);
    }

    /**
     * Get all dish applications with pagination
     */
    public function dishApplications(Request $request)
    {
        $query = DishApplication::with(['vendor', 'category', 'reviewer']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhereHas('vendor', function($q) use ($search) {
                      $q->where('name', 'like', "%{$search}%");
                  });
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            $query->where('status', $status);
        }
        
        $applications = $query->orderBy('created_at', 'desc')
                             ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Approve dish application
     */
    public function approveDishApplication(Request $request, $id)
    {
        $application = DishApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->approve($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature plat approuvée avec succès'
        ]);
    }

    /**
     * Reject dish application
     */
    public function rejectDishApplication(Request $request, $id)
    {
        $application = DishApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->reject($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature plat rejetée'
        ]);
    }

    /**
     * Approve a dish
     */
    public function approveDish($id)
    {
        $dish = Dish::findOrFail($id);
        $dish->update(['is_available' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Plat approuvé avec succès'
        ]);
    }

    /**
     * Reject a dish
     */
    public function rejectDish($id)
    {
        $dish = Dish::findOrFail($id);
        $dish->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Plat rejeté avec succès'
        ]);
    }

    /**
     * Get all orders with pagination
     */
    public function orders(Request $request)
    {
        $query = Order::with(['user', 'vendor', 'orderItems.dish']);
        
        // Filtres
        if ($request->has('status')) {
            $query->where('status', $request->get('status'));
        }
        
        if ($request->has('date_from')) {
            $query->where('created_at', '>=', $request->get('date_from'));
        }
        
        if ($request->has('date_to')) {
            $query->where('created_at', '<=', $request->get('date_to'));
        }
        
        $orders = $query->orderBy('created_at', 'desc')
                       ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Get all reviews with pagination
     */
    public function reviews(Request $request)
    {
        $query = Review::with(['user', 'dish', 'vendor']);
        
        // Filtres
        if ($request->has('status')) {
            $status = $request->get('status');
            if ($status === 'pending') {
                $query->where('is_verified', false);
            } elseif ($status === 'verified') {
                $query->where('is_verified', true);
            }
        }
        
        $reviews = $query->orderBy('created_at', 'desc')
                        ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $reviews
        ]);
    }

    /**
     * Get all review applications with pagination
     */
    public function reviewApplications(Request $request)
    {
        $query = ReviewApplication::with(['user', 'dish', 'order', 'reviewer']);
        
        // Filtres
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->whereHas('user', function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
        
        if ($request->has('status')) {
            $status = $request->get('status');
            $query->where('status', $status);
        }
        
        $applications = $query->orderBy('created_at', 'desc')
                             ->paginate(15);
        
        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Approve review application
     */
    public function approveReviewApplication(Request $request, $id)
    {
        $application = ReviewApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->approve($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature avis approuvée avec succès'
        ]);
    }

    /**
     * Reject review application
     */
    public function rejectReviewApplication(Request $request, $id)
    {
        $application = ReviewApplication::findOrFail($id);
        
        $request->validate([
            'notes' => 'nullable|string',
        ]);
        
        $application->reject($request->user()->id, $request->notes);
        
        return response()->json([
            'success' => true,
            'message' => 'Candidature avis rejetée'
        ]);
    }

    /**
     * Verify a review
     */
    public function verifyReview($id)
    {
        $review = Review::findOrFail($id);
        $review->update(['is_verified' => true]);
        
        return response()->json([
            'success' => true,
            'message' => 'Avis vérifié avec succès'
        ]);
    }

    /**
     * Delete a review
     */
    public function deleteReview($id)
    {
        $review = Review::findOrFail($id);
        $review->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Avis supprimé avec succès'
        ]);
    }

    /**
     * Get categories management
     */
    public function categories()
    {
        $categories = Category::withCount('dishes')
                             ->orderBy('name')
                             ->get();
        
        return response()->json([
            'success' => true,
            'data' => $categories
        ]);
    }

    /**
     * Create a new category
     */
    public function createCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);
        
        $category = Category::create($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Catégorie créée avec succès',
            'data' => $category
        ]);
    }

    /**
     * Update a category
     */
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
        ]);
        
        $category->update($request->all());
        
        return response()->json([
            'success' => true,
            'message' => 'Catégorie mise à jour avec succès',
            'data' => $category
        ]);
    }

    /**
     * Delete a category
     */
    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);
        
        // Vérifier s'il y a des plats dans cette catégorie
        if ($category->dishes()->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer une catégorie qui contient des plats'
            ], 400);
        }
        
        $category->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Catégorie supprimée avec succès'
        ]);
    }

    /**
     * Get detailed statistics
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', 'month'); // week, month, year
        
        switch ($period) {
            case 'week':
                $startDate = now()->startOfWeek();
                break;
            case 'month':
                $startDate = now()->startOfMonth();
                break;
            case 'year':
                $startDate = now()->startOfYear();
                break;
            default:
                $startDate = now()->startOfMonth();
        }
        
        // Statistiques des commandes
        $ordersStats = Order::where('created_at', '>=', $startDate)
            ->selectRaw('
                COUNT(*) as total_orders,
                SUM(total) as total_revenue,
                AVG(total) as average_order_value,
                COUNT(CASE WHEN status = "delivered" THEN 1 END) as completed_orders,
                COUNT(CASE WHEN status = "cancelled" THEN 1 END) as cancelled_orders
            ')
            ->first();
        
        // Top vendeurs
        $topVendors = Vendor::withCount(['orders' => function($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }])
            ->withSum(['orders' => function($query) use ($startDate) {
                $query->where('created_at', '>=', $startDate);
            }], 'total')
            ->orderByDesc('orders_sum_total')
            ->take(10)
            ->get();
        
        // Top plats
        $topDishes = Dish::withCount(['orderItems' => function($query) use ($startDate) {
                $query->whereHas('order', function($q) use ($startDate) {
                    $q->where('created_at', '>=', $startDate);
                });
            }])
            ->orderByDesc('order_items_count')
            ->take(10)
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => [
                'period' => $period,
                'orders_stats' => $ordersStats,
                'top_vendors' => $topVendors,
                'top_dishes' => $topDishes,
            ]
        ]);
    }

    // User management methods
    public function createUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'account_type' => 'required|in:client,vendor,admin',
            'status' => 'required|in:active,pending,suspended,banned',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'account_type' => $request->account_type,
            'status' => $request->status,
            'is_admin' => $request->account_type === 'admin',
        ]);

        return response()->json([
            'message' => 'Utilisateur créé avec succès',
            'user' => $user
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|string|email|max:255|unique:users,email,' . $id,
            'account_type' => 'sometimes|in:client,vendor,admin',
            'status' => 'sometimes|in:active,pending,suspended,banned',
        ]);

        $user->update($request->only(['name', 'email', 'account_type', 'status']));
        
        if ($request->account_type === 'admin') {
            $user->update(['is_admin' => true]);
        }

        return response()->json([
            'message' => 'Utilisateur mis à jour avec succès',
            'user' => $user
        ]);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        // Empêcher la suppression de l'admin principal
        if ($user->email === 'admin@foodhub.ci') {
            return response()->json([
                'message' => 'Impossible de supprimer l\'administrateur principal'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'message' => 'Utilisateur supprimé avec succès'
        ]);
    }
}
