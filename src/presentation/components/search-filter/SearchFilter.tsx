import React from 'react';
import { useSearchFilter } from './useSearchFilter';

interface SearchFilterProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  senderFilter: 'all' | 'user' | 'bot';
  onSenderFilterChange: (filter: 'all' | 'user' | 'bot') => void;
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  searchQuery,
  onSearchChange,
  senderFilter,
  onSenderFilterChange,
}) => {
  const {
    isExpanded,
    toggleExpanded,
    handleSearchChange,
    handleClearSearch,
    handleSenderFilterChange,
  } = useSearchFilter({
    onSearchChange,
    onSenderFilterChange,
  });

  return (
    <div className="border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search messages..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <button
          onClick={toggleExpanded}
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="Filter options"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Filter by sender:</span>
          
          <div className="flex gap-1">
            <button
              onClick={() => handleSenderFilterChange('all')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                senderFilter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            
            <button
              onClick={() => handleSenderFilterChange('user')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                senderFilter === 'user'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              User
            </button>
            
            <button
              onClick={() => handleSenderFilterChange('bot')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                senderFilter === 'bot'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Bot
            </button>
          </div>
        </div>
      )}
    </div>
  );
};