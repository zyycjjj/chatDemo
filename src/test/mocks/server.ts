import { setupServer } from 'msw/node'
import { rest } from 'msw'
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
  rest.get('http://localhost:3001/api/messages', (req: { url: { searchParams: { get: (arg0: string) => any } } }, res: (arg0: any) => any, ctx: { json: (arg0: { success: boolean; data: { messages: { id: number; content: string; sender: string; timestamp: string; status: string; type: string }[]; hasMore: boolean; total: number } }) => any }) => {
    const page = Number(req.url.searchParams.get('page')) || 1
    const limit = Number(req.url.searchParams.get('limit')) || 20
    const before = req.url.searchParams.get('before')
    
    let filteredMessages = messages
    
    if (before) {
      filteredMessages = messages.filter(msg => 
        new Date(msg.timestamp) < new Date(before)
      )
    }
    
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex)
    
    return res(
      ctx.json({
        success: true,
        data: {
          messages: paginatedMessages,
          hasMore: endIndex < filteredMessages.length,
          total: filteredMessages.length
        }
      })
    )
  }),

  // 发送消息
  rest.post('http://localhost:3001/api/messages', (req: { body: { content: any } }, res: (arg0: any, arg1: any) => any, ctx: { delay: (arg0: number) => any; json: (arg0: { success: boolean; data: { id: number; content: any; sender: string; timestamp: string; status: string; type: string } }) => any }) => {
    return res(
      ctx.delay(500), // 模拟网络延迟
      ctx.json({
        success: true,
        data: {
          id: messages.length + 1,
          content: req.body.content,
          sender: 'user',
          timestamp: new Date().toISOString(),
          status: 'sent',
          type: 'text'
        }
      })
    )
  }),

  // 搜索消息
  rest.get('http://localhost:3001/api/messages/search', (req: { url: { searchParams: { get: (arg0: string) => string } } }, res: (arg0: any) => any, ctx: { json: (arg0: { success: boolean; data: { messages: { id: number; content: string; sender: string; timestamp: string; status: string; type: string }[]; hasMore: boolean; total: number } }) => any }) => {
    const q = req.url.searchParams.get('q') || ''
    const sender = req.url.searchParams.get('sender') || 'all'
    
    let filteredMessages = messages
    
    if (q) {
      filteredMessages = filteredMessages.filter(msg => 
        msg.content.toLowerCase().includes(q.toLowerCase())
      )
    }
    
    if (sender !== 'all') {
      filteredMessages = filteredMessages.filter(msg => msg.sender === sender)
    }
    
    return res(
      ctx.json({
        success: true,
        data: {
          messages: filteredMessages,
          hasMore: false,
          total: filteredMessages.length
        }
      })
    )
  }),

  // 删除消息
  rest.delete('http://localhost:3001/api/messages/:id', (req: { params: { id: any } }, res: (arg0: any) => any, ctx: { json: (arg0: { success: boolean; data: { id: number; deleted: boolean } }) => any }) => {
    const { id } = req.params
    
    return res(
      ctx.json({
        success: true,
        data: {
          id: Number(id),
          deleted: true
        }
      })
    )
  }),

  // 撤回消息
  rest.post('http://localhost:3001/api/messages/:id/recall', (req: { params: { id: any } }, res: (arg0: any) => any, ctx: { json: (arg0: { success: boolean; data: { id: number; recalled: boolean } }) => any }) => {
    const { id } = req.params
    
    return res(
      ctx.json({
        success: true,
        data: {
          id: Number(id),
          recalled: true
        }
      })
    )
  }),
]

export const server = setupServer(...handlers)