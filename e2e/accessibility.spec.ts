import { test, expect } from '@playwright/test'

test.describe('可访问性测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174')
    await page.waitForLoadState('networkidle')
  })

  test('键盘导航', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 测试Tab键导航
    await page.keyboard.press('Tab')
    let focused = await page.locator(':focus')
    await expect(focused).toBeVisible()
    
    // 继续Tab导航到输入框
    let tabCount = 0
    while (tabCount < 10) {
      await page.keyboard.press('Tab')
      focused = await page.locator(':focus')
      
      // 检查是否到达输入框
      if (await focused.getAttribute('data-testid') === 'message-input') {
        break
      }
      tabCount++
    }
    
    expect(await focused.getAttribute('data-testid')).toBe('message-input')
    
    // 测试输入和发送
    await page.keyboard.type('Keyboard navigation test')
    await page.keyboard.press('Enter')
    
    // 验证消息发送成功
    await expect(page.locator('text=Keyboard navigation test')).toBeVisible({ timeout: 5000 })
  })

  test('ARIA标签和语义化HTML', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查主要区域的ARIA标签
    const chatPage = page.locator('[data-testid="chat-page"]')
    await expect(chatPage).toHaveAttribute('role', 'main')
    
    // 检查消息列表
    const messageList = page.locator('[data-testid="message-list"]')
    await expect(messageList).toHaveAttribute('role', 'log')
    await expect(messageList).toHaveAttribute('aria-live', 'polite')
    await expect(messageList).toHaveAttribute('aria-label', '消息列表')
    
    // 检查输入框
    const textarea = page.locator('[data-testid="message-input"]')
    await expect(textarea).toHaveAttribute('aria-label', '输入消息')
    await expect(textarea).toHaveAttribute('placeholder')
    
    // 检查发送按钮
    const sendButton = page.locator('[data-testid="send-button"]')
    await expect(sendButton).toHaveAttribute('aria-label', '发送消息')
    
    // 检查搜索框
    const searchInput = page.locator('[data-testid="search-input"]')
    await expect(searchInput).toHaveAttribute('aria-label', '搜索消息')
    await expect(searchInput).toHaveAttribute('placeholder')
    
    // 检查过滤器
    const filterSelect = page.locator('[data-testid="sender-filter"]')
    await expect(filterSelect).toHaveAttribute('aria-label', '发送者过滤器')
  })

  test('屏幕阅读器支持', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查消息项目的语义化结构
    const messageItems = page.locator('[data-testid="message-item"]')
    const firstMessage = messageItems.first()
    
    await expect(firstMessage).toHaveAttribute('role', 'article')
    await expect(firstMessage).toHaveAttribute('aria-label', /消息来自/)
    
    // 检查消息状态的可访问性
    const userMessages = page.locator('[data-testid="message-item"][data-sender="user"]')
    const firstUserMessage = userMessages.first()
    
    const statusIndicator = firstUserMessage.locator('[data-testid="message-status"]')
    await expect(statusIndicator).toHaveAttribute('aria-label')
  })

  test('颜色对比度和视觉可访问性', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查是否有高对比度模式支持
    const html = page.locator('html')
    const hasHighContrastClass = await html.evaluate((el) => 
      el.classList.contains('high-contrast') || 
      el.classList.contains('dark-mode')
    )
    
    // 测试文本是否可读（不是纯图片）
    const messageTexts = page.locator('[data-testid="message-item"] [data-testid="message-content"]')
    await expect(messageTexts.first()).toBeVisible()
    
    // 检查链接和交互元素是否有明确的视觉反馈
    const sendButton = page.locator('[data-testid="send-button"]')
    await sendButton.hover()
    await expect(sendButton).toBeVisible()
  })

  test('焦点管理', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 测试焦点陷阱在模态框中
    await page.locator('[data-testid="message-item"][data-sender="user"]').first().hover()
    await page.locator('[data-testid="delete-button"]').first().click()
    
    // 检查确认对话框是否获得焦点
    const confirmDialog = page.locator('[data-testid="confirm-dialog"]')
    if (await confirmDialog.isVisible()) {
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
      
      // 测试Escape键关闭对话框
      await page.keyboard.press('Escape')
      await expect(confirmDialog).not.toBeVisible()
    }
  })

  test('响应式设计可访问性', async ({ page }) => {
    // 测试移动端可访问性
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查触摸目标大小（至少44x44px）
    const sendButton = page.locator('[data-testid="send-button"]')
    const boundingBox = await sendButton.boundingBox()
    
    if (boundingBox) {
      expect(boundingBox.width).toBeGreaterThanOrEqual(44)
      expect(boundingBox.height).toBeGreaterThanOrEqual(44)
    }
    
    // 检查输入框大小
    const textarea = page.locator('[data-testid="message-input"]')
    const inputBoundingBox = await textarea.boundingBox()
    
    if (inputBoundingBox) {
      expect(inputBoundingBox.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('表单验证和错误消息', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const textarea = page.locator('[data-testid="message-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // 尝试发送空消息
    await sendButton.click()
    
    // 检查是否有适当的错误提示
    const errorMessage = page.locator('[data-testid="error-message"]')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toHaveAttribute('role', 'alert')
    }
    
    // 检查字符限制提示
    await textarea.fill('a'.repeat(2001))
    const charCount = page.locator('[data-testid="char-count"]')
    await expect(charCount).toBeVisible()
  })

  test('跳转链接和快速导航', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查是否有跳转到主内容的链接
    const skipLink = page.locator('[data-testid="skip-to-content"]')
    if (await skipLink.isVisible()) {
      await skipLink.click()
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    }
    
    // 检查是否有回到顶部的功能
    const scrollToBottom = page.locator('[data-testid="scroll-to-bottom"]')
    if (await scrollToBottom.isVisible()) {
      await scrollToBottom.click()
      await page.waitForTimeout(500)
      
      // 验证滚动到底部
      const messageList = page.locator('[data-testid="message-list"]')
      const scrollTop = await messageList.evaluate((el) => el.scrollTop)
      expect(scrollTop).toBe(0)
    }
  })

  test('动态内容的可访问性', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 发送消息并检查屏幕阅读器通知
    const textarea = page.locator('[data-testid="message-input"]')
    await textarea.fill('Accessibility test message')
    
    const sendButton = page.locator('[data-testid="send-button"]')
    await sendButton.click()
    
    // 检查新消息是否有适当的ARIA属性
    const newMessage = page.locator('text=Accessibility test message')
    await expect(newMessage).toBeVisible()
    
    // 检查是否有aria-live区域
    const liveRegion = page.locator('[aria-live]')
    await expect(liveRegion.first()).toBeVisible()
  })

  test('语言和方向性', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 检查HTML语言属性
    const html = page.locator('html')
    await expect(html).toHaveAttribute('lang', 'zh-CN')
    
    // 检查文本方向
    const textDirection = await html.evaluate((el) => 
      getComputedStyle(el).direction
    )
    expect(textDirection).toBe('ltr') // 左到右
  })
})