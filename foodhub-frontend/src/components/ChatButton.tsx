import React from 'react';

import { MessageCircle, Bell } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
  unreadCount: number;
  isActive?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, unreadCount, isActive = false }) => {
  return (
    <div
      }
      }
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
        <div>
          {unreadCount > 0 && (
            <div
              }
              }
              }
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>
        
        <div
           : {}}
          }
        >
          {unreadCount > 0 ? <Bell className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </div>
      </button>
    </div>
  );
};

export default ChatButton;

