<template>
  <div class="ppi-page">
    <section class="hero card">
      <p class="hero-badge">{{ t('ppiHub.badge') }}</p>
      <h1>{{ t('ppiHub.title') }}</h1>
      <p class="hero-subtitle">{{ t('ppiHub.subtitle') }}</p>
      <div class="hero-meta">
        <span>{{ t('enrichment.poweredBy') }}</span>
        <span class="divider">/</span>
        <span>{{ t('ppiHub.focusedLibrary') }}</span>
      </div>
    </section>

    <el-card class="analysis-card" shadow="hover">
      <div class="form-grid">
        <div class="form-block">
          <div class="label-row">
            <label>{{ t('enrichment.geneListLabel') }}</label>
            <span class="count-tag" v-if="activeGeneCount">
              {{ t('enrichment.previewCount', { count: activeGeneCount }) }}
            </span>
          </div>

          <el-radio-group v-model="analysisSource" class="mode-toggle" size="small">
            <el-radio-button label="manual">
              {{ t('ppiHub.modeManual') }}
            </el-radio-button>
            <el-radio-button label="compound">
              {{ t('ppiHub.modeCompound') }}
            </el-radio-button>
            <el-radio-button label="disease">
              {{ t('ppiHub.modeDisease') }}
            </el-radio-button>
          </el-radio-group>

          <template v-if="analysisSource === 'manual'">
            <el-input
              v-model="geneInput"
              type="textarea"
              :rows="10"
              :placeholder="t('enrichment.geneListPlaceholder')"
            />
            <p class="input-hint">{{ t('enrichment.geneHint') }}</p>
          </template>

          <template v-else-if="analysisSource === 'compound'">
            <label class="compound-label">{{ t('ppiHub.compoundSelectLabel') }}</label>
            <el-select
              v-model="selectedCompoundKey"
              class="compound-select"
              filterable
              remote
              clearable
              reserve-keyword
              :remote-method="searchCompounds"
              :loading="compoundSelectLoading"
              :placeholder="t('ppiHub.compoundPlaceholder')"
              @change="handleCompoundChange"
              @clear="resetCompoundSelection"
            >
              <el-option
                v-for="item in compoundOptions"
                :key="item.inchikey"
                :label="formatCompoundOption(item)"
                :value="item.inchikey"
              >
                <div class="compound-option">
                  <div class="compound-option-name">
                    {{ item.compoundName || item.molecularFormula || item.inchikey }}
                  </div>
                  <div class="compound-option-meta">
                    <span v-if="item.inchikey">{{ item.inchikey }}</span>
                    <span v-if="item.pubchemCid">CID: {{ item.pubchemCid }}</span>
                    <span v-if="item.molecularFormula">{{ item.molecularFormula }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
            <p class="input-hint">{{ t('ppiHub.compoundHint') }}</p>

            <div class="compound-summary" v-if="selectedCompound">
              <span class="compound-summary-name">
                {{ selectedCompound.compoundName || selectedCompound.inchikey }}
              </span>
              <span v-if="selectedCompound.molecularFormula" class="compound-summary-chip">
                {{ selectedCompound.molecularFormula }}
              </span>
              <span v-if="selectedCompound.pubchemCid" class="compound-summary-chip">
                CID: {{ selectedCompound.pubchemCid }}
              </span>
            </div>

            <div class="gene-preview-card">
              <div class="preview-header">
                <span>
                  {{ t('ppiHub.compoundGenesLabel', { count: compoundGeneCount }) }}
                </span>
                <el-button
                  v-if="selectedCompoundKey"
                  text
                  size="small"
                  :loading="compoundGeneLoading"
                  @click="refreshCompoundGenes"
                >
                  {{ t('ppiHub.refreshGenes') }}
                </el-button>
              </div>

              <div v-if="compoundGeneLoading" class="gene-preview-loading">
                {{ t('ppiHub.loadingGenes') }}
              </div>
              <template v-else>
                <div v-if="compoundGenes.length">
                  <div class="gene-selection-header">
                    <div>
                      {{ t('ppiHub.availableGenesLabel', { count: compoundGeneCount }) }}
                      ·
                      {{ t('ppiHub.selectedGenesLabel', { count: selectedCompoundGenes.length }) }}
                    </div>
                    <el-button
                      text
                      size="small"
                      @click="selectCompoundTopGenes"
                    >
                      {{ t('ppiHub.selectTopGenes', { count: TOP_GENE_DEFAULT }) }}
                    </el-button>
                  </div>
                  <el-checkbox-group v-model="selectedCompoundGenes" class="gene-select-list">
                    <el-checkbox
                      v-for="gene in compoundGenes"
                      :key="gene"
                      :label="gene"
                      size="small"
                    >
                      {{ gene }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <el-empty
                  v-else-if="selectedCompoundKey"
                  :description="compoundGeneError || t('ppiHub.compoundNoGenes')"
                  :image-size="80"
                />
                <p v-else class="input-hint muted">
                  {{ t('ppiHub.selectCompoundHint') }}
                </p>
              </template>
            </div>

            <el-alert
              v-if="compoundGeneError && !compoundGeneLoading"
              type="warning"
              :closable="false"
              class="compound-alert"
              :title="compoundGeneError"
            />
          </template>

          <template v-else>
            <label class="disease-label">{{ t('ppiHub.diseaseSelectLabel') }}</label>
            <el-select
              v-model="selectedDiseaseId"
              class="disease-select"
              filterable
              remote
              clearable
              reserve-keyword
              :remote-method="searchDiseases"
              :loading="diseaseSelectLoading"
              :placeholder="t('ppiHub.diseasePlaceholder')"
              @change="handleDiseaseChange"
              @clear="resetDiseaseSelection"
            >
              <el-option
                v-for="item in diseaseOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              >
                <div class="disease-option">
                  <div class="disease-option-name">{{ item.name }}</div>
                  <div class="disease-option-meta">
                    <span>{{ item.id }}</span>
                    <span v-if="item.extra?.source">{{ item.extra.source }}</span>
                  </div>
                </div>
              </el-option>
            </el-select>
            <p class="input-hint">{{ t('ppiHub.diseaseHint') }}</p>

            <div class="disease-summary" v-if="selectedDisease">
              <span class="disease-summary-name">
                {{ selectedDisease.name }}
              </span>
              <span class="disease-summary-chip">{{ selectedDisease.id }}</span>
            </div>

            <div class="gene-preview-card">
              <div class="preview-header">
                <span>
                  {{ t('ppiHub.diseaseGenesLabel', { count: diseaseGeneCount }) }}
                </span>
                <el-button
                  v-if="selectedDiseaseId"
                  text
                  size="small"
                  :loading="diseaseGeneLoading"
                  @click="refreshDiseaseGenes"
                >
                  {{ t('ppiHub.refreshGenes') }}
                </el-button>
              </div>

              <div v-if="diseaseGeneLoading" class="gene-preview-loading">
                {{ t('ppiHub.loadingGenes') }}
              </div>
              <template v-else>
                <div v-if="diseaseGenes.length">
                  <div class="gene-selection-header">
                    <div>
                      {{ t('ppiHub.availableGenesLabel', { count: diseaseGeneCount }) }}
                      ·
                      {{ t('ppiHub.selectedGenesLabel', { count: selectedDiseaseGenes.length }) }}
                    </div>
                    <el-button
                      text
                      size="small"
                      @click="selectDiseaseTopGenes"
                    >
                      {{ t('ppiHub.selectTopGenes', { count: TOP_GENE_DEFAULT }) }}
                    </el-button>
                  </div>
                  <el-checkbox-group v-model="selectedDiseaseGenes" class="gene-select-list">
                    <el-checkbox
                      v-for="gene in diseaseGenes"
                      :key="gene"
                      :label="gene"
                      size="small"
                    >
                      {{ gene }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
                <el-empty
                  v-else-if="selectedDiseaseId"
                  :description="diseaseGeneError || t('ppiHub.diseaseNoGenes')"
                  :image-size="80"
                />
                <p v-else class="input-hint muted">
                  {{ t('ppiHub.selectDiseaseHint') }}
                </p>
              </template>
            </div>

            <el-alert
              v-if="diseaseGeneError && !diseaseGeneLoading"
              type="warning"
              :closable="false"
              class="compound-alert"
              :title="diseaseGeneError"
            />
          </template>
        </div>

        <div class="form-block slim">
          <label>{{ t('enrichment.descriptionLabel') }}</label>
          <el-input
            v-model="description"
            type="textarea"
            :rows="3"
            :placeholder="t('enrichment.descriptionPlaceholder')"
          />

          <label class="mt-24">{{ t('enrichment.libraryLabel') }}</label>
          <el-input :model-value="t('ppiHub.title')" disabled />

          <div class="button-row">
            <el-button text @click="fillExample">
              {{ t('enrichment.loadExample') }}
            </el-button>
            <el-button type="primary" :loading="loading" @click="handleAnalysis">
              {{ loading ? t('enrichment.running') : t('enrichment.runAnalysis') }}
            </el-button>
          </div>
        </div>
      </div>

      <section class="result-section">
        <div class="result-header">
          <div>
            <h3>{{ t('enrichment.resultsTitle') }}</h3>
            <p class="result-subtitle">
              <span v-if="userListId">
                {{ t('enrichment.userListIdLabel') }}: {{ userListId }}
              </span>
            </p>
          </div>
          <div class="result-actions" v-if="hasResults">
            <el-tag type="success">
              {{ t('enrichment.listMetadata', { count: listInfo?.genes?.length || 0 }) }}
            </el-tag>
            <el-button size="small" :icon="Download" @click="downloadResults">
              {{ t('enrichment.download') }}
            </el-button>
          </div>
        </div>

        <el-empty v-if="!hasResults" :description="t('enrichment.noResults')" />
        <ReactomeResults
          v-else
          :rows="results"
          :library-name="t('ppiHub.title')"
          :show-grip-network="true"
          :gene-list="listInfo?.genes || []"
        />
      </section>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import ReactomeResults from '@/components/ReactomeResults.vue'
import {
  addEnrichrGeneList,
  downloadEnrichrResults,
  fetchEnrichrResults,
  viewEnrichrGeneList
} from '@/api/enrichment'
import { getCompoundsList, getCompoundTargets, getDiseaseGenes, searchCenterNodes } from '@/api'

const PPI_LIBRARY = 'PPI_Hub_Proteins'

const { t } = useI18n()

const geneInput = ref('')
const description = ref('')
const loading = ref(false)
const results = ref([])
const TOP_GENE_DEFAULT = 100
const listInfo = ref(null)
const userListId = ref(null)
const analysisSource = ref('manual')
const compoundOptions = ref([])
const compoundSelectLoading = ref(false)
const selectedCompoundKey = ref('')
const selectedCompound = ref(null)
const compoundGeneLoading = ref(false)
const compoundGenes = ref([])
const compoundGeneError = ref('')
const selectedCompoundGenes = ref([])
const diseaseOptions = ref([])
const diseaseSelectLoading = ref(false)
const selectedDiseaseId = ref('')
const selectedDisease = ref(null)
const diseaseGeneLoading = ref(false)
const diseaseGenes = ref([])
const diseaseGeneError = ref('')
const selectedDiseaseGenes = ref([])

const parseGeneInput = (raw) => {
  if (!raw) return []
  return raw
    .split(/[\s,;]+/)
    .map((gene) => gene.trim().toUpperCase())
    .filter(Boolean)
}

const buildGenePayload = (raw) => parseGeneInput(raw).join('\n')
const geneCount = computed(() => parseGeneInput(geneInput.value).length)
const compoundGeneCount = computed(() => compoundGenes.value.length)
const diseaseGeneCount = computed(() => diseaseGenes.value.length)
const activeGeneCount = computed(() =>
  analysisSource.value === 'compound'
    ? selectedCompoundGenes.value.length
    : analysisSource.value === 'disease'
      ? selectedDiseaseGenes.value.length
      : geneCount.value
)
const hasResults = computed(() => results.value.length > 0)

const resultMapper = (rows = []) =>
  (rows || []).map((row) => ({
    rank: row[0],
    term: row[1],
    pValue: row[2],
    oddsRatio: row[3],
    combinedScore: row[4],
    overlap: row[5] || [],
    adjustedP: row[6],
    oldP: row[7],
    oldAdjustedP: row[8]
  }))

const handleAnalysis = async () => {
  let genes = ''

  if (analysisSource.value === 'compound') {
    if (!selectedCompoundKey.value) {
      ElMessage.warning(t('ppiHub.compoundSelectWarn'))
      return
    }
    if (!selectedCompoundGenes.value.length) {
      ElMessage.warning(t('ppiHub.compoundGeneWarn'))
      return
    }
    genes = selectedCompoundGenes.value.join('\n')
  } else if (analysisSource.value === 'disease') {
    if (!selectedDiseaseId.value) {
      ElMessage.warning(t('ppiHub.diseaseSelectWarn'))
      return
    }
    if (!selectedDiseaseGenes.value.length) {
      ElMessage.warning(t('ppiHub.diseaseGeneWarn'))
      return
    }
    genes = selectedDiseaseGenes.value.join('\n')
  } else {
    genes = buildGenePayload(geneInput.value)
    if (!genes) {
      ElMessage.warning(t('enrichment.geneValidation'))
      return
    }
  }

  loading.value = true
  results.value = []

  try {
    const { userListId: listId } = await addEnrichrGeneList({
      genes,
      description: description.value
    })
    userListId.value = listId

    const [listInfoData, enrichment] = await Promise.all([
      viewEnrichrGeneList(listId),
      fetchEnrichrResults({
        userListId: listId,
        backgroundType: PPI_LIBRARY
      })
    ])

    listInfo.value = listInfoData
    results.value = resultMapper(enrichment[PPI_LIBRARY])
    ElMessage.success(t('enrichment.runSuccess'))
  } catch (error) {
    console.error('PPI Hub analysis failed', error)
    ElMessage.error(t('enrichment.runFailed'))
  } finally {
    loading.value = false
  }
}

const downloadResults = async () => {
  if (!userListId.value) {
    return
  }

  try {
    const response = await downloadEnrichrResults({
      userListId: userListId.value,
      backgroundType: PPI_LIBRARY,
      filename: `enrichr_${PPI_LIBRARY}`
    })

    const disposition = response.headers?.['content-disposition'] || ''
    const dispositionMatch = disposition.match(/filename="?([^"]+)"?/)
    const fallbackName = `enrichr_${PPI_LIBRARY}.txt`
    const filename = dispositionMatch ? dispositionMatch[1] : fallbackName
    const blob =
      response.data instanceof Blob
        ? response.data
        : new Blob([response.data], {
            type: response.headers?.['content-type'] || 'text/plain;charset=utf-8'
          })

    const blobUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = filename
    link.style.display = 'none'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download PPI Hub results', error)
    ElMessage.error(t('enrichment.exportFailed'))
  }
}

const fillExample = () => {
  analysisSource.value = 'manual'
  const exampleGenes = [
    'PHF14', 'RBM3', 'MSL1', 'PHF21A', 'ARL10', 'INSR', 'JADE2', 'P2RX7',
    'LINC00662', 'CCDC101', 'PPM1B', 'KANSL1L', 'CRYZL1', 'ANAPC16', 'TMCC1',
    'CDH8', 'RBM11', 'CNPY2', 'HSPA1L', 'CUL2', 'PLBD2', 'LARP7', 'TECPR2',
    'ZNF302', 'CUX1', 'MOB2', 'CYTH2', 'SEC22C', 'EIF4E3', 'ROBO2',
    'ADAMTS9-AS2', 'CXXC1', 'LINC01314', 'ATF7', 'ATP5F1'
  ]
  geneInput.value = exampleGenes.join('\n')
  description.value = t('enrichment.exampleDescription')
}

const formatCompoundOption = (compound) => {
  if (!compound) return ''
  const primary =
    compound.compoundName ||
    compound.molecularFormula ||
    compound.inchikey ||
    t('medicine.herb.unknown')
  const parts = [
    compound.inchikey,
    compound.pubchemCid ? `CID:${compound.pubchemCid}` : '',
    compound.molecularFormula
  ].filter(Boolean)
  return parts.length ? `${primary} · ${parts.join(' | ')}` : primary
}

const resetCompoundSelection = () => {
  selectedCompoundKey.value = ''
  selectedCompound.value = null
  compoundGenes.value = []
  compoundGeneError.value = ''
  selectedCompoundGenes.value = []
}

const searchCompounds = async (query) => {
  const keyword = query?.trim()
  compoundGeneError.value = ''
  if (!keyword) {
    compoundOptions.value = []
    return
  }

  compoundSelectLoading.value = true
  try {
    const response = await getCompoundsList({
      page: 1,
      pageSize: 20,
      keyword
    })
    if (response.code === 200) {
      compoundOptions.value = response.rows || []
    } else {
      compoundGeneError.value = response.msg || t('ppiHub.compoundSearchFailed')
    }
  } catch (error) {
    console.error('Failed to search compounds', error)
    compoundGeneError.value = t('ppiHub.compoundSearchFailed')
  } finally {
    compoundSelectLoading.value = false
  }
}

const fetchCompoundGenes = async (inchikey) => {
  if (!inchikey) return
  compoundGeneLoading.value = true
  compoundGeneError.value = ''
  compoundGenes.value = []
  try {
    const response = await getCompoundTargets(inchikey, {
      page: 1,
      pageSize: 500
    })
    if (response.code === 200) {
      const rows = response.rows || response.data || []
    const genes = rows
        .map(
          (row) =>
            row.symbol ||
            row.geneSymbol ||
            row.targetSymbol ||
            row.targetGeneSymbol ||
            row.geneName
        )
        .filter(Boolean)
        .map((symbol) => symbol.trim().toUpperCase())
    compoundGenes.value = Array.from(new Set(genes))
    selectedCompoundGenes.value = compoundGenes.value.slice(0, TOP_GENE_DEFAULT)
    if (!compoundGenes.value.length) {
      compoundGeneError.value = t('ppiHub.compoundNoGenes')
      selectedCompoundGenes.value = []
    }
  } else {
    compoundGeneError.value = response.msg || t('ppiHub.compoundGeneLoadFailed')
    }
  } catch (error) {
    console.error('Failed to load compound genes', error)
    compoundGeneError.value = t('ppiHub.compoundGeneLoadFailed')
  } finally {
    compoundGeneLoading.value = false
  }
}

const handleCompoundChange = async (inchikey) => {
  if (!inchikey) {
    resetCompoundSelection()
    return
  }

  selectedCompoundKey.value = inchikey
  const found = compoundOptions.value.find((item) => item.inchikey === inchikey)
  selectedCompound.value = found || null
  await fetchCompoundGenes(inchikey)
}

const refreshCompoundGenes = () => {
  if (selectedCompoundKey.value) {
    fetchCompoundGenes(selectedCompoundKey.value)
  }
}

const selectCompoundTopGenes = () => {
  selectedCompoundGenes.value = compoundGenes.value.slice(0, TOP_GENE_DEFAULT)
}

const resetDiseaseSelection = () => {
  selectedDiseaseId.value = ''
  selectedDisease.value = null
  diseaseGenes.value = []
  diseaseGeneError.value = ''
  selectedDiseaseGenes.value = []
}

const searchDiseases = async (query) => {
  const keyword = query?.trim()
  diseaseGeneError.value = ''
  if (!keyword) {
    diseaseOptions.value = []
    return
  }

  diseaseSelectLoading.value = true
  try {
    const response = await searchCenterNodes({
      centerType: 'disease',
      keyword,
      page: 1,
      pageSize: 20
    })

    if (response.code === 200) {
      diseaseOptions.value = response.data?.rows || []
    } else {
      diseaseGeneError.value = response.msg || t('ppiHub.diseaseSearchFailed')
    }
  } catch (error) {
    console.error('Failed to search diseases', error)
    diseaseGeneError.value = t('ppiHub.diseaseSearchFailed')
  } finally {
    diseaseSelectLoading.value = false
  }
}

const fetchDiseaseGenes = async (diseaseId) => {
  if (!diseaseId) return
  diseaseGeneLoading.value = true
  diseaseGeneError.value = ''
  diseaseGenes.value = []
  try {
    const response = await getDiseaseGenes(diseaseId, {
      page: 1,
      pageSize: 500
    })
    if (response.code === 200) {
    const rows = response.rows || response.data?.rows || []
      const genes = rows
        .map((row) => row.symbol || row.geneSymbol || row.targetSymbol || row.geneName)
        .filter(Boolean)
        .map((gene) => gene.trim().toUpperCase())
    diseaseGenes.value = Array.from(new Set(genes))
    selectedDiseaseGenes.value = diseaseGenes.value.slice(0, TOP_GENE_DEFAULT)
    if (!diseaseGenes.value.length) {
      diseaseGeneError.value = t('ppiHub.diseaseNoGenes')
      selectedDiseaseGenes.value = []
    }
  } else {
    diseaseGeneError.value = response.msg || t('ppiHub.diseaseGeneLoadFailed')
    }
  } catch (error) {
    console.error('Failed to load disease genes', error)
    diseaseGeneError.value = t('ppiHub.diseaseGeneLoadFailed')
  } finally {
    diseaseGeneLoading.value = false
  }
}

const handleDiseaseChange = (diseaseId) => {
  if (!diseaseId) {
    resetDiseaseSelection()
    return
  }

  selectedDiseaseId.value = diseaseId
  const found = diseaseOptions.value.find((item) => item.id === diseaseId)
  selectedDisease.value = found || null
  fetchDiseaseGenes(diseaseId)
}

const refreshDiseaseGenes = () => {
  if (selectedDiseaseId.value) {
    fetchDiseaseGenes(selectedDiseaseId.value)
  }
}

const selectDiseaseTopGenes = () => {
  selectedDiseaseGenes.value = diseaseGenes.value.slice(0, TOP_GENE_DEFAULT)
}
</script>

<style scoped>
.ppi-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px 80px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 20px 40px rgba(6, 22, 33, 0.1);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(45, 134, 89, 0.12);
  color: #2d8659;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 12px;
}

.hero h1 {
  margin: 0;
  font-size: 32px;
  color: #111827;
}

.hero-subtitle {
  margin: 12px 0 20px;
  color: #6b7280;
  font-size: 16px;
}

.hero-meta {
  color: #2d8659;
  font-weight: 500;
}

.hero-meta .divider {
  margin: 0 8px;
  color: #c5cbd0;
}

.analysis-card {
  border-radius: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 32px;
  margin-bottom: 32px;
}

.form-block {
  display: flex;
  flex-direction: column;
}

.form-block.slim {
  gap: 12px;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label-row label {
  font-weight: 600;
  color: #1f2a37;
}

.count-tag {
  font-size: 12px;
  color: #2d8659;
}

.mode-toggle {
  margin-bottom: 16px;
}

.input-hint {
  font-size: 12px;
  color: #8b92a3;
  margin-top: 8px;
}

.input-hint.muted {
  color: #9ca3af;
}

.mt-24 {
  margin-top: 24px;
}

.button-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.result-section {
  margin-top: 24px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.result-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.result-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.compound-label,
.disease-label {
  font-weight: 600;
  color: #1f2a37;
  margin-bottom: 6px;
}

.compound-select,
.disease-select {
  width: 100%;
}

.compound-option,
.disease-option {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.compound-option-name,
.disease-option-name {
  font-weight: 600;
  color: #1f2937;
}

.compound-option-meta,
.disease-option-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.compound-summary,
.disease-summary {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin: 12px 0;
}

.compound-summary-name,
.disease-summary-name {
  font-weight: 600;
  color: #111827;
}

.compound-summary-chip,
.disease-summary-chip {
  font-size: 12px;
  background: #f3f4f6;
  color: #374151;
  padding: 2px 10px;
  border-radius: 999px;
}

.gene-preview-card {
  margin-top: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #fafbff;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
}

.gene-preview-loading {
  color: #6b7280;
  font-size: 13px;
}

.compound-alert {
  margin-top: 12px;
}

.gene-selection-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #374151;
  margin-bottom: 8px;
}

.gene-select-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  max-height: 220px;
  overflow-y: auto;
  padding: 8px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.gene-select-list :deep(.el-checkbox) {
  margin-right: 0;
}

@media (max-width: 992px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .button-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 600px) {
  .card {
    padding: 24px;
  }
}
</style>
