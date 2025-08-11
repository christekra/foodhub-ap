<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class VendorMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Vérifier si l'utilisateur est authentifié
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Authentification requise',
                'status' => 401
            ], 401);
        }

        $user = Auth::user();

        // Vérifier si l'utilisateur est vendeur
        if ($user->account_type !== 'vendor') {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Droits de vendeur requis.',
                'status' => 403
            ], 403);
        }

        // Vérifier si le compte est actif
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Compte suspendu ou inactif',
                'status' => 403
            ], 403);
        }

        // Vérifier si le vendeur a un profil restaurant
        $vendor = $user->vendor;
        if (!$vendor) {
            return response()->json([
                'success' => false,
                'message' => 'Profil restaurant non trouvé. Veuillez compléter votre profil.',
                'status' => 403
            ], 403);
        }

        // Vérifier si le restaurant est vérifié (optionnel selon les besoins)
        if (!$vendor->is_verified) {
            return response()->json([
                'success' => false,
                'message' => 'Votre restaurant n\'est pas encore vérifié par nos administrateurs.',
                'status' => 403
            ], 403);
        }

        // Ajouter le vendeur à la requête pour un accès facile
        $request->merge(['vendor_user' => $user, 'vendor_profile' => $vendor]);

        return $next($request);
    }
}
