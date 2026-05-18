<template>
  <div class="qa-container">
    <div class="qa-header">
      <h2>
        <el-icon class="header-icon"><ChatDotRound /></el-icon>
        {{$t('home.features.aiTitle')}}
      </h2>
      <div class="mode-selector">
        <button 
          class="mode-btn" 
          :class="{ active: mode === 'academic' }"
          @click="mode = 'academic'"
        >
          <el-icon><Reading /></el-icon>
          {{$t('model.academicMode')}}
        </button>
        <button 
          class="mode-btn" 
          :class="{ active: mode === 'general' }"
          @click="mode = 'general'"
        >
          <el-icon><ChatLineRound /></el-icon>
          {{$t('model.generalMode')}}
        </button>
      </div>
    </div>

    <div class="qa-workspace">
      <aside class="history-panel">
        <div class="history-header">
          <h3>历史对话</h3>
          <button
            type="button"
            class="history-new-btn"
            :disabled="conversationLoading || isLoading"
            @click="startNewConversation(mode)"
          >
            <el-icon><Plus /></el-icon>
            新对话
          </button>
        </div>
        <div v-if="conversationLoading" class="history-state">加载中...</div>
        <div v-else-if="currentConversations.length === 0" class="history-state">暂无历史对话</div>
        <div v-else class="history-list">
          <div
            v-for="conversation in currentConversations"
            :key="conversation.id"
            class="history-item"
            :class="{ active: conversation.id === currentSessionId }"
            tabindex="0"
            @click="selectConversation(conversation)"
            @keyup.enter="selectConversation(conversation)"
          >
            <div class="history-item-main">
              <div
                v-if="renamingConversationId === conversation.id"
                class="history-rename"
                @click.stop
              >
                <input
                  v-model="renamingTitle"
                  class="history-rename-input"
                  maxlength="80"
                  @keyup.enter.stop="submitRenameConversation(conversation)"
                  @keyup.esc.stop="cancelRenameConversation"
                />
                <button
                  type="button"
                  class="history-icon-btn"
                  title="保存"
                  :disabled="isRenamingConversation"
                  @click.stop="submitRenameConversation(conversation)"
                >
                  <el-icon><Check /></el-icon>
                </button>
                <button
                  type="button"
                  class="history-icon-btn"
                  title="取消"
                  :disabled="isRenamingConversation"
                  @click.stop="cancelRenameConversation"
                >
                  <el-icon><Close /></el-icon>
                </button>
              </div>
              <template v-else>
                <span class="history-title">{{ conversation.title || '新对话' }}</span>
                <span class="history-meta">
                  {{ formatConversationTime(conversation.updatedAt) }} · {{ conversation.messageCount || 0 }} 条
                </span>
              </template>
            </div>
            <div v-if="renamingConversationId !== conversation.id" class="history-actions">
              <button
                type="button"
                class="history-icon-btn"
                title="重命名"
                :disabled="isLoading"
                @click.stop="startRenameConversation(conversation)"
              >
                <el-icon><Edit /></el-icon>
              </button>
              <button
                type="button"
                class="history-icon-btn history-delete-btn"
                title="删除"
                :disabled="isLoading"
                @click.stop="removeConversation(conversation)"
              >
                <el-icon><Delete /></el-icon>
              </button>
            </div>
          </div>
          <button
            v-if="hasMoreConversations"
            type="button"
            class="history-more-btn"
            :disabled="conversationLoadingMore"
            @click="loadMoreConversations"
          >
            {{ conversationLoadingMore ? '加载中...' : '加载更多' }}
          </button>
        </div>
      </aside>

      <section class="qa-main">
        <div class="mode-description">
          <p v-if="mode === 'academic'">
            <strong> {{$t('model.academicMode')}}:</strong>{{ $t('model.academicModeDesc') }}
          </p>
          <p v-else>
            <strong>{{$t('model.generalMode')}}:</strong>{{ $t('model.generalModeDesc') }}
          </p>
        </div>

        <div v-if="errorMessage" class="error-banner">
          <el-icon><WarningFilled /></el-icon>
          <span>{{ errorMessage }}</span>
        </div>

    <div class="chat-area">
      <div class="messages" ref="messagesWrapper">
        <div v-if="!isConversationOpening && currentMessages.length === 0" class="welcome-message">
          <h3>
            <el-icon v-if="mode === 'academic'"><UserFilled /></el-icon>
            <el-icon v-else><ChatDotSquare /></el-icon>
            {{ mode === 'academic' ? $t('model.welcome') : $t('model.generalWelcome') }}
          </h3>
          <p>{{$t('model.placeholder')}}</p>
        </div>
        <div 
          v-for="(message, index) in currentMessages" 
          :key="index" 
          class="message"
          :class="[message.type, { pending: message.pending, error: message.isError }]"
        >
          <div class="message-avatar">
            <el-icon v-if="message.type === 'user'"><User /></el-icon>
            <img v-else class="assistant-avatar-img" :src="aiAvatarUrl" alt="" aria-hidden="true">
          </div>
          <div class="message-content">
            <div v-if="message.thinking" class="thinking-block">
              <div class="thinking-header" @click="message.showThinking = !message.showThinking">
                <span class="thinking-dot"></span>
                <span class="thinking-title">{{ $t('qa.thinkingProcess') }}</span>
                <span class="thinking-toggle">{{ message.showThinking ? $t('qa.collapse') : $t('qa.expand') }}</span>
              </div>
              <div v-if="message.showThinking" class="thinking-text">
                {{ message.thinking }}
              </div>
            </div>
            <div class="message-text" v-html="renderRichMessage(message.text)"></div>
            <div class="message-time">{{ message.time }}</div>
          </div>
        </div>
      </div>
      <div v-if="mode === 'general' && isLoading" class="typing-indicator">
        <el-icon><Loading /></el-icon>
        <span>{{$t('model.generating')}}</span>
      </div>

      <div v-if="mode === 'academic' && csvLink" class="result-actions">
        <button
          type="button"
          class="download-btn"
          :disabled="isDownloadingCsv"
          @click="downloadCsv"
        >
          {{ isDownloadingCsv ? $t('model.generating') : $t('qa.downloadFull') }}
        </button>
      </div>

      <div class="input-area">
        <input 
          v-model="inputText"
          type="text" 
          :placeholder="$t('model.placeholder')"
          @keyup.enter="sendMessage"
          class="qa-input"
          />
        <button @click="sendMessage" class="send-btn" :disabled="!inputText.trim() || isLoading">
          <el-icon><Promotion /></el-icon>
          {{$t('model.send')}}
        </button>
      </div>
    </div>

    <div class="quick-questions">
      <h4>
        <el-icon><Opportunity /></el-icon>
        {{$t('model.quickQuestions')}}
      </h4>
      <div class="question-tags">
        <button 
          v-for="(question, index) in quickQuestions" 
          :key="index"
          class="question-tag"
          @click="inputText = question"
        >
          {{ question }}
        </button>
      </div>
    </div>

    <div
      v-if="mode === 'academic' && graphData"
      class="graph-panel"
    >
      <div class="graph-header">
        <div class="graph-title">
          <span>{{ graphTitleText }}</span>
          <small v-if="graphData.displayedTargets !== undefined && graphData.totalTargets !== undefined">
            {{ $t('qa.displayInfo', { displayed: graphData.displayedTargets, total: graphData.totalTargets }) }}
          </small>
        </div>
      </div>
      <div ref="graphContainer" class="graph-canvas"></div>
      <div class="graph-hint">
        {{ $t('qa.graphHint') }}
      </div>
    </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, nextTick, watch, onMounted, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import aiAvatarUrl from '@/assets/icon/ai-avatar.png'
