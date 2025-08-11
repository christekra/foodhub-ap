import React from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatWidget from './ChatWidget';
import ChatButton from './ChatButton';
import { useChat } from '../hooks/useChat';

const ChatSystem: React.FC = () => {
  const { isChatOpen, unreadMessages, toggleChat } = useChat();

  return (
    <>
      <AnimatePresence>
        {!isChatOpen && (
          <ChatButton
            onClick={toggleChat}
            unreadCount={unreadMessages}
            isActive={false}
          />
        )}
      </AnimatePresence>
      
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </>
  );
};

export default ChatSystem;
