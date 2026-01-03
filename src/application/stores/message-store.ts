import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import { Message } from '../../domain/entities/message';
import type { ApiMessage } from '../../shared/types/api';
import { requestClient } from '../../infrastructure/http/request';
import type { MessageState, MessageActions } from './message-types';
import { DraftStorage } from '../../infrastructure/storage/draft-storage';
import { NetworkService } from '../../infrastructure/services/network-service';
import { OfflineQueue } from '../../infrastructure/services/offline-queue';
import type { QueuedMessage } from './message-types';


// Transformation functions
const transformApiMessageToMessage = (apiMessage: ApiMessage): Message => {
  return Message.create({
    id: apiMessage.id,
    content: apiMessage.content,
    sender: apiMessage.sender,
    timestamp: new Date(apiMessage.timestamp),
    status: apiMessage.status || 'sent',
    type: apiMessage.type || 'text',
    updatedAt: apiMessage.updatedAt ? new Date(apiMessage.updatedAt) : undefined,
  });
};

const initialState: MessageState = {
  messages: [],
  loading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
  searchQuery: '',
  senderFilter: 'all',
  draftMessage: '',
  unreadCount: 0,
  isAtBottom: true,
  isOnline: navigator.onLine,
  offlineQueue: [],
};

const networkService = new NetworkService();
const offlineQueue = new OfflineQueue();

