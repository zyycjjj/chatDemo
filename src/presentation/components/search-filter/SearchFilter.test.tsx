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
    expect(screen.getByTitle('Filter options')).toBeInTheDocument()
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
    
    // 点击过滤器按钮展开选项
    const filterButton = screen.getByTitle('Filter options')
    fireEvent.click(filterButton)
    
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
    
    // 先清空输入框，然后输入
    await user.clear(searchInput)
    await user.type(searchInput, 'hello')
    
    // 验证每个字符都被正确处理
    expect(mockOnSearchChange).toHaveBeenCalledTimes(5)
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(1, 'h')
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(2, 'e')
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(3, 'l')
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(4, 'l')
    expect(mockOnSearchChange).toHaveBeenNthCalledWith(5, 'o')
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
    
    // 点击过滤器按钮展开选项
    const filterButton = screen.getByTitle('Filter options')
    await user.click(filterButton)
    
    // 点击 User 按钮
    const userButton = screen.getByText('User')
    await user.click(userButton)
    
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
    
    // 点击过滤器按钮展开选项
    const filterButton = screen.getByTitle('Filter options')
    fireEvent.click(filterButton)
    
    // 检查 User 按钮是否被选中
    const userButton = screen.getByText('User')
    expect(userButton).toHaveClass('bg-primary-100', 'text-primary-700')
  })

  it('应该支持日期过滤器', async () => {
    const user = userEvent.setup()
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
    
    // 点击过滤器按钮展开选项
    const filterButton = screen.getByTitle('Filter options')
    await user.click(filterButton)
    
    const dateInput = screen.getByDisplayValue(today)
    expect(dateInput).toBeInTheDocument()
  })
})