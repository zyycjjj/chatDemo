import React from 'react';
import { getDateSeparatorLogic } from './getDateSeparatorLogic';

interface DateSeparatorProps {
  date: Date | string;
  isSticky?: boolean;
}

export const DateSeparator: React.FC<DateSeparatorProps> = ({ date, isSticky = false }) => {
  const dateString = typeof date === 'string' ? date : date.toISOString();
  const { displayDate } = getDateSeparatorLogic(dateString);

  return (
    <div className={`relative w-full ${isSticky ? 'sticky top-0 z-20 bg-gradient-to-b from-gray-50 to-white border-b border-gray-200' : ''}`}>
      <div className="flex items-center justify-center py-3">
        <div className="bg-white border border-gray-300 text-gray-700 text-xs font-medium px-4 py-1.5 rounded-full shadow-md">
          {displayDate}
        </div>
      </div>
    </div>
  );
};