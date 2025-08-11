<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class AdminChatController extends Controller
{
    /**
     * Récupérer tous les chats actifs
     */
    public function getActiveChats(): JsonResponse
    {
        // Récupérer tous les chats actifs depuis le cache
        $activeChats = [];
        $cacheKeys = Cache::get('active_chat_sessions', []);
        
        foreach ($cacheKeys as $sessionKey) {
            $chatHistory = Cache::get($sessionKey, []);
            if (!empty($chatHistory)) {
                $lastMessage = end($chatHistory);
                $userInfo = $this->getUserInfoFromSession($sessionKey);
                
                $activeChats[] = [
                    'session_id' => $sessionKey,
                    'user_info' => $userInfo,
                    'last_message' => $lastMessage,
                    'unread_count' => $this->getUnreadCount($sessionKey),
                    'last_activity' => $lastMessage['timestamp'] ?? now()->toISOString(),
                    'status' => 'active'
                ];
            }
        }
        
        // Trier par dernière activité
        usort($activeChats, function($a, $b) {
            return strtotime($b['last_activity']) - strtotime($a['last_activity']);
        });

        return response()->json([
            'success' => true,
            'data' => [
                'chats' => $activeChats,
                'total' => count($activeChats)
            ]
        ]);
    }

    /**
     * Récupérer l'historique d'un chat spécifique
     */
    public function getChatHistory(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $sessionId = $request->input('session_id');
        $chatHistory = Cache::get($sessionId, []);
        $userInfo = $this->getUserInfoFromSession($sessionId);

        return response()->json([
            'success' => true,
            'data' => [
                'session_id' => $sessionId,
                'user_info' => $userInfo,
                'messages' => $chatHistory,
                'total' => count($chatHistory)
            ]
        ]);
    }

    /**
     * Envoyer une réponse administrateur
     */
    public function sendAdminResponse(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string',
            'message' => 'required|string|max:1000',
            'type' => 'nullable|string|in:text,file,image',
            'attachment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $admin = Auth::user();
        $sessionId = $request->input('session_id');
        $message = $request->input('message');
        $type = $request->input('type', 'text');
        $attachment = $request->input('attachment');

        // Créer le message administrateur
        $adminMessage = [
            'id' => uniqid(),
            'user_id' => $admin->id,
            'message' => $message,
            'type' => $type,
            'attachment' => $attachment,
            'timestamp' => now()->toISOString(),
            'status' => 'sent',
            'is_admin' => true,
            'admin_name' => $admin->name
        ];

        // Ajouter le message à l'historique
        $chatHistory = Cache::get($sessionId, []);
        $chatHistory[] = $adminMessage;
        Cache::put($sessionId, $chatHistory, 3600);

        // Marquer tous les messages comme lus
        $this->markAllAsRead($sessionId);

        // Ajouter la session aux chats actifs si pas déjà présente
        $activeSessions = Cache::get('active_chat_sessions', []);
        if (!in_array($sessionId, $activeSessions)) {
            $activeSessions[] = $sessionId;
            Cache::put('active_chat_sessions', $activeSessions, 3600);
        }

        return response()->json([
            'success' => true,
            'message' => 'Réponse envoyée avec succès',
            'data' => [
                'message' => $adminMessage
            ]
        ]);
    }

    /**
     * Marquer un chat comme résolu
     */
    public function resolveChat(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'session_id' => 'required|string',
            'resolution_notes' => 'nullable|string|max:500'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $sessionId = $request->input('session_id');
        $resolutionNotes = $request->input('resolution_notes');

        // Ajouter un message de résolution
        $resolutionMessage = [
            'id' => uniqid(),
            'user_id' => Auth::id(),
            'message' => '✅ Chat résolu' . ($resolutionNotes ? " - $resolutionNotes" : ''),
            'type' => 'text',
            'timestamp' => now()->toISOString(),
            'status' => 'sent',
            'is_admin' => true,
            'is_resolution' => true,
            'admin_name' => Auth::user()->name
        ];

        $chatHistory = Cache::get($sessionId, []);
        $chatHistory[] = $resolutionMessage;
        Cache::put($sessionId, $chatHistory, 3600);

        // Retirer de la liste des chats actifs
        $activeSessions = Cache::get('active_chat_sessions', []);
        $activeSessions = array_diff($activeSessions, [$sessionId]);
        Cache::put('active_chat_sessions', $activeSessions, 3600);

        return response()->json([
            'success' => true,
            'message' => 'Chat marqué comme résolu'
        ]);
    }

    /**
     * Obtenir les statistiques du chat
     */
    public function getChatStats(): JsonResponse
    {
        $activeSessions = Cache::get('active_chat_sessions', []);
        $totalActiveChats = count($activeSessions);
        
        $totalUnread = 0;
        foreach ($activeSessions as $sessionId) {
            $totalUnread += $this->getUnreadCount($sessionId);
        }

        // Statistiques des dernières 24h
        $recentChats = 0;
        $resolvedChats = 0;
        
        // Simuler des statistiques (en production, utiliser une base de données)
        $stats = [
            'active_chats' => $totalActiveChats,
            'unread_messages' => $totalUnread,
            'recent_chats_24h' => $recentChats,
            'resolved_chats_24h' => $resolvedChats,
            'avg_response_time' => '2-5 minutes',
            'satisfaction_rate' => '95%'
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Rechercher dans les chats
     */
    public function searchChats(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'query' => 'required|string|min:2'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $query = strtolower($request->input('query'));
        $activeSessions = Cache::get('active_chat_sessions', []);
        $results = [];

        foreach ($activeSessions as $sessionId) {
            $chatHistory = Cache::get($sessionId, []);
            $userInfo = $this->getUserInfoFromSession($sessionId);
            
            // Rechercher dans les messages et les infos utilisateur
            $found = false;
            foreach ($chatHistory as $message) {
                if (str_contains(strtolower($message['message']), $query)) {
                    $found = true;
                    break;
                }
            }
            
            if ($found || 
                str_contains(strtolower($userInfo['name'] ?? ''), $query) ||
                str_contains(strtolower($userInfo['email'] ?? ''), $query)) {
                
                $lastMessage = end($chatHistory);
                $results[] = [
                    'session_id' => $sessionId,
                    'user_info' => $userInfo,
                    'last_message' => $lastMessage,
                    'unread_count' => $this->getUnreadCount($sessionId),
                    'last_activity' => $lastMessage['timestamp'] ?? now()->toISOString()
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => [
                'results' => $results,
                'total' => count($results)
            ]
        ]);
    }

    /**
     * Obtenir les informations utilisateur depuis la session
     */
    private function getUserInfoFromSession(string $sessionId): array
    {
        // Extraire l'ID utilisateur de la session
        $parts = explode('_', $sessionId);
        $userId = end($parts);
        
        // En production, récupérer depuis la base de données
        // Pour l'instant, simuler des informations
        return [
            'id' => $userId,
            'name' => 'Utilisateur ' . $userId,
            'email' => 'user' . $userId . '@example.com',
            'avatar' => null,
            'account_type' => 'client'
        ];
    }

    /**
     * Compter les messages non lus
     */
    private function getUnreadCount(string $sessionId): int
    {
        $chatHistory = Cache::get($sessionId, []);
        $count = 0;
        
        foreach ($chatHistory as $message) {
            if (!isset($message['is_admin']) && $message['status'] !== 'read') {
                $count++;
            }
        }
        
        return $count;
    }

    /**
     * Marquer tous les messages comme lus
     */
    private function markAllAsRead(string $sessionId): void
    {
        $chatHistory = Cache::get($sessionId, []);
        
        foreach ($chatHistory as &$message) {
            if (!isset($message['is_admin'])) {
                $message['status'] = 'read';
            }
        }
        
        Cache::put($sessionId, $chatHistory, 3600);
    }
}