import {
  chatWithLlm,
  aichatWithLlm,
  aichatWithLlmStream,
  toGatewayAiUrl,
  downloadAiExport,
  listAiConversations,
  createAiConversation,
  getAiConversationMessages,
  updateAiConversation,
  deleteAiConversation
} from '@/api/llm'
import { ChatDotRound, Reading, ChatLineRound, UserFilled, ChatDotSquare, User, Promotion, Opportunity, WarningFilled, Loading, Plus, Delete, Edit, Check, Close } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

const { t } = useI18n()

const mode = ref('academic')
const CONVERSATION_PAGE_SIZE = 30
const inputText = ref('')
const generalSessionId = ref(`general-${Date.now()}`)
const academicSessionId = ref(`academic-${Date.now()}`)
const chatHistory = reactive({
  academic: [],
  general: []
})
const conversations = reactive({
  academic: [],
  general: []
})
const conversationsLoaded = reactive({
  academic: false,
  general: false
})
const conversationPage = reactive({
  academic: 1,
  general: 1
})
const conversationTotals = reactive({
  academic: 0,
  general: 0
})
const currentMessages = computed(() => chatHistory[mode.value])
const currentConversations = computed(() => conversations[mode.value])
const currentSessionId = computed(() => (mode.value === 'academic' ? academicSessionId.value : generalSessionId.value))
const currentConversationTotal = computed(() => conversationTotals[mode.value] || 0)
const hasMoreConversations = computed(() => currentConversations.value.length < currentConversationTotal.value)
const STREAM_RENDER_INTERVAL_MS = 35
const STREAM_MIN_CHARS_PER_TICK = 2
const STREAM_MAX_CHARS_PER_TICK = 48
const isLoading = ref(false)
const conversationLoading = ref(false)
const conversationLoadingMore = ref(false)
const isConversationOpening = ref(false)
const renamingConversationId = ref('')
const renamingTitle = ref('')
const isRenamingConversation = ref(false)
const errorMessage = ref('')
const messagesWrapper = ref(null)
const graphContainer = ref(null)
let graphInstance = null
const graphData = ref(null)
const csvLink = ref('')
const isDownloadingCsv = ref(false)
const expiredCsvExportIds = reactive(new Set())
let streamScrollTimer = null

const resultLabel = computed(() => {
  const type = graphData.value?.entityType
  if (type === 'target') return t('qa.target')
  if (type === 'compound') return t('qa.compound')
  return t('qa.result')
})

const graphTitleText = computed(() => t('qa.graphTitle', { label: resultLabel.value }))

watch(mode, async (newMode) => {
  if (newMode !== 'general') {
    errorMessage.value = ''
    isLoading.value = false
  }
  if (newMode !== 'academic') {
    clearGraph()
  } else {
    clearGraphData()
    updateCsvLinkFromMessages(chatHistory.academic)
  }
  await loadConversations(newMode)
  if (currentMessages.value.length) {
    scrollMessagesToBottom()
  }
})

const formatTime = () =>
  new Date().toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })

