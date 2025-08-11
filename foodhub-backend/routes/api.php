<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\VendorController;
use App\Http\Controllers\Api\DishController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderTrackingController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\GeolocationController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\AdminChatController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Categories
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);

// Vendors
Route::get('/vendors', [VendorController::class, 'index']);
Route::get('/vendors/featured', [VendorController::class, 'featured']);
Route::get('/vendors/search', [VendorController::class, 'search']);
Route::get('/vendors/nearby', [VendorController::class, 'nearby']);
Route::get('/vendors/nearby/address', [VendorController::class, 'nearbyByAddress']);
Route::get('/vendors/city/{city}', [VendorController::class, 'byCity']);
Route::get('/vendors/{id}', [VendorController::class, 'show']);

// Routes de géolocalisation avancées
Route::prefix('geolocation')->group(function () {
    Route::get('/optimized-vendors', [GeolocationController::class, 'getOptimizedVendors']);
    Route::post('/delivery-route', [GeolocationController::class, 'calculateDeliveryRoute']);
    Route::post('/multi-delivery-route', [GeolocationController::class, 'calculateMultiDeliveryRoute']);
    Route::post('/optimal-delivery-person', [GeolocationController::class, 'findOptimalDeliveryPerson']);
    Route::post('/real-time-route', [GeolocationController::class, 'calculateRealTimeRoute']);
    Route::post('/optimize-zone-routes', [GeolocationController::class, 'optimizeZoneRoutes']);
    Route::post('/notifications', [GeolocationController::class, 'sendGeolocationNotifications']);
    Route::post('/geofencing/setup', [GeolocationController::class, 'setupGeofencing']);
    Route::post('/geofencing/check', [GeolocationController::class, 'checkGeofencing']);
    Route::post('/geocode', [GeolocationController::class, 'geocodeWithGoogleMaps']);
    Route::get('/places/search', [GeolocationController::class, 'searchPlaces']);
});

// Dishes
Route::get('/dishes', [DishController::class, 'index']);
Route::get('/dishes/popular', [DishController::class, 'popular']);
Route::get('/dishes/featured', [DishController::class, 'featured']);
Route::get('/dishes/search', [DishController::class, 'search']);
Route::get('/dishes/vendor/{vendorId}', [DishController::class, 'byVendor']);
Route::get('/dishes/category/{categoryId}', [DishController::class, 'byCategory']);
Route::get('/dishes/{id}', [DishController::class, 'show']);

// Reviews
Route::get('/reviews', [ReviewController::class, 'index']);
Route::get('/reviews/dish/{dishId}', [ReviewController::class, 'byDish']);
Route::get('/reviews/vendor/{vendorId}', [ReviewController::class, 'byVendor']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User profile
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::put('/change-password', [AuthController::class, 'changePassword']);

    // Orders
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/user/orders', [OrderController::class, 'userOrders']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::put('/orders/{id}/cancel', [OrderController::class, 'cancel']);
    
    // Suivi de commande
    Route::get('/orders/{id}/tracking', [OrderTrackingController::class, 'show']);
    
    // Gestion des adresses utilisateur
    Route::get('/user/locations', [OrderTrackingController::class, 'getUserLocations']);
    Route::post('/user/locations', [OrderTrackingController::class, 'saveUserLocation']);

    // Reviews
    Route::post('/reviews', [ReviewController::class, 'store']);
    Route::put('/reviews/{id}', [ReviewController::class, 'update']);
    Route::delete('/reviews/{id}', [ReviewController::class, 'destroy']);

    // Chat routes
    Route::prefix('chat')->group(function () {
        Route::post('/send', [ChatController::class, 'sendMessage']);
        Route::get('/history', [ChatController::class, 'getHistory']);
        Route::post('/mark-read', [ChatController::class, 'markAsRead']);
        Route::get('/support-status', [ChatController::class, 'getSupportStatus']);
    });

    // Vendor management (for vendor users)
    Route::middleware('vendor')->group(function () {
        Route::post('/vendors', [VendorController::class, 'store']);
        Route::put('/vendors/{id}', [VendorController::class, 'update']);
        Route::delete('/vendors/{id}', [VendorController::class, 'destroy']);
        
        // Profil du restaurant
        Route::get('/vendor/profile', [VendorController::class, 'profile']);
        Route::put('/vendor/profile', [VendorController::class, 'updateProfile']);
        
        // Commandes du vendeur
        Route::get('/vendor/orders', [OrderController::class, 'vendorOrders']);
        Route::put('/vendor/orders/{id}/status', [OrderController::class, 'updateStatus']);
        
        // Suivi de livraison pour vendeurs
        Route::put('/vendor/orders/{id}/tracking/status', [OrderTrackingController::class, 'updateStatus']);
        Route::put('/vendor/orders/{id}/tracking/location', [OrderTrackingController::class, 'updateDeliveryLocation']);
        Route::get('/vendor/stats', [OrderController::class, 'vendorStats']);
        
        // Plats du vendeur
        Route::get('/vendor/dishes', [DishController::class, 'vendorDishes']);
        Route::post('/vendor/dishes', [DishController::class, 'storeForVendor']);
        Route::get('/vendor/dishes/{id}', [DishController::class, 'show']);
        Route::put('/vendor/dishes/{id}', [DishController::class, 'update']);
        Route::delete('/vendor/dishes/{id}', [DishController::class, 'destroy']);
        Route::put('/vendor/dishes/{id}/availability', [DishController::class, 'toggleAvailability']);
    });
});

