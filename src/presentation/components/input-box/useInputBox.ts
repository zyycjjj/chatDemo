import { useState, useRef, useEffect } from 'react';
import { useMessageStore } from '../../../application/stores/message-store';

interface UseInputBoxProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

export const useInputBox = ({ onSendMessage, disabled = false }: UseInputBoxProps) => {
  const { draftMessage, setDraftMessage } = useMessageStore();
  const [message, setMessage] = useState(draftMessage);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, [message]);

  // Load draft on component mount
  useEffect(() => {
    setMessage(draftMessage);
  }, [draftMessage]);

  // Save draft when message changes
  useEffect(() => {
    if (message !== draftMessage) {
      setDraftMessage(message);
    }
  }, [message, draftMessage, setDraftMessage]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      setDraftMessage(''); // Clear draft after sending
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  return {
    message,
    isComposing,
    textareaRef,
    setMessage,
    handleSend,
    handleKeyDown,
    handleCompositionStart,
    handleCompositionEnd,
  };
};