const formatConversationTime = (value) => {
  if (!value) return '刚刚'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '刚刚'
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const sessionIdForMode = (targetMode) =>
  targetMode === 'academic' ? academicSessionId.value : generalSessionId.value

const setSessionIdForMode = (targetMode, sessionId) => {
  if (targetMode === 'academic') {
    academicSessionId.value = sessionId
  } else {
    generalSessionId.value = sessionId
  }
}

const setMessagesForMode = (targetMode, messages = []) => {
  chatHistory[targetMode].splice(0, chatHistory[targetMode].length, ...messages)
}

const messageTime = (createdAt) => {
  if (!createdAt) return formatTime()
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return formatTime()
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const conversationMessageToChat = (message) => ({
  type: message.role === 'user' ? 'user' : 'bot',
  text: message.content || '',
  time: messageTime(message.createdAt),
  thinking: '',
  showThinking: false,
  csvExportId: message.csvExportId || ''
})

const updateCsvLinkFromMessages = (messages = []) => {
  const lastExportMessage = [...messages]
    .reverse()
    .find((message) => message.csvExportId && !expiredCsvExportIds.has(message.csvExportId))
  csvLink.value = lastExportMessage?.csvExportId
    ? toGatewayAiUrl(`/ai/exports/${lastExportMessage.csvExportId}`)
    : ''
}

const exportIdFromUrl = (url = '') => {
  if (!url) return ''
  const normalized = String(url).split('?')[0]
  const index = normalized.lastIndexOf('/')
  return index >= 0 ? normalized.slice(index + 1) : normalized
}

const loadConversationMessages = async (conversationId, targetMode = mode.value) => {
  if (!conversationId) return
  isConversationOpening.value = targetMode === mode.value
  setMessagesForMode(targetMode, [])
  if (targetMode === 'academic') {
    clearGraph()
  }
  try {
    const response = await getAiConversationMessages(conversationId, { limit: 100 })
    if (response.code !== 200 || !response.data) {
      throw new Error(t('model.generalModeErrorFallback'))
    }
    const messages = (response.data.messages || []).map(conversationMessageToChat)
    setMessagesForMode(targetMode, messages)
    if (targetMode === 'academic') {
      clearGraphData()
      updateCsvLinkFromMessages(messages)
    } else {
      clearGraph()
    }
    scrollMessagesToBottom()
  } catch (error) {
    setMessagesForMode(targetMode, [])
    ElMessage.error('历史消息加载失败')
  } finally {
    if (targetMode === mode.value) {
      isConversationOpening.value = false
    }
  }
}

const selectConversation = async (conversation, targetMode = mode.value) => {
  if (!conversation?.id || isLoading.value) return
  cancelRenameConversation()
  if (conversation.id === sessionIdForMode(targetMode) && chatHistory[targetMode].length) {
    if (targetMode === 'academic') {
      clearGraphData()
      updateCsvLinkFromMessages(chatHistory[targetMode])
    }
    scrollMessagesToBottom()
    return
  }
  setSessionIdForMode(targetMode, conversation.id)
  if (targetMode === 'academic') {
    clearGraph()
  }
  await loadConversationMessages(conversation.id, targetMode)
}

const mergeConversations = (targetMode, items = []) => {
  const list = conversations[targetMode]
  const seen = new Set(list.map((item) => item.id))
  items.forEach((item) => {
    if (!seen.has(item.id)) {
      list.push(item)
      seen.add(item.id)
    }
  })
}

const isReusableEmptyConversation = (conversation) => {
  if (!conversation) return false
  const title = (conversation.title || '').trim()
  return Number(conversation.messageCount || 0) === 0
    && !conversation.lastMessageAt
    && (!title || title === '新对话' || title === '新会话')
}

const findReusableEmptyConversation = (targetMode) => {
  const activeId = sessionIdForMode(targetMode)
  const list = conversations[targetMode]
  const activeConversation = list.find((item) => item.id === activeId)
  if (isReusableEmptyConversation(activeConversation)) {
    return activeConversation
  }
  return list.find(isReusableEmptyConversation)
}

const loadConversations = async (targetMode = mode.value, selectLatest = false, append = false) => {
  if (append && (conversationLoadingMore.value || !hasMoreConversations.value)) return
  if (append) {
    conversationLoadingMore.value = true
  } else {
    conversationLoading.value = true
  }
  const nextPage = append ? conversationPage[targetMode] + 1 : 1
  try {
    const response = await listAiConversations({
      mode: targetMode,
      page: nextPage,
      pageSize: CONVERSATION_PAGE_SIZE
    })
    if (response.code !== 200 || !response.data) {
      throw new Error(t('model.generalModeErrorFallback'))
    }
    const items = response.data.items || []
    if (append) {
      mergeConversations(targetMode, items)
    } else {
      conversations[targetMode].splice(0, conversations[targetMode].length, ...items)
    }
    conversationPage[targetMode] = nextPage
    conversationTotals[targetMode] = Number(response.data.total || 0)
    conversationsLoaded[targetMode] = true

    const activeId = sessionIdForMode(targetMode)
    const activeExists = conversations[targetMode].some((item) => item.id === activeId)
    if (!append && (selectLatest || !activeExists) && items.length > 0 && !chatHistory[targetMode].length) {
      await selectConversation(items[0], targetMode)
    } else if (!append && !items.length && !activeId) {
      setSessionIdForMode(targetMode, `${targetMode}-${Date.now()}`)
      setMessagesForMode(targetMode, [])
    }
  } catch (error) {
    ElMessage.error('历史对话加载失败')
  } finally {
    if (append) {
      conversationLoadingMore.value = false
    } else {
      conversationLoading.value = false
    }
  }
}

const loadMoreConversations = () => {
  loadConversations(mode.value, false, true)
}

const startNewConversation = async (targetMode = mode.value) => {
  if (isLoading.value) return
  cancelRenameConversation()
  if (!chatHistory[targetMode].length) {
    const reusableConversation = findReusableEmptyConversation(targetMode)
    if (reusableConversation) {
      await selectConversation(reusableConversation, targetMode)
      return
    }
  }
  try {
    const response = await createAiConversation({
      mode: targetMode,
      title: '新对话'
    })
    if (response.code !== 200 || !response.data?.id) {
      throw new Error(t('model.generalModeErrorFallback'))
    }
    const conversation = response.data
    conversations[targetMode].unshift(conversation)
    conversationTotals[targetMode] += 1
    setSessionIdForMode(targetMode, conversation.id)
  } catch (error) {
    setSessionIdForMode(targetMode, `${targetMode}-${Date.now()}`)
    ElMessage.warning('已创建本地新对话，发送后会自动保存')
  }
  setMessagesForMode(targetMode, [])
  if (targetMode === 'academic') {
    clearGraph()
  }
  scrollMessagesToBottom()
}

const startRenameConversation = (conversation) => {
  if (!conversation?.id || isLoading.value) return
  renamingConversationId.value = conversation.id
  renamingTitle.value = conversation.title || '新对话'
}

const cancelRenameConversation = () => {
  renamingConversationId.value = ''
  renamingTitle.value = ''
}

const submitRenameConversation = async (conversation) => {
  if (!conversation?.id || isRenamingConversation.value) return
  const title = renamingTitle.value.trim()
  if (!title) {
    ElMessage.warning('标题不能为空')
    return
  }
  isRenamingConversation.value = true
  try {
    const response = await updateAiConversation(conversation.id, { title })
    if (response.code !== 200 || !response.data) {
      throw new Error(t('model.generalModeErrorFallback'))
    }
    const list = conversations[mode.value]
    const index = list.findIndex((item) => item.id === conversation.id)
    if (index !== -1) {
      list.splice(index, 1, response.data)
    }
    cancelRenameConversation()
    ElMessage.success('已重命名')
  } catch (error) {
    ElMessage.error('重命名失败')
  } finally {
    isRenamingConversation.value = false
  }
}

const removeConversation = async (conversation) => {
  if (!conversation?.id || isLoading.value) return
  try {
    await ElMessageBox.confirm(
      '删除后这条历史对话不会再出现在列表中。',
      '删除历史对话',
      {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
  } catch (error) {
    return
  }
  try {
    await deleteAiConversation(conversation.id)
    const list = conversations[mode.value]
    const index = list.findIndex((item) => item.id === conversation.id)
    if (index !== -1) {
      list.splice(index, 1)
    }
    conversationTotals[mode.value] = Math.max(0, conversationTotals[mode.value] - 1)
    if (renamingConversationId.value === conversation.id) {
      cancelRenameConversation()
    }
    if (currentSessionId.value === conversation.id) {
      if (list.length) {
        await selectConversation(list[0])
      } else {
        setSessionIdForMode(mode.value, `${mode.value}-${Date.now()}`)
        setMessagesForMode(mode.value, [])
        clearGraph()
      }
    }
    ElMessage.success('已删除历史对话')
  } catch (error) {
    ElMessage.error('删除历史对话失败')
  }
}

const scrollMessagesToBottom = () => {
  nextTick(() => {
    if (messagesWrapper.value) {
      messagesWrapper.value.scrollTop = messagesWrapper.value.scrollHeight
    }
  })
}

const scheduleMessagesScrollToBottom = () => {
  if (streamScrollTimer) return
  streamScrollTimer = window.setTimeout(() => {
    streamScrollTimer = null
    scrollMessagesToBottom()
  }, 50)
}

const quickQuestions = computed(() => {
  if (mode.value === 'academic') {
    return [
      t('model.academic.q1'),
      t('model.academic.q2'),
      t('model.academic.q3'),
      t('model.academic.q4')
    ]
  }
  return [
    t('model.general.q1'),
    t('model.general.q2'),
    t('model.general.q3'),
    t('model.general.q4')
  ]
})

const extractErrorMessage = (error) => {
  // 不显示后端返回的具体错误，只使用前端的通用错误提示
  return t('model.generalModeErrorFallback')
}

const renderMessage = (raw = '') => {
  if (!raw) return ''
  const escapeHtml = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  const escaped = escapeHtml(raw)
  // 支持 **粗体** 和换行
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>')
}

const renderRichMessage = (raw = '') => {
  if (!raw) return ''
  const escapeHtml = (s) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

  const formatInline = (text = '') =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+?)`/g, '<code>$1</code>')

  const splitTableRow = (line = '') =>
    line
      .trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((cell) => cell.trim())

  const isTableSeparator = (line = '') =>
    /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line)

  const headingMatch = (line = '') => line.match(/^(#{1,4})\s+(.+)$/)
  const isHorizontalRule = (line = '') => /^\s*-{3,}\s*$/.test(line)
  const unorderedListMatch = (line = '') => line.match(/^\s*[-*]\s+(.+)$/)
  const orderedListMatch = (line = '') => line.match(/^\s*\d+\.\s+(.+)$/)

  const renderTable = (lines, start) => {
    const headers = splitTableRow(lines[start])
    const rows = []
    let index = start + 2
    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      rows.push(splitTableRow(lines[index]))
      index += 1
    }

    const headerHtml = headers.map((cell) => `<th>${formatInline(cell)}</th>`).join('')
    const bodyHtml = rows
      .map((row) => {
        const cells = headers.map((_, cellIndex) => `<td>${formatInline(row[cellIndex] || '')}</td>`).join('')
        return `<tr>${cells}</tr>`
      })
      .join('')

    return {
      html: `<div class="markdown-table-wrap"><table class="markdown-table"><thead><tr>${headerHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
      nextIndex: index
    }
  }

  const renderList = (lines, start, ordered = false) => {
    const tag = ordered ? 'ol' : 'ul'
    const items = []
    let index = start
    while (index < lines.length) {
      const match = ordered ? orderedListMatch(lines[index]) : unorderedListMatch(lines[index])
      if (!match) break
      items.push(`<li>${formatInline(match[1])}</li>`)
      index += 1
    }
    return {
      html: `<${tag} class="markdown-list">${items.join('')}</${tag}>`,
      nextIndex: index
    }
  }

  const lines = raw.replace(/\r\n/g, '\n').split('\n')
  const blocks = []
  let textLines = []

  const flushText = () => {
    if (!textLines.length) return
    blocks.push(textLines.map(formatInline).join('<br/>'))
    textLines = []
  }

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].trim()) {
      flushText()
      continue
    }
    if (isHorizontalRule(lines[i])) {
      flushText()
      blocks.push('<hr class="markdown-hr"/>')
      continue
    }
    const heading = headingMatch(lines[i])
    if (heading) {
      flushText()
      const level = Math.min(4, heading[1].length + 2)
      blocks.push(`<h${level} class="markdown-heading">${formatInline(heading[2])}</h${level}>`)
      continue
    }
    if (unorderedListMatch(lines[i])) {
      flushText()
      const list = renderList(lines, i)
      blocks.push(list.html)
      i = list.nextIndex - 1
      continue
    }
    if (orderedListMatch(lines[i])) {
      flushText()
      const list = renderList(lines, i, true)
      blocks.push(list.html)
      i = list.nextIndex - 1
      continue
    }
    if (i + 1 < lines.length && lines[i].includes('|') && isTableSeparator(lines[i + 1])) {
      flushText()
      const table = renderTable(lines, i)
      blocks.push(table.html)
      i = table.nextIndex - 1
      continue
    }
    textLines.push(lines[i])
  }
  flushText()

  return blocks.join('<br/>')
}

