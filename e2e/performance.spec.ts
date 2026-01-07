import { test, expect } from '@playwright/test'

test.describe('性能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174')
    await page.waitForLoadState('networkidle')
  })

  test('大量消息加载性能', async ({ page }) => {
    // 等待初始消息加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 测量加载时间
    const startTime = Date.now()
    
    // 滚动到顶部触发加载更多
    const messageList = page.locator('[data-testid="message-list"]')
    await messageList.evaluate((el) => el.scrollTop = 0)
    
    // 等待新消息加载
    await page.waitForTimeout(2000)
    
    const loadTime = Date.now() - startTime
    
    // 验证加载时间在合理范围内（小于3秒）
    expect(loadTime).toBeLessThan(3000)
    
    // 验证消息数量
    const messageCount = await page.locator('[data-testid="message-item"]').count()
    expect(messageCount).toBeGreaterThan(20) // 至少加载了两页
  })

  test('滚动性能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const messageList = page.locator('[data-testid="message-list"]')
    
    // 测量滚动到顶部的时间
    const startTime = Date.now()
    await messageList.evaluate((el) => el.scrollTop = 0)
    await page.waitForTimeout(1000)
    
    const scrollTime = Date.now() - startTime
    
    // 验证滚动响应时间（小于1秒）
    expect(scrollTime).toBeLessThan(1000)
  })

  test('内存使用测试', async ({ page }) => {
    // 等待初始加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 获取初始内存使用
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // 执行多个操作
    for (let i = 0; i < 10; i++) {
      // 搜索
      await page.locator('[data-testid="search-input"]').fill(`test ${i}`)
      await page.waitForTimeout(500)
      
      // 清除搜索
      await page.locator('[data-testid="clear-search"]').click()
      await page.waitForTimeout(200)
      
      // 发送消息
      await page.locator('[data-testid="message-input"]').fill(`Message ${i}`)
      await page.locator('[data-testid="send-button"]').click()
      await page.waitForTimeout(500)
    }
    
    // 获取最终内存使用
    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0
    })
    
    // 验证内存增长在合理范围内（小于10MB）
    const memoryIncrease = finalMemory - initialMemory
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024) // 10MB
  })

  test('页面加载性能指标', async ({ page }) => {
    // 等待页面完全加载
    await page.waitForLoadState('networkidle')
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    // 获取性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByType('paint')[1]?.startTime || 0,
      }
    })
    
    // 验证关键性能指标
    expect(metrics.domContentLoaded).toBeLessThan(3000) // DOM加载时间小于3秒
    expect(metrics.loadComplete).toBeLessThan(5000) // 完整加载时间小于5秒
    expect(metrics.firstContentfulPaint).toBeLessThan(2000) // 首次内容绘制小于2秒
  })

  test('搜索性能', async ({ page }) => {
    // 等待消息列表加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const searchInput = page.locator('[data-testid="search-input"]')
    
    // 测试搜索响应时间
    const searchTerms = ['hello', 'world', 'test', 'message', 'user', 'bot']
    
    for (const term of searchTerms) {
      const startTime = Date.now()
      
      await searchInput.fill(term)
      await page.waitForTimeout(600) // 等待防抖完成
      
      const searchTime = Date.now() - startTime
      
      // 验证搜索时间（小于1秒）
      expect(searchTime).toBeLessThan(1000)
      
      // 清除搜索
      await page.locator('[data-testid="clear-search"]').click()
      await page.waitForTimeout(200)
    }
  })

  test('连续发送消息性能', async ({ page }) => {
    // 等待页面加载
    await page.waitForSelector('[data-testid="message-item"]', { timeout: 10000 })
    
    const textarea = page.locator('[data-testid="message-input"]')
    const sendButton = page.locator('[data-testid="send-button"]')
    
    // 连续发送10条消息
    const startTime = Date.now()
    
    for (let i = 0; i < 10; i++) {
      await textarea.fill(`Performance test message ${i}`)
      await sendButton.click()
      await page.waitForTimeout(200) // 等待消息处理
    }
    
    const totalTime = Date.now() - startTime
    const averageTime = totalTime / 10
    
    // 验证平均发送时间（小于500ms）
    expect(averageTime).toBeLessThan(500)
    
    // 验证所有消息都显示在列表中
    for (let i = 0; i < 10; i++) {
      await expect(page.locator(`text=Performance test message ${i}`)).toBeVisible()
    }
  })
})