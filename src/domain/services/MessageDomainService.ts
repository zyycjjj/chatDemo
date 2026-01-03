import { Message } from '../entities/message';

export class MessageDomainService {
  public groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
    const groupedMessages = new Map<string, Message[]>();

    messages.forEach(message => {
      const dateKey = message.getFormattedDate();
      
      if (!groupedMessages.has(dateKey)) {
        groupedMessages.set(dateKey, []);
      }
      
      groupedMessages.get(dateKey)!.push(message);
    });

    return groupedMessages;
  }

  public getUnreadCount(messages: Message[], lastReadTime?: Date): number {
    if (!lastReadTime) {
      return messages.filter(msg => msg.isFromBot()).length;
    }

    return messages.filter(msg => 
      msg.isFromBot() && msg.timestamp > lastReadTime
    ).length;
  }

  public canRetryMessage(message: Message): boolean {
    return message.canRetry();
  }

  public canDeleteMessage(message: Message): boolean {
    return message.canDelete();
  }

  public isMessageExpired(message: Message, maxAgeMinutes: number = 5): boolean {
    const now = new Date();
    const ageInMinutes = (now.getTime() - message.timestamp.getTime()) / (1000 * 60);
    return ageInMinutes > maxAgeMinutes;
  }

  public filterMessages(
    messages: Message[], 
    filters: {
      query?: string;
      sender?: 'user' | 'bot';
      status?: 'sending' | 'sent' | 'failed';
      dateRange?: { start: Date; end: Date };
    }
  ): Message[] {
    return messages.filter(message => {
      if (filters.query) {
        const query = filters.query.toLowerCase();
        if (!message.content.toLowerCase().includes(query)) {
          return false;
        }
      }

      if (filters.sender && message.sender !== filters.sender) {
        return false;
      }

      if (filters.status && message.status !== filters.status) {
        return false;
      }

      if (filters.dateRange) {
        const { start, end } = filters.dateRange;
        if (message.timestamp < start || message.timestamp > end) {
          return false;
        }
      }

      return true;
    });
  }

  public sortMessages(messages: Message[], order: 'asc' | 'desc' = 'asc'): Message[] {
    return [...messages].sort((a, b) => {
      const comparison = a.timestamp.getTime() - b.timestamp.getTime();
      return order === 'asc' ? comparison : -comparison;
    });
  }

  public getConsecutiveMessages(
    messages: Message[], 
    currentMessage: Message,
    maxTimeDiffMinutes: number = 2
  ): {
    previous?: Message;
    next?: Message;
    isGroupedWithPrevious: boolean;
    isGroupedWithNext: boolean;
  } {
    const sortedMessages = this.sortMessages(messages);
    const currentIndex = sortedMessages.findIndex(msg => msg.id === currentMessage.id);

    if (currentIndex === -1) {
      return {
        isGroupedWithPrevious: false,
        isGroupedWithNext: false,
      };
    }

    const previous = currentIndex > 0 ? sortedMessages[currentIndex - 1] : undefined;
    const next = currentIndex < sortedMessages.length - 1 ? sortedMessages[currentIndex + 1] : undefined;

    const maxTimeDiff = maxTimeDiffMinutes * 60 * 1000;

    const isGroupedWithPrevious = previous &&
      previous.sender === currentMessage.sender &&
      Math.abs(previous.timestamp.getTime() - currentMessage.timestamp.getTime()) < maxTimeDiff;

    const isGroupedWithNext = next &&
      next.sender === currentMessage.sender &&
      Math.abs(next.timestamp.getTime() - currentMessage.timestamp.getTime()) < maxTimeDiff;

    return {
      previous,
      next,
      isGroupedWithPrevious: isGroupedWithPrevious || false,
      isGroupedWithNext: isGroupedWithNext || false,
    };
  }
}