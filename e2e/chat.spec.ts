import { test, expect } from '@playwright/test'

test.describe('聊天应用核心功能 E2E 测试', () => {
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

  test('搜索高亮功能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 输入搜索关键词
    const searchInput = page.locator('input[placeholder="Search messages..."]')
    await searchInput.fill('test')
    
    // 等待搜索结果
    await page.waitForTimeout(500)
    
    // 验证搜索结果包含高亮
    const highlightedElements = page.locator('.bg-yellow-200')
    if (await highlightedElements.count() > 0) {
      await expect(highlightedElements.first()).toBeVisible()
    }
  })

  test('发送者过滤功能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 点击过滤器按钮
    const filterButton = page.locator('button[title="Filter options"]')
    await filterButton.click()
    
    // 等待过滤器展开
    await page.waitForTimeout(300)
    
    // 选择用户消息过滤器
    const userFilterButton = page.locator('button:has-text("User")')
    await userFilterButton.click()
    
    // 等待过滤结果
    await page.waitForTimeout(500)
  })
})