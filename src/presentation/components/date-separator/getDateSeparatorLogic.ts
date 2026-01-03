import { format, isToday, isYesterday, isThisWeek } from 'date-fns';

export interface DateSeparatorLogic {
  displayDate: string;
}

export const getDateSeparatorLogic = (date: string): DateSeparatorLogic => {
  const messageDate = new Date(date);
  
  const getDisplayDate = () => {
    if (isToday(messageDate)) {
      return 'Today';
    }
    
    if (isYesterday(messageDate)) {
      return 'Yesterday';
    }
    
    if (isThisWeek(messageDate, { weekStartsOn: 1 })) {
      return format(messageDate, 'EEEE');
    }
    
    return format(messageDate, 'MMM d, yyyy');
  };

  const displayDate = getDisplayDate();

  return {
    displayDate,
  };
};