const parseReply = (raw) => {
  if (!raw) return { finalText: '', thinking: '' }
  const thinkingMatch = raw.match(/##\s*Thinking\s*([\s\S]*?)(?=##\s*Final Response|$)/i)
  const finalMatch = raw.match(/##\s*Final Response\s*([\s\S]*)/i)
  const thinking = thinkingMatch?.[1]?.trim() || ''
  const finalText = finalMatch?.[1]?.trim() || raw.trim()
  return { finalText, thinking }
}

const buildGeneralPayload = (text) => {
  return {
    sessionId: generalSessionId.value || `general-${Date.now()}`,
    messages: [
      {
        role: 'user',
        content: text
      }
    ]
  }
}

const buildAcademicPayload = () => {
  return {
    sessionId: academicSessionId.value || `academic-${Date.now()}`,
    messages: chatHistory.academic
      .filter((msg) => (msg.type === 'user' || msg.type === 'bot') && !msg.pending)
      .map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
  }
}

const disposeGraph = () => {
  if (graphInstance) {
    graphInstance.dispose()
    graphInstance = null
  }
}

const clearGraphData = () => {
  graphData.value = null
  disposeGraph()
}

const clearGraph = () => {
  graphData.value = null
  csvLink.value = ''
  disposeGraph()
}

const renderGraph = () => {
  if (!graphData.value || !graphData.value.nodes || !graphData.value.nodes.length) {
    clearGraphData()
    return
  }
  nextTick(() => {
    if (!graphContainer.value) return
    if (!graphInstance) {
      graphInstance = echarts.init(graphContainer.value, null, { renderer: 'canvas' })
    }
    const data = graphData.value
    const entityType = graphData.value.entityType || 'other'
    const categories = [
      { name: 'herb', itemStyle: { color: '#2d8659' } },
      { name: resultLabel.value, itemStyle: { color: entityType === 'compound' ? '#f39c12' : '#8c8cff' } }
    ]
    const option = {
      tooltip: { formatter: (p) => p.data?.label || p.name },
      legend: [{ data: categories.map((c) => c.name) }],
      series: [
        {
          type: 'graph',
          layout: 'force',
          roam: true,
          label: { show: true, position: 'right', formatter: '{b}' },
          data: data.nodes.map((n) => {
            const shortLabel = n.label && n.label.length > 30 ? `${n.label.slice(0, 30)}…` : n.label
            return {
              id: n.id,
              name: shortLabel || n.id,
              label: { show: true },
              category: n.type === 'herb' ? 0 : 1,
              draggable: true,
              symbolSize: n.type === 'herb' ? 40 : 26,
              tooltip: { show: true, formatter: n.label || n.id }
            }
          }),
          categories,
          edges: data.edges.map((e) => ({
            source: e.source,
            target: e.target,
            value: e.type || ''
          })),
          force: {
            repulsion: 120,
            gravity: 0.1,
            edgeLength: [60, 120]
          }
        }
      ]
    }
    graphInstance.setOption(option)
  })
}

const applyGraphFromResponse = (data) => {
  csvLink.value = toGatewayAiUrl(data?.csvDownloadUrl || '')
  if (!data?.graph) {
    clearGraphData()
    return
  }
  graphData.value = data.graph
  renderGraph()
}

const findMessageIndex = (history, message) => {
  if (!message) return -1
  return history.findIndex((item) => item === message || (message.streamId && item.streamId === message.streamId))
}

const updateStreamingPlaceholder = (history, placeholder, text) => {
  const idx = findMessageIndex(history, placeholder)
  if (idx === -1) return
  history[idx].text = text
  history[idx].time = formatTime()
}

const createStreamingPlaceholderUpdater = (history, placeholder) => {
  let sourceText = ''
  let visibleText = ''
  let renderTimer = null

  const stop = () => {
    if (renderTimer) {
      window.clearInterval(renderTimer)
      renderTimer = null
    }
  }

  const renderStep = () => {
    const remaining = sourceText.length - visibleText.length
    if (remaining <= 0) {
      stop()
      return
    }
    const step = Math.min(
      STREAM_MAX_CHARS_PER_TICK,
      Math.max(STREAM_MIN_CHARS_PER_TICK, Math.ceil(remaining / 6))
    )
    visibleText = sourceText.slice(0, visibleText.length + step)
    updateStreamingPlaceholder(history, placeholder, visibleText)
    scheduleMessagesScrollToBottom()
  }

  const start = () => {
    if (!renderTimer) {
      renderTimer = window.setInterval(renderStep, STREAM_RENDER_INTERVAL_MS)
    }
  }

  return {
    append(chunk = '') {
      sourceText += chunk
      start()
    },
    flush() {
      stop()
      visibleText = sourceText
      updateStreamingPlaceholder(history, placeholder, visibleText)
      scrollMessagesToBottom()
      return sourceText
    },
    getText() {
      return sourceText
    },
    stop
  }
}

const updateAcademicPlaceholder = (history, placeholder, data = {}, fallbackReply = '') => {
  const { finalText, thinking } = parseReply(data?.reply || fallbackReply)
  const idx = findMessageIndex(history, placeholder)
  if (idx !== -1) {
    history.splice(idx, 1, {
      ...placeholder,
      text: finalText,
      thinking,
      showThinking: false,
      csvExportId: exportIdFromUrl(data?.csvDownloadUrl),
      time: formatTime(),
      pending: false
    })
  }
}

const shouldFallbackToAcademicJson = (error) => {
  if (error?.streamEvent) return false
  if (error?.code === 'STREAM_UNSUPPORTED') return true
  return [404, 405, 501].includes(Number(error?.status || 0))
}

const requestAcademicJsonAnswer = async (payload, history, placeholder) => {
  const response = await aichatWithLlm(payload)
  if (response.code !== 200 || !response.data) {
    throw new Error(t('model.generalModeErrorFallback'))
  }
  updateAcademicPlaceholder(history, placeholder, response.data)
  applyGraphFromResponse(response.data)
  loadConversations('academic')
}

const filenameFromDisposition = (disposition = '') => {
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1])
  }
  const match = disposition.match(/filename="?([^"]+)"?/i)
  return match?.[1] || 'ai-export.csv'
}

