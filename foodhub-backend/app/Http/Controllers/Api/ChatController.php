<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Cache;

class ChatController extends Controller
{
    /**
     * Envoyer un message de chat
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
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

        $user = Auth::user();
        $message = $request->input('message');
        $type = $request->input('type', 'text');
        $attachment = $request->input('attachment');

        // Simuler le traitement du message
        $chatMessage = [
            'id' => uniqid(),
            'user_id' => $user ? $user->id : null,
            'message' => $message,
            'type' => $type,
            'attachment' => $attachment,
            'timestamp' => now()->toISOString(),
            'status' => 'sent'
        ];

        // Créer une clé de session unique
        $sessionKey = 'chat_history_' . ($user ? $user->id : 'guest_' . uniqid());
        
        // Stocker temporairement dans le cache (en production, utiliser une base de données)
        $chatHistory = Cache::get($sessionKey, []);
        $chatHistory[] = $chatMessage;
        Cache::put($sessionKey, $chatHistory, 3600);

        // Ajouter la session aux chats actifs
        $activeSessions = Cache::get('active_chat_sessions', []);
        if (!in_array($sessionKey, $activeSessions)) {
            $activeSessions[] = $sessionKey;
            Cache::put('active_chat_sessions', $activeSessions, 3600);
        }

        // Simuler une réponse automatique
        $autoResponse = $this->generateAutoResponse($message);
        
        if ($autoResponse) {
            $responseMessage = [
                'id' => uniqid(),
                'user_id' => null,
                'message' => $autoResponse,
                'type' => 'text',
                'attachment' => null,
                'timestamp' => now()->toISOString(),
                'status' => 'read',
                'is_support' => true
            ];
            
            $chatHistory[] = $responseMessage;
            Cache::put($sessionKey, $chatHistory, 3600);

            // Ajouter la session aux chats actifs si pas déjà présente
            $activeSessions = Cache::get('active_chat_sessions', []);
            if (!in_array($sessionKey, $activeSessions)) {
                $activeSessions[] = $sessionKey;
                Cache::put('active_chat_sessions', $activeSessions, 3600);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Message envoyé avec succès',
            'data' => [
                'message' => $chatMessage,
                'auto_response' => $autoResponse ? $responseMessage : null
            ]
        ]);
    }

    /**
     * Récupérer l'historique des messages
     */
    public function getHistory(Request $request): JsonResponse
    {
        $user = Auth::user();
        $chatHistory = Cache::get('chat_history_' . ($user ? $user->id : 'guest'), []);

        return response()->json([
            'success' => true,
            'data' => [
                'messages' => $chatHistory,
                'total' => count($chatHistory)
            ]
        ]);
    }

    /**
     * Marquer les messages comme lus
     */
    public function markAsRead(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message_ids' => 'required|array',
            'message_ids.*' => 'string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Erreurs de validation',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = Auth::user();
        $messageIds = $request->input('message_ids');
        $chatHistory = Cache::get('chat_history_' . ($user ? $user->id : 'guest'), []);

        foreach ($chatHistory as &$message) {
            if (in_array($message['id'], $messageIds)) {
                $message['status'] = 'read';
            }
        }

        Cache::put('chat_history_' . ($user ? $user->id : 'guest'), $chatHistory, 3600);

        return response()->json([
            'success' => true,
            'message' => 'Messages marqués comme lus'
        ]);
    }

    /**
     * Obtenir le statut du support
     */
    public function getSupportStatus(): JsonResponse
    {
        // Simuler le statut du support (en production, vérifier la disponibilité réelle)
        $isOnline = true; // Simuler que le support est en ligne
        $responseTime = '2-5 minutes'; // Temps de réponse estimé

        return response()->json([
            'success' => true,
            'data' => [
                'is_online' => $isOnline,
                'response_time' => $responseTime,
                'available_hours' => '24h/24, 7j/7',
                'support_agents' => 3
            ]
        ]);
    }

    /**
     * Générer une réponse automatique basée sur le message
     */
    private function generateAutoResponse(string $message): ?string
    {
        $lowerMessage = strtolower($message);
        
        // Réponses automatiques basées sur des mots-clés
        $responses = [
            'commande' => 'Pour suivre votre commande, allez dans "Mes commandes" dans votre profil. Vous pouvez aussi utiliser le numéro de suivi fourni.',
            'order' => 'Pour suivre votre commande, allez dans "Mes commandes" dans votre profil. Vous pouvez aussi utiliser le numéro de suivi fourni.',
            'livraison' => 'Nos délais de livraison varient entre 30-60 minutes selon votre localisation. Vous recevrez une notification quand votre livreur arrive !',
            'delivery' => 'Nos délais de livraison varient entre 30-60 minutes selon votre localisation. Vous recevrez une notification quand votre livreur arrive !',
            'paiement' => 'Nous acceptons les cartes bancaires, PayPal et les paiements en espèces à la livraison. Tous les paiements sont sécurisés.',
            'payment' => 'Nous acceptons les cartes bancaires, PayPal et les paiements en espèces à la livraison. Tous les paiements sont sécurisés.',
            'restaurant' => 'Pour devenir partenaire restaurant, cliquez sur "Devenir vendeur" dans le menu. Notre équipe vous contactera rapidement !',
            'vendor' => 'Pour devenir partenaire restaurant, cliquez sur "Devenir vendeur" dans le menu. Notre équipe vous contactera rapidement !',
            'problème' => 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Je vais vous aider à le résoudre rapidement.',
            'issue' => 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Je vais vous aider à le résoudre rapidement.',
            'bug' => 'Merci de signaler ce bug. Notre équipe technique va l\'examiner rapidement. Pouvez-vous décrire plus précisément le problème ?',
            'erreur' => 'Je suis désolé pour cette erreur. Pouvez-vous me donner plus de détails sur ce qui s\'est passé ?',
            'error' => 'Je suis désolé pour cette erreur. Pouvez-vous me donner plus de détails sur ce qui s\'est passé ?',
            'aide' => 'Je suis là pour vous aider ! Pouvez-vous me décrire votre problème ou votre question ?',
            'help' => 'Je suis là pour vous aider ! Pouvez-vous me décrire votre problème ou votre question ?',
            'bonjour' => 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
            'hello' => 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
            'salut' => 'Salut ! 😊 Comment puis-je vous aider aujourd\'hui ?',
            'hi' => 'Salut ! 😊 Comment puis-je vous aider aujourd\'hui ?'
        ];

        foreach ($responses as $keyword => $response) {
            if (str_contains($lowerMessage, $keyword)) {
                return $response;
            }
        }

        // Réponse par défaut pour les messages qui ne correspondent à aucun mot-clé
        if (strlen($message) > 10) {
            return 'Merci pour votre message ! Un membre de notre équipe va vous répondre dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ.';
        }

        return null;
    }
}
