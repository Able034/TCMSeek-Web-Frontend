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

const parseSsePayload = (raw = '') => {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch (error) {
    return { raw }
  }
}

const sseHandlerName = (event = 'message') =>
  `on${event.charAt(0).toUpperCase()}${event.slice(1)}`

const dispatchSseBlock = (block, callbacks = {}) => {
  if (!block.trim()) return
  let event = 'message'
  const dataLines = []
  block.split(/\r?\n/).forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim() || 'message'
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trimStart())
    }
  })
  const payload = parseSsePayload(dataLines.join('\n'))
  const handler = callbacks[sseHandlerName(event)]
  if (typeof handler === 'function') {
    handler(payload)
  }
  if (typeof callbacks.onEvent === 'function') {
    callbacks.onEvent(event, payload)
  }
}

const readSseStream = async (response, callbacks = {}) => {
  if (!response.body?.getReader) {
    const error = new Error('Streaming response is not supported by this browser.')
    error.code = 'STREAM_UNSUPPORTED'
    throw error
  }
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() || ''
    blocks.forEach((block) => dispatchSseBlock(block, callbacks))
  }
  buffer += decoder.decode()
  if (buffer.trim()) {
    dispatchSseBlock(buffer, callbacks)
  }
}

/**
 * Stream a professional/academic DeepSeek answer through SSE.
 * The legacy JSON /aichat endpoint is kept for compatibility.
 * @param {Object} data { sessionId, messages }
 * @param {Object} callbacks { onStart, onDelta, onMetadata, onHeartbeat, onDone, onError }
 * @returns {Promise<Object|null>} final AiChatResponse metadata
 */
export const aichatWithLlmStream = async (data, callbacks = {}) => {
  const response = await fetch('/api/ai/aichat/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(data)
  })

  if (response.status === 401) {
    const { autoLogout } = await import('@/utils/auth')
    autoLogout('invalid')
  }
  if (!response.ok) {
    const error = new Error(`AI stream request failed: ${response.status}`)
    error.status = response.status
    throw error
  }

  let metadata = null
  await readSseStream(response, {
    ...callbacks,
    onMetadata: (payload) => {
      metadata = payload
      callbacks.onMetadata?.(payload)
    },
    onError: (payload) => {
      const error = new Error(payload?.message || 'AI stream failed.')
      error.streamEvent = true
      throw error
    }
  })
  return metadata
}
