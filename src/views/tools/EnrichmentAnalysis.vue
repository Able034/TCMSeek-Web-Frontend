<template>
  <div class="enrichment-page">
    <section class="hero card">
      <p class="hero-badge">{{ t('enrichment.badge') }}</p>
      <h1>{{ t('enrichment.title') }}</h1>
      <p class="hero-subtitle">{{ t('enrichment.subtitle') }}</p>
      <div class="hero-meta">
        <span>{{ t('enrichment.poweredBy') }}</span>
        <span class="divider">•</span>
        <span>{{ t('enrichment.instantResults') }}</span>
      </div>
    </section>

    <el-card class="analysis-card" shadow="hover">
      <el-tabs v-model="activeTab">
        <el-tab-pane :label="t('enrichment.standardTab')" name="standard">
          <div class="form-grid">
            <div class="form-block">
              <div class="label-row">
                <label>{{ t('enrichment.geneListLabel') }}</label>
                <span class="count-tag" v-if="standardGeneCount">
                  {{ t('enrichment.previewCount', { count: standardGeneCount }) }}
                </span>
              </div>
              <el-input
                v-model="standardGenes"
                type="textarea"
                :rows="10"
                :placeholder="t('enrichment.geneListPlaceholder')"
              />
              <p class="input-hint">{{ t('enrichment.geneHint') }}</p>
            </div>

            <div class="form-block slim">
              <label>{{ t('enrichment.descriptionLabel') }}</label>
              <el-input
                v-model="standardDescription"
                type="textarea"
                :rows="3"
                :placeholder="t('enrichment.descriptionPlaceholder')"
              />

              <label class="mt-24">{{ t('enrichment.libraryLabel') }}</label>
              <el-select v-model="standardLibrary" filterable class="full-width">
                <el-option
                  v-for="item in libraryOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>

              <div class="button-row">
                <el-button text @click="fillExample('standard')">
                  {{ t('enrichment.loadExample') }}
                </el-button>
                <el-button
                  type="primary"
                  :loading="standardLoading"
                  @click="handleStandardAnalysis"
                >
                  {{ standardLoading ? t('enrichment.running') : t('enrichment.runAnalysis') }}
                </el-button>
              </div>
            </div>
          </div>

          <section class="result-section">
            <div class="result-header">
              <div>
                <h3>{{ t('enrichment.resultsTitle') }}</h3>
                <p class="result-subtitle">
                  <span v-if="standardUserListId">
                    {{ t('enrichment.userListIdLabel') }}: {{ standardUserListId }}
                  </span>
                </p>
              </div>
              <div class="result-actions" v-if="hasStandardResults">
                <el-tag type="success">
                  {{ t('enrichment.listMetadata', { count: standardListInfo?.genes?.length || 0 }) }}
                </el-tag>
                <el-button
                  size="small"
                  :icon="Download"
                  @click="downloadStandardResults"
                >
                  {{ t('enrichment.download') }}
                </el-button>
              </div>
            </div>

            <el-empty v-if="!hasStandardResults" :description="t('enrichment.noResults')" />

            <template v-else>
              <ReactomeResults
                v-if="isEnhancedStandardView"
                :rows="standardResults"
                :library-name="selectedLibraryLabel"
                :show-grip-network="enableGripNetwork"
                :gene-list="standardListInfo?.genes || []"
              />
              <el-table
                v-else
                :data="standardResults"
                border
                class="result-table"
                height="420"
              >
                <el-table-column prop="rank" :label="t('enrichment.rank')" width="80" />
                <el-table-column prop="term" :label="t('enrichment.term')" min-width="240" />
                <el-table-column
                  prop="pValue"
                  :label="t('enrichment.pValue')"
                  width="140"
                >
                  <template #default="{ row }">
                    {{ formatPValue(row.pValue) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="adjustedP"
                  :label="t('enrichment.adjPValue')"
                  width="160"
                >
                  <template #default="{ row }">
                    {{ formatPValue(row.adjustedP) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="combinedScore"
                  :label="t('enrichment.combinedScore')"
                  width="140"
                >
                  <template #default="{ row }">
                    {{ formatScore(row.combinedScore) }}
                  </template>
                </el-table-column>
                <el-table-column
                  prop="overlap"
                  :label="t('enrichment.overlapHeader')"
                  min-width="220"
                >
                  <template #default="{ row }">
                    <div class="overlap-list">
                      <el-tag
                        v-for="gene in row.overlap"
                        :key="gene"
                        size="small"
                        effect="plain"
                      >
                        {{ gene }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </template>
          </section>
        </el-tab-pane>

      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import {
  addEnrichrGeneList,
  downloadEnrichrResults,
  fetchEnrichrResults,
  viewEnrichrGeneList
} from '@/api/enrichment'
import ReactomeResults from '@/components/ReactomeResults.vue'

const { t } = useI18n()

const activeTab = ref('standard')

const standardGenes = ref('')
const standardDescription = ref('')
const REACTOME_LIBRARY = 'Reactome_Pathways_2024'
const WIKI_LIBRARY = 'WikiPathways_2024_Human'
const KEGG_LIBRARY = 'KEGG_2021_Human'
const ENHANCED_LIBRARIES = [REACTOME_LIBRARY, WIKI_LIBRARY, KEGG_LIBRARY]
const standardLibrary = ref(REACTOME_LIBRARY)
const standardLoading = ref(false)
const standardResults = ref([])
const standardListInfo = ref(null)
const standardUserListId = ref(null)

const libraryOptions = [
  { label: 'Reactome Pathways 2024', value: REACTOME_LIBRARY },
  { label: 'KEGG 2021 Human', value: KEGG_LIBRARY },
  { label: 'WikiPathways 2024 Human', value: WIKI_LIBRARY }
]

const selectedLibraryLabel = computed(() => {
  const match = libraryOptions.find((item) => item.value === standardLibrary.value)
  return match?.label || standardLibrary.value
})

const isEnhancedStandardView = computed(
  () => ENHANCED_LIBRARIES.includes(standardLibrary.value) && hasStandardResults.value
)
const enableGripNetwork = computed(() => false)

const parseGeneInput = (raw) => {
  if (!raw) return []
  return raw
    .split(/[\s,;]+/)
    .map((gene) => gene.trim().toUpperCase())
    .filter(Boolean)
}

const buildGenePayload = (raw) => parseGeneInput(raw).join('\n')

const standardGeneCount = computed(() => parseGeneInput(standardGenes.value).length)

const hasStandardResults = computed(() => standardResults.value.length > 0)

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

const handleStandardAnalysis = async () => {
  const genes = buildGenePayload(standardGenes.value)
  if (!genes) {
    ElMessage.warning(t('enrichment.geneValidation'))
    return
  }

  standardLoading.value = true
  standardResults.value = []

  try {
    const { userListId } = await addEnrichrGeneList({
      genes,
      description: standardDescription.value
    })
    standardUserListId.value = userListId

    const [listInfo, enrichment] = await Promise.all([
      viewEnrichrGeneList(userListId),
      fetchEnrichrResults({
        userListId,
        backgroundType: standardLibrary.value
      })
    ])

    standardListInfo.value = listInfo
    standardResults.value = resultMapper(enrichment[standardLibrary.value])
    ElMessage.success(t('enrichment.runSuccess'))
  } catch (error) {
    console.error('Enrichr analysis failed', error)
    ElMessage.error(t('enrichment.runFailed'))
  } finally {
    standardLoading.value = false
  }
}

const downloadStandardResults = async () => {
  if (!standardUserListId.value) {
    return
  }

  try {
    const response = await downloadEnrichrResults({
      userListId: standardUserListId.value,
      backgroundType: standardLibrary.value,
      filename: `enrichr_${standardLibrary.value}`
    })

    const disposition = response.headers?.['content-disposition'] || ''
    const dispositionMatch = disposition.match(/filename="?([^"]+)"?/)
    const fallbackName = `enrichr_${standardLibrary.value}.txt`
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
    console.error('Failed to download enrichment results', error)
    ElMessage.error(t('enrichment.exportFailed'))
  }
}

const fillExample = (mode) => {
  const coreGenes = [
    'PHF14', 'RBM3', 'MSL1', 'PHF21A', 'ARL10', 'INSR', 'JADE2', 'P2RX7',
    'LINC00662', 'CCDC101', 'PPM1B', 'KANSL1L', 'CRYZL1', 'ANAPC16', 'TMCC1',
    'CDH8', 'RBM11', 'CNPY2', 'HSPA1L', 'CUL2', 'PLBD2', 'LARP7', 'TECPR2',
    'ZNF302', 'CUX1', 'MOB2', 'CYTH2', 'SEC22C', 'EIF4E3', 'ROBO2',
    'ADAMTS9-AS2', 'CXXC1', 'LINC01314', 'ATF7', 'ATP5F1'
  ]

  if (mode === 'standard') {
    standardGenes.value = coreGenes.join('\n')
    standardDescription.value = t('enrichment.exampleDescription')
    return
  }
}

const formatPValue = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  if (value === 0) {
    return '0'
  }
  return Number(value).toExponential(2)
}

const formatScore = (value) => {
  if (value === null || value === undefined) {
    return '-'
  }
  return Number(value).toFixed(2)
}
</script>

<style scoped>
.enrichment-page {
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
  font-size: 32px;
  margin: 0 0 8px;
}

.hero-subtitle {
  color: #5c5f62;
  font-size: 16px;
  margin: 0 0 12px;
  line-height: 1.6;
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

.input-hint {
  font-size: 12px;
  color: #8b92a3;
  margin-top: 8px;
}

.mt-24 {
  margin-top: 24px;
}

.full-width {
  width: 100%;
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

.result-table {
  border-radius: 16px;
  overflow: hidden;
}

.overlap-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mb-24 {
  margin-bottom: 24px;
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
