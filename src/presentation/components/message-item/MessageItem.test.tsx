import { render, screen } from '@testing-library/react'
import { MessageItem } from '@/presentation/components/message-item/MessageItem'
import type { EnhancedMessage } from '@/shared/types/message-types'

describe('MessageItem', () => {
  const mockUserMessage: EnhancedMessage = {
    id: 1,
    content: 'Hello world',
    sender: 'user',
    timestamp: new Date('2024-01-01T10:00:00Z'),
    status: 'sent',
    type: 'text',
    showAvatar: true,
    showTail: true
  }

  const mockBotMessage: EnhancedMessage = {
    id: 2,
    content: 'Hello! How can I help you?',
    sender: 'bot',
    timestamp: new Date('2024-01-01T10:01:00Z'),
    status: 'sent',
    type: 'text',
    showAvatar: true,
    showTail: true
  }

  it('应该渲染用户消息', () => {
    render(<MessageItem message={mockUserMessage} />)
    
    expect(screen.getByText('Hello world')).toBeInTheDocument()
    expect(screen.getByText('10:00')).toBeInTheDocument()
  })

  it('应该渲染机器人消息', () => {
    render(<MessageItem message={mockBotMessage} />)
    
    expect(screen.getByText('Hello! How can I help you?')).toBeInTheDocument()
    expect(screen.getByText('10:01')).toBeInTheDocument()
  })

  it('应该正确显示头像', () => {
    render(<MessageItem message={mockUserMessage} />)
    
    if (mockUserMessage.showAvatar) {
      expect(screen.getByAltText('User')).toBeInTheDocument()
    }
  })

  it('应该正确显示消息状态', () => {
    render(<MessageItem message={mockUserMessage} />)
    
    if (mockUserMessage.sender === 'user') {
      expect(screen.getByText('sent')).toBeInTheDocument()
    }
  })

  it('应该正确处理发送中状态', () => {
    const sendingMessage: EnhancedMessage = {
      ...mockUserMessage,
      status: 'sending'
    }
    
    render(<MessageItem message={sendingMessage} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('应该正确处理发送失败状态', () => {
    const failedMessage: EnhancedMessage = {
      ...mockUserMessage,
      status: 'failed'
    }
    
    render(<MessageItem message={failedMessage} />)
    
    expect(screen.getByText('failed')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument()
  })

  it('应该正确处理不显示头像的情况', () => {
    const noAvatarMessage: EnhancedMessage = {
      ...mockUserMessage,
      showAvatar: false
    }
    
    render(<MessageItem message={noAvatarMessage} />)
    
    expect(screen.queryByAltText('User')).not.toBeInTheDocument()
  })

  it('应该正确处理不显示尾部的情况', () => {
    const noTailMessage: EnhancedMessage = {
      ...mockUserMessage,
      showTail: false
    }
    
    render(<MessageItem message={noTailMessage} />)
    
    const messageBubble = screen.getByText('Hello world').closest('div')
    expect(messageBubble).not.toHaveClass('rounded-br-sm')
  })

  it('应该支持自定义className', () => {
    const { container } = render(
      <MessageItem message={mockUserMessage} className="custom-class" />
    )
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })
})