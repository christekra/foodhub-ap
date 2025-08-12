import React, { useState, useEffect, useRef } from 'react';

import { 
  Send, 
  User, 
  Bot, 
  Clock, 
  Check, 
  CheckCheck,
  Phone,
  Mail,
  MessageCircle,
  FileText,
  Image,
  Paperclip,
  Smile,
  X,
  Minimize2,
  Maximize2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type?: 'text' | 'image' | 'file';
  attachment?: string;
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! 👋 Bienvenue sur le support FoodHub. Comment puis-je vous aider aujourd\'hui ?',
      sender: 'support',
      timestamp: new Date(),
      status: 'read'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      type: selectedFile ? 'file' : 'text',
      attachment: selectedFile?.name
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedFile(null);

    // Simuler l'envoi
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'sent' as const }
            : msg
        )
      );
    }, 1000);

    // Simuler la réponse du support
    setIsTyping(true);
    setTimeout(() => {
      const supportMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: generateSupportResponse(inputMessage),
        sender: 'support',
        timestamp: new Date(),
        status: 'read'
      };
      setMessages(prev => [...prev, supportMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const generateSupportResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('commande') || lowerMessage.includes('order')) {
      return 'Pour suivre votre commande, allez dans "Mes commandes" dans votre profil. Vous pouvez aussi utiliser le numéro de suivi fourni.';
    }
    
    if (lowerMessage.includes('livraison') || lowerMessage.includes('delivery')) {
      return 'Nos délais de livraison varient entre 30-60 minutes selon votre localisation. Vous recevrez une notification quand votre livreur arrive !';
    }
    
    if (lowerMessage.includes('paiement') || lowerMessage.includes('payment')) {
      return 'Nous acceptons les cartes bancaires, PayPal et les paiements en espèces à la livraison. Tous les paiements sont sécurisés.';
    }
    
    if (lowerMessage.includes('restaurant') || lowerMessage.includes('vendor')) {
      return 'Pour devenir partenaire restaurant, cliquez sur "Devenir vendeur" dans le menu. Notre équipe vous contactera rapidement !';
    }
    
    if (lowerMessage.includes('problème') || lowerMessage.includes('issue')) {
      return 'Je suis désolé pour ce problème. Pouvez-vous me donner plus de détails ? Je vais vous aider à le résoudre rapidement.';
    }
    
    return 'Merci pour votre message ! Un membre de notre équipe va vous répondre dans les plus brefs délais. En attendant, vous pouvez consulter notre FAQ.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Le fichier est trop volumineux. Taille maximum : 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-400" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-green-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto p-4">
        <div
          }
          }
          className="bg-white rounded-lg shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h1 className="text-xl font-bold">Support FoodHub</h1>
                  <p className="text-orange-100 text-sm">En ligne • Réponse rapide</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="text-orange-100 hover:text-white transition-colors">
                  <Phone className="w-5 h-5" />
                </button>
                <button className="text-orange-100 hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
                <button className="text-orange-100 hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                }
                }
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-end space-x-3 max-w-md ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {message.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={`px-4 py-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-orange-500 text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}>
                    {message.type === 'file' && message.attachment && (
                      <div className="mb-2 p-2 bg-white bg-opacity-20 rounded">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-4 h-4" />
                          <span className="text-sm">{message.attachment}</span>
                        </div>
                      </div>
                    )}
                    <p className="text-sm">{message.text}</p>
                    <div className={`flex items-center space-x-2 mt-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span className={`text-xs ${
                        message.sender === 'user' ? 'text-orange-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </span>
                      {message.sender === 'user' && getStatusIcon(message.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div
                }
                }
                className="flex justify-start"
              >
                <div className="flex items-end space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="bg-gray-100 px-4 py-3 rounded-lg rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* File Preview */}
          {selectedFile && (
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                <div className="flex items-center space-x-3">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  onClick={removeSelectedFile}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex space-x-3">
              <div className="flex-1 flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-3 text-gray-500 hover:text-orange-500 border border-gray-300 rounded-lg hover:border-orange-500 transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button className="px-3 py-3 text-gray-500 hover:text-orange-500 border border-gray-300 rounded-lg hover:border-orange-500 transition-colors">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() && !selectedFile}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Send className="w-4 h-4" />
                <span>Envoyer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

