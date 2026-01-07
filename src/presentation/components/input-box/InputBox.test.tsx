import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InputBox } from './InputBox'

describe('InputBox', () => {
  const mockOnSendMessage = vi.fn()

  beforeEach(() => {
    mockOnSendMessage.mockClear()
  })

  it('应该渲染输入框', () => {
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    expect(textarea).toBeInTheDocument()
    expect(textarea).toHaveAttribute('rows', '1')
  })

  it('应该显示字符计数', () => {
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    const charCount = screen.getByText('0/2000')
    
    expect(charCount).toBeInTheDocument()
    
    fireEvent.change(textarea, { target: { value: 'Hello' } })
    expect(screen.getByText('5/2000')).toBeInTheDocument()
  })

  

  it('应该通过点击发送按钮发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.clear(textarea)
    await user.type(textarea, 'Hello world')
    await user.click(sendButton)
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world')
    expect(textarea).toHaveValue('')
  })

  it('应该通过回车键发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    
    await user.type(textarea, 'Hello world{enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello world')
    expect(textarea).toHaveValue('')
  })

  it('应该在输入法组合期间不发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    
    // 模拟输入法组合
    fireEvent.compositionStart(textarea)
    await user.type(textarea, 'Hello{enter}')
    fireEvent.compositionEnd(textarea)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('应该在输入法组合结束后发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    
    await user.clear(textarea)
    await user.type(textarea, 'Hello')
    fireEvent.compositionStart(textarea)
    fireEvent.compositionEnd(textarea)
    await user.keyboard('{enter}')
    
    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello')
  })

  it('应该在禁用状态下不允许发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} disabled />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    expect(textarea).toBeDisabled()
    expect(sendButton).toBeDisabled()
    
    // 尝试发送消息
    await user.click(sendButton)
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('应该在输入为空时不发送消息', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const sendButton = screen.getByRole('button', { name: /send/i })
    
    await user.click(sendButton)
    
    expect(mockOnSendMessage).not.toHaveBeenCalled()
  })

  it('应该自动调整textarea高度', async () => {
    const user = userEvent.setup()
    render(<InputBox onSendMessage={mockOnSendMessage} />)
    
    const textarea = screen.getByPlaceholderText('Type a message...')
    
    await user.type(textarea, 'Hello\nworld\nhow are you?')
    
    expect(textarea).toHaveStyle({ minHeight: '48px', maxHeight: '120px' })
  })

  it('应该支持自定义placeholder', () => {
    render(
      <InputBox 
        onSendMessage={mockOnSendMessage} 
        placeholder="Enter your message..." 
      />
    )
    
    expect(screen.getByPlaceholderText('Enter your message...')).toBeInTheDocument()
  })

  
})