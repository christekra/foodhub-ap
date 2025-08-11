import { API_BASE_URL } from './api';

export interface ChatMessage {
  id: string;
  message: string;
  type: 'text' | 'file' | 'image';
  attachment?: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  user_id?: number | null;
  is_support?: boolean;
}

export interface SupportStatus {
  is_online: boolean;
  response_time: string;
  available_hours: string;
  support_agents: number;
}

export interface ChatResponse {
  success: boolean;
  message: string;
  data: {
    message?: ChatMessage;
    auto_response?: ChatMessage;
    messages?: ChatMessage[];
    total?: number;
    is_online?: boolean;
    response_time?: string;
    available_hours?: string;
    support_agents?: number;
  };
}

class ChatService {
  private async request(endpoint: string, options: RequestInit = {}): Promise<ChatResponse> {
    const token = localStorage.getItem('token');
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Erreur HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erreur de connexion au serveur');
    }
  }

  /**
   * Envoyer un message
   */
  async sendMessage(message: string, type: 'text' | 'file' | 'image' = 'text', attachment?: string): Promise<ChatResponse> {
    return this.request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({
        message,
        type,
        attachment
      })
    });
  }

  /**
   * Récupérer l'historique des messages
   */
  async getHistory(): Promise<ChatResponse> {
    return this.request('/chat/history');
  }

  /**
   * Marquer les messages comme lus
   */
  async markAsRead(messageIds: string[]): Promise<ChatResponse> {
    return this.request('/chat/mark-read', {
      method: 'POST',
      body: JSON.stringify({
        message_ids: messageIds
      })
    });
  }

  /**
   * Obtenir le statut du support
   */
  async getSupportStatus(): Promise<ChatResponse> {
    return this.request('/chat/support-status');
  }

  /**
   * Simuler l'envoi d'un message (pour les utilisateurs non connectés)
   */
  async simulateSendMessage(message: string): Promise<ChatMessage> {
    // Simulation locale pour les utilisateurs non connectés
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message,
      type: 'text',
      timestamp: new Date().toISOString(),
      status: 'sent',
      user_id: null
    };

    // Simuler une réponse automatique
    const autoResponse = this.generateAutoResponse(message);
    if (autoResponse) {
      const supportMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: autoResponse,
        type: 'text',
        timestamp: new Date().toISOString(),
        status: 'read',
        user_id: null,
        is_support: true
      };

      // Retourner les deux messages
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(userMessage);
        }, 1000);
      });
    }

    return userMessage;
  }

  /**
   * Générer une réponse automatique basée sur le message
   */
  private generateAutoResponse(message: string): string | null {
    const lowerMessage = message.toLowerCase();
    
    const responses: Record<string, string> = {
      'commande': 'Pour suivre votre commande, allez dans "Mes commandes" dans votre profil. Vous pouvez aussi utiliser le numéro de suivi fourni.',
      'order': 'Pour suivre votre commande, allez dans "Mes commandes" dans votre profil. Vous pouvez aussi utiliser le numéro de suivi fourni.',
      'livraison': 'Nos délais de livraison varient entre 30-60 minutes selon votre localisation. Vous recevrez une notification quand votre livreur arrive !',
      'delivery': 'Nos délais de livraison varient entre 30-60 minutes selon votre localisation. Vous recevrez une notification quand votre livreur arrive !',
      'paiement': 'Nous acceptons les cartes bancaires, PayPal et les paiements en espèces à la livraison. Tous les paiements sont sécurisés.',
      'payment': 'Nous acceptons les cartes bancaires, PayPal et les paiements en espèces à la livraison. Tous les paiements sont sécurisés.',
      'restaurant': 'Pour devenir partenaire restaurant, cliquez sur "Devenir vendeur" dans le menu. Notre équipe vous contactera rapidement !',
      'vendor': 'Pour devenir partenaire restaurant, cliquez sur "Devenir vendeur" dans le menu. Notre équipe vous contactera rapidement !',
      'problème': 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Je vais vous aider à le résoudre rapidement.',
      'issue': 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Je vais vous aider à le résoudre rapidement.',
      'bug': 'Merci de signaler ce bug. Notre équipe technique va l\'examiner rapidement. Pouvez-vous décrire plus précisément le problème ?',
      'erreur': 'Je suis désolé pour cette erreur. Pouvez-vous me donner plus de détails sur ce qui s\'est passé ?',
      'error': 'Je suis désolé pour cette erreur. Pouvez-vous me donner plus de détails sur ce qui s\'est passé ?',
      'aide': 'Je suis là pour vous aider ! Pouvez-vous me décrire votre problème ou votre question ?',
      'help': 'Je suis là pour vous aider ! Pouvez-vous me décrire votre problème ou votre question ?',
      'bonjour': 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
      'hello': 'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
      'salut': 'Salut ! 😊 Comment puis-je vous aider aujourd\'hui ?',
      'hi': 'Salut ! 😊 Comment puis-je vous aider aujourd\'hui ?'
    };

    for (const [keyword, response] of Object.entries(responses)) {
      if (lowerMessage.includes(keyword)) {
        return response;
      }
    }

    // Réponse par défaut pour les messages longs
    if (message.length > 10) {
      return 'Merci pour votre message ! Un membre de notre équipe va vous répondre dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ.';
    }

    return null;
  }
}

export const chatService = new ChatService();
