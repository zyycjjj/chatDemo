import { useCallback, useMemo, useRef } from 'react';
import { useMessageStore } from '../../../application/stores/message-store';
import { Message } from '../../../domain/entities/message';

export const useChatPage = () => {
  const messageStore = useMessageStore();
  const {
    messages: storeMessages,
    isAtBottom,
    addMessage,
    updateMessage,
    deleteMessage,
    recallMessage,
    resetUnreadCount,
    setIsAtBottom,
  } = messageStore;

  const messages = useMemo(() => storeMessages, [storeMessages]);
  const messageListRef = useRef<HTMLDivElement>(null);

  const handleScrollToBottom = useCallback(() => {
    if (messageListRef.current) {
      const listElement = messageListRef.current.querySelector('.react-window-list');
      if (listElement) {
        listElement.scrollTop = listElement.scrollHeight;
      } else {
        // 备用方案：查找任何可能的滚动容器
        const scrollContainer = messageListRef.current.querySelector('[data-test-id="virtuoso-scroller"]') ||
                               messageListRef.current.querySelector('.overflow-y-auto') ||
                               messageListRef.current;
        if (scrollContainer && 'scrollTop' in scrollContainer) {
          scrollContainer.scrollTop = (scrollContainer as HTMLElement).scrollHeight;
        }
      }
    }
    resetUnreadCount();
    setIsAtBottom(true);
  }, [resetUnreadCount, setIsAtBottom]);

  const handleScroll = useCallback(
    (scrollTop: number, scrollHeight: number, clientHeight: number) => {
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
      const newIsAtBottom = distanceFromBottom < 100;
      
      if (newIsAtBottom !== isAtBottom) {
        setIsAtBottom(newIsAtBottom);
      }

      if (newIsAtBottom) {
        resetUnreadCount();
      }
    },
    [isAtBottom, resetUnreadCount, setIsAtBottom]
  );

  const handleSendMessage = useCallback(
    (content: string) => {
      const newMessage = Message.create({
        id: Date.now(),
        content,
        sender: 'user',
        timestamp: new Date(),
        type: 'text',
        status: 'sending',
      });

      addMessage(newMessage);

      // 发送消息后自动滚动到底部
      setTimeout(() => {
        handleScrollToBottom();
      }, 100);

      setTimeout(() => {
        updateMessage(newMessage.id, { status: 'sent' });
      }, 1000);

      setTimeout(() => {
        updateMessage(newMessage.id, { status: 'sent' });
      }, 2000);
    },
    [addMessage, updateMessage, handleScrollToBottom]
  );

  const handleRetryMessage = useCallback(
    (messageId: number) => {
      const message = messages.find((m) => m.id === messageId);
      if (message) {
        updateMessage(messageId, { status: 'sending' });
        setTimeout(() => {
          updateMessage(messageId, { status: 'sent' });
        }, 1000);
        setTimeout(() => {
          updateMessage(messageId, { status: 'sent' });
        }, 2000);
      }
    },
    [messages, updateMessage]
  );

  const handleDeleteMessage = useCallback(
    (messageId: number) => {
      deleteMessage(messageId);
    },
    [deleteMessage]
  );

  const handleRecallMessage = useCallback(
    (messageId: number) => {
      recallMessage(messageId);
    },
    [recallMessage]
  );

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
