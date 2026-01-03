import React from 'react';
import { MessageList } from '../../components/message-list';
import { InputBox } from '../../components/input-box';
import { SearchFilter } from '../../components/search-filter';
import { NetworkIndicator } from '../../components/network-indicator';
import { NewMessageAlert } from '../../components/new-message-alert';
import { useMessageStore } from '../../../application/stores/message-store';
import { useChatPage } from './useChatPage';

export const ChatPage: React.FC = () => {
  const messageStore = useMessageStore();
  
  const {
    loading,
    error,
    searchQuery,
    senderFilter,
    isOnline,
    offlineQueue,
    unreadCount,
    setSearchQuery,
    setSenderFilter,
  } = messageStore;

  const {
    messages,
    messageListRef,
    handleSendMessage,
    handleRetryMessage,
    handleDeleteMessage,
    handleRecallMessage,
    handleScrollToBottom,
    handleScroll,
  } = useChatPage();

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Chat Demo
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    React 19 + TypeScript + DDD
                  </span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">Online</span>
              </div>
              
              <button className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <NetworkIndicator 
        isOnline={isOnline} 
        offlineCount={offlineQueue.length} 
      />

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-4 overflow-hidden">
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0 flex-shrink-0">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            senderFilter={senderFilter}
            onSenderFilterChange={setSenderFilter}
          />
        </div>
        
        <div className="flex-1 overflow-hidden bg-white rounded-b-xl shadow-sm border border-gray-200 flex flex-col min-h-0">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4 rounded-lg flex-shrink-0">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">
                    {error}
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex bg-red-50 p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="relative flex-1 overflow-hidden min-h-0">
            <div
              ref={messageListRef}
              onScroll={handleScroll}
              className="h-full overflow-y-auto"
            >
              <MessageList
                messages={messages}
                loading={loading}
                onRetry={handleRetryMessage}
                onDelete={handleDeleteMessage}
                onRecall={handleRecallMessage}
              />
            </div>
            
            <NewMessageAlert
              count={unreadCount}
              onClick={handleScrollToBottom}
            />
          </div>
        </div>

        <div className="flex-shrink-0">
          <InputBox
            onSendMessage={handleSendMessage}
            disabled={loading}
          />
        </div>
      </main>
    </div>
  );
};