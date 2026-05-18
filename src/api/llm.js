import axios from 'axios'

const aiRequest = axios.create({
  baseURL: '/api/ai',
  timeout: 600000
})

const getLoginUser = () => {
  try {
    return JSON.parse(localStorage.getItem('loginUser') || 'null')
  } catch (error) {
    return null
  }
}

const authHeaders = () => {
  const loginUser = getLoginUser()
  if (!loginUser?.token) {
    return {}
  }
  return {
    Authorization: loginUser.token,
    token: loginUser.token
  }
}

const normalizeAiResponse = (data) => {
  if (data && typeof data === 'object' && Object.prototype.hasOwnProperty.call(data, 'code')) {
    return data
  }

  return {
    code: 200,
    data
  }
}

aiRequest.interceptors.request.use((config) => {
  Object.assign(config.headers, authHeaders())
  return config
})

aiRequest.interceptors.response.use(
  (response) => normalizeAiResponse(response.data),
  async (error) => {
    if (error.response?.status === 401) {
      const { autoLogout } = await import('@/utils/auth')
      autoLogout('invalid')
    }
    return Promise.reject(error)
  }
)

export const toGatewayAiUrl = (url = '') => {
  if (!url) return ''
  if (url.startsWith('/api/ai/')) return url
  if (url.startsWith('/ai/')) return `/api${url}`
  return url
}

export const downloadAiExport = async (url) => {
  const downloadUrl = toGatewayAiUrl(url)
  try {
    return await axios.get(downloadUrl, {
      headers: authHeaders(),
      responseType: 'blob'
    })
  } catch (error) {
    if (error.response?.status === 401) {
      const { autoLogout } = await import('@/utils/auth')
      autoLogout('invalid')
    }
    throw error
  }
}

export const listAiConversations = (params = {}) => {
  return aiRequest.get('/conversations', { params })
}

export const createAiConversation = (data = {}) => {
  return aiRequest.post('/conversations', data)
}

export const getAiConversationMessages = (conversationId, params = {}) => {
  return aiRequest.get(`/conversations/${conversationId}/messages`, { params })
}

export const updateAiConversation = (conversationId, data = {}) => {
  return aiRequest.patch(`/conversations/${conversationId}`, data)
}

export const deleteAiConversation = (conversationId) => {
  return aiRequest.delete(`/conversations/${conversationId}`)
}

/**
 * Send a chat request to the general LLM mode.
 * @param {Object} data { sessionId, messages }
 */
export const chatWithLlm = (data) => {
  return aiRequest.post('/chat', data)
}

/**
 * Send a chat request to the professional/academic mode (TCM AI Chat).
 * Uses Neo4j knowledge graph and DeepSeek model for professional TCM Q&A.
 * @param {Object} data { sessionId, messages }
 * @returns {Promise} Response with reply, usage, model info
 */
export const aichatWithLlm = (data) => {
  return aiRequest.post('/aichat', data)
}
