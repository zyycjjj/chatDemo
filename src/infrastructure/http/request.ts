import type { ApiResponse, MessageData, ApiMessage, CreateMessageRequest, UpdateMessageStatusRequest, MessageSearchParams, MessageListParams } from '../../shared/types/api';

class RequestClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = 'http://localhost:3001/api', timeout: number = 10000) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Network error occurred');
    }
  }

  async getMessages(params?: MessageListParams): Promise<ApiResponse<MessageData>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.before) searchParams.append('before', params.before);

    const query = searchParams.toString();
    return this.request<MessageData>(`/messages${query ? `?${query}` : ''}`);
  }

  async sendMessage(data: CreateMessageRequest): Promise<ApiResponse<ApiMessage>> {
    return this.request<ApiMessage>('/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMessageStatus(
    id: number,
    data: UpdateMessageStatusRequest
  ): Promise<ApiResponse<ApiMessage>> {
    return this.request<ApiMessage>(`/messages/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMessage(id: number): Promise<ApiResponse<ApiMessage>> {
    return this.request<ApiMessage>(`/messages/${id}`, {
      method: 'DELETE',
    });
  }

  async recallMessage(id: number): Promise<ApiResponse<ApiMessage>> {
    return this.request<ApiMessage>(`/messages/${id}/recall`, {
      method: 'POST',
    });
  }

  async searchMessages(params: MessageSearchParams): Promise<ApiResponse<MessageData>> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.sender) searchParams.append('sender', params.sender);

    const query = searchParams.toString();
    return this.request<MessageData>(`/messages/search${query ? `?${query}` : ''}`);
  }
}

export const requestClient = new RequestClient();