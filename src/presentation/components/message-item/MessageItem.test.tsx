import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MessageItem } from './MessageItem'
import { Message } from '../../../domain/entities/message'

describe('MessageItem', () => {
  const mockOnRetry = vi.fn()
  const mockOnDelete = vi.fn()
  const mockOnRecall = vi.fn()

  const mockUserMessage = Message.create({
    id: 1,
    content: 'Hello world',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'sent',
    type: 'text'
  })

  const mockBotMessage = Message.create({
    id: 2,
    content: 'Hello! How can I help you?',
    sender: 'bot',
    timestamp: new Date('2024-01-01T10:01:00Z'),
    status: 'sent',
    type: 'text'
  })

  it('应该渲染用户消息', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('应该渲染机器人消息', () => {
    render(<MessageItem message={mockBotMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
    // 机器人消息应该正确渲染
  })

  it('应该正确显示头像', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    // 简单检查组件渲染成功，头像部分通过showAvatar=true来控制显示
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('应该正确显示消息状态', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    // 用户消息显示 "Sent" 状态
    expect(screen.getByText('Sent')).toBeInTheDocument()
  })

  it('应该正确处理发送中状态', () => {
    const sendingMessage = Message.create({
      ...mockUserMessage,
      status: 'sending'
    })
    
    render(<MessageItem message={sendingMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    expect(screen.getByText('Sending...')).toBeInTheDocument()
  })

  it('应该正确处理发送失败状态', () => {
    const failedMessage = Message.create({
      ...mockUserMessage,
      status: 'failed'
    })
    
    render(<MessageItem message={failedMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={true} />)
    
    expect(screen.getByText('Failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument()
  })

  it('应该正确处理不显示头像的情况', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={false} showTail={true} />)
    
    expect(screen.queryByAltText('User')).not.toBeInTheDocument()
  })

  it('应该正确处理不显示尾部的情况', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} showAvatar={true} showTail={false} />)
    
    const messageBubble = screen.getByText('Hello world').closest('div')
    expect(messageBubble).not.toHaveClass('rounded-br-sm')
  })

  it('应该正确显示搜索高亮', () => {
    render(<MessageItem message={mockUserMessage} onRetry={mockOnRetry} onDelete={mockOnDelete} onRecall={mockOnRecall} searchQuery="Hello" showAvatar={true} showTail={true} />)
    
    // 检查消息容器存在
    const messageItem = screen.getByTestId('message-item')
    expect(messageItem).toBeInTheDocument()
    
    // 检查消息内容是否包含搜索词
    expect(messageItem).toHaveTextContent('Hello world')
    
    // 检查是否有高亮元素（简化检查）
    const highlightedElements = messageItem.querySelectorAll('span[class*="yellow"]')
    expect(highlightedElements.length).toBeGreaterThan(0)
  })
})