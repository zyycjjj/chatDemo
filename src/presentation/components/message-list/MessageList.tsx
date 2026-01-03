import React, { useMemo } from 'react';
import type { Message } from '../../../domain/entities/message';
import { MessageItem } from '../message-item/MessageItem';
import { DateSeparator } from '../date-separator';
import { getMessageListData } from './getMessageListData';

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  onRetry: (messageId: number) => void;
  onDelete: (messageId: number) => void;
  onRecall: (messageId: number) => void;
}

interface MessageListRenderProps {
  onRetry: (messageId: number) => void;
  onDelete: (messageId: number) => void;
  onRecall: (messageId: number) => void;
}

const MessageListRender: React.FC<{
  messagesWithDates: Array<{ type: 'date' | 'message'; data: string | Message }>;
} & MessageListRenderProps> = ({ messagesWithDates, onRetry, onDelete, onRecall }) => {
  const renderMessage = (message: Message) => (
    <MessageItem
      key={message.id}
      message={message}
      onRetry={onRetry}
      onDelete={onDelete}
      onRecall={onRecall}
    />
  );

  const renderDateSeparator = (date: string) => (
    <DateSeparator key={date} date={date} isSticky={false} />
  );

  return (
    <>
      {messagesWithDates.map((item) => {
        if (item.type === 'date') {
          return renderDateSeparator(item.data as string);
        }
        return renderMessage(item.data as Message);
      })}
    </>
  );
};

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  onRetry,
  onDelete,
  onRecall,
}) => {
  const messagesWithDates = useMemo(() => getMessageListData(messages), [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-1 p-4">
        <MessageListRender
          messagesWithDates={messagesWithDates}
          onRetry={onRetry}
          onDelete={onDelete}
          onRecall={onRecall}
        />
      </div>
      
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
        </div>
      )}
    </div>
  );
};