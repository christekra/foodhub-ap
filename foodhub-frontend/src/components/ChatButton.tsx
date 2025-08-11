import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Bell } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
  isActive?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, unreadCount, isActive = false }) => {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <button
        onClick={onClick}
        className={`relative p-4 rounded-full shadow-lg transition-all duration-300 ${
          isActive 
            ? 'bg-orange-600 text-white' 
            : 'bg-orange-500 hover:bg-orange-600 text-white'
        }`}
      >
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.div
          animate={unreadCount > 0 ? { rotate: [0, -10, 10, 0] } : {}}
          transition={{ duration: 0.5, repeat: unreadCount > 0 ? Infinity : 0, repeatDelay: 2 }}
        >
          {unreadCount > 0 ? <Bell className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </motion.div>
      </button>
    </motion.div>
  );
};

export default ChatButton;
