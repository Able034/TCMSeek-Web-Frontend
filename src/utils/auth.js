/**
 * 认证工具类
 * 提供 Token 管理、自动登出等功能
 */

import { ElMessage, ElMessageBox } from 'element-plus'
import router from '@/router'

// 配置项
const CONFIG = {
  // 📌 生产环境配置
  TOKEN_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000, // Token 过期时间：7天（毫秒）
  IDLE_TIMEOUT: 30 * 60 * 1000, // 闲置超时：30分钟（毫秒）
  CHECK_INTERVAL: 2 * 60 * 1000, // 检查间隔：2分钟（毫秒）
  WARNING_TIME: 5 * 60 * 1000 // 过期前警告时间：5分钟（毫秒）
  
  // 🧪 测试模式配置（需要测试时取消注释）
  // TOKEN_EXPIRE_TIME: 2 * 60 * 1000, // Token 过期时间：2分钟（测试）
  // IDLE_TIMEOUT: 30 * 1000, // 闲置超时：30秒（测试）
  // CHECK_INTERVAL: 5 * 1000, // 检查间隔：5秒（测试）
  // WARNING_TIME: 30 * 1000 // 过期前警告时间：30秒（测试）
}

let idleTimer = null
let checkTimer = null
let lastActivityTime = Date.now()
let warningShown = false

/**
 * 获取用户信息
 */
export function getUser() {
  try {
    const loginUser = localStorage.getItem('loginUser')
    if (loginUser) {
      return JSON.parse(loginUser)
    }
  } catch (error) {
    console.error('解析用户信息失败:', error)
  }
  return null
}

/**
 * 设置用户信息（包含登录时间）
 */
export function setUser(user) {
  const userWithTimestamp = {
    ...user,
    loginTime: Date.now() // 记录登录时间
  }
  localStorage.setItem('loginUser', JSON.stringify(userWithTimestamp))
  resetIdleTimer() // 重置闲置计时器
  warningShown = false
}

/**
 * 清除用户信息
 */
export function clearUser() {
  localStorage.removeItem('loginUser')
  localStorage.removeItem('wemolUserName')
  stopTimers()
}

/**
 * 检查 Token 是否过期
 */
export function isTokenExpired() {
  const user = getUser()
  if (!user || !user.loginTime) {
    return true
  }
  
  const elapsedTime = Date.now() - user.loginTime
  return elapsedTime > CONFIG.TOKEN_EXPIRE_TIME
}

/**
 * 检查是否即将过期（用于警告）
 */
export function isTokenExpiringSoon() {
  const user = getUser()
  if (!user || !user.loginTime) {
    return false
  }
  
  const elapsedTime = Date.now() - user.loginTime
  const remainingTime = CONFIG.TOKEN_EXPIRE_TIME - elapsedTime
  
  return remainingTime > 0 && remainingTime <= CONFIG.WARNING_TIME
}

/**
 * 检查是否闲置超时
 */
export function isIdleTimeout() {
  const idleTime = Date.now() - lastActivityTime
  return idleTime > CONFIG.IDLE_TIMEOUT
}

/**
 * 自动登出
 */
export async function autoLogout(reason = 'expired') {
  console.log('自动登出，原因:', reason)
  
  clearUser()
  
  // 显示提示
  const messages = {
    expired: '登录已过期，请重新登录',
    idle: '长时间未操作，已自动登出',
    invalid: '登录信息无效，请重新登录'
  }
  
  ElMessage.warning(messages[reason] || messages.expired)
  
  // 跳转到登录页
  const currentPath = router.currentRoute.value.fullPath
  if (currentPath !== '/' && currentPath !== '/login') {
    router.push({
      path: '/login',
      query: { redirect: currentPath }
    })
  } else {
    router.push('/login')
  }
}

/**
 * 显示即将过期警告
 */
async function showExpiringWarning() {
  if (warningShown) return
  warningShown = true
  
  try {
    await ElMessageBox.confirm(
      '您的登录即将过期，是否继续保持登录？',
      '登录提醒',
      {
        confirmButtonText: '继续登录',
        cancelButtonText: '退出登录',
        type: 'warning'
      }
    )
    
    // 用户选择继续登录，刷新 token
    const user = getUser()
    if (user) {
      setUser({ ...user, loginTime: Date.now() }) // 重置登录时间
      ElMessage.success('已延长登录时间')
    }
  } catch {
    // 用户选择退出或关闭对话框
    autoLogout('expired')
  }
}

/**
 * 定期检查 Token 状态
 */
function checkTokenStatus() {
  const user = getUser()
  if (!user) {
    stopTimers()
    return
  }
  
  // 检查是否过期
  if (isTokenExpired()) {
    autoLogout('expired')
    return
  }
  
  // 检查是否即将过期
  if (isTokenExpiringSoon()) {
    showExpiringWarning()
    return
  }
  
  // 检查是否闲置超时
  if (isIdleTimeout()) {
    autoLogout('idle')
  }
}

/**
 * 更新最后活动时间
 */
export function updateActivity() {
  lastActivityTime = Date.now()
}

/**
 * 重置闲置计时器
 */
function resetIdleTimer() {
  lastActivityTime = Date.now()
}

/**
 * 启动监控计时器
 */
export function startTimers() {
  // 停止旧的计时器
  stopTimers()
  
  const user = getUser()
  if (!user) return
  
  console.log('🔐 启动自动登出监控')
  
  // 定期检查 Token 状态
  checkTimer = setInterval(checkTokenStatus, CONFIG.CHECK_INTERVAL)
  
  // 监听用户活动
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  events.forEach(event => {
    document.addEventListener(event, updateActivity, { passive: true })
  })
  
  // 立即检查一次
  checkTokenStatus()
}

/**
 * 停止监控计时器
 */
export function stopTimers() {
  if (checkTimer) {
    clearInterval(checkTimer)
    checkTimer = null
  }
  
  // 移除事件监听
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
  events.forEach(event => {
    document.removeEventListener(event, updateActivity)
  })
  
  console.log('🔓 停止自动登出监控')
}

/**
 * 获取剩余登录时间（毫秒）
 */
export function getRemainingTime() {
  const user = getUser()
  if (!user || !user.loginTime) return 0
  
  const elapsedTime = Date.now() - user.loginTime
  const remainingTime = CONFIG.TOKEN_EXPIRE_TIME - elapsedTime
  
  return Math.max(0, remainingTime)
}

/**
 * 格式化剩余时间为可读字符串
 */
export function formatRemainingTime() {
  const remaining = getRemainingTime()
  
  const days = Math.floor(remaining / (24 * 60 * 60 * 1000))
  const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
  
  if (days > 0) {
    return `${days}天${hours}小时`
  } else if (hours > 0) {
    return `${hours}小时${minutes}分钟`
  } else {
    return `${minutes}分钟`
  }
}

export default {
  getUser,
  setUser,
  clearUser,
  isTokenExpired,
  isTokenExpiringSoon,
  isIdleTimeout,
  autoLogout,
  updateActivity,
  startTimers,
  stopTimers,
  getRemainingTime,
  formatRemainingTime,
  CONFIG
}

