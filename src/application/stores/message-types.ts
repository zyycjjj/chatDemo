import type { Message } from '../../domain/entities/message';

export interface MessageState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  searchQuery: string;
  senderFilter: 'all' | 'user' | 'bot';
  dateFilter: string | null; // Format: YYYY-MM-DD
  draftMessage: string;
  unreadCount: number;
  isAtBottom: boolean;
  isOnline: boolean;
  offlineQueue: QueuedMessage[];
}

export interface QueuedMessage {
  id: string;
  content: string;
  type: 'text' | 'image' | 'file';
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface MessageActions {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: number, updates: Partial<Message>) => void;
  deleteMessage: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasMore: (hasMore: boolean) => void;
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setSenderFilter: (filter: 'all' | 'user' | 'bot') => void;
  setDateFilter: (date: string | null) => void;
  setDraftMessage: (draft: string) => void;
  incrementUnreadCount: () => void;
  resetUnreadCount: () => void;
  setIsAtBottom: (isAtBottom: boolean) => void;
  setIsOnline: (isOnline: boolean) => void;
  addToOfflineQueue: (message: Message) => void;
  clearOfflineQueue: () => void;
  processOfflineQueue: () => Promise<void>;
  loadInitialMessages: () => Promise<void>;
  loadMoreMessages: () => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file') => Promise<void>;
  retryMessage: (id: number) => Promise<void>;
  searchMessages: (query: string, sender?: 'user' | 'bot') => Promise<void>;
  deleteMessageFromServer: (id: number) => Promise<void>;
  recallMessage: (id: number) => Promise<void>;
}