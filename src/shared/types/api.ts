export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface MessageData {
  messages: ApiMessage[];
  hasMore?: boolean;
  total?: number;
}

export interface ApiMessage {
  id: number;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  status: 'sending' | 'sent' | 'failed';
  type: 'text' | 'image' | 'file';
  updatedAt?: string;
}

export interface CreateMessageRequest {
  content: string;
  type?: 'text' | 'image' | 'file';
}

export interface UpdateMessageStatusRequest {
  status: 'sending' | 'sent' | 'failed';
}

export interface MessageSearchParams {
  q?: string;
  sender?: 'user' | 'bot';
}

export interface MessageListParams {
  page?: number;
  limit?: number;
  before?: string;
}