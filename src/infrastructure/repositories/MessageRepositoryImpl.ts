import { Message } from '../../domain/entities/message';
import type { MessageRepository } from '../../domain/repositories/MessageRepository';
import { requestClient } from '../http/request';
import type { ApiMessage } from '../../shared/types/api';

export class MessageRepositoryImpl implements MessageRepository {
  public async findAll(): Promise<Message[]> {
    const response = await requestClient.getMessages();
    
    if (response.success && response.data) {
      return response.data.messages.map((data: ApiMessage) => Message.create(data));
    }
    
    throw new Error(response.error || 'Failed to fetch messages');
  }

  public async findById(id: number): Promise<Message | null> {
    try {
      const response = await requestClient.getMessages();
      
      if (response.success && response.data) {
        const messageData = response.data.messages.find((msg: ApiMessage) => msg.id === id);
        return messageData ? Message.create(messageData) : null;
      }
      
      throw new Error(response.error || 'Failed to fetch message');
    } catch {
      return null;
    }
  }

  public async findBySender(sender: 'user' | 'bot'): Promise<Message[]> {
    const response = await requestClient.searchMessages({ sender });
    
    if (response.success && response.data) {
      return response.data.messages.map((data: ApiMessage) => Message.create(data));
    }
    
    throw new Error(response.error || 'Failed to fetch messages by sender');
  }

  public async findByDateRange(start: Date, end: Date): Promise<Message[]> {
    const allMessages = await this.findAll();
    
    return allMessages.filter(message => 
      message.timestamp >= start && message.timestamp <= end
    );
  }

  public async search(
    query: string, 
    filters?: {
      sender?: 'user' | 'bot';
      status?: 'sending' | 'sent' | 'failed';
    }
  ): Promise<Message[]> {
    const response = await requestClient.searchMessages({ 
      q: query, 
      sender: filters?.sender 
    });
    
    if (response.success && response.data) {
      let messages = response.data.messages.map((data: ApiMessage) => Message.create(data));
      
      if (filters?.status) {
        messages = messages.filter((msg: Message) => msg.status === filters.status);
      }
      
      return messages;
    }
    
    throw new Error(response.error || 'Failed to search messages');
  }

  public async save(message: Message): Promise<Message> {
    const response = await requestClient.sendMessage({
      content: message.content,
      type: message.type
    });
    
    if (response.success && response.data) {
      return Message.create(response.data);
    }
    
    throw new Error(response.error || 'Failed to save message');
  }

  public async update(id: number, updates: Partial<Message>): Promise<Message> {
    const response = await requestClient.updateMessageStatus(id, {
      status: updates.status as 'sending' | 'sent' | 'failed'
    });
    
    if (response.success && response.data) {
      return Message.create(response.data);
    }
    
    throw new Error(response.error || 'Failed to update message');
  }

  public async delete(id: number): Promise<void> {
    const response = await requestClient.deleteMessage(id);
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete message');
    }
  }

  public async findPaginated(
    page: number, 
    limit: number, 
    before?: Date
  ): Promise<{
    messages: Message[];
    hasMore: boolean;
    total: number;
  }> {
    const response = await requestClient.getMessages({
      page,
      limit,
      before: before?.toISOString()
    });
    
    if (response.success && response.data) {
      return {
        messages: response.data.messages.map((data: ApiMessage) => Message.create(data)),
        hasMore: response.data.hasMore || false,
        total: response.data.total || 0
      };
    }
    
    throw new Error(response.error || 'Failed to fetch paginated messages');
  }
}