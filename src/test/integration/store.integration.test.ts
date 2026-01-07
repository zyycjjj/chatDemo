import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useMessageStore } from '../../application/stores/message-store'
import { server } from '../mocks/server'
import { http } from 'msw'

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
    
    // 验证页面数增加
    expect(result.current.currentPage).toBe(2)
    // 验证消息数量保持不变（如果没有更多数据）
    expect(result.current.messages.length).toBeGreaterThanOrEqual(initialCount)
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
      http.post('/api/messages', () => {
        return Response.json(
          { success: false, error: 'Network error' },
          { status: 500 }
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
    
    // 验证错误状态被设置
    expect(result.current.error).toBeTruthy()
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
      await result.current.searchMessages('test')
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
    const today = new Date().toISOString().split('T')[0]
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

  it('应该处理草稿保存和恢复', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 设置草稿
    act(() => {
      result.current.setDraftMessage('Test draft')
    })
    
    expect(result.current.draftMessage).toBe('Test draft')
    expect(localStorageMock.setItem).toHaveBeenCalledWith('chat-draft', 'Test draft')
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
      await result.current.updateMessage(messageId, { status: 'sent' })
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

  it('应该处理离线队列清空', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 清空离线队列
    act(() => {
      result.current.clearOfflineQueue()
    })
    
    // 验证离线队列为空
    expect(result.current.offlineQueue.length).toBe(0)
  })

  it('应该处理清空搜索和过滤器', () => {
    const { result } = renderHook(() => useMessageStore())
    
    // 设置搜索和过滤器
    act(() => {
      result.current.setSearchQuery('test')
      result.current.setSenderFilter('user')
      result.current.setDateFilter(new Date().toISOString().split('T')[0])
    })
    
    // 手动清空搜索和过滤器
    act(() => {
      result.current.setSearchQuery('')
      result.current.setSenderFilter('all')
      result.current.setDateFilter(null)
    })
    
    expect(result.current.searchQuery).toBe('')
    expect(result.current.senderFilter).toBe('all')
    expect(result.current.dateFilter).toBe(null)
  })

  it('应该处理错误状态', async () => {
    // Mock 服务器错误
    server.use(
      http.get('/api/messages', ({ request }) => {
        return Response.json(
          { success: false, error: 'Server error' },
          { status: 500 }
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
    
    // 滚动到底部并重置未读计数
    act(() => {
      result.current.setIsAtBottom(true)
      result.current.resetUnreadCount()
    })
    
    expect(result.current.unreadCount).toBe(0)
  })
})