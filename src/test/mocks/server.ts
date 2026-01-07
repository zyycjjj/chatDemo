import { setupServer } from 'msw/node'
import { http } from 'msw'
import { faker } from '@faker-js/faker'

// 生成模拟数据
function generateMockMessage(id: number, isUser = true, daysAgo = 0) {
  return {
    id,
    content: isUser ? faker.lorem.sentences(1) : faker.lorem.sentences(1),
    sender: isUser ? 'user' : 'bot',
    timestamp: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
    status: 'sent',
    type: 'text'
  }
}

const messages = Array.from({ length: 50 }, (_, i) => 
  generateMockMessage(i + 1, Math.random() > 0.4, Math.floor(i / 5))
)

export const handlers = [
  // 获取消息列表
  http.get('http://localhost:3001/api/messages', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page')) || 1
    const limit = Number(url.searchParams.get('limit')) || 20
    const before = url.searchParams.get('before')
    
    let filteredMessages = messages
    
    if (before) {
      filteredMessages = messages.filter(msg => 
        new Date(msg.timestamp) < new Date(before)
      )
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex)
    
    return Response.json({
      success: true,
      data: {
        messages: paginatedMessages,
        hasMore: endIndex < filteredMessages.length,
        total: filteredMessages.length
      }
    })
  }),

  // 发送消息
  http.post('http://localhost:3001/api/messages', async ({ request }) => {
    const body = await request.json() as { content: string }
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return Response.json({
      success: true,
      data: {
        id: messages.length + 1,
        content: body.content,
        sender: 'user',
        timestamp: new Date().toISOString(),
        status: 'sent',
        type: 'text'
      }
    })
  }),

  // 搜索消息
  http.get('http://localhost:3001/api/messages/search', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    const sender = url.searchParams.get('sender') || 'all'
    
    let filteredMessages = messages
    
    if (q) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.content.toLowerCase().includes(q.toLowerCase())
      )
    }
    
    if (sender !== 'all') {
      filteredMessages = filteredMessages.filter(msg => msg.sender === sender)
    }
    
    return Response.json({
      success: true,
      data: {
        messages: filteredMessages,
        hasMore: false,
        total: filteredMessages.length
      }
    })
  }),

  // 删除消息
  http.delete('http://localhost:3001/api/messages/:id', ({ params }) => {
    const { id } = params
    
    return Response.json({
      success: true,
      data: {
        id: Number(id),
        deleted: true
      }
    })
  }),

  // 撤回消息
  http.post('http://localhost:3001/api/messages/:id/recall', ({ params }) => {
    const { id } = params
    
    return Response.json({
      success: true,
      data: {
        id: Number(id),
        recalled: true
      }
    })
  }),
]

export const server = setupServer(...handlers)