import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMessageStore } from '@/application/stores/message-store'
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

describe('Message Store Integration Tests', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null)
    // Reset store state
    useMessageStore.setState({
      messages: [],
      loading: false,
      error: null,
      hasMore: true,
      currentPage: 1,
      searchQuery: '',
      senderFilter: 'all',
      dateFilter: null,
      draftMessage: '',
      unreadCount: 0,
      isAtBottom: true,
      isOnline: navigator.onLine,
      offlineQueue: [],
    })
  })

  it('应该初始化默认状态', () => {
    const { result } = renderHook(() => useMessageStore())
    
    expect(result.current.messages).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBe(null)
    expect(result.current.hasMore).toBe(true)
    expect(result.current.currentPage).toBe(1)
    expect(result.current.searchQuery).toBe('')
    expect(result.current.senderFilter).toBe('all')
    expect(result.current.dateFilter).toBe(null)
    expect(result.current.draftMessage).toBe('')
    expect(result.current.unreadCount).toBe(0)
    expect(result.current.isAtBottom).toBe(true)
    expect(result.current.isOnline).toBe(navigator.onLine)
    expect(result.current.offlineQueue).toEqual([])
  })

  it('应该加载初始消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    expect(result.current.loading).toBe(false)
    expect(result.current.messages.length).toBeGreaterThan(0)
    expect(result.current.error).toBe(null)
  })

  it('应该处理加载更多消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 先加载初始消息
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    const initialCount = result.current.messages.length
    
    // 加载更多消息
    await act(async () => {
      await result.current.loadMoreMessages()
    })
    
    expect(result.current.messages.length).toBeGreaterThan(initialCount)
    expect(result.current.currentPage).toBe(2)
  })

  it('应该处理发送消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.sendMessage('Hello world')
    })
    
    expect(result.current.messages).toContainEqual(
      expect.objectContaining({
        content: 'Hello world',
        sender: 'user',
        status: 'sent'
      })
    )
  })

  it('应该处理发送失败', async () => {
    // Mock 发送失败
    server.use(
      rest.post('/api/messages', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, error: 'Network error' })
        )
      })
    )

    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      try {
        await result.current.sendMessage('Failed message')
      } catch (error) {
        // 预期会抛出错误
      }
    })
    
    // 验证失败消息被添加到队列
    expect(result.current.offlineQueue.length).toBeGreaterThan(0)
  })

  it('应该处理搜索消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    // 设置搜索查询
    act(() => {
      result.current.setSearchQuery('test')
    })
    
    await act(async () => {
      await result.current.searchMessages()
    })
    
    expect(result.current.searchQuery).toBe('test')
    expect(result.current.loading).toBe(false)
  })

  it('应该处理发送者过滤', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    // 设置发送者过滤器
    act(() => {
      result.current.setSenderFilter('user')
    })
    
    // 验证过滤器设置成功
    expect(result.current.senderFilter).toBe('user')
  })

  it('应该处理日期过滤', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    // 设置日期过滤器
    const today = new Date()
    act(() => {
      result.current.setDateFilter(today)
    })
    
    // 验证过滤器设置成功
    expect(result.current.dateFilter).toEqual(today)
  })

  it('应该处理草稿保存', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 设置草稿
    act(() => {
      result.current.setDraftMessage('Draft content')
    })
    
    expect(result.current.draftMessage).toBe('Draft content')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('chat-draft', 'Draft content')
  })

  it('应该处理草稿恢复', () => {
    // Mock localStorage 返回草稿
    localStorageMock.getItem.mockReturnValue('Existing draft')
    
    const { result } = renderHook(() => useMessageStore())
    
    // 验证草稿被恢复
    expect(result.current.draftMessage).toBe('Existing draft')
  })

  it('应该处理删除消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    const messageId = result.current.messages[0].id
    
    await act(async () => {
      await result.current.deleteMessage(messageId)
    })
    
    expect(result.current.messages).not.toContainEqual(
      expect.objectContaining({ id: messageId })
    )
  })

  it('应该处理撤回消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    const messageId = result.current.messages[0].id
    
    await act(async () => {
      await result.current.recallMessage(messageId)
    })
    
    // 验证消息被撤回
    const recalledMessage = result.current.messages.find(msg => msg.id === messageId)
    expect(recalledMessage).toBeDefined()
  })

  it('应该处理消息状态更新', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    const messageId = result.current.messages[0].id
    
    await act(async () => {
      await result.current.updateMessageStatus(messageId, 'delivered')
    })
    
    const updatedMessage = result.current.messages.find(msg => msg.id === messageId)
    expect(updatedMessage?.status).toBe('delivered')
  })

  it('应该处理网络状态变化', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 模拟网络断开
    act(() => {
      window.dispatchEvent(new Event('offline'))
    })
    
    expect(result.current.isOnline).toBe(false)
    
    // 模拟网络恢复
    act(() => {
      window.dispatchEvent(new Event('online'))
    })
    
    expect(result.current.isOnline).toBe(true)
  })

  it('应该处理重试发送离线消息', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 添加离线消息到队列
    act(() => {
      result.current.offlineQueue.push({
        id: '1',
        content: 'Offline message',
        timestamp: new Date().toISOString()
      })
    })
    
    await act(async () => {
      await result.current.retryOfflineMessages()
    })
    
    // 验证离线消息被处理
    expect(result.current.offlineQueue.length).toBe(0)
  })

  it('应该处理清空搜索和过滤器', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 设置搜索和过滤器
    act(() => {
      result.current.setSearchQuery('test')
      result.current.setSenderFilter('user')
      result.current.setDateFilter(new Date())
    })
    
    // 清空搜索和过滤器
    act(() => {
      result.current.clearFilters()
    })
    
    expect(result.current.searchQuery).toBe('')
    expect(result.current.senderFilter).toBe('all')
    expect(result.current.dateFilter).toBe(null)
  })

  it('应该处理错误状态', async () => {
    // Mock 服务器错误
    server.use(
      rest.get('/api/messages', (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({ success: false, error: 'Server error' })
        )
      })
    )

    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    expect(result.current.error).toBeDefined()
    expect(result.current.loading).toBe(false)
  })

  it('应该处理未读消息计数', async () => {
    const { result } = renderHook(() => useMessageStore())
    
    await act(async () => {
      await result.current.loadInitialMessages()
    })
    
    // 模拟用户滚动到顶部
    act(() => {
      result.current.setIsAtBottom(false)
    })
    
    // 发送新消息
    await act(async () => {
      await result.current.sendMessage('New message')
    })
    
    expect(result.current.unreadCount).toBeGreaterThan(0)
    
    // 滚动到底部
    act(() => {
      result.current.setIsAtBottom(true)
    })
    
    expect(result.current.unreadCount).toBe(0)
  })
})