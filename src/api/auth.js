import request from '@/utils/request'

/**
 * 认证相关 API
 * Authentication Related APIs
 */

/**
 * 用户登录
 * User Login
 * @param {Object} data - 登录数据
 * @param {string} data.account - 账号
 * @param {string} data.password - 密码
 * @returns {Promise} 返回登录结果
 */
export const login = (data) => {
  return request.post('/tcmseek/login', data)
}

/**
 * 用户登出
 * User Logout
 * @returns {Promise} 返回登出结果
 */
export const logout = () => {
  return request.post('/tcmseek/logout')
}

/**
 * 用户注册
 * User Register
 * @param {Object} data - 注册数据
 * @param {string} data.account - 账号
 * @param {string} data.password - 密码
 * @param {string} data.username - 用户名
 * @param {string} data.email - 邮箱
 * @returns {Promise} 返回注册结果
 */
export const register = (data) => {
  return request.post('/tcmseek/regist', data)
}

/**
 * 获取用户信息
 * Get User Info
 * @returns {Promise} 返回用户信息
 */
export const getUserInfo = () => {
  return request.get('/tcmseek/user/info')
}

/**
 * 修改密码
 * Change Password
 * @param {Object} data - 密码数据
 * @param {string} data.oldPassword - 旧密码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise} 返回修改结果
 */
export const changePassword = (data) => {
  return request.post('/tcmseek/user/changePassword', data)
}

/**
 * 发送邮箱验证码
 * Send Email Verification Code
 * @param {Object} data - 数据
 * @param {string} data.email - 邮箱
 * @returns {Promise} 返回发送结果
 */
export const sendCode = (data) => {
  return request.post('/tcmseek/sendCode', data)
}

/**
 * 忘记密码 - 发送验证码
 * Forgot Password - Send Verification Code
 * @param {Object} data - 数据
 * @param {string} data.email - 邮箱
 * @returns {Promise} 返回发送结果
 */
export const sendResetCode = (data) => {
  return request.post('/tcmseek/password/sendCode', data)
}

/**
 * 重置密码
 * Reset Password
 * @param {Object} data - 重置数据
 * @param {string} data.email - 邮箱
 * @param {string} data.code - 验证码
 * @param {string} data.newPassword - 新密码
 * @returns {Promise} 返回重置结果
 */
export const resetPassword = (data) => {
  return request.post('/tcmseek/password/reset', data)
}

/**
 * 刷新 Token
 * Refresh Token
 * @param {string} refreshToken - 刷新令牌
 * @returns {Promise} 返回新的 token
 */
export const refreshToken = (refreshToken) => {
  return request.post('/tcmseek/token/refresh', { refreshToken })
}

// /**
//  * 检查账号是否存在
//  * Check if Account Exists
//  * @param {string} account - 账号
//  * @returns {Promise} 返回检查结果
//  */
// export const checkAccountExists = (account) => {
//   return request.get('/tcmseek/account/check', { params: { account } })
// }

// /**
//  * 检查邮箱是否存在
//  * Check if Email Exists
//  * @param {string} email - 邮箱
//  * @returns {Promise} 返回检查结果
//  */
// export const checkEmailExists = (email) => {
//   return request.get('/tcmseek/email/check', { params: { email } })
// }

