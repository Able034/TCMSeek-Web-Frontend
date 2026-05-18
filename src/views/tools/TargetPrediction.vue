<template>
  <div class="target-prediction">
    <el-dialog
      v-model="resultLoading"
      :title="t('targetPrediction.loading.title')"
      width="360px"
      :show-close="false"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="loading-dialog"
    >
      <div class="loading-dialog__content">
        <el-icon class="loading-icon" :size="28"><Loading /></el-icon>
        <div>{{ t('targetPrediction.loading.message') }}</div>
      </div>
    </el-dialog>

    <div class="page-header">
      <div>
        <h2>{{ t('targetPrediction.title') }}</h2>
        <p>{{ t('targetPrediction.subtitle') }}</p>
      </div>
      <el-button type="primary" plain @click="loadModuleProfile" :loading="moduleLoading">
        {{ t('targetPrediction.actions.refresh') }}
      </el-button>
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
      <el-row :gutter="20">
        <el-col :xl="8" :lg="9" :md="24">
          <el-card class="module-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <span>{{ t('targetPrediction.module.title') }}</span>
                <el-link v-if="moduleDocUrl" :href="moduleDocUrl" target="_blank" type="primary">
                  {{ t('targetPrediction.module.viewDoc') }}
                </el-link>
              </div>
            </template>
            <div v-if="moduleProfile">
              <p class="module-name">{{ moduleProfile.config?.moduleName }}</p>
              <p class="module-desc">{{ moduleProfile.config?.description }}</p>
              <ul class="info-list">
                <li><strong>{{ t('targetPrediction.module.moduleId') }}：</strong>{{ moduleProfile.config?.moduleId }}</li>
                <li><strong>{{ t('targetPrediction.module.wemolName') }}：</strong>{{ moduleProfile.module?.Name || moduleProfile.module?.name }}</li>
                <li><strong>{{ t('targetPrediction.module.lastUpdated') }}：</strong>{{ moduleProfile.config?.lastUpdated }}</li>
              </ul>
              <el-divider />
              <div class="section-title">{{ t('targetPrediction.module.parameterTitle') }}</div>
              <div v-for="section in moduleProfile.config?.inputSections || []" :key="section.title" class="field-section">
                <h4>{{ section.title }}</h4>
                <ul>
                  <li v-for="field in section.fields" :key="field.key">
                    <strong>{{ field.label }}：</strong>{{ field.description }}
                  </li>
                </ul>
              </div>
            </div>
            <el-empty v-else :description="t('targetPrediction.module.loading')" :image-size="80" />
          </el-card>
        </el-col>

        <el-col :xl="8" :lg="8" :md="24">
          <el-card shadow="hover" class="form-card">
            <template #header>
              <div class="card-header">
                <span>{{ t('targetPrediction.form.title') }}</span>
              </div>
            </template>
            <el-form label-position="top" @submit.prevent>
              <el-form-item :label="t('targetPrediction.form.sdfFile')" required>
                <el-upload
                  drag
                  action=""
                  :auto-upload="false"
                  :limit="1"
                  :file-list="fileList"
                  accept=".sdf"
                  :on-change="handleFileChange"
                  :on-remove="handleFileRemove"
                >
                  <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
                  <div class="el-upload__text" v-html="t('targetPrediction.form.dragText')"></div>
                </el-upload>
              </el-form-item>
              <el-form-item :label="t('targetPrediction.form.referenceDatabase')">
                <el-radio-group v-model="form.referenceDatabase">
                  <el-radio label="pdb">pdb</el-radio>
                  <el-radio label="chembl29">chembl29</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item :label="t('targetPrediction.form.queryConformations')">
                <el-input-number v-model="form.queryConformations" :min="1" :max="32" />
              </el-form-item>
              <el-form-item :label="t('targetPrediction.form.similarityThreshold')">
                <el-input-number v-model="form.similarityThreshold" :min="0" :max="1" :step="0.1" />
              </el-form-item>
              <el-form-item :label="t('targetPrediction.form.activityThreshold')">
                <el-input-number v-model="form.activityThreshold" :min="0" :max="100000" :step="100" />
              </el-form-item>
              <el-form-item :label="t('targetPrediction.form.ranking')">
                <el-radio-group v-model="form.ranking">
                  <el-radio label="similarity">similarity</el-radio>
                  <el-radio label="overall">overall</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-button type="primary" class="w-100" :loading="submitLoading" @click="handleSubmit">
                {{ t('targetPrediction.actions.submit') }}
              </el-button>
            </el-form>
          </el-card>
        </el-col>

        <el-col :xl="8" :lg="7" :md="24">
          <el-card shadow="hover" class="status-card">
            <template #header>
              <div class="card-header">
                <span>{{ t('targetPrediction.status.title') }}</span>
                <el-tag v-if="currentJob?.status" size="small" :type="statusType(currentJob.status)">
                  {{ formatStatus(currentJob.status) }}
                </el-tag>
              </div>
            </template>
            <div v-if="currentJob">
              <p><strong>{{ t('targetPrediction.status.jobId') }}：</strong>{{ currentJob.requestId }}</p>
              <p><strong>{{ t('targetPrediction.status.wemolId') }}：</strong>{{ currentJob.wemolJobId }}</p>
              <p><strong>{{ t('targetPrediction.status.uploadedFileName') }}：</strong>{{ currentJob.uploadedFileName || '-' }}</p>
              <p><strong>{{ t('targetPrediction.status.params') }}：</strong>{{ formatParams(currentJob.params) }}</p>
              <el-alert
                v-if="jobStatusMessage"
                :title="jobStatusMessage"
                :type="statusAlertType"
                :closable="false"
                show-icon
                class="status-alert"
              />
              <ul class="status-meta">
                <li><strong>{{ t('targetPrediction.status.createdAt') }}：</strong>{{ currentJob.createdAt || '-' }}</li>
                <li><strong>{{ t('targetPrediction.status.updatedAt') }}：</strong>{{ currentJob.updatedAt || '-' }}</li>
              </ul>
              <p class="status-hint">{{ t('targetPrediction.status.autoRefreshHint') }}</p>
              <div class="status-actions">
                <el-button size="small" :loading="polling" @click="checkJobStatus(true)">
                  {{ t('targetPrediction.actions.refreshStatus') }}
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  plain
                  :disabled="!canFetchResult"
                  :loading="resultLoading"
                  @click="fetchJobResultData(true)"
                >
                  {{ t('targetPrediction.actions.fetchResult') }}
                </el-button>
              </div>
            </div>
            <el-empty v-else :description="t('targetPrediction.status.empty')" :image-size="80" />
          </el-card>
        </el-col>
      </el-row>

      <div class="result-wrapper">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ t('targetPrediction.result.title') }}</span>
              <el-tag
                v-if="currentJob?.status"
                size="small"
                :type="statusType(currentJob.status)"
                class="card-tag"
              >
                {{ formatStatus(currentJob.status) }}
              </el-tag>
            </div>
          </template>

          <template v-if="currentJob">
            <div v-if="resultLoading" class="result-loading">
              <el-skeleton :rows="6" animated />
            </div>
            <template v-else>
              <div v-if="hasResultData" class="result-sections">
                <div class="result-section">
                  <div class="section-header">
                    <h4>{{ t('targetPrediction.result.filesTitle') }}</h4>
                    <span>{{ t('targetPrediction.result.filesTip') }}</span>
                  </div>
                  <el-table :data="resultFiles" border stripe max-height="580" v-if="resultFiles.length">
                    <el-table-column prop="name" :label="t('targetPrediction.result.fileName')" width="220" />
                    <el-table-column :label="t('targetPrediction.result.fileSize')" width="140">
                      <template #default="{ row }">{{ formatSize(row.size) }}</template>
                    </el-table-column>
                    <el-table-column
                      v-if="currentJob?.requestId"
                      :label="t('targetPrediction.result.structure')"
                      min-width="440"
                    >
                      <template #default="{ row }">
                        <StructurePreview
                          v-if="isStructureFile(row.name)"
                          :request-id="currentJob.requestId"
                          :relative-path="row.relativePath"
                          :wemol-user-name="wemolUserName"
                          :width="2000"
                          :height="300"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column :label="t('targetPrediction.result.actionsLabel')" width="160">
                      <template #default="{ row }">
                        <el-button size="small" link type="primary" @click="downloadFile(row)">
                          {{ t('targetPrediction.result.download') }}
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-else :description="t('targetPrediction.result.filesEmpty')" :image-size="60" />
                </div>

                <div class="result-section">
                  <div class="section-header">
                    <h4>{{ t('targetPrediction.result.predictedTitle') }}</h4>
                    <span>{{ t('targetPrediction.result.predictedTip') }}</span>
                  </div>
                  <el-table v-if="predictedTargets.length" :data="predictedTargets" border stripe height="360">
                    <el-table-column :label="t('targetPrediction.result.structure')" width="140">
                      <template #default="{ row }">
                        <StructurePreview
                          v-if="row.overlay_sdf && currentJob?.requestId && wemolUserName"
                          :request-id="currentJob.requestId"
                          :relative-path="row.overlay_sdf"
                          :wemol-user-name="wemolUserName"
                          :width="80"
                          :height="80"
                        />
                      </template>
                    </el-table-column>
                    <el-table-column type="index" :label="t('targetPrediction.result.index')" width="70" />
                    <el-table-column prop="mol_id" :label="t('targetPrediction.result.columns.molId')" width="110" />
                    <el-table-column prop="smiles" :label="t('targetPrediction.result.columns.smiles')" min-width="220" />
                    <el-table-column prop="rank" :label="t('targetPrediction.result.columns.rank')" width="80" />
                    <el-table-column prop="pdb_code" :label="t('targetPrediction.result.columns.pdbCode')" min-width="150" />
                    <el-table-column prop="uniprot_id" :label="t('targetPrediction.result.columns.uniprotId')" width="150" />
                    <el-table-column prop="protein_name" :label="t('targetPrediction.result.columns.proteinName')" min-width="200" />
                    <el-table-column :label="t('targetPrediction.result.columns.maxSimilarity')" width="140">
                      <template #default="{ row }">
                        {{ row['max_similarity'] ?? row.similarity ?? '-' }}
                      </template>
                    </el-table-column>
                  </el-table>
                  <el-empty v-else :description="t('targetPrediction.result.predictedEmpty')" :image-size="60" />
                </div>

                <div class="result-section">
                  <div class="section-header">
                    <h4>{{ t('targetPrediction.result.detailTitle') }}</h4>
                    <span>{{ t('targetPrediction.result.detailTip') }}</span>
                  </div>
                  <el-table v-if="detailRecords.length" :data="detailRecords" border stripe height="360">
                    <el-table-column type="index" :label="t('targetPrediction.result.index')" width="70" />
                    <el-table-column
                      prop="ligand_name"
                      :label="t('targetPrediction.result.detailColumns.ligandName')"
                      min-width="140"
                    />
                    <el-table-column prop="mol_id" :label="t('targetPrediction.result.detailColumns.molId')" width="110" />
                    <el-table-column
                      prop="similarity"
                      :label="t('targetPrediction.result.detailColumns.similarity')"
                      width="120"
                    />
                    <el-table-column prop="pdb_code" :label="t('targetPrediction.result.detailColumns.pdbCode')" width="120" />
                    <el-table-column
                      prop="release_year"
                      :label="t('targetPrediction.result.detailColumns.releaseYear')"
                      width="120"
                    />
                    <el-table-column
                      prop="uniprot_id"
                      :label="t('targetPrediction.result.detailColumns.uniprotId')"
                      width="140"
                    />
                    <el-table-column
                      prop="protein_name"
                      :label="t('targetPrediction.result.detailColumns.proteinName')"
                      min-width="180"
                    />
                    <el-table-column
                      prop="activity_type"
                      :label="t('targetPrediction.result.detailColumns.activityType')"
                      width="150"
                    />
                    <el-table-column :label="t('targetPrediction.result.detailColumns.activityNm')" width="140">
                      <template #default="{ row }">
                        {{ row['activity(nM)'] ?? row.activity_nM ?? '-' }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="overall" :label="t('targetPrediction.result.detailColumns.overall')" width="120" />
                  </el-table>
                  <el-empty v-else :description="t('targetPrediction.result.detailEmpty')" :image-size="60" />
                </div>
              </div>
              <el-empty v-else :description="resultEmptyDescription" :image-size="80" />
            </template>
          </template>
          <el-empty v-else :description="t('targetPrediction.result.placeholder')" :image-size="80" />
        </el-card>
      </div>
    </template>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { UploadFilled, Loading } from '@element-plus/icons-vue'
import {
  fetchTargetPredictionModule,
  submitTargetPredictionJob,
  fetchTargetPredictionJob,
  fetchTargetPredictionJobResult,
  downloadTargetPredictionFile,
  loginTargetPrediction
} from '@/api/targetPrediction'
import StructurePreview from '@/components/StructurePreview.vue'

const { t } = useI18n()

const FINISHED_STATES = ['done', 'completed', 'abort', 'cancel', 'failed']
const STATUS_LABEL_MAP = {
  creating: 'targetPrediction.statusLabels.creating',
  pending: 'targetPrediction.statusLabels.pending',
  doing: 'targetPrediction.statusLabels.doing',
  completed: 'targetPrediction.statusLabels.done',
  done: 'targetPrediction.statusLabels.done',
  failed: 'targetPrediction.statusLabels.failed',
  abort: 'targetPrediction.statusLabels.abort',
  cancel: 'targetPrediction.statusLabels.cancel'
}
const POLLING_INTERVAL = 10000

let loginAccount = ''
try {
  const savedLoginUser = JSON.parse(localStorage.getItem('loginUser') || 'null')
  loginAccount =
    savedLoginUser?.account || savedLoginUser?.username || savedLoginUser?.userName || ''
} catch (error) {
  // ignore parse error
}

const storedWemolUser = localStorage.getItem('wemolUserName') || ''
const wemolUserName = ref(storedWemolUser)
const loginForm = reactive({ userName: storedWemolUser || loginAccount })
const loginLoading = ref(false)

const moduleProfile = ref(null)
const moduleLoading = ref(false)
const submitLoading = ref(false)
const fileList = ref([])
const uploadFile = ref(null)
const currentJob = ref(null)
const predictedTargets = ref([])
const detailRecords = ref([])
const resultFiles = ref([])
const polling = ref(false)
const resultLoadingState = ref(false)
const hasFetchedResult = ref(false)
const pollingTimer = ref(null)

const resultLoading = computed({
  get: () => resultLoadingState.value,
  set: (val) => {
    resultLoadingState.value = val
  }
})

const isLoggedIn = computed(() => !!wemolUserName.value)
const moduleDocUrl = computed(() => moduleProfile.value?.config?.docUrl)
const canFetchResult = computed(() => {
  const status = (currentJob.value?.status || '').toLowerCase()
  return status === 'done' || status === 'completed'
})
const jobStatusMessage = computed(
  () => currentJob.value?.lastMessage || t('targetPrediction.messages.waiting')
)
const hasResultData = computed(
  () => predictedTargets.value.length || detailRecords.value.length || resultFiles.value.length
)
const jobFinished = computed(() => FINISHED_STATES.includes((currentJob.value?.status || '').toLowerCase()))
const resultEmptyDescription = computed(() => {
  if (!currentJob.value) return t('targetPrediction.result.noJob')
  if (!jobFinished.value) return t('targetPrediction.result.waiting')
  if (canFetchResult.value && hasFetchedResult.value) {
    return t('targetPrediction.result.fetchAgain')
  }
  if (!canFetchResult.value && jobFinished.value) {
    return t('targetPrediction.result.jobFailed')
  }
  return t('targetPrediction.result.placeholder')
})
const statusAlertType = computed(() => {
  if (!currentJob.value?.status) return 'info'
  const normalized = currentJob.value.status.toLowerCase()
  if (normalized === 'done') return 'success'
  if (normalized === 'abort' || normalized === 'failed' || normalized === 'cancel') return 'error'
  return 'info'
})

const form = reactive({
  moduleId: null,
  referenceDatabase: 'chembl29',
  queryConformations: 16,
  similarityThreshold: 0.5,
  activityThreshold: 10000,
  ranking: 'similarity'
})

onMounted(() => {
  if (isLoggedIn.value) {
    loadModuleProfile()
  }
})

onUnmounted(() => {
  stopPolling()
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
      loadModuleProfile()
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
  currentJob.value = null
  resetResultData()
  stopPolling()
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

function handleFileChange(uploadFileObj, uploadFiles) {
  uploadFile.value = uploadFileObj.raw
  fileList.value = uploadFiles.slice(-1)
}

function handleFileRemove() {
  uploadFile.value = null
  fileList.value = []
}

function loadModuleProfile() {
  if (!ensureLoggedIn(false)) {
    return
  }
  moduleLoading.value = true
  fetchTargetPredictionModule(wemolUserName.value)
    .then((resp) => {
      moduleProfile.value = resp
      form.moduleId = resp.config?.moduleId || resp.module?.Id
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.moduleError')))
      if (!moduleProfile.value) {
        moduleProfile.value = {
          config: {
            moduleName: '3DSTarPred (Target Prediction)',
            description: t('targetPrediction.module.defaultDescription'),
            moduleId: 310
          }
        }
      }
    })
    .finally(() => {
      moduleLoading.value = false
    })
}

function handleSubmit() {
  if (!ensureLoggedIn()) {
    return
  }
  if (!uploadFile.value) {
    ElMessage.warning(t('targetPrediction.messages.uploadRequired'))
    return
  }
  submitLoading.value = true
  const payload = new FormData()
  payload.append('sdfFile', uploadFile.value)
  payload.append('referenceDatabase', form.referenceDatabase)
  payload.append('queryConformations', String(form.queryConformations))
  payload.append('similarityThreshold', String(form.similarityThreshold))
  payload.append('activityThreshold', String(form.activityThreshold))
  payload.append('ranking', form.ranking)

  submitTargetPredictionJob(payload, wemolUserName.value)
    .then((resp) => {
      ElMessage.success(t('targetPrediction.messages.submitSuccess', { id: resp.wemolJobId }))
      uploadFile.value = null
      fileList.value = []
      currentJob.value = { ...resp, wemolUserName: wemolUserName.value }
      resetResultData()
      stopPolling()
      checkJobStatus()
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.submitFailed')))
    })
    .finally(() => {
      submitLoading.value = false
    })
}

function checkJobStatus(manual = false) {
  if (!ensureLoggedIn(false) || !currentJob.value?.requestId) {
    return
  }
  polling.value = true
  fetchTargetPredictionJob(currentJob.value.requestId, wemolUserName.value)
    .then((resp) => {
      currentJob.value = { ...currentJob.value, ...resp }
      if (canFetchResult.value) {
        stopPolling()
        fetchJobResultData()
      } else if (!jobFinished.value) {
        scheduleNextPoll()
      } else {
        stopPolling()
      }
      if (manual) {
        ElMessage.success(t('targetPrediction.messages.statusRefreshed'))
      }
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.statusError')))
      scheduleNextPoll()
    })
    .finally(() => {
      polling.value = false
    })
}

function scheduleNextPoll() {
  stopPolling()
  pollingTimer.value = window.setTimeout(() => {
    checkJobStatus()
  }, POLLING_INTERVAL)
}

function stopPolling() {
  if (pollingTimer.value) {
    clearTimeout(pollingTimer.value)
    pollingTimer.value = null
  }
}

function fetchJobResultData(force = false) {
  if (!ensureLoggedIn() || !currentJob.value?.requestId) {
    return
  }
  if (!canFetchResult.value) {
    if (force) {
      ElMessage.warning(t('targetPrediction.messages.jobNotFinished'))
    }
    return
  }
  if (hasFetchedResult.value && !force) {
    return
  }
  resultLoadingState.value = true
  fetchTargetPredictionJobResult(currentJob.value.requestId, wemolUserName.value)
    .then((resp) => {
      currentJob.value = { ...currentJob.value, ...resp }
      predictedTargets.value = resp.predictedTargets || []
      detailRecords.value = resp.details || []
      resultFiles.value = resp.resultFiles || []
      hasFetchedResult.value = true
      if (force) {
        ElMessage.success(t('targetPrediction.messages.resultUpdated'))
      }
    })
    .catch((error) => {
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.fetchFailed')))
    })
    .finally(() => {
      resultLoadingState.value = false
    })
}

function downloadFile(file) {
  if (!ensureLoggedIn() || !currentJob.value?.requestId) return
  downloadTargetPredictionFile(currentJob.value.requestId, file.relativePath, wemolUserName.value)
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
      ElMessage.error(getErrorMessage(error, t('targetPrediction.messages.downloadFailed')))
    })
}

function resetResultData() {
  predictedTargets.value = []
  detailRecords.value = []
  resultFiles.value = []
  hasFetchedResult.value = false
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

function statusType(status) {
  if (!status) return 'info'
  const normalized = status.toLowerCase()
  if (normalized === 'done' || normalized === 'completed') return 'success'
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

function isStructureFile(name) {
  if (!name) return false
  const lower = name.toLowerCase()
  return lower.endsWith('.sdf') || lower.endsWith('.mol') || lower.endsWith('.mol2')
}

function getErrorMessage(error, fallback) {
  return error?.response?.data?.msg || error?.message || fallback
}
</script>

<style scoped>
.target-prediction {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.module-card,
.form-card {
  margin-bottom: 20px;
}

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
  gap: 12px;
}

.module-name {
  font-size: 18px;
  font-weight: 600;
}

.module-desc {
  color: #666;
  margin: 8px 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-list li {
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
}

.section-title {
  font-weight: 600;
  margin-top: 10px;
}

.field-section ul {
  padding-left: 18px;
}

.status-card .status-alert {
  margin: 12px 0;
}

.status-meta {
  list-style: none;
  padding: 0;
  margin: 0 0 8px 0;
}

.status-meta li {
  color: #555;
  font-size: 13px;
  margin-bottom: 4px;
}

.status-hint {
  font-size: 12px;
  color: #999;
  margin-bottom: 10px;
}

.status-actions {
  display: flex;
  gap: 8px;
}

.result-wrapper {
  margin-top: 20px;
}

.result-section {
  margin-bottom: 24px;
}

.result-section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  gap: 12px;
}

.section-header h4 {
  margin: 0;
  font-weight: 600;
}

.section-header span {
  font-size: 12px;
  color: #888;
}

.loading-dialog__content {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
}

.loading-icon {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
