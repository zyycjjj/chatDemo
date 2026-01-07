import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { requestClient } from '@/infrastructure/http/request'

// Mock fetch
global.fetch = vi.fn()

describe('RequestClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getMessages', () => {
    it('应该成功获取消息列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          messages: [
            {
              id: 1,
              content: 'Hello',
              sender: 'user',
              timestamp: '2024-01-01T10:00:00Z',
              status: 'sent',
              type: 'text'
            }
          ],
          hasMore: true,
          total: 1
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.getMessages({ page: 1, limit: 20 })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages?page=1&limit=20',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('应该支持before参数', async () => {
      const mockResponse = {
        success: true,
        data: { messages: [], hasMore: false, total: 0 }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await requestClient.getMessages({ before: '2024-01-01T00:00:00Z' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages?before=2024-01-01T00:00:00Z',
        expect.any(Object)
      )
    })

    it('应该处理网络错误', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('Network error'))

      await expect(requestClient.getMessages()).rejects.toThrow('网络请求失败')
    })

    it('应该处理HTTP错误状态', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' })
      })

      await expect(requestClient.getMessages()).rejects.toThrow('请求失败: 500 Internal Server Error')
    })

    it('应该处理超时', async () => {
      ;(global.fetch as any).mockImplementationOnce(() => 
        new Promise((resolve) => setTimeout(resolve, 20000))
      )

      await expect(requestClient.getMessages()).rejects.toThrow('请求超时')
    })
  })

  describe('sendMessage', () => {
    it('应该成功发送消息', async () => {
      const mockResponse = {
        success: true,
        data: {
          id: 1,
          content: 'Hello world',
          sender: 'user',
          timestamp: '2024-01-01T10:00:00Z',
          status: 'sent',
          type: 'text'
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.sendMessage({ content: 'Hello world' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ content: 'Hello world' })
        })
      )

      expect(result).toEqual(mockResponse)
    })

    it('应该处理发送失败', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Failed to send message' })
      })

      await expect(requestClient.sendMessage({ content: 'Hello' })).rejects.toThrow()
    })
  })

  describe('updateMessageStatus', () => {
    it('应该成功更新消息状态', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, status: 'delivered' }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.updateMessageStatus(1, 'delivered')

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages/1/status',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          }),
          body: JSON.stringify({ status: 'delivered' })
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteMessage', () => {
    it('应该成功删除消息', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, deleted: true }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.deleteMessage(1)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages/1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('recallMessage', () => {
    it('应该成功撤回消息', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, recalled: true }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.recallMessage(1)

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages/1/recall',
        expect.objectContaining({
          method: 'POST'
        })
      )

      expect(result).toEqual(mockResponse)
    })
  })

  describe('searchMessages', () => {
    it('应该成功搜索消息', async () => {
      const mockResponse = {
        success: true,
        data: {
          messages: [
            {
              id: 1,
              content: 'Hello world',
              sender: 'user',
              timestamp: '2024-01-01T10:00:00Z',
              status: 'sent',
              type: 'text'
            }
          ],
          hasMore: false,
          total: 1
        }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      const result = await requestClient.searchMessages({ q: 'hello', sender: 'user' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages/search?q=hello&sender=user',
        expect.any(Object)
      )

      expect(result).toEqual(mockResponse)
    })

    it('应该只传递非空参数', async () => {
      const mockResponse = {
        success: true,
        data: { messages: [], hasMore: false, total: 0 }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await requestClient.searchMessages({ q: 'hello' })

      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/messages/search?q=hello',
        expect.any(Object)
      )
    })
  })

  describe('error handling', () => {
    it('应该处理JSON解析错误', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON')
        }
      })

      await expect(requestClient.getMessages()).rejects.toThrow('数据解析失败')
    })

    it('应该处理AbortController超时', async () => {
      // 创建一个永远不会解决的fetch
      const neverResolve = new Promise(() => {})
      ;(global.fetch as any).mockReturnValueOnce(neverResolve)

      // 使用较短的测试超时
      const testClient = new (requestClient.constructor as any)('http://localhost:3001/api', 100)
      
      await expect(testClient.getMessages()).rejects.toThrow('请求超时')
    })
  })
})