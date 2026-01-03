import React from 'react';

interface NetworkIndicatorProps {
  isOnline: boolean;
  offlineCount?: number;
}

export const NetworkIndicator: React.FC<NetworkIndicatorProps> = ({ 
  isOnline, 
  offlineCount = 0 
}) => {
  if (isOnline && offlineCount === 0) {
    return null;
  }

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 ${
        isOnline 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        <div className={`w-2 h-2 rounded-full ${
          isOnline ? 'bg-white' : 'bg-red-200 animate-pulse'
        }`}></div>
        
        <span className="text-sm font-medium">
          {isOnline ? (
            offlineCount > 0 
              ? `Back online - Sending ${offlineCount} pending messages...`
              : 'Back online'
          ) : (
            'You are offline'
          )}
        </span>
      </div>
    </div>
  );
};