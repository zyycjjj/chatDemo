import React from 'react';
import { Message } from '../../../domain/entities/message';
import { useMessageActions } from './useMessageActions';

interface MessageActionsProps {
  message: Message;
  onDelete: (id: number) => void;
  onRecall?: (id: number) => void;
}

export const MessageActions: React.FC<MessageActionsProps> = ({ 
  message, 
  onDelete, 
  onRecall 
}) => {
  const { showActions, toggleActions, closeActions, handleRecall, handleDelete } = useMessageActions(
    message,
    onRecall,
    onDelete
  );

  if (!message.isFromUser()) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={toggleActions}
        className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:scale-110"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {showActions && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={closeActions}
          />
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden">
            {message.canRecall() && onRecall && (
              <button
                onClick={handleRecall}
                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-700">Recall</span>
                  <p className="text-xs text-gray-500">Withdraw this message</p>
                </div>
              </button>
            )}
            
            <button
              onClick={handleDelete}
              className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors flex items-center space-x-3 group border-t border-gray-100"
            >
              <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-red-600">Delete</span>
                <p className="text-xs text-gray-500">Remove this message</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
};