const parseBlobError = async (data) => {
  if (!(data instanceof Blob) || !data.type?.includes('application/json')) {
    return null
  }
  try {
    return JSON.parse(await data.text())
  } catch (error) {
    return null
  }
}

const csvDownloadErrorMessage = async (error) => {
  const status = error?.response?.status
  const body = await parseBlobError(error?.response?.data)
  if (status === 404 || body?.code === 'EXPORT_NOT_AVAILABLE') {
    const exportId = exportIdFromUrl(csvLink.value)
    if (exportId) {
      expiredCsvExportIds.add(exportId)
    }
    csvLink.value = ''
    return '完整 CSV 结果已过期或不存在，请重新提问生成。'
  }
  if (status === 401) {
    return '登录状态已失效，请重新登录后再下载。'
  }
  return 'CSV下载失败，请稍后重试。'
}

const downloadCsv = async () => {
  if (!csvLink.value || isDownloadingCsv.value) return
  isDownloadingCsv.value = true
  try {
    const response = await downloadAiExport(csvLink.value)
    const blob = new Blob([response.data], {
      type: response.headers?.['content-type'] || 'text/csv;charset=UTF-8'
    })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filenameFromDisposition(response.headers?.['content-disposition'])
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    ElMessage.error(await csvDownloadErrorMessage(error))
  } finally {
    isDownloadingCsv.value = false
  }
}

