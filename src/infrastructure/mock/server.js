import express from 'express';
import cors from 'cors';
import pkg from 'lodash';
const { random } = pkg;

function randomInt(min, max) {
  return Math.floor(random() * (max - min + 1)) + min;
}
import { faker } from '@faker-js/faker';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

let messageIdCounter = 1000;
const messages = [];

function generateMockMessage(id, isUser = true) {
  const timestamp = new Date(Date.now() - randomInt(0, 7 * 24 * 60 * 60 * 1000));
  
  return {
    id,
    content: isUser ? faker.lorem.sentences(randomInt(1, 3)) : faker.lorem.sentences(randomInt(1, 2)),
    sender: isUser ? 'user' : 'bot',
    timestamp: timestamp.toISOString(),
    status: 'sent',
    type: 'text'
  };
}

for (let i = 0; i < 200; i++) {
  messages.push(generateMockMessage(messageIdCounter++, i % 3 !== 0));
}

messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

app.get('/api/messages', (req, res) => {
  const { page = 1, limit = 20, before } = req.query;
  
  let filteredMessages = messages;
  
  if (before) {
    filteredMessages = messages.filter(msg => 
      new Date(msg.timestamp) < new Date(before)
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedMessages = filteredMessages.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: {
      messages: paginatedMessages,
      hasMore: endIndex < filteredMessages.length,
      total: filteredMessages.length
    }
  });
});

app.post('/api/messages', async (req, res) => {
  const { content, type = 'text' } = req.body;
  
  const delay = randomInt(500, 2000);
  const shouldFail = randomInt(1, 100) <= 5; // 5% failure rate
  
  await new Promise(resolve => setTimeout(resolve, delay));
  
  if (shouldFail) {
    return res.status(500).json({
      success: false,
      error: 'Network error occurred'
    });
  }
  
  const newMessage = {
    id: messageIdCounter++,
    content,
    sender: 'user',
    timestamp: new Date().toISOString(),
    status: 'sent',
    type
  };
  
  messages.push(newMessage);
  
  setTimeout(() => {
    const botReply = {
      id: messageIdCounter++,
      content: faker.lorem.sentences(randomInt(1, 2)),
      sender: 'bot',
      timestamp: new Date().toISOString(),
      status: 'sent',
      type: 'text'
    };
    messages.push(botReply);
  }, randomInt(1000, 3000));
  
  res.json({
    success: true,
    data: newMessage
  });
});

app.put('/api/messages/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const message = messages.find(msg => msg.id === parseInt(id));
  if (!message) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }
  
  message.status = status;
  message.updatedAt = new Date().toISOString();
  
  res.json({
    success: true,
    data: message
  });
});

app.delete('/api/messages/:id', (req, res) => {
  const { id } = req.params;
  const index = messages.findIndex(msg => msg.id === parseInt(id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }
  
  const deletedMessage = messages[index];
  messages.splice(index, 1);
  
  res.json({
    success: true,
    data: deletedMessage
  });
});

app.post('/api/messages/:id/recall', (req, res) => {
  const { id } = req.params;
  console.log('=== RECALL DEBUG ===');
  console.log('Request ID:', id, 'Type:', typeof id);
  console.log('Parsed ID:', parseInt(id), 'Type:', typeof parseInt(id));
  console.log('Available message IDs:', messages.map(m => ({ id: m.id, type: typeof m.id })));
  const index = messages.findIndex(msg => msg.id === parseInt(id));
  console.log('Found index:', index);
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      error: 'Message not found'
    });
  }
  
  // Mark message as recalled instead of deleting it
  const recalledMessage = messages[index];
  recalledMessage.content = 'This message has been recalled';
  recalledMessage.status = 'recalled';
  recalledMessage.recalled = true;
  
  res.json({
    success: true,
    data: recalledMessage
  });
});

app.get('/api/messages/search', (req, res) => {
  const { q, sender } = req.query;
  
  let filteredMessages = messages;
  
  if (q) {
    filteredMessages = filteredMessages.filter(msg =>
      msg.content.toLowerCase().includes(q.toLowerCase())
    );
  }
  
  if (sender) {
    filteredMessages = filteredMessages.filter(msg => msg.sender === sender);
  }
  
  res.json({
    success: true,
    data: {
      messages: filteredMessages,
      total: filteredMessages.length
    }
  });
});

app.listen(port, () => {
  console.log(`Mock server running at http://localhost:${port}`);
});