import type { Message } from '../../../domain/entities/message';
import { MessageActions } from '../message-actions';

interface MessageItemLogic {
  isUser: boolean;
  avatarContent: React.ReactNode;
  timeDisplay: React.ReactNode;
  messageContent: React.ReactNode;
  actionButton: React.ReactNode;
}

export const getMessageItemLogic = (
  message: Message,
  showAvatar: boolean,
  onRetry: (messageId: number) => void,
  onDelete: (messageId: number) => void,
  onRecall?: (messageId: number) => void
): MessageItemLogic => {
  const isUser = message.isFromUser();

  const avatarContent = showAvatar ? (
    isUser ? (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center ml-3 flex-shrink-0 shadow-md">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-3 flex-shrink-0 shadow-md">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
    )
  ) : null;

  const timeDisplay = (
    <div className={`text-xs text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'} flex items-center gap-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {message.getFormattedTime()}
      {message.isSent() && isUser && (
        <span className="text-green-500 flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="text-green-500 font-medium">Sent</span>
        </span>
      )}
    </div>
  );

  const messageContent = (
    <>
      <p className={`text-sm leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere ${message.isRecalled() ? 'italic text-gray-500' : ''}`}>
        {message.content}
      </p>
      
      {message.isSending() && (
        <div className="flex items-center gap-2 mt-2 text-xs opacity-75">
          <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
          <span>Sending...</span>
        </div>
      )}

      {message.isFailed() && (
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xs text-red-500 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Failed
          </span>
          <button
            onClick={() => onRetry(message.id)}
            className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg transition-colors backdrop-blur-sm"
          >
            Retry
          </button>
        </div>
      )}
    </>
  );

  const actionButton = isUser && !message.isSending() && !message.isRecalled() ? (
    <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <MessageActions 
        message={message} 
        onDelete={onDelete}
        onRecall={onRecall}
      />
    </div>
  ) : null;

  return {
    isUser,
    avatarContent,
    timeDisplay,
    messageContent,
    actionButton,
  };
};