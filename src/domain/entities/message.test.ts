import { describe, it, expect } from 'vitest'
import { Message } from '@/domain/entities/message'

describe('Message Entity', () => {
  const validMessageData = {
    id: 1,
    content: 'Hello world',
    sender: 'user' as const,
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'sent' as const,
    type: 'text' as const
  }

  describe('create', () => {
    it('应该创建有效的消息实体', () => {
      const message = Message.create(validMessageData)
      
      expect(message.id).toBe(1)
      expect(message.content).toBe('Hello world')
      expect(message.sender).toBe('user')
      expect(message.timestamp).toEqual(new Date('2024-01-01T10:00:00Z'))
      expect(message.status).toBe('sent')
      expect(message.type).toBe('text')
    })

    it('应该处理可选的updatedAt字段', () => {
      const messageData = {
        ...validMessageData,
        updatedAt: new Date('2024-01-01T10:05:00Z')
      }
      
      const message = Message.create(messageData)
      expect(message.updatedAt).toEqual(new Date('2024-01-01T10:05:00Z'))
    })

    it('应该处理缺少updatedAt字段的情况', () => {
      const message = Message.create(validMessageData)
      expect(message.updatedAt).toBeUndefined()
    })
  })

  describe('updateStatus', () => {
    it('应该更新消息状态', () => {
      const message = Message.create(validMessageData)
      
      const updatedMessage = message.updateStatus('delivered')
      
      expect(updatedMessage.status).toBe('delivered')
      expect(updatedMessage.id).toBe(1) // 其他属性保持不变
      expect(updatedMessage.content).toBe('Hello world')
    })

    it('应该更新状态为failed', () => {
      const message = Message.create(validMessageData)
      
      const updatedMessage = message.updateStatus('failed')
      
      expect(updatedMessage.status).toBe('failed')
    })
  })

  describe('updateContent', () => {
    it('应该更新消息内容', () => {
      const message = Message.create(validMessageData)
      
      const updatedMessage = message.updateContent('Updated content')
      
      expect(updatedMessage.content).toBe('Updated content')
      expect(updatedMessage.id).toBe(1) // 其他属性保持不变
      expect(updatedMessage.status).toBe('sent')
    })

    it('应该设置updatedAt为当前时间', () => {
      const message = Message.create(validMessageData)
      const beforeUpdate = new Date()
      
      const updatedMessage = message.updateContent('Updated content')
      
      expect(updatedMessage.updatedAt).toBeDefined()
      expect(updatedMessage.updatedAt!.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime())
    })
  })

  describe('toJSON', () => {
    it('应该序列化为JSON对象', () => {
      const message = Message.create(validMessageData)
      
      const json = message.toJSON()
      
      expect(json).toEqual({
        id: 1,
        content: 'Hello world',
        sender: 'user',
        timestamp: '2024-01-01T10:00:00.000Z',
        status: 'sent',
        type: 'text',
        updatedAt: undefined
      })
    })

    it('应该包含updatedAt字段', () => {
      const messageData = {
        ...validMessageData,
        updatedAt: new Date('2024-01-01T10:05:00Z')
      }
      
      const message = Message.create(messageData)
      const json = message.toJSON()
      
      expect(json.updatedAt).toBe('2024-01-01T10:05:00.000Z')
    })
  })

  describe('fromJSON', () => {
    it('应该从JSON对象创建消息', () => {
      const json = {
        id: 1,
        content: 'Hello world',
        sender: 'user',
        timestamp: '2024-01-01T10:00:00.000Z',
        status: 'sent',
        type: 'text'
      }
      
      const message = Message.fromJSON(json)
      
      expect(message.id).toBe(1)
      expect(message.content).toBe('Hello world')
      expect(message.sender).toBe('user')
      expect(message.timestamp).toEqual(new Date('2024-01-01T10:00:00.000Z'))
      expect(message.status).toBe('sent')
      expect(message.type).toBe('text')
    })

    it('应该处理updatedAt字段', () => {
      const json = {
        id: 1,
        content: 'Hello world',
        sender: 'user',
        timestamp: '2024-01-01T10:00:00.000Z',
        status: 'sent',
        type: 'text',
        updatedAt: '2024-01-01T10:05:00.000Z'
      }
      
      const message = Message.fromJSON(json)
      
      expect(message.updatedAt).toEqual(new Date('2024-01-01T10:05:00.000Z'))
    })
  })

  describe('equals', () => {
    it('应该识别相同的消息', () => {
      const message1 = Message.create(validMessageData)
      const message2 = Message.create(validMessageData)
      
      expect(message1.equals(message2)).toBe(true)
    })

    it('应该识别不同的消息', () => {
      const message1 = Message.create(validMessageData)
      const message2 = Message.create({
        ...validMessageData,
        id: 2
      })
      
      expect(message1.equals(message2)).toBe(false)
    })
  })

  describe('validation', () => {
    it('应该创建有效的消息实体', () => {
      const message = Message.create(validMessageData)
      expect(message.id).toBe(1)
      expect(message.content).toBe('Hello world')
      expect(message.sender).toBe('user')
      expect(message.status).toBe('sent')
      expect(message.type).toBe('text')
    })

    it('应该拒绝空内容的消息', () => {
      expect(() => {
        Message.create({
          ...validMessageData,
          content: ''
        })
      }).toThrow()
    })

    it('应该拒绝无效的发送者', () => {
      expect(() => {
        Message.create({
          ...validMessageData,
          sender: 'invalid' as any
        })
      }).toThrow()
    })
  })
})