import React from 'react';
import { getDateSeparatorLogic } from './getDateSeparatorLogic';

interface DateSeparatorProps {
  date: string;
  isSticky?: boolean;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date, isSticky = false }) => {
  const { displayDate } = getDateSeparatorLogic(date);

  return (
    <div className={`relative ${isSticky ? 'sticky top-0 z-10 bg-gray-50' : ''}`}>
      <div className="flex items-center justify-center py-2">
        <div className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {displayDate}
        </div>
      </div>
    </div>
  );
};