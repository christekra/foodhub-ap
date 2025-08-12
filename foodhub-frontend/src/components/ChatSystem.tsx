import React from 'react';

import ChatWidget from './ChatWidget';
import ChatButton from './ChatButton';
import { useChat } from '../hooks/useChat';

const ChatSystem: React.FC = () => {
  const { isChatOpen, unreadMessages, toggleChat } = useChat();

  return (
    <>
      <div>
        {!isChatOpen && (
          <ChatButton
            onClick={toggleChat}
            unreadCount={unreadMessages}
            isActive={false}
          />
        )}
      </div>
      
      <ChatWidget
        isOpen={isChatOpen}
        onToggle={toggleChat}
      />
    </>
  );
};

export default ChatSystem;