onMounted(() => {
  loadConversations(mode.value, true)
})

onBeforeUnmount(() => {
  if (streamScrollTimer) {
    window.clearTimeout(streamScrollTimer)
    streamScrollTimer = null
  }
  clearGraph()
})

const sendMessage = async () => {
  if (!inputText.value.trim()) return

  const text = inputText.value.trim()
  const history = chatHistory[mode.value]
  const currentTime = formatTime()

  history.push({
    type: 'user',
    text,
    time: currentTime
  })
  scrollMessagesToBottom()
  inputText.value = ''

  if (mode.value === 'general') {
    errorMessage.value = ''
    isLoading.value = true
    clearGraph()
    const payload = buildGeneralPayload(text)
    const placeholder = {
      type: 'bot',
      text: t('model.generating'),
      time: currentTime,
      pending: true,
      thinking: '',
      showThinking: false
    }
    history.push(placeholder)
    scrollMessagesToBottom()

    try {
      const response = await chatWithLlm(payload)
      if (response.code !== 200 || !response.data) {
        throw new Error(t('model.generalModeErrorFallback'))
      }
      const { finalText, thinking } = parseReply(response.data.reply)
      const idx = history.indexOf(placeholder)
      if (idx !== -1) {
        history.splice(idx, 1, {
          ...placeholder,
          text: finalText,
          thinking,
          showThinking: false,
          time: formatTime(),
          pending: false
        })
      }
      loadConversations('general')
    } catch (error) {
      const message = extractErrorMessage(error)
      const index = history.indexOf(placeholder)
      if (index !== -1) {
        history.splice(index, 1)
      }
      history.push({
        type: 'bot',
        text: message,
        time: formatTime(),
        isError: true
      })
      errorMessage.value = message
      ElMessage.error(message)
    } finally {
      isLoading.value = false
      scrollMessagesToBottom()
    }
  } else {
    errorMessage.value = ''
    isLoading.value = true
    clearGraph()
    const payload = buildAcademicPayload()
    const placeholder = {
      streamId: `academic-stream-${Date.now()}`,
      type: 'bot',
      text: t('model.generating'),
      time: currentTime,
      pending: true,
      thinking: '',
      showThinking: false
    }
    history.push(placeholder)
    scrollMessagesToBottom()

    let streamedReply = ''
    const streamUpdater = createStreamingPlaceholderUpdater(history, placeholder)
    try {
      const responseData = await aichatWithLlmStream(payload, {
        onDelta: ({ text: chunk = '' } = {}) => {
          if (!chunk) return
          streamUpdater.append(chunk)
          streamedReply = streamUpdater.getText()
        }
      })
      streamedReply = streamUpdater.flush()
      const finalData = responseData || { reply: streamedReply }
      updateAcademicPlaceholder(history, placeholder, finalData, streamedReply)
      applyGraphFromResponse(finalData)
      loadConversations('academic')
    } catch (error) {
      streamedReply = streamUpdater.getText()
      streamUpdater.stop()
      if (!streamedReply && shouldFallbackToAcademicJson(error)) {
        try {
          await requestAcademicJsonAnswer(payload, history, placeholder)
          return
        } catch (fallbackError) {
          error = fallbackError
        }
      }
      const message = extractErrorMessage(error)
      const index = history.indexOf(placeholder)
      if (index !== -1) {
        history.splice(index, 1)
      }
      history.push({
        type: 'bot',
        text: message,
        time: formatTime(),
        isError: true
      })
      errorMessage.value = message
      ElMessage.error(message)
      clearGraph()
    } finally {
      streamUpdater.stop()
      isLoading.value = false
      scrollMessagesToBottom()
    }
  }
}
</script>

