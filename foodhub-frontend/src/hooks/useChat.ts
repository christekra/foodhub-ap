import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const useChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

  // Simuler des notifications de nouveaux messages
  useEffect(() => {
    if (!isChatOpen) {
      const interval = setInterval(() => {
        // 5% de chance d'avoir un nouveau message toutes les 30 secondes
        if (Math.random() < 0.05) {
          setUnreadMessages(prev => prev + 1);
          setLastMessageTime(new Date());
          
          // Notification toast
          toast('Nouveau message du support !', {
            icon: '💬',
            duration: 4000,
            style: {
              background: '#f97316',
              color: '#fff',
            },
          });
        }
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isChatOpen]);

  const openChat = () => {
    setIsChatOpen(true);
    setUnreadMessages(0);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const toggleChat = () => {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  };

  return {
    isChatOpen,
    unreadMessages,
    lastMessageTime,
    openChat,
    closeChat,
    toggleChat,
  };
};
