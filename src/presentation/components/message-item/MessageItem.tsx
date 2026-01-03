import React from 'react';
import type { Message } from '../../../domain/entities/message';
import { getMessageItemLogic } from './getMessageItemLogic';

interface MessageItemProps {
  message: Message;
  onRetry: (messageId: number) => void;
  onDelete: (messageId: number) => void;
  onRecall?: (messageId: number) => void;
  showAvatar?: boolean;
  showTail?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onRetry,
  onDelete,
  onRecall,
  showAvatar = true,
  showTail = true,
}) => {
  const { isUser, avatarContent, timeDisplay, messageContent, actionButton } = getMessageItemLogic(
    message,
    showAvatar,
    onRetry,
    onDelete,
    onRecall
  );

  return (
    <div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group animate-fade-in`}
    >
      {!isUser && avatarContent}

      <div className={`max-w-xs lg:max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 ${
            isUser 
              ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white' 
              : 'bg-white border border-gray-200 text-gray-800'
          } ${showTail && (isUser ? 'rounded-br-sm' : 'rounded-bl-sm')}`}
        >
          {messageContent}
        </div>

        {timeDisplay}
      </div>

      {isUser && avatarContent}
      {actionButton}
    </div>
  );
};