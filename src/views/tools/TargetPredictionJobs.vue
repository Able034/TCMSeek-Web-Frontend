<template>
  <div class="job-center">
    <div class="page-header">
      <div>
        <h2>{{ t('targetPrediction.jobs.title') }}</h2>
        <p>{{ t('targetPrediction.jobs.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" plain @click="loadJobs" :loading="jobsLoading">
          {{ t('targetPrediction.jobs.refresh') }}
        </el-button>
      </div>
    </div>

    <el-card v-if="!isLoggedIn" class="login-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <span>{{ t('targetPrediction.login.title') }}</span>
        </div>
      </template>
      <el-form label-position="top" @submit.prevent>
        <el-form-item :label="t('targetPrediction.login.usernameLabel')">
          <el-input v-model="loginForm.userName" :placeholder="t('targetPrediction.login.usernamePlaceholder')" />
        </el-form-item>
        <p class="login-hint">{{ t('targetPrediction.login.hint') }}</p>
        <el-button type="primary" :loading="loginLoading" @click="handleLogin">
          {{ t('targetPrediction.login.button') }}
        </el-button>
      </el-form>
    </el-card>

    <template v-if="isLoggedIn">

    <el-card shadow="hover" class="jobs-card">
      <el-table v-loading="jobsLoading" :data="jobs" border stripe style="width: 100%" height="420">
        <el-table-column type="index" :label="t('targetPrediction.jobs.columns.index')" width="70" />
        <el-table-column prop="requestId" :label="t('targetPrediction.jobs.columns.jobId')" width="110" />
        <el-table-column prop="moduleName" :label="t('targetPrediction.jobs.columns.moduleName')" min-width="200" />
        <el-table-column :label="t('targetPrediction.jobs.columns.status')" width="120">
          <template #default="{ row }">
            <el-tag :type="statusType(row.status)" size="small">
              {{ formatStatus(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="t('targetPrediction.jobs.columns.progress')" min-width="200">
          <template #default="{ row }">{{ row.lastMessage || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" :label="t('targetPrediction.jobs.columns.createdAt')" min-width="160" />
        <el-table-column prop="updatedAt" :label="t('targetPrediction.jobs.columns.updatedAt')" min-width="160" />
        <el-table-column :label="t('targetPrediction.jobs.columns.actions')" width="220">
          <template #default="{ row }">
            <el-button size="small" link @click="viewJob(row)">
              {{ t('targetPrediction.jobs.actions.view') }}
            </el-button>
            <el-button size="small" link type="primary" :disabled="!isJobFinished(row)" @click="pullJobResult(row)">
              {{ t('targetPrediction.jobs.actions.fetchResult') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty
        v-if="!jobsLoading && !jobs.length"
        :description="t('targetPrediction.jobs.empty')"
        :image-size="80"
      />
    </el-card>

    <el-card v-if="selectedJob" shadow="hover" class="detail-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('targetPrediction.jobs.detailTitle') }} #{{ selectedJob.requestId }}</span>
          <el-tag size="small" :type="statusType(selectedJob.status)">{{ formatStatus(selectedJob.status) }}</el-tag>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :md="12">
          <ul class="info-list">
            <li><strong>{{ t('targetPrediction.jobs.detail.wemolJobId') }}:</strong>{{ selectedJob.wemolJobId }}</li>
            <li><strong>{{ t('targetPrediction.jobs.detail.createdAt') }}:</strong>{{ selectedJob.createdAt }}</li>
            <li><strong>{{ t('targetPrediction.jobs.detail.updatedAt') }}:</strong>{{ selectedJob.updatedAt }}</li>
            <li>
              <strong>{{ t('targetPrediction.jobs.detail.uploadedFile') }}:</strong>{{ selectedJob.uploadedFileName || '-' }}
            </li>
            <li><strong>{{ t('targetPrediction.jobs.detail.params') }}:</strong>{{ formatParams(selectedJob.params) }}</li>
            <li v-if="selectedJob.lastMessage">
              <strong>{{ t('targetPrediction.jobs.detail.lastMessage') }}:</strong>{{ selectedJob.lastMessage }}
            </li>
          </ul>
        </el-col>
        <el-col :md="12">
          <div class="section-title">{{ t('targetPrediction.jobs.detail.filesTitle') }}</div>
          <el-table
            :data="selectedJob.resultFiles || []"
            border
            stripe
            max-height="220"
            v-if="selectedJob.resultFiles?.length"
          >
            <el-table-column prop="name" :label="t('targetPrediction.result.fileName')" min-width="220" />
            <el-table-column :label="t('targetPrediction.result.fileSize')" width="120">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column :label="t('targetPrediction.result.actionsLabel')" width="140">
              <template #default="{ row }">
                <el-button size="small" link type="primary" @click="downloadFile(row)">
                  {{ t('targetPrediction.result.download') }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else :description="t('targetPrediction.jobs.detail.filesEmpty')" :image-size="60" />
        </el-col>
      </el-row>
      <el-divider />
      <div class="section-title">{{ t('targetPrediction.result.predictedTitle') }}</div>
      <el-table
        v-if="selectedJob.predictedTargets?.length"
        :data="selectedJob.predictedTargets"
        border
        stripe
        height="320"
      >
        <el-table-column type="index" :label="t('targetPrediction.result.index')" width="70" />
        <el-table-column prop="mol_id" :label="t('targetPrediction.result.columns.molId')" width="120" />
        <el-table-column prop="smiles" :label="t('targetPrediction.result.columns.smiles')" min-width="200" />
        <el-table-column prop="rank" :label="t('targetPrediction.result.columns.rank')" width="80" />
        <el-table-column prop="pref_name" :label="t('targetPrediction.result.columns.prefName')" min-width="150" />
        <el-table-column prop="accession" :label="t('targetPrediction.result.columns.accession')" width="130" />
        <el-table-column prop="organism" :label="t('targetPrediction.result.columns.organism')" width="120" />
        <el-table-column prop="target_type" :label="t('targetPrediction.result.columns.targetType')" width="140" />
        <el-table-column prop="similarity" :label="t('targetPrediction.result.columns.maxSimilarity')" width="130" />
        <el-table-column prop="max_activity" :label="t('targetPrediction.result.columns.maxActivity')" width="150" />
        <el-table-column prop="overall" :label="t('targetPrediction.result.columns.overall')" width="120" />
        <el-table-column prop="sim_ligands_cnt" :label="t('targetPrediction.result.columns.simLigandsCnt')" width="150" />
        <el-table-column prop="chembl_id" :label="t('targetPrediction.result.columns.chemblId')" width="130" />
        <el-table-column prop="overlay_sdf" :label="t('targetPrediction.result.columns.overlaySdf')" min-width="160" />
      </el-table>
      <el-empty v-else :description="t('targetPrediction.result.predictedEmpty')" :image-size="60" />
    </el-card>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  fetchTargetPredictionJobs,
  fetchTargetPredictionJob,
  fetchTargetPredictionJobResult,
  downloadTargetPredictionFile,
  loginTargetPrediction
} from '@/api/targetPrediction'

const { t } = useI18n()

const FINISHED_STATES = ['done', 'abort', 'cancel', 'failed']
const STATUS_LABEL_MAP = {
  creating: 'targetPrediction.statusLabels.creating',
  pending: 'targetPrediction.statusLabels.pending',
  doing: 'targetPrediction.statusLabels.doing',
  done: 'targetPrediction.statusLabels.done',
  failed: 'targetPrediction.statusLabels.failed',
  abort: 'targetPrediction.statusLabels.abort',
  cancel: 'targetPrediction.statusLabels.cancel'
}

let loginAccount = ''
try {
  const savedLoginUser = JSON.parse(localStorage.getItem('loginUser') || 'null')
  loginAccount =
    savedLoginUser?.account || savedLoginUser?.username || savedLoginUser?.userName || ''
} catch (error) {}

const storedWemolUser = localStorage.getItem('wemolUserName') || ''
const wemolUserName = ref(storedWemolUser)
const loginForm = reactive({ userName: storedWemolUser || loginAccount })
const loginLoading = ref(false)

const jobs = ref([])
const jobsLoading = ref(false)
const selectedJob = ref(null)

const isLoggedIn = computed(() => !!wemolUserName.value)

onMounted(() => {
  if (isLoggedIn.value) {
    loadJobs()
  }
})

function handleLogin() {
  const user = (loginForm.userName || '').trim()
  if (!user) {
    ElMessage.warning(t('targetPrediction.messages.loginUsernameRequired'))
    return
  }
  loginLoading.value = true
  loginTargetPrediction(user)
    .then(() => {
      ElMessage.success(t('targetPrediction.messages.loginSuccess'))
      applyLoggedInUser(user)
      loadJobs()
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.loginFailed')))
    })
    .finally(() => {
      loginLoading.value = false
    })
}

function applyLoggedInUser(user) {
  const normalized = user.trim()
  wemolUserName.value = normalized
  loginForm.userName = normalized
  localStorage.setItem('wemolUserName', normalized)
  selectedJob.value = null
  jobs.value = []
}

function ensureLoggedIn(showWarning = true) {
  if (!wemolUserName.value) {
    if (showWarning) {
      ElMessage.warning(t('targetPrediction.messages.loginRequired'))
    }
    return false
  }
  return true
}

function loadJobs() {
  if (!ensureLoggedIn(false)) {
    return
  }
  jobsLoading.value = true
  fetchTargetPredictionJobs(wemolUserName.value)
    .then((resp) => {
      jobs.value = resp || []
      if (!jobs.value.length) {
        selectedJob.value = null
      }
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.jobs.messages.listError')))
    })
    .finally(() => {
      jobsLoading.value = false
    })
}

function viewJob(job) {
  if (!ensureLoggedIn()) {
    return
  }
  fetchTargetPredictionJob(job.requestId, wemolUserName.value)
    .then((resp) => {
      selectedJob.value = resp
      mergeJob(resp)
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.jobs.messages.jobQueryFailed')))
    })
}

function pullJobResult(job) {
  if (!ensureLoggedIn()) {
    return
  }
  fetchTargetPredictionJobResult(job.requestId, wemolUserName.value)
    .then((resp) => {
      selectedJob.value = resp
      mergeJob(resp)
      ElMessage.success(t('targetPrediction.jobs.messages.resultPulled'))
    })
    .catch((error) => {
      const fallback = `${t('targetPrediction.jobs.messages.resultPullFailed')}: ${
        error?.response?.data?.msg || t('targetPrediction.messages.jobNotFinished')
      }`
      ElMessage.error(getErrorMessage(error, fallback))
    })
}

function downloadFile(file) {
  if (!ensureLoggedIn() || !selectedJob.value) return
  downloadTargetPredictionFile(selectedJob.value.requestId, file.relativePath, wemolUserName.value)
    .then((blob) => {
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', file.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.jobs.messages.downloadFailed')))
    })
}

function mergeJob(jobData) {
  const idx = jobs.value.findIndex((item) => item.requestId === jobData.requestId)
  if (idx !== -1) {
    jobs.value[idx] = { ...jobs.value[idx], ...jobData }
  }
}

function formatParams(params) {
  if (!params) return '-'
  return Object.entries(params)
    .map(([key, value]) => `${key}: ${value}`)
    .join('; ')
}

function formatSize(size) {
  if (size === undefined || size === null) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  return `${(size / 1024 / 1024).toFixed(2)} MB`
}

function isJobFinished(job) {
  if (!job?.status) return false
  return FINISHED_STATES.includes(job.status.toLowerCase())
}

function statusType(status) {
  if (!status) return 'info'
  const normalized = status.toLowerCase()
  if (normalized === 'done') return 'success'
  if (normalized === 'abort' || normalized === 'failed' || normalized === 'cancel') return 'danger'
  if (normalized === 'doing') return 'primary'
  return 'info'
}

function formatStatus(status) {
  if (!status) {
    return t('targetPrediction.statusLabels.creating')
  }
  const key = STATUS_LABEL_MAP[status.toLowerCase()]
  return key ? t(key) : status
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.msg || error?.message || fallback
}
</script>

<style scoped>
.job-center {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.jobs-card,
.detail-card,
.login-card {
  margin-bottom: 20px;
}

.login-hint {
  font-size: 12px;
  color: #888;
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  margin-bottom: 6px;
  color: #333;
}

.section-title {
  font-weight: 600;
  margin: 10px 0;
}
</style>