// Admin routes
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Dashboard
    Route::get('/admin/dashboard', [AdminController::class, 'dashboard']);
    Route::get('/admin/statistics', [AdminController::class, 'statistics']);
    
    // User management
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::post('/admin/users', [AdminController::class, 'createUser']);
    Route::put('/admin/users/{id}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    
    // Client management
    Route::get('/admin/clients', [AdminController::class, 'clients']);
    Route::put('/admin/clients/{id}/status', [AdminController::class, 'updateClientStatus']);
    
    // Vendor management
    Route::get('/admin/vendors', [AdminController::class, 'vendors']);
    Route::put('/admin/vendors/{id}/verify', [AdminController::class, 'verifyVendor']);
    Route::delete('/admin/vendors/{id}', [AdminController::class, 'rejectVendor']);
    
    // Vendor applications
    Route::get('/admin/vendor-applications', [AdminController::class, 'vendorApplications']);
    Route::put('/admin/vendor-applications/{id}/approve', [AdminController::class, 'approveVendorApplication']);
    Route::put('/admin/vendor-applications/{id}/reject', [AdminController::class, 'rejectVendorApplication']);
    Route::put('/admin/vendor-applications/{id}/review', [AdminController::class, 'reviewVendorApplication']);
    
    // Dish management
    Route::get('/admin/dishes', [AdminController::class, 'dishes']);
    Route::put('/admin/dishes/{id}/approve', [AdminController::class, 'approveDish']);
    Route::delete('/admin/dishes/{id}', [AdminController::class, 'rejectDish']);
    
    // Dish applications
    Route::get('/admin/dish-applications', [AdminController::class, 'dishApplications']);
    Route::put('/admin/dish-applications/{id}/approve', [AdminController::class, 'approveDishApplication']);
    Route::put('/admin/dish-applications/{id}/reject', [AdminController::class, 'rejectDishApplication']);
    
    // Order management
    Route::get('/admin/orders', [AdminController::class, 'orders']);
    
    // Review management
    Route::get('/admin/reviews', [AdminController::class, 'reviews']);
    Route::put('/admin/reviews/{id}/verify', [AdminController::class, 'verifyReview']);
    Route::delete('/admin/reviews/{id}', [AdminController::class, 'deleteReview']);
    
    // Review applications
    Route::get('/admin/review-applications', [AdminController::class, 'reviewApplications']);
    Route::put('/admin/review-applications/{id}/approve', [AdminController::class, 'approveReviewApplication']);
    Route::put('/admin/review-applications/{id}/reject', [AdminController::class, 'rejectReviewApplication']);
    
    // Category management
    Route::get('/admin/categories', [AdminController::class, 'categories']);
    Route::post('/admin/categories', [AdminController::class, 'createCategory']);
    Route::put('/admin/categories/{id}', [AdminController::class, 'updateCategory']);
    Route::delete('/admin/categories/{id}', [AdminController::class, 'deleteCategory']);
    
    // Admin Chat management
    Route::prefix('admin/chat')->group(function () {
        Route::get('/active-chats', [AdminChatController::class, 'getActiveChats']);
        Route::get('/chat-history', [AdminChatController::class, 'getChatHistory']);
        Route::post('/send-response', [AdminChatController::class, 'sendAdminResponse']);
        Route::post('/resolve-chat', [AdminChatController::class, 'resolveChat']);
        Route::get('/stats', [AdminChatController::class, 'getChatStats']);
        Route::get('/search', [AdminChatController::class, 'searchChats']);
    });
}); 