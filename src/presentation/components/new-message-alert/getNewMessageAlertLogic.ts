

export interface NewMessageAlertLogic {
  shouldShow: boolean;
  messageText: string;
  badgeContent: string;
}

export const getNewMessageAlertLogic = (count: number): NewMessageAlertLogic => {
  const shouldShow = count !== 0;
  const messageText = count === 1 ? 'New Message' : `${count} New Messages`;
  const badgeContent = count > 1 && count > 9 ? '9+' : count > 1 ? count.toString() : '';

  return {
    shouldShow,
    messageText,
    badgeContent,
  };
};