import { useState } from 'react';

export interface UseSearchFilterProps {
  onSearchChange: (query: string) => void;
  onSenderFilterChange: (filter: 'all' | 'user' | 'bot') => void;
}

export interface SearchFilterLogic {
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleSearchChange: (value: string) => void;
  handleClearSearch: () => void;
  handleSenderFilterChange: (filter: 'all' | 'user' | 'bot') => void;
}

export const useSearchFilter = ({
  onSearchChange,
  onSenderFilterChange,
}: UseSearchFilterProps): SearchFilterLogic => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleSenderFilterChange = (filter: 'all' | 'user' | 'bot') => {
    onSenderFilterChange(filter);
  };

  return {
    isExpanded,
    toggleExpanded,
    handleSearchChange,
    handleClearSearch,
    handleSenderFilterChange,
  };
};