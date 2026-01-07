import { describe, it, expect } from 'vitest'
import { Message } from './message'

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
      
      message.updateStatus('failed')
      
      expect(message.status).toBe('failed')
      expect(message.id).toBe(1) // 其他属性保持不变
      expect(message.content).toBe('Hello world')
      expect(message.updatedAt).toBeDefined()
    })

    it('应该更新状态为recalled', () => {
      const message = Message.create(validMessageData)
      
      message.updateStatus('recalled')
      
      expect(message.status).toBe('recalled')
      expect(message.updatedAt).toBeDefined()
    })
  })

  describe('isFromUser', () => {
    it('应该识别用户消息', () => {
      const message = Message.create(validMessageData)
      expect(message.isFromUser()).toBe(true)
    })

    it('应该识别非用户消息', () => {
      const message = Message.create({
        ...validMessageData,
        sender: 'bot'
      })
      expect(message.isFromUser()).toBe(false)
    })
  })

  describe('isFromBot', () => {
    it('应该识别机器人消息', () => {
      const message = Message.create({
        ...validMessageData,
        sender: 'bot'
      })
      expect(message.isFromBot()).toBe(true)
    })

    it('应该识别非机器人消息', () => {
      const message = Message.create(validMessageData)
      expect(message.isFromBot()).toBe(false)
    })
  })

  describe('状态检查方法', () => {
    it('应该正确检查sending状态', () => {
      const message = Message.create({
        ...validMessageData,
        status: 'sending'
      })
      expect(message.isSending()).toBe(true)
      expect(message.isSent()).toBe(false)
      expect(message.isFailed()).toBe(false)
      expect(message.isRecalled()).toBe(false)
    })

    it('应该正确检查sent状态', () => {
      const message = Message.create({
        ...validMessageData,
        status: 'sent'
      })
      expect(message.isSending()).toBe(false)
      expect(message.isSent()).toBe(true)
      expect(message.isFailed()).toBe(false)
      expect(message.isRecalled()).toBe(false)
    })

    it('应该正确检查failed状态', () => {
      const message = Message.create({
        ...validMessageData,
        status: 'failed'
      })
      expect(message.isSending()).toBe(false)
      expect(message.isSent()).toBe(false)
      expect(message.isFailed()).toBe(true)
      expect(message.isRecalled()).toBe(false)
    })

    it('应该正确检查recalled状态', () => {
      const message = Message.create({
        ...validMessageData,
        status: 'recalled'
      })
      expect(message.isSending()).toBe(false)
      expect(message.isSent()).toBe(false)
      expect(message.isFailed()).toBe(false)
      expect(message.isRecalled()).toBe(true)
    })
  })

  describe('权限检查方法', () => {
    it('应该正确检查重试权限', () => {
      const failedUserMessage = Message.create({
        ...validMessageData,
        sender: 'user',
        status: 'failed'
      })
      expect(failedUserMessage.canRetry()).toBe(true)

      const sentUserMessage = Message.create({
        ...validMessageData,
        sender: 'user',
        status: 'sent'
      })
      expect(sentUserMessage.canRetry()).toBe(false)

      const failedBotMessage = Message.create({
        ...validMessageData,
        sender: 'bot',
        status: 'failed'
      })
      expect(failedBotMessage.canRetry()).toBe(false)
    })

    it('应该正确检查删除权限', () => {
      const userMessage = Message.create(validMessageData)
      expect(userMessage.canDelete()).toBe(true)

      const botMessage = Message.create({
        ...validMessageData,
        sender: 'bot'
      })
      expect(botMessage.canDelete()).toBe(false)
    })

    it('应该正确检查撤回权限', () => {
      const sentUserMessage = Message.create({
        ...validMessageData,
        sender: 'user',
        status: 'sent'
      })
      expect(sentUserMessage.canRecall()).toBe(true)

      const failedUserMessage = Message.create({
        ...validMessageData,
        sender: 'user',
        status: 'failed'
      })
      expect(failedUserMessage.canRecall()).toBe(false)

      const sentBotMessage = Message.create({
        ...validMessageData,
        sender: 'bot',
        status: 'sent'
      })
      expect(sentBotMessage.canRecall()).toBe(false)
    })
  })

  describe('isRecent', () => {
    it('应该识别最近的消息', () => {
      const recentMessage = Message.create({
        ...validMessageData,
        timestamp: new Date()
      })
      expect(recentMessage.isRecent()).toBe(true)
    })

    it('应该识别非最近的消息', () => {
      const oldMessage = Message.create({
        ...validMessageData,
        timestamp: new Date(Date.now() - 3 * 60 * 1000) // 3分钟前
      })
      expect(oldMessage.isRecent()).toBe(false)
    })
  })

  describe('getFormattedTime', () => {
    it('应该格式化时间', () => {
      const message = Message.create({
        ...validMessageData,
        timestamp: new Date('2024-01-01T14:30:45Z')
      })
      expect(message.getFormattedTime()).toMatch(/^\d{2}:\d{2}$/)
    })
  })

  describe('getFormattedDate', () => {
    it('应该返回Today对于今天的消息', () => {
      const todayMessage = Message.create({
        ...validMessageData,
        timestamp: new Date()
      })
      expect(todayMessage.getFormattedDate()).toBe('Today')
    })

    it('应该返回Yesterday对于昨天的消息', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const yesterdayMessage = Message.create({
        ...validMessageData,
        timestamp: yesterday
      })
      expect(yesterdayMessage.getFormattedDate()).toBe('Yesterday')
    })

    it('应该返回具体日期对于更早的消息', () => {
      const oldMessage = Message.create({
        ...validMessageData,
        timestamp: new Date('2024-01-01T10:00:00Z')
      })
      expect(oldMessage.getFormattedDate()).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/)
    })
  })

  describe('isSameDay', () => {
    it('应该识别同一天的消息', () => {
      const date = new Date('2024-01-01T10:00:00Z')
      const message = Message.create({
        ...validMessageData,
        timestamp: date
      })
      
      expect(message.isSameDay(date)).toBe(true)
    })

    it('应该识别不同天的消息', () => {
      const date = new Date('2024-01-01T10:00:00Z')
      const otherDate = new Date('2024-01-02T10:00:00Z')
      const message = Message.create({
        ...validMessageData,
        timestamp: date
      })
      
      expect(message.isSameDay(otherDate)).toBe(false)
    })
  })
})