<style scoped>
.qa-container {
  background: white;
  border-radius: 16px;
  padding: 28px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  width: 100%;
  min-height: 70vh;
}

.qa-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.qa-header h2 {
  margin: 0;
  color: #1a5f4a;
  display: flex;
  align-items: center;
  gap: 10px;
}

.qa-workspace {
  display: grid;
  grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.qa-main {
  min-width: 0;
}

.history-panel {
  border: 1px solid #dbe7e1;
  border-radius: 12px;
  background: #fbfdfc;
  padding: 12px;
  position: sticky;
  top: 92px;
  max-height: calc(100vh - 120px);
  overflow: hidden;
}

.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.history-header h3 {
  margin: 0;
  color: #1a5f4a;
  font-size: 15px;
}

.history-new-btn {
  border: none;
  border-radius: 8px;
  background: #2d8659;
  color: white;
  padding: 7px 10px;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-new-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.history-state {
  padding: 18px 8px;
  color: #7a8a82;
  font-size: 13px;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: calc(100vh - 178px);
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: 8px;
  padding: 9px 8px;
  color: #33443b;
  cursor: pointer;
  border: 1px solid transparent;
  background: white;
}

.history-item:hover,
.history-item:focus {
  border-color: #c9dfd3;
  outline: none;
}

.history-item.active {
  background: #edf8f2;
  border-color: #2d8659;
}

.history-item-main {
  min-width: 0;
  flex: 1;
}

.history-title {
  display: block;
  color: #1f3d31;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-meta {
  display: block;
  margin-top: 3px;
  color: #7a8a82;
  font-size: 11px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.history-rename {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 26px 26px;
  gap: 4px;
  align-items: center;
}

.history-rename-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #bdd8cb;
  border-radius: 6px;
  padding: 5px 7px;
  color: #1f3d31;
  font-size: 12px;
  outline: none;
}

.history-rename-input:focus {
  border-color: #2d8659;
  box-shadow: 0 0 0 2px rgba(45, 134, 89, 0.1);
}

.history-icon-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #8aa096;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.history-icon-btn:hover:not(:disabled) {
  background: #edf8f2;
  color: #1a5f4a;
}

.history-delete-btn:hover:not(:disabled) {
  background: #fff0f0;
  color: #b42318;
}

.history-icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.history-more-btn {
  width: 100%;
  border: 1px dashed #bdd8cb;
  border-radius: 8px;
  background: #fbfdfc;
  color: #2d8659;
  padding: 8px;
  font-size: 12px;
  cursor: pointer;
}

.history-more-btn:hover:not(:disabled) {
  background: #edf8f2;
}

.history-more-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.header-icon {
  font-size: 28px;
}

.mode-selector {
  display: flex;
  gap: 10px;
}

.mode-btn {
  padding: 10px 20px;
  border: 2px solid #2d8659;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #2d8659;
  display: flex;
  align-items: center;
  gap: 6px;
}

.mode-btn:hover {
  background: #f0f9f5;
}

.mode-btn.active {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  border-color: transparent;
}

.mode-description {
  background: #f0f9f5;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.mode-description p {
  margin: 0;
  color: #333;
  line-height: 1.6;
}

.error-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #f8b4b4;
  background: #fff5f5;
  color: #b42318;
  margin-bottom: 16px;
}

