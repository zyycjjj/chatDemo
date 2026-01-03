import { useEffect, useRef } from 'react';
import { useMessageStore, getFilteredMessages } from '../../../application/stores/message-store';

export interface ChatPageLogic {
  messages: ReturnType<typeof getFilteredMessages>;
  messageListRef: React.RefObject<HTMLDivElement | null>;
  handleSendMessage: (content: string) => Promise<void>;
  handleRetryMessage: (messageId: number) => Promise<void>;
  handleDeleteMessage: (messageId: number) => Promise<void>;
  handleRecallMessage: (messageId: number) => Promise<void>;
  handleScrollToBottom: () => void;
  handleScroll: () => void;
}

export const useChatPage = (): ChatPageLogic => {
  const messageStore = useMessageStore();
  const messageListRef = useRef<HTMLDivElement>(null);
  
  const {
    loading,
    hasMore,
    loadInitialMessages,
    loadMoreMessages,
    sendMessage,
    retryMessage,
    deleteMessage,
    recallMessage,
    resetUnreadCount,
    setIsAtBottom,
  } = messageStore;
  
  // Get filtered messages
  const messages = getFilteredMessages(messageStore);

  useEffect(() => {
    loadInitialMessages();
  }, [loadInitialMessages]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleRetryMessage = async (messageId: number) => {
    try {
      await retryMessage(messageId);
    } catch (error) {
      console.error('Failed to retry message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    try {
      await deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const handleRecallMessage = async (messageId: number) => {
    try {
      await recallMessage(messageId);
    } catch (error) {
      console.error('Failed to recall message:', error);
    }
  };

  const handleScrollToBottom = () => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
    resetUnreadCount();
    setIsAtBottom(true);
  };

  const handleScroll = () => {
    if (messageListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageListRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setIsAtBottom(isAtBottom);
      
      if (isAtBottom) {
        resetUnreadCount();
      }
      
      // Load more messages when scrolling to top
      if (scrollTop < 100 && hasMore && !loading) {
        loadMoreMessages();
      }
    }
  };

  return {
    messages,
    messageListRef,
    handleSendMessage,
    handleRetryMessage,
    handleDeleteMessage,
    handleRecallMessage,
    handleScrollToBottom,
    handleScroll,
  };
};