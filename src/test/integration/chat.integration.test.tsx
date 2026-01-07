import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatPage } from '@/presentation/pages/chat/ChatPage'
import { server } from '../mocks/server'
import { rest } from 'msw'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Chat Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
  })

  it('应该完成完整的消息发送和接收流程', async () => {
    render(<ChatPage />)
    
    // 等待消息列表加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 输入消息
    const textarea = screen.getByPlaceholderText('Type a message...')
    await userEvent.type(textarea, 'Hello bot')

    // 发送消息
    const sendButton = screen.getByRole('button', { name: /send/i })
    await userEvent.click(sendButton)

    // 验证消息显示在列表中
    await waitFor(() => {
      expect(screen.getByText('Hello bot')).toBeInTheDocument()
    })

    // 验证字符计数重置
    expect(screen.getByText('0/2000')).toBeInTheDocument()
  })

  it('应该处理搜索和过滤功能', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 输入搜索关键词
    const searchInput = screen.getByPlaceholderText('搜索消息...')
    await userEvent.type(searchInput, 'specific')

    // 验证搜索结果
    await waitFor(() => {
      expect(screen.getByText('specific')).toBeInTheDocument()
    })
  })

  it('应该处理发送失败和重试', async () => {
    // 模拟发送失败
    server.use(
      rest.post('/api/messages', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, error: 'Network error' })
        )
      })
    )

    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 输入并发送消息
    const textarea = screen.getByPlaceholderText('Type a message...')
    await userEvent.type(textarea, 'Failed message')
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await userEvent.click(sendButton)

    // 验证失败状态和重试按钮
    await waitFor(() => {
      expect(screen.getByText('failed')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument()
    })
  })

  it('应该处理消息删除功能', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 找到用户消息的删除按钮
    const deleteButtons = screen.getAllByRole('button', { name: /删除/i })
    if (deleteButtons.length > 0) {
      await userEvent.click(deleteButtons[0])

      // 验证确认对话框
      const confirmButton = screen.getByRole('button', { name: /确认删除/i })
      await userEvent.click(confirmButton)

      // 验证消息被删除
      await waitFor(() => {
        expect(screen.getByText('消息已删除')).toBeInTheDocument()
      })
    }
  })

  it('应该处理消息撤回功能', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 找到用户消息的撤回按钮
    const recallButtons = screen.getAllByRole('button', { name: /撤回/i })
    if (recallButtons.length > 0) {
      await userEvent.click(recallButtons[0])

      // 验证撤回状态
      await waitFor(() => {
        expect(screen.getByText('消息已撤回')).toBeInTheDocument()
      })
    }
  })

  it('应该处理草稿保存功能', async () => {
    render(<ChatPage />)
    
    // 输入消息但不发送
    const textarea = screen.getByPlaceholderText('Type a message...')
    await userEvent.type(textarea, 'Draft message')

    // 验证localStorage被调用
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'chat-draft',
      'Draft message'
    )
  })

  it('应该处理草稿恢复功能', async () => {
    // 设置localStorage中的草稿
    localStorageMock.getItem.mockReturnValue('Existing draft')

    render(<ChatPage />)
    
    // 验证草稿被恢复
    const textarea = screen.getByPlaceholderText('Type a message...')
    expect(textarea).toHaveValue('Existing draft')
  })

  it('应该处理分页加载', async () => {
    render(<ChatPage />)
    
    // 等待初始消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 滚动到顶部触发加载更多
    const messageList = screen.getByRole('main')
    fireEvent.scroll(messageList, { target: { scrollTop: 0 } })

    // 验证加载更多消息
    await waitFor(() => {
      expect(screen.getByText(/loading more/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('应该处理日期过滤', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 查找日期过滤器
    const dateFilter = screen.getByRole('combobox', { name: /日期/i })
    if (dateFilter) {
      await userEvent.selectOptions(dateFilter, 'today')

      // 验证过滤结果
      await waitFor(() => {
        expect(screen.getByText(/今天/i)).toBeInTheDocument()
      })
    }
  })

  it('应该处理网络状态变化', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 模拟网络断开
    window.dispatchEvent(new Event('offline'))

    // 验证离线状态提示
    await waitFor(() => {
      expect(screen.getByText(/网络已断开/i)).toBeInTheDocument()
    })

    // 模拟网络恢复
    window.dispatchEvent(new Event('online'))

    // 验证网络恢复提示
    await waitFor(() => {
      expect(screen.getByText(/网络已恢复/i)).toBeInTheDocument()
    })
  })

  it('应该处理键盘快捷键', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 测试Ctrl+Enter发送消息
    const textarea = screen.getByPlaceholderText('Type a message...')
    await userEvent.type(textarea, 'Test shortcut')
    await userEvent.keyboard('{Control>}{Enter}{/Control}')

    // 验证消息发送
    await waitFor(() => {
      expect(screen.getByText('Test shortcut')).toBeInTheDocument()
    })
  })

  it('应该处理消息时间显示', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 验证时间显示
    const timeElements = screen.getAllByText(/\d{2}:\d{2}/)
    expect(timeElements.length).toBeGreaterThan(0)
  })

  it('应该处理滚动到新消息功能', async () => {
    render(<ChatPage />)
    
    // 等待消息加载
    await waitFor(() => {
      expect(screen.getByText(/test/i)).toBeInTheDocument()
    })

    // 滚动到顶部
    const messageList = screen.getByRole('main')
    fireEvent.scroll(messageList, { target: { scrollTop: 1000 } })

    // 发送新消息
    const textarea = screen.getByPlaceholderText('Type a message...')
    await userEvent.type(textarea, 'New message')
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    await userEvent.click(sendButton)

    // 验证自动滚动到底部
    await waitFor(() => {
      expect(messageList.scrollTop).toBe(0)
    })
  })
})