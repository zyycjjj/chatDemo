import type { Message } from '../../../domain/entities/message';

export interface MessageListData {
  messagesWithDates: Array<{ type: 'date' | 'message'; data: string | Message }>;
  loading: boolean;
}

export const getMessageListData = (messages: Message[]): MessageListData['messagesWithDates'] => {
  const result: Array<{ type: 'date' | 'message'; data: string | Message }> = [];
  
  messages.forEach((message, index) => {
    if (index === 0) {
      result.push({ type: 'date', data: new Date(message.timestamp).toDateString() });
      result.push({ type: 'message', data: message });
    } else {
      const prevMessage = messages[index - 1];
      const currentDate = new Date(message.timestamp).toDateString();
      const prevDate = new Date(prevMessage.timestamp).toDateString();
      
      if (currentDate !== prevDate) {
        result.push({ type: 'date', data: currentDate });
      }
      
      result.push({ type: 'message', data: message });
    }
  });
  
  return result;
};