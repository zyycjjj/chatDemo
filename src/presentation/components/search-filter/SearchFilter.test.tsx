import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilter } from './SearchFilter'

describe('SearchFilter', () => {
  const mockOnSearchChange = vi.fn()
  const mockOnSenderFilterChange = vi.fn()
  const mockOnDateFilterChange = vi.fn()

  beforeEach(() => {
    mockOnSearchChange.mockClear()
    mockOnSenderFilterChange.mockClear()
    mockOnDateFilterChange.mockClear()
  })

  it('应该渲染搜索框和过滤器', () => {
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该显示正确的过滤选项', () => {
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3) // all, user, bot
    expect(screen.getByText('All')).toBeInTheDocument()
    expect(screen.getByText('User')).toBeInTheDocument()
    expect(screen.getByText('Bot')).toBeInTheDocument()
  })

  it('应该在输入搜索词时调用onSearchChange', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search messages...')
    
    await user.type(searchInput, 'hello')
    
    expect(mockOnSearchChange).toHaveBeenCalledWith('hello')
  })

  it('应该在过滤器改变时调用onSenderFilterChange', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const filterSelect = screen.getByRole('combobox')
    
    await user.selectOptions(filterSelect, 'user')
    
    expect(mockOnSenderFilterChange).toHaveBeenCalledWith('user')
  })

  it('应该显示搜索图标', () => {
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    // 搜索图标应该存在
    expect(screen.getByTestId('search-filter')).toBeInTheDocument()
  })

  it('应该支持初始搜索值', () => {
    render(
      <SearchFilter 
        searchQuery="test"
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('Search messages...')
    expect(searchInput).toHaveValue('test')
  })

  it('应该支持初始过滤器值', () => {
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="user"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={null}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const filterSelect = screen.getByRole('combobox')
    expect(filterSelect).toHaveValue('user')
  })

  it('应该支持日期过滤器', () => {
    const today = new Date().toISOString().split('T')[0]
    render(
      <SearchFilter 
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        senderFilter="all"
        onSenderFilterChange={mockOnSenderFilterChange}
        dateFilter={today}
        onDateFilterChange={mockOnDateFilterChange}
      />
    )
    
    const dateInput = screen.getByDisplayValue(today)
    expect(dateInput).toBeInTheDocument()
  })
})