.chat-area {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 20px;
}

.messages {
  max-height: 65vh;
  overflow-y: auto;
  padding: 20px;
  background: #fafafa;
}

.welcome-message {
  text-align: center;
  padding: 60px 20px;
  color: #666;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #f3f9ff;
  color: #1a5f4a;
  font-size: 13px;
  border-top: 1px solid #e0e0e0;
}

.welcome-message h3 {
  color: #2d8659;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
  color: white;
}

.message-avatar .el-icon {
  font-size: 22px;
}

.assistant-avatar-img {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 50%;
  object-fit: cover;
}

.message.user .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-content {
  max-width: 70%;
}

.message.user .message-content {
  text-align: right;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.message-text :deep(code) {
  padding: 2px 5px;
  border-radius: 4px;
  background: #f1f5f3;
  color: #1a5f4a;
  font-family: Consolas, Monaco, monospace;
  font-size: 0.92em;
}

.message-text :deep(.markdown-heading) {
  margin: 14px 0 8px;
  color: #1a5f4a;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.message-text :deep(.markdown-hr) {
  border: none;
  border-top: 1px solid #e0ebe5;
  margin: 14px 0;
}

.message-text :deep(.markdown-list) {
  margin: 8px 0 10px 18px;
  padding: 0;
}

.message-text :deep(.markdown-list li) {
  margin: 4px 0;
  padding-left: 2px;
}

.message-text :deep(.markdown-table-wrap) {
  max-width: 100%;
  overflow-x: auto;
  margin: 12px 0;
  border: 1px solid #dbe7e1;
  border-radius: 8px;
}

.message-text :deep(.markdown-table) {
  width: 100%;
  border-collapse: collapse;
  background: white;
  font-size: 13px;
  line-height: 1.5;
}

.message-text :deep(.markdown-table th),
.message-text :deep(.markdown-table td) {
  padding: 8px 10px;
  border-bottom: 1px solid #e7eee9;
  text-align: left;
  vertical-align: top;
  white-space: normal;
  word-break: break-word;
}

.message-text :deep(.markdown-table th) {
  background: #eef8f3;
  color: #1a5f4a;
  font-weight: 600;
}

.message-text :deep(.markdown-table tr:last-child td) {
  border-bottom: none;
}

.message.user .message-text {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
}

.thinking-block {
  margin-bottom: 8px;
  background: #f7f9fb;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  padding: 8px 10px;
}

.thinking-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #1a5f4a;
  margin-bottom: 6px;
  cursor: pointer;
}

.thinking-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #1a5f4a;
  display: inline-block;
}

.thinking-title {
  font-weight: 600;
}

.thinking-text {
  font-size: 13px;
  color: #4a5568;
  line-height: 1.5;
  white-space: pre-wrap;
}

.thinking-toggle {
  margin-left: auto;
  font-size: 12px;
  color: #2d8659;
}

.message.pending .message-text {
  background: #f0f4ff;
  color: #4a5568;
}

.message.error .message-text {
  background: #ffecec;
  color: #b42318;
}

.message-time {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.input-area {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: white;
  border-top: 2px solid #e0e0e0;
}

.result-actions {
  display: flex;
  justify-content: flex-end;
  padding: 10px 15px 12px;
  background: #fafafa;
  border-top: 1px solid #e8eee9;
}

.qa-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.qa-input:focus {
  outline: none;
  border-color: #2d8659;
  box-shadow: 0 0 0 3px rgba(45, 134, 89, 0.1);
}

.send-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(45, 134, 89, 0.3);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-questions {
  margin-top: 20px;
}

.quick-questions h4 {
  color: #1a5f4a;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.question-tag {
  padding: 8px 16px;
  background: #f0f9f5;
  border: 1px solid #2d8659;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  color: #2d8659;
}

.question-tag:hover {
  background: #2d8659;
  color: white;
  transform: translateY(-2px);
}

.graph-panel {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  background: #f9fbff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  gap: 10px;
}

.graph-title {
  font-weight: 600;
  color: #1a5f4a;
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.graph-title small {
  color: #666;
  font-weight: 400;
}

.download-btn {
  border: none;
  padding: 8px 12px;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  color: white;
  border-radius: 8px;
  font-size: 13px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.download-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.download-btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.graph-canvas {
  width: 100%;
  height: 420px;
}

.graph-hint {
  margin-top: 8px;
  color: #666;
  font-size: 12px;
}

@media (max-width: 900px) {
  .qa-workspace {
    grid-template-columns: 1fr;
  }

  .history-panel {
    position: static;
    max-height: none;
  }

  .history-list {
    max-height: 220px;
  }
}
</style>
