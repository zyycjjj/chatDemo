import { useState } from 'react';
import { Message } from '../../../domain/entities/message';

export interface MessageActionsLogic {
  showActions: boolean;
  toggleActions: () => void;
  closeActions: () => void;
  handleRecall: () => void;
  handleDelete: () => void;
}

export const useMessageActions = (
  message: Message,
  onRecall?: (id: number) => void,
  onDelete?: (id: number) => void
): MessageActionsLogic => {
  const [showActions, setShowActions] = useState(false);

  const toggleActions = () => setShowActions(!showActions);

  const closeActions = () => setShowActions(false);

  const handleRecall = () => {
    console.log('=== MESSAGE ACTIONS RECALL DEBUG ===');
    console.log('Recall button clicked for message ID:', message.id);
    if (onRecall) {
      onRecall(message.id);
    }
    closeActions();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(message.id);
    }
    closeActions();
  };

  return {
    showActions,
    toggleActions,
    closeActions,
    handleRecall,
    handleDelete,
  };
};