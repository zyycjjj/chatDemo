import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchFilter } from '@/presentation/components/search-filter/SearchFilter'

describe('SearchFilter', () => {
  const mockOnSearch = vi.fn()
  const mockOnFilterChange = vi.fn()

  beforeEach(() => {
    mockOnSearch.mockClear()
    mockOnFilterChange.mockClear()
  })

  it('应该渲染搜索框和过滤器', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    expect(screen.getByPlaceholderText('搜索消息...')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('应该显示正确的过滤选项', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(3) // 全部, 用户, 机器人
    expect(screen.getByText('全部')).toBeInTheDocument()
    expect(screen.getByText('用户')).toBeInTheDocument()
    expect(screen.getByText('机器人')).toBeInTheDocument()
  })

  it('应该在输入搜索词时调用onSearch', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    
    await user.type(searchInput, 'hello')
    
    expect(mockOnSearch).toHaveBeenCalledWith('hello')
  })

  it('应该在防抖延迟后调用onSearch', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    
    await user.type(searchInput, 'h')
    await user.type(searchInput, 'e')
    await user.type(searchInput, 'l')
    await user.type(searchInput, 'l')
    await user.type(searchInput, 'o')
    
    // 等待防抖延迟
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledTimes(1)
      expect(mockOnSearch).toHaveBeenCalledWith('hello')
    }, { timeout: 1000 })
  })

  it('应该在过滤器改变时调用onFilterChange', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const filterSelect = screen.getByRole('combobox')
    
    await user.selectOptions(filterSelect, 'user')
    
    expect(mockOnFilterChange).toHaveBeenCalledWith('user')
  })

  it('应该显示搜索图标', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    expect(screen.getByTestId('search-icon')).toBeInTheDocument()
  })

  it('应该显示清除按钮当有输入内容时', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    
    await user.type(searchInput, 'hello')
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    expect(clearButton).toBeInTheDocument()
  })

  it('应该在点击清除按钮时清空输入', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    
    await user.type(searchInput, 'hello')
    
    const clearButton = screen.getByRole('button', { name: /clear/i })
    await user.click(clearButton)
    
    expect(searchInput).toHaveValue('')
    expect(mockOnSearch).toHaveBeenCalledWith('')
  })

  it('应该支持初始搜索值', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        initialSearch="test"
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    expect(searchInput).toHaveValue('test')
  })

  it('应该支持初始过滤器值', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        initialFilter="user"
      />
    )
    
    const filterSelect = screen.getByRole('combobox')
    expect(filterSelect).toHaveValue('user')
  })

  it('应该在按回车键时触发搜索', async () => {
    const user = userEvent.setup()
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
      />
    )
    
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    
    await user.type(searchInput, 'hello{enter}')
    
    expect(mockOnSearch).toHaveBeenCalledWith('hello')
  })

  it('应该支持自定义placeholder', () => {
    render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        placeholder="Search messages..."
      />
    )
    
    expect(screen.getByPlaceholderText('Search messages...')).toBeInTheDocument()
  })

  it('应该支持自定义className', () => {
    const { container } = render(
      <SearchFilter 
        onSearch={mockOnSearch}
        onFilterChange={mockOnFilterChange}
        className="custom-class"
      />
    )
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})