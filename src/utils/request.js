import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: '/api/web',
  timeout: 600000
})

const getLoginUser = () => {
  try {
    return JSON.parse(localStorage.getItem('loginUser') || 'null')
  } catch (error) {
    return null
  }
}

request.interceptors.request.use((config) => {
  const loginUser = getLoginUser()
  if (loginUser?.token) {
    config.headers.Authorization = loginUser.token
    config.headers.token = loginUser.token
  }
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      const { autoLogout } = await import('@/utils/auth')
      autoLogout('invalid')
    } else {
      ElMessage.error('接口访问异常')
    }
    return Promise.reject(error)
  }
)

export default request
