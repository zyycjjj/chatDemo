import React, { useEffect } from 'react';
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
    dateFilter,
    isOnline,
    offlineQueue,
    unreadCount,
    hasMore,
    setSearchQuery,
    setSenderFilter,
    setDateFilter,
    loadMoreMessages,
  } = messageStore;

  const {
    messages,
    handleSendMessage,
    handleRetryMessage,
    handleDeleteMessage,
    handleRecallMessage,
    handleScrollToBottom,
    handleScrollToSearchResult,
  } = useChatPage();

  useEffect(() => {
    messageStore.loadInitialMessages().then(() => {
      // 初始化加载后滚动到底部显示最新消息
      setTimeout(() => {
        handleScrollToBottom();
      }, 100);
    });
  }, [handleScrollToBottom]);

  // 搜索时自动滚动到第一个匹配结果
  useEffect(() => {
    if (searchQuery.trim()) {
      setTimeout(() => {
        handleScrollToSearchResult();
      }, 300); // 等待DOM更新
    }
  }, [searchQuery, handleScrollToSearchResult]);



  return (
    <div data-testid="chat-page" className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b border-gray-200 shadow-lg">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex justify-center items-center w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-transparent text-gray-900 bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Chat Demo
                </h1>
                <p className="flex gap-1 items-center text-sm text-gray-500">
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

      <main className="flex overflow-hidden flex-col flex-1 px-4 mx-auto w-full max-w-6xl">
        <div className="flex-shrink-0 bg-white rounded-t-xl border border-b-0 border-gray-200 shadow-sm">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            senderFilter={senderFilter}
            onSenderFilterChange={setSenderFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />
        </div>
        
        <div className="flex overflow-hidden flex-col flex-1 min-h-0 bg-white rounded-b-xl border border-gray-200 shadow-sm">
          {error && (
            <div className="flex-shrink-0 p-4 m-4 bg-red-50 rounded-lg border-l-4 border-red-400">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>
                </div>
                <div className="pl-3 ml-auto">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex bg-red-50 p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.0 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-hidden relative flex-1 min-h-0">
            <MessageList
              messages={messages}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={loadMoreMessages}
              onRetry={handleRetryMessage}
              onDelete={handleDeleteMessage}
              onRecall={handleRecallMessage}
              dateFilter={dateFilter}
              searchQuery={searchQuery}
            />
            
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