export const useMessageStore = create<MessageState & MessageActions>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        setMessages: (messages) => set({ messages }),

        addMessage: (message) => set((state) => {
          const messages = [...state.messages, message];
          return {
            messages,
            unreadCount: state.isAtBottom ? state.unreadCount : state.unreadCount + 1,
          };
        }),

        updateMessage: (id, updates) => set((state) => {
          const messages = state.messages.map((msg) => {
            if (msg.id === id) {
              const updatedMessage = Object.create(Object.getPrototypeOf(msg));
              Object.assign(updatedMessage, msg, updates);
              return updatedMessage;
            }
            return msg;
          });
          return { messages };
        }),

        deleteMessage: (id) => set((state) => ({
          messages: state.messages.filter((msg) => msg.id !== id),
        })),

        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        setHasMore: (hasMore) => set({ hasMore }),
        setCurrentPage: (page) => set({ currentPage: page }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        setSenderFilter: (filter) => set({ senderFilter: filter }),

        setDraftMessage: (draft) => {
          set({ draftMessage: draft });
          DraftStorage.save(draft);
        },

        incrementUnreadCount: () => set((state) => ({
          unreadCount: state.unreadCount + 1,
        })),

        resetUnreadCount: () => set({ unreadCount: 0 }),

        setIsAtBottom: (isAtBottom) => set({ isAtBottom }),

        setIsOnline: (isOnline) => set({ isOnline }),

        addToOfflineQueue: () => {
          // This method is kept for backward compatibility but not used
        },

        clearOfflineQueue: () => set({ offlineQueue: [] }),

        processOfflineQueue: async () => {
          const { setError } = get();
          const retryableMessages = offlineQueue.getRetryableMessages();

          if (retryableMessages.length === 0) return;

          const processMessage = async (queuedMsg: QueuedMessage): Promise<boolean> => {
            try {
              const response = await requestClient.sendMessage({ 
                content: queuedMsg.content, 
                type: queuedMsg.type 
              });
              if (response.success && response.data) {
                offlineQueue.remove(queuedMsg.id);
                return true;
              }
              return false;
            } catch {
              offlineQueue.markRetry(queuedMsg.id);
              return false;
            }
          };

          for (const queuedMsg of retryableMessages) {
            const success = await processMessage(queuedMsg);
            if (!success) {
              setError('Failed to send some offline messages');
              break;
            }
          }

          const updatedQueue = offlineQueue.getAll();
          set({ offlineQueue: updatedQueue as QueuedMessage[] });
        },

        loadMessages: async () => {
          const { setLoading, setError, setMessages } = get();
          
          setLoading(true);
          setError(null);

          try {
            const response = await requestClient.getMessages();
            
            if (response.success && response.data) {
              const transformedMessages = response.data.messages.map(transformApiMessageToMessage);
              setMessages(transformedMessages);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load messages');
          } finally {
            setLoading(false);
          }
        },

        loadInitialMessages: async () => {
          const { setLoading, setError, setMessages, setHasMore } = get();
          
          setLoading(true);
          setError(null);

          try {
            const response = await requestClient.getMessages({ page: 1, limit: 20 });
            
            if (response.success && response.data) {
              const transformedMessages = response.data.messages.map(transformApiMessageToMessage);
              setMessages(transformedMessages);
              setHasMore(response.data.hasMore || false);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load messages');
          } finally {
            setLoading(false);
          }
        },

        loadMoreMessages: async () => {
          const { currentPage, messages, hasMore, loading, setLoading, setError, setMessages, setHasMore, setCurrentPage } = get();
          
          if (!hasMore || loading) return;

          setLoading(true);

          try {
            const oldestMessage = messages[0];
            const response = await requestClient.getMessages({
              page: currentPage + 1,
              limit: 20,
              before: oldestMessage?.timestamp.toISOString(),
            });

            if (response.success && response.data) {
              const transformedMessages = response.data.messages.map(transformApiMessageToMessage);
              setMessages([...transformedMessages, ...messages]);
              setHasMore(response.data.hasMore || false);
              setCurrentPage(currentPage + 1);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to load more messages');
          } finally {
            setLoading(false);
          }
        },

        sendMessage: async (content, type = 'text') => {
          const { addMessage, updateMessage, isOnline } = get();
          
          const tempMessage = Message.create({
            id: Date.now(),
            content,
            sender: 'user',
            timestamp: new Date(),
            type,
            status: 'sending',
          });

          addMessage(tempMessage);

          if (!isOnline) {
            offlineQueue.add({ content, type, maxRetries: 3 });
            updateMessage(tempMessage.id, { status: 'failed' });
            return;
          }

          try {
            const response = await requestClient.sendMessage({ content, type });
            
            if (response.success && response.data) {
              const newMessage = transformApiMessageToMessage(response.data);
              updateMessage(tempMessage.id, {
                id: newMessage.id,
                status: 'sent',
                timestamp: newMessage.timestamp,
              });
            } else {
              updateMessage(tempMessage.id, { status: 'failed' });
            }
          } catch {
            updateMessage(tempMessage.id, { status: 'failed' });
          }
        },

        retryMessage: async (id) => {
          const { messages, updateMessage, sendMessage } = get();
          const message = messages.find(msg => msg.id === id);
          
          if (!message || !message.canRetry()) return;

          updateMessage(id, { status: 'sending' });
          
          try {
            await sendMessage(message.content, message.type);
          } catch {
            updateMessage(id, { status: 'failed' });
          }
        },

        searchMessages: async (query, sender) => {
          const { setLoading, setError, setMessages } = get();
          
          setLoading(true);
          setError(null);

          try {
            const response = await requestClient.searchMessages({ q: query, sender });
            
            if (response.success && response.data) {
              const transformedMessages = response.data.messages.map(transformApiMessageToMessage);
              setMessages(transformedMessages);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to search messages');
          } finally {
            setLoading(false);
          }
        },

        deleteMessageFromServer: async (id) => {
          const { deleteMessage, setError } = get();
          
          try {
            const response = await requestClient.deleteMessage(id);
            
            if (response.success) {
              deleteMessage(id);
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to delete message');
          }
        },

        recallMessage: async (id) => {
          const { setError, updateMessage } = get();
          console.log('=== STORE RECALL DEBUG ===');
          console.log('Recalling message with ID:', id, 'Type:', typeof id);
          
          try {
            const response = await requestClient.recallMessage(id);
            console.log('Recall response:', response);
            
            if (response.success) {
              updateMessage(id, { status: 'recalled', content: 'This message has been recalled' });
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to recall message');
          }
        },
      }),
      {
        name: 'message-store',
        partialize: (state) => ({
          draftMessage: state.draftMessage,
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.draftMessage) {
            DraftStorage.save(state.draftMessage);
          }
        },
      }
    )
  )
);

networkService.subscribe((isOnline) => {
  useMessageStore.getState().setIsOnline(isOnline);
  
  if (isOnline) {
    useMessageStore.getState().processOfflineQueue();
  }
});

// Helper function to filter messages
export const getFilteredMessages = (state: MessageState & MessageActions) => {
  let filtered = state.messages;
  
  // Filter by sender
  if (state.senderFilter !== 'all') {
    filtered = filtered.filter(message => 
      state.senderFilter === 'user' ? message.isFromUser() : !message.isFromUser()
    );
  }
  
  // Filter by search query
  if (state.searchQuery.trim()) {
    const query = state.searchQuery.toLowerCase().trim();
    filtered = filtered.filter(message => 
      message.content.toLowerCase().includes(query)
    );
  }
  
  return filtered;
};