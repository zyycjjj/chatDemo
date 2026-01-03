import type { Message } from '../entities/message';

export interface MessageRepository {
  findAll(): Promise<Message[]>;
  findById(id: number): Promise<Message | null>;
  findBySender(sender: 'user' | 'bot'): Promise<Message[]>;
  findByDateRange(start: Date, end: Date): Promise<Message[]>;
  search(query: string, filters?: {
    sender?: 'user' | 'bot';
    status?: 'sending' | 'sent' | 'failed';
  }): Promise<Message[]>;
  save(message: Message): Promise<Message>;
  update(id: number, updates: Partial<Message>): Promise<Message>;
  delete(id: number): Promise<void>;
  findPaginated(page: number, limit: number, before?: Date): Promise<{
    messages: Message[];
    hasMore: boolean;
    total: number;
  }>;
}