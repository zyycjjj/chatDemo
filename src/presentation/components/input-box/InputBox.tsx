import React from 'react';
import { useInputBox } from './useInputBox';

interface InputBoxProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const InputBox: React.FC<InputBoxProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const {
    message,
    textareaRef,
    setMessage,
    handleSend,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
  } = useInputBox({ onSendMessage, disabled });

  return (
    <div className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              placeholder={placeholder}
              disabled={disabled}
              rows={1}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500 transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-lg"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            
            <div className="absolute right-3 bottom-3 text-xs text-gray-400 bg-white px-1 rounded">
              {message.length}/2000
            </div>
          </div>

          <button
            onClick={handleSend}
            disabled={!message.trim() || disabled}
            className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            {disabled ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Sending
              </>
            ) : (
              <>
                Send
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Press Enter to send, Shift+Enter for new line</span>
          </div>
          
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Attach file"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            </button>
            
            <button
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors group"
              title="Add emoji"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};