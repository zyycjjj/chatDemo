import React from 'react';
import { getNewMessageAlertLogic } from './getNewMessageAlertLogic';

interface NewMessageAlertProps {
  count: number;
  onClick: () => void;
}

export const NewMessageAlert: React.FC<NewMessageAlertProps> = ({ count, onClick }) => {
  const { shouldShow, messageText, badgeContent } = getNewMessageAlertLogic(count);

  if (!shouldShow) return null;

  return (
    <div
      onClick={onClick}
      className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 cursor-pointer group"
    >
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center space-x-3 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 animate-pulse border border-white/20 backdrop-blur-sm">
        <div className="relative">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19l5-5m0 0V7a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-4.586a1 1 0 01-.707-.293l-4.414-4.414A1 1 0 019 12V7a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-4.586a1 1 0 01-.707-.293l-4.414-4.414A1 1 0 019 12z" />
          </svg>
          {badgeContent && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {badgeContent}
            </span>
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{messageText}</span>
          <span className="text-xs opacity-90">Click to scroll down</span>
        </div>
        <svg className="w-4 h-4 transform group-hover:translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};