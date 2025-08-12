import React, { useState, useEffect, useRef } from 'react';

import { 
  MessageCircle, 
  Search, 
  Send, 
  CheckCircle, 
  Clock, 
  User, 
  Bot,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  TrendingUp,
  Users,
  MessageSquare,
  Star,
  Filter,
  MoreVertical,
  Archive,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  message: string;
  type: 'text' | 'file' | 'image';
  attachment?: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  user_id?: number | null;
  is_admin?: boolean;
  is_support?: boolean;
  admin_name?: string;
  is_resolution?: boolean;
}

interface ChatSession {
  session_id: string;
  user_info: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    account_type: string;
  };
  last_message: ChatMessage;
  unread_count: number;
  last_activity: string;
  status: string;
}

interface ChatStats {
  active_chats: number;
  unread_messages: number;
  recent_chats_24h: number;
  resolved_chats_24h: number;
  avg_response_time: string;
  satisfaction_rate: string;
}

const ChatManagementTab: React.FC = () => {
  const [activeChats, setActiveChats] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatStats, setChatStats] = useState<ChatStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unread' | 'active'>('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-refresh des chats actifs
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchActiveChats();
        if (selectedChat) {
          fetchChatHistory(selectedChat.session_id);
        }
      }, 5000); // Rafraîchir toutes les 5 secondes

      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedChat]);

  useEffect(() => {
    fetchActiveChats();
    fetchChatStats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchActiveChats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/chat/active-chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChats(data.data.chats);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/chat/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatStats(data.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
    }
  };

  const fetchChatHistory = async (sessionId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/chat/chat-history?session_id=${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.data.messages);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    }
  };

  const handleChatSelect = (chat: ChatSession) => {
    setSelectedChat(chat);
    fetchChatHistory(chat.session_id);
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat) return;

    setIsSending(true);
    try {
      const response = await fetch('http://localhost:8000/api/admin/chat/send-response', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: selectedChat.session_id,
          message: messageInput.trim(),
          type: 'text'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, data.data.message]);
        setMessageInput('');
        toast.success('Message envoyé avec succès');
        
        // Rafraîchir la liste des chats
        fetchActiveChats();
      } else {
        toast.error('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      toast.error('Erreur de connexion');
    } finally {
      setIsSending(false);
    }
  };

  const handleResolveChat = async (notes?: string) => {
    if (!selectedChat) return;

    try {
      const response = await fetch('http://localhost:8000/api/admin/chat/resolve-chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: selectedChat.session_id,
          resolution_notes: notes
        }),
      });

      if (response.ok) {
        toast.success('Chat résolu avec succès');
        setSelectedChat(null);
        setChatHistory([]);
        fetchActiveChats();
      } else {
        toast.error('Erreur lors de la résolution du chat');
      }
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
      toast.error('Erreur de connexion');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchActiveChats();
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/admin/chat/search?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChats(data.data.results);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <CheckCircle className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-400" />;
      case 'read':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      default:
        return null;
    }
  };

  const filteredChats = activeChats.filter(chat => {
    if (filterStatus === 'unread') return chat.unread_count > 0;
    if (filterStatus === 'active') return chat.status === 'active';
    return true;
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
          <MessageCircle className="w-6 h-6 text-orange-500" />
          <span>Gestion du Chat Support</span>
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span>Auto-refresh</span>
          </button>
        </div>
      </div>

      {/* Statistiques */}
      {chatStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Chats Actifs</p>
                <p className="text-2xl font-bold">{chatStats.active_chats}</p>
              </div>
              <MessageSquare className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Messages Non Lus</p>
                <p className="text-2xl font-bold">{chatStats.unread_messages}</p>
              </div>
              <AlertCircle className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Temps de Réponse</p>
                <p className="text-lg font-bold">{chatStats.avg_response_time}</p>
              </div>
              <Clock className="w-8 h-8 opacity-80" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Satisfaction</p>
                <p className="text-2xl font-bold">{chatStats.satisfaction_rate}</p>
              </div>
              <Star className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des chats */}
        <div className="lg:col-span-1 bg-gray-50 rounded-lg p-4">
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Rechercher un chat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleSearch}
                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'all' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilterStatus('unread')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'unread' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Non lus
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filterStatus === 'active' 
                    ? 'bg-orange-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Actifs
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Chargement...</p>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Aucun chat trouvé</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.session_id}
                  }
                  }
                  onClick={() => handleChatSelect(chat)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedChat?.session_id === chat.session_id
                      ? 'bg-orange-100 border-2 border-orange-300'
                      : 'bg-white hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.user_info.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {chat.user_info.email}
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                        {chat.last_message.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(chat.last_activity)}
                        </span>
                        {chat.unread_count > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {chat.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg flex flex-col h-96">
          {selectedChat ? (
            <>
              {/* Header du chat */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{selectedChat.user_info.name}</h3>
                      <p className="text-sm opacity-90">{selectedChat.user_info.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleResolveChat()}
                      className="px-3 py-1 bg-white bg-opacity-20 rounded-lg text-sm hover:bg-opacity-30 transition-colors"
                    >
                      Résoudre
                    </button>
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatHistory.map((message) => (
                  <div
                    key={message.id}
                    }
                    }
                    className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end space-x-3 max-w-md ${message.is_admin ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.is_admin 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {message.is_admin ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>
                      <div className={`px-4 py-3 rounded-lg ${
                        message.is_admin
                          ? 'bg-orange-500 text-white rounded-br-none'
                          : 'bg-gray-100 text-gray-800 rounded-bl-none'
                      } ${message.is_resolution ? 'bg-green-500' : ''}`}>
                        <p className="text-sm">{message.message}</p>
                        <div className={`flex items-center space-x-2 mt-2 ${
                          message.is_admin ? 'justify-end' : 'justify-start'
                        }`}>
                          <span className={`text-xs ${
                            message.is_admin ? 'text-orange-100' : 'text-gray-500'
                          }`}>
                            {formatTime(message.timestamp)}
                          </span>
                          {message.is_admin && getStatusIcon(message.status)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Tapez votre réponse..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    disabled={isSending}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || isSending}
                    className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Envoyer</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Sélectionnez un chat
                </h3>
                <p className="text-gray-500">
                  Choisissez un chat dans la liste pour commencer à répondre
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatManagementTab;

