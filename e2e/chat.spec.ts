import { test, expect } from '@playwright/test'

test.describe('聊天应用 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174')
    await page.waitForLoadState('networkidle')
  })

  test('页面加载和基本元素显示', async ({ page }) => {
    // 验证页面标题
    await expect(page).toHaveTitle(/Chat Demo/)
    
    // 验证主要元素存在
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible()
    await expect(page.locator('[data-testid="message-list"]')).toBeVisible()
    await expect(page.locator('[data-testid="input-box"]')).toBeVisible()
    await expect(page.locator('[data-testid="search-filter"]')).toBeVisible()
  })

  test('发送和接收消息', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 输入消息
    const textarea = page.locator('[data-testid="message-input"]')
    await textarea.fill('Hello from E2E test!')
    
    // 发送消息
    const sendButton = page.locator('[data-testid="send-button"]')
    await sendButton.click()
    
    // 验证消息出现在列表中
    await expect(page.locator('text=Hello from E2E test!')).toBeVisible({ timeout: 5000 })
    
    // 验证字符计数重置
    await expect(page.locator('[data-testid="char-count"]')).toHaveText('0/2000')
  })

  test('键盘快捷键发送消息', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 输入消息
    const textarea = page.locator('[data-testid="message-input"]')
    await textarea.fill('Ctrl+Enter shortcut test')
    
    // 使用 Ctrl+Enter 发送
    await page.keyboard.press('Control+Enter')
    
    // 验证消息发送成功
    await expect(page.locator('text=Ctrl+Enter shortcut test')).toBeVisible({ timeout: 5000 })
  })

  test('搜索功能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 输入搜索关键词
    const searchInput = page.locator('[data-testid="search-input"]')
    await searchInput.fill('test')
    
    // 等待搜索结果
    await page.waitForTimeout(500) // 等待防抖
    
    // 验证搜索结果
    const searchResults = page.locator('[data-testid="message-item"]:has-text("test")')
    await expect(searchResults.first()).toBeVisible()
    
    // 清除搜索
    const clearButton = page.locator('[data-testid="clear-search"]')
    await clearButton.click()
    
    // 验证搜索框被清空
    await expect(searchInput).toHaveValue('')
  })

  test('发送者过滤', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 选择用户消息过滤器
    const filterSelect = page.locator('[data-testid="sender-filter"]')
    await filterSelect.selectOption('user')
    
    // 等待过滤结果
    await page.waitForTimeout(500)
    
    // 验证只显示用户消息
    const userMessages = page.locator('[data-testid="message-item"][data-sender="user"]')
    const botMessages = page.locator('[data-testid="message-item"][data-sender="bot"]')
    
    await expect(userMessages.first()).toBeVisible()
    await expect(botMessages).toHaveCount(0)
    
    // 重置过滤器
    await filterSelect.selectOption('all')
  })

  test('消息删除功能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 找到第一个用户消息
    const firstUserMessage = page.locator('[data-testid="message-item"][data-sender="user"]').first()
    await firstUserMessage.hover()
    
    // 点击删除按钮
    const deleteButton = firstUserMessage.locator('[data-testid="delete-button"]')
    await deleteButton.click()
    
    // 确认删除
    const confirmButton = page.locator('[data-testid="confirm-delete"]')
    await confirmButton.click()
    
    // 验证删除成功提示
    await expect(page.locator('text=消息已删除')).toBeVisible({ timeout: 3000 })
  })

  test('消息撤回功能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 找到第一个用户消息
    const firstUserMessage = page.locator('[data-testid="message-item"][data-sender="user"]').first()
    await firstUserMessage.hover()
    
    // 点击撤回按钮
    const recallButton = firstUserMessage.locator('[data-testid="recall-button"]')
    await recallButton.click()
    
    // 验证撤回成功提示
    await expect(page.locator('text=消息已撤回')).toBeVisible({ timeout: 3000 })
  })

  test('分页加载历史消息', async ({ page }) => {
    // 等待初始消息加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 记录当前消息数量
    const initialCount = await page.locator('[data-testid="message-item"]').count()
    
    // 滚动到列表顶部
    const messageList = page.locator('[data-testid="message-list"]')
    await messageList.evaluate((el) => el.scrollTop = 0)
    
    // 等待加载更多消息
    await page.waitForTimeout(2000)
    
    // 验证消息数量增加
    const newCount = await page.locator('[data-testid="message-item"]').count()
    expect(newCount).toBeGreaterThan(initialCount)
  })

  test('草稿自动保存', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 输入草稿但不发送
    const textarea = page.locator('[data-testid="message-input"]')
    await textarea.fill('Draft message content')
    
    // 刷新页面
    await page.reload()
    await page.waitForLoadState('networkidle')
    
    // 验证草稿被恢复
    await expect(textarea).toHaveValue('Draft message content')
  })

  test('网络状态处理', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 模拟网络断开
    await page.context().setOffline(true)
    
    // 输入消息并尝试发送
    const textarea = page.locator('[data-testid="message-input"]')
    await textarea.fill('Offline message')
    
    const sendButton = page.locator('[data-testid="send-button"]')
    await sendButton.click()
    
    // 验证离线状态提示
    await expect(page.locator('text=网络已断开')).toBeVisible({ timeout: 3000 })
    
    // 验证消息进入离线队列
    await expect(page.locator('[data-testid="offline-indicator"]')).toBeVisible()
    
    // 恢复网络
    await page.context().setOffline(false)
    
    // 验证网络恢复提示
    await expect(page.locator('text=网络已恢复')).toBeVisible({ timeout: 5000 })
    
    // 验证离线消息被发送
    await expect(page.locator('text=Offline message')).toBeVisible({ timeout: 5000 })
  })

  test('响应式设计测试', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1200, height: 800 })
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible()
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible()
    
    // 测试手机视图
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('[data-testid="chat-page"]')).toBeVisible()
    
    // 验证手机端导航菜单
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible()
  })

  test('日期粘性标题', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 查找日期分隔符
    const dateSeparators = page.locator('[data-testid="date-separator"]')
    await expect(dateSeparators.first()).toBeVisible()
    
    // 滚动消息列表
    const messageList = page.locator('[data-testid="message-list"]')
    await messageList.evaluate((el) => el.scrollTop = 100)
    
    // 验证粘性标题存在
    await expect(page.locator('[data-testid="sticky-date"]')).toBeVisible()
  })

  test('消息状态显示', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 查找用户消息的状态指示器
    const userMessages = page.locator('[data-testid="message-item"][data-sender="user"]')
    const firstMessage = userMessages.first()
    
    await expect(firstMessage.locator('[data-testid="message-status"]')).toBeVisible()
  })

  test('输入框自动调整高度', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const textarea = page.locator('[data-testid="message-input"]')
    const initialHeight = await textarea.evaluate((el) => el.clientHeight)
    
    // 输入多行文本
    await textarea.fill('Line 1\nLine 2\nLine 3\nLine 4\nLine 5')
    
    const newHeight = await textarea.evaluate((el) => el.clientHeight)
    expect(newHeight).toBeGreaterThan(initialHeight)
    
    // 验证最大高度限制
    const maxHeight = await textarea.evaluate((el) => el.clientHeight)
    expect(maxHeight).toBeLessThanOrEqual(120) // maxHeight 设置为 120px
  })

  test('字符计数和限制', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const textarea = page.locator('[data-testid="message-input"]')
    const charCount = page.locator('[data-testid="char-count"]')
    
    // 输入短文本
    await textarea.fill('Hello')
    await expect(charCount).toHaveText('5/2000')
    
    // 输入长文本（超过限制）
    const longText = 'a'.repeat(2001)
    await textarea.fill(longText)
    
    // 验证被截断到2000字符
    const actualText = await textarea.inputValue()
    expect(actualText.length).toBe(2000)
    await expect(charCount).toHaveText('2000/2000')
  })
})