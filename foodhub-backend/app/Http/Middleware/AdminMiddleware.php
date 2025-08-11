<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
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

        // Vérifier si l'utilisateur est admin
        if ($user->account_type !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accès refusé. Droits d\'administrateur requis.',
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

        // Ajouter l'utilisateur à la requête pour un accès facile
        $request->merge(['admin_user' => $user]);

        return $next($request);
    }
} 