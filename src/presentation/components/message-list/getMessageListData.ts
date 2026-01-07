import type { Message } from '../../../domain/entities/message';

export interface EnhancedMessage {
  message: Message;
  showAvatar: boolean;
  showTail: boolean;
  isGroupStart: boolean;
  isGroupEnd: boolean;
}

export interface MessageListData {
  messagesWithDates: Array<{ type: 'date' | 'message'; data: string | EnhancedMessage }>;
  loading: boolean;
}

export const getMessageListData = (messages: Message[], dateFilter: string | null = null): MessageListData['messagesWithDates'] => {
  // 如果有日期筛选，先筛选消息
  let filteredMessages = messages;
  if (dateFilter) {
    const filterDate = new Date(dateFilter);
    filteredMessages = messages.filter(message => {
      const messageDate = new Date(message.timestamp);
      return messageDate.toDateString() === filterDate.toDateString();
    });
  }
  const result: Array<{ type: 'date' | 'message'; data: string | EnhancedMessage }> = [];
  
  filteredMessages.forEach((message, index) => {
    // 检查是否需要添加日期分隔符
    if (index === 0) {
      result.push({ type: 'date', data: new Date(message.timestamp).toDateString() });
    } else {
      const prevMessage = filteredMessages[index - 1];
      const currentDate = new Date(message.timestamp).toDateString();
      const prevDate = new Date(prevMessage.timestamp).toDateString();
      
      if (currentDate !== prevDate) {
        result.push({ type: 'date', data: currentDate });
      }
    }
    
    // 计算消息分组逻辑
    const prevMessage = index > 0 ? filteredMessages[index - 1] : null;
    const nextMessage = index < filteredMessages.length - 1 ? filteredMessages[index + 1] : null;
    
    // 检查与前一条消息的时间差（超过5分钟则重新分组）
    const timeDiffFromPrev = prevMessage ? 
      Math.abs(new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) : 
      Infinity;
    const shouldGroupByTime = timeDiffFromPrev < 5 * 60 * 1000; // 5分钟内
    
    // 检查是否应该显示头像
    const showAvatar = !prevMessage || 
                       prevMessage.sender !== message.sender || 
                       new Date(prevMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString() ||
                       !shouldGroupByTime;
    
    // 检查是否应该显示气泡尾巴
    const showTail = !nextMessage || 
                     nextMessage.sender !== message.sender || 
                     new Date(nextMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString() ||
                     Math.abs(new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) >= 5 * 60 * 1000;
    
    // 检查是否是分组开始
    const isGroupStart = !prevMessage || 
                        prevMessage.sender !== message.sender || 
                        new Date(prevMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString() ||
                        !shouldGroupByTime;
    
    // 检查是否是分组结束
    const isGroupEnd = !nextMessage || 
                      nextMessage.sender !== message.sender || 
                      new Date(nextMessage.timestamp).toDateString() !== new Date(message.timestamp).toDateString() ||
                      Math.abs(new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime()) >= 5 * 60 * 1000;
    
    const enhancedMessage: EnhancedMessage = {
      message,
      showAvatar,
      showTail,
      isGroupStart,
      isGroupEnd
    };
    
    result.push({ type: 'message', data: enhancedMessage });
  });
  
  return result;
};