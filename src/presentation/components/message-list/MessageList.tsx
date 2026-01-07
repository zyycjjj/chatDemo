import React, { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import type { Message } from '../../../domain/entities/message';
import { MessageItem } from '../message-item/MessageItem';
import { DateSeparator } from '../date-separator/DateSeparator';
import { getMessageListData, type EnhancedMessage } from './getMessageListData';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry: (messageId: number) => void;
  onDelete: (messageId: number) => void;
  onRecall: (messageId: number) => void;
  dateFilter?: string | null;
}

export const MessageList: React.FC<MessageListProps> = React.memo(({
  messages,
  loading,
  hasMore,
  onLoadMore,
  onRetry,
  onDelete,
  onRecall,
  dateFilter,
}) => {
  const listContainerRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef(false);
  const [currentStickyDate, setCurrentStickyDate] = useState<Date | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const messagesWithDates = useMemo(() => getMessageListData(messages, dateFilter), [messages, dateFilter]);

  // 初始滚动到底部
  useEffect(() => {
    if (listContainerRef.current && messagesWithDates.length > 0 && isInitialLoad) {
      setTimeout(() => {
        const container = listContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
          setIsInitialLoad(false);
        }
      }, 100);
    }
  }, [messagesWithDates, isInitialLoad]);

  // 监听消息变化，发送新消息后滚动到底部
  useEffect(() => {
    if (!isInitialLoad && messagesWithDates.length > 0 && listContainerRef.current) {
      const container = listContainerRef.current;
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      
      // 如果用户已经在底部附近，新消息到来时自动滚动到底部
      if (isNearBottom) {
        setTimeout(() => {
          if (listContainerRef.current) {
            listContainerRef.current.scrollTop = listContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messagesWithDates.length, isInitialLoad]);

  // 滚动处理
  const handleScroll = useCallback(() => {
    const container = listContainerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    
    // 检测是否滚动到顶部，触发加载更多
    if (scrollTop < 100 && hasMore && !loading && !isLoadingMoreRef.current) {
      isLoadingMoreRef.current = true;
      onLoadMore();
      setTimeout(() => {
        isLoadingMoreRef.current = false;
      }, 1000);
    }

    // 更新粘性日期标题
    let latestDate: string | null = null;
    const children = Array.from(container.children) as HTMLElement[];
    
    for (const child of children) {
      const rect = child.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      
      if (rect.top > containerRect.top + 50) {
        break;
      }
      
      if (child.classList.contains('date-separator')) {
        const dateText = child.textContent;
        if (dateText) {
          latestDate = dateText;
        }
      }
    }
    
    setCurrentStickyDate(latestDate ? new Date(latestDate) : null);
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const container = listContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div className="flex flex-col flex-1 h-full">
      {currentStickyDate && (
        <div className="sticky top-0 z-10 px-4 py-2 bg-gray-100 border-b border-gray-200 flex-shrink-0">
          <div className="text-sm text-center text-gray-600">
            {currentStickyDate.toLocaleDateString('zh-CN', {
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      )}
      <div 
        className="overflow-y-auto flex-1 px-4 pt-4" 
        ref={listContainerRef}
      >
        {messagesWithDates.length > 0 ? (
          messagesWithDates.map((item, index) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${item.data}`} className="my-4 date-separator">
                  <DateSeparator date={new Date(item.data as string)} />
                </div>
              );
            }

            const enhancedMessage = item.data as EnhancedMessage;
            return (
              <MessageItem
                key={enhancedMessage.message.id}
                message={enhancedMessage.message}
                onRetry={onRetry}
                onDelete={onDelete}
                onRecall={onRecall}
                showAvatar={enhancedMessage.showAvatar}
                showTail={enhancedMessage.showTail}
              />
            );
          })
        ) : (
          <div className="flex justify-center items-center h-full text-gray-500">
            No messages yet
          </div>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 rounded-full border-b-2 animate-spin border-primary-600"></div>
        </div>
      )}
    </div>
  );
});