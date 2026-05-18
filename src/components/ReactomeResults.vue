<template>
  <div class="reactome-card">
    <div class="reactome-header">
      <div>
        <h3>{{ libraryName }}</h3>
        <p class="reactome-subtitle">{{ t('enrichment.resultsTitle') }}</p>
        <p class="reactome-meta">
          {{ t('enrichment.listMetadata', { count: geneList.length }) }}
        </p>
      </div>
        <div class="reactome-actions" v-if="hasResults && showGripNetwork">
        <el-button
          size="small"
          type="success"
          plain
          :disabled="!geneList.length"
          @click="openX2K"
        >
          X2K
        </el-button>
      </div>
    </div>

    <div class="reactome-tabs">
      <button
        class="reactome-tab"
        :class="{ active: activeView === 'bar' }"
        @click="activeView = 'bar'"
      >
        Bar Graph
      </button>
      <button
        class="reactome-tab"
        :class="{ active: activeView === 'table' }"
        @click="activeView = 'table'"
      >
        Table
      </button>
    </div>

    <div v-if="activeView === 'bar'" class="reactome-bar-view" ref="barContainer">
      <el-tooltip
        v-for="row in barRows"
        :key="row.term"
        placement="right"
        effect="dark"
      >
        <template #content>
          <div class="reactome-bar-tooltip">
            <strong class="tooltip-title">{{ row.term }}</strong>
            <p>P-value: {{ formatPValue(row.pValue) }}</p>
            <p>Adjusted p-value: {{ formatPValue(row.adjustedP) }}</p>
            <p>Odds Ratio: {{ formatNumber(row.oddsRatio) }}</p>
            <p>Combined score: {{ formatNumber(row.combinedScore) }}</p>
          </div>
        </template>
        <div class="reactome-bar-item" @click="cycleSortMode">
          <div class="reactome-bar-label">{{ row.term }}</div>
          <div class="reactome-bar-track">
            <div
              class="reactome-bar-fill"
              :style="{ width: getBarWidth(row), background: getBarColor(row) }"
            ></div>
          </div>
        </div>
      </el-tooltip>
      <div class="reactome-bar-footer">
        <span>Modes: P-value ranking / Rank based ranking / Combined score ranking</span>
        <div class="reactome-export-icons">
          <span v-if="isExporting" class="exporting-text">
            <el-icon class="is-loading"><Loading /></el-icon>
            {{ t('common.loading') }}
          </span>
          <template v-else>
            <span @click="handleExport('svg')">SVG</span>
            <span @click="handleExport('png')">PNG</span>
            <span @click="handleExport('jpg')">JPG</span>
          </template>
        </div>
      </div>
    </div>

    <div v-else class="reactome-table-view">
      <div class="reactome-table-controls">
        <label>
          <span>{{ entriesLabel }}</span>
          <select v-model.number="pageSize">
            <option v-for="size in pageSizeOptions" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
          <span>entries per page</span>
        </label>
        <label class="reactome-search">
          <span>Search:</span>
          <input v-model="searchKeyword" type="text" placeholder="Search terms" />
        </label>
      </div>

      <div class="reactome-table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Index</th>
              <th>Name</th>
              <th class="sortable" @click="toggleTableSort('pValue')">
                P-value
                <span v-if="tableSortField === 'pValue'" class="sort-indicator">
                  {{ tableSortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="toggleTableSort('adjustedP')">
                Adjusted p-value
                <span v-if="tableSortField === 'adjustedP'" class="sort-indicator">
                  {{ tableSortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="toggleTableSort('oddsRatio')">
                Odds Ratio
                <span v-if="tableSortField === 'oddsRatio'" class="sort-indicator">
                  {{ tableSortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th class="sortable" @click="toggleTableSort('combinedScore')">
                Combined score
                <span v-if="tableSortField === 'combinedScore'" class="sort-indicator">
                  {{ tableSortOrder === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, idx) in paginatedRows"
              :key="row.term + row.rank"
              @mouseenter="reactomeHover = row.overlap"
            >
              <td>{{ showFrom + idx }}</td>
              <td>
                {{ row.term }}
                <span v-if="row.overlap.length < 5" class="reactome-asterisk">*</span>
              </td>
              <td>{{ formatPValue(row.pValue) }}</td>
              <td>{{ formatPValue(row.adjustedP) }}</td>
              <td>{{ formatNumber(row.oddsRatio) }}</td>
              <td>{{ formatNumber(row.combinedScore) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="reactome-hover-genes" v-if="reactomeHover.length">
        <strong>Overlapping genes:</strong>
        <span>{{ reactomeHover.join(', ') }}</span>
      </div>

      <div class="reactome-table-footer">
        <span>
          Showing
          {{ showFrom }}
          to
          {{ showTo }}
          of
          {{ filteredRows.length }}
          entries
        </span>
        <div class="reactome-pagination">
          <button @click="goPrev" :disabled="currentPage === 1">Previous</button>
          <button @click="goNext" :disabled="currentPage === totalPages">Next</button>
        </div>
      </div>
      <p class="reactome-footnote">
        Terms marked with an * have an overlap of less than 5
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElTooltip, ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { toSvg, toPng, toJpeg } from 'html-to-image'

const props = defineProps({
  rows: {
    type: Array,
    default: () => []
  },
  libraryName: {
    type: String,
    default: 'Reactome Pathways 2024'
  },
  showGripNetwork: {
    type: Boolean,
    default: false
  },
  geneList: {
    type: Array,
    default: () => []
  }
})

const { t } = useI18n()
const router = useRouter()
const activeView = ref('bar')
const barContainer = ref(null)
const isExporting = ref(false)
const tableSortField = ref('pValue')
const tableSortOrder = ref('asc')
const currentSortIndex = ref(0)
const pageSizeOptions = [10, 25, 50]
const pageSize = ref(10)
const currentPage = ref(1)
const searchKeyword = ref('')
const reactomeHover = ref([])
const baseExportOptions = {
  backgroundColor: '#ffffff',
  pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 2 : 2,
  skipFonts: true
}

const geneList = computed(() => props.geneList || [])
const hasResults = computed(() => props.rows && props.rows.length > 0)
const exportFilePrefix = computed(() => {
  const base = (props.libraryName || 'reactome_results').toString().trim()
  const normalized = base.replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '')
  return normalized || 'reactome_results'
})

const normalizedRows = computed(() =>
  (props.rows || []).map((row, index) => ({
    ...row,
    rank: row.rank ?? index + 1,
    oddsRatio: row.oddsRatio ?? row[3] ?? 0,
    combinedScore: row.combinedScore ?? row[4] ?? 0,
    overlap: row.overlap || []
  }))
)

const sortModes = ['combinedScore', 'pValue', 'rank']
const sortLabels = {
  combinedScore: 'combined score ranking',
  pValue: 'p-value ranking',
  rank: 'rank based ranking'
}
const sortMode = computed(() => sortModes[currentSortIndex.value])
const sortDescription = computed(() => sortLabels[sortMode.value])

const sortedRows = computed(() => {
  const data = [...normalizedRows.value]
  switch (sortMode.value) {
    case 'pValue':
      return data.sort((a, b) => (a.pValue ?? 1) - (b.pValue ?? 1))
    case 'rank':
      return data.sort((a, b) => {
        const compareA = a.oddsRatio ?? Number.POSITIVE_INFINITY
        const compareB = b.oddsRatio ?? Number.POSITIVE_INFINITY
        if (compareA === compareB) {
          return a.rank - b.rank
        }
        return compareA - compareB
      })
    default:
      return data.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0))
  }
})

const barRows = computed(() => sortedRows.value.slice(0, 10))

const metricValue = (row) => {
  if (sortMode.value === 'pValue') {
    const value = row.pValue > 0 ? row.pValue : 1e-16
    return -Math.log10(value)
  }
  if (sortMode.value === 'rank') {
    if (row.oddsRatio !== undefined && row.oddsRatio !== null) {
      return row.oddsRatio
    }
    return row.rank || 0
  }
  return row.combinedScore || 0
}

const maxMetric = computed(() => {
  const values = barRows.value.map((row) => metricValue(row))
  return Math.max(...values, 1)
})

const getBarWidth = (row) => {
  const width = (metricValue(row) / maxMetric.value) * 100
  return `${Math.max(width, 2)}%`
}

const getBarColor = (row) => {
  const base = metricValue(row) / maxMetric.value
  const start = Math.max(120, 255 - base * 120)
  return `linear-gradient(90deg, rgb(255, ${start}, ${start - 20}) 0%, #c62828 100%)`
}

const entriesLabel = computed(() => pageSize.value)

const tableSortedRows = computed(() => {
  const data = [...normalizedRows.value]
  const field = tableSortField.value
  const order = tableSortOrder.value

  return data.sort((a, b) => {
    const valueA = a[field]
    const valueB = b[field]
    const fallbackA = order === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    const fallbackB = order === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY
    const parsedA = valueA === null || valueA === undefined ? fallbackA : valueA
    const parsedB = valueB === null || valueB === undefined ? fallbackB : valueB

    if (parsedA === parsedB) {
      return a.rank - b.rank
    }
    return order === 'asc' ? parsedA - parsedB : parsedB - parsedA
  })
})

const filteredRows = computed(() => {
  const sourceRows = tableSortedRows.value
  if (!searchKeyword.value) {
    return sourceRows
  }
  const keyword = searchKeyword.value.toLowerCase()
  return sourceRows.filter((row) => row.term.toLowerCase().includes(keyword))
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRows.value.length / pageSize.value))
)

const paginatedRows = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredRows.value.slice(start, start + pageSize.value)
})

const showFrom = computed(() => {
  if (!filteredRows.value.length) return 0
  return (currentPage.value - 1) * pageSize.value + 1
})

const showTo = computed(() =>
  Math.min(currentPage.value * pageSize.value, filteredRows.value.length)
)

const cycleSortMode = () => {
  currentSortIndex.value = (currentSortIndex.value + 1) % sortModes.length
}

const goPrev = () => {
  if (currentPage.value > 1) currentPage.value -= 1
}

const goNext = () => {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}

const exportTable = () => {
  const header = ['Index', 'Name', 'P-value', 'Adjusted p-value', 'Odds Ratio', 'Combined score']
  const rows = filteredRows.value.map((row, index) => [
    index + 1,
    row.term,
    formatPValue(row.pValue),
    formatPValue(row.adjustedP),
    formatNumber(row.oddsRatio),
    formatNumber(row.combinedScore)
  ])

  const csv = [header, ...rows]
    .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${exportFilePrefix.value}_table.csv`
  link.click()
  URL.revokeObjectURL(url)
}

const handleExport = async (format) => {
  if (!barContainer.value) return

  try {
    isExporting.value = true
    let dataUrl = ''
    const options = { ...baseExportOptions }

    if (format === 'svg') {
      dataUrl = await toSvg(barContainer.value, options)
    } else if (format === 'png') {
      dataUrl = await toPng(barContainer.value, options)
    } else {
      dataUrl = await toJpeg(barContainer.value, {
        ...options,
        quality: 0.95
      })
    }

    const link = document.createElement('a')
    link.href = dataUrl
    link.download = `${exportFilePrefix.value}_bar_graph.${format === 'jpg' ? 'jpg' : format}`
    link.click()
  } catch (error) {
    console.error('Bar chart export failed', error)
    ElMessage.error('条形图导出失败，请稍后再试')
  } finally {
    isExporting.value = false
  }
}

const toggleTableSort = (field) => {
  if (tableSortField.value === field) {
    tableSortOrder.value = tableSortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    tableSortField.value = field
    tableSortOrder.value = 'asc'
  }
}

const formatPValue = (value) => {
  if (value === null || value === undefined) return '-'
  if (value === 0) return '0'
  return Number(value).toExponential(3)
}

const formatNumber = (value) => {
  if (value === null || value === undefined) return '-'
  return Number(value).toFixed(2)
}

const openX2K = () => {
  if (!geneList.value.length) {
    ElMessage.warning('暂无可用基因列表')
    return
  }
  const token = `x2k-${Date.now()}`
  sessionStorage.setItem(
    token,
    JSON.stringify({
      genes: geneList.value,
      library: props.libraryName
    })
  )
  router.push({ name: 'X2KAnalysis', query: { token } })
}

watch(
  () => props.rows,
  () => {
    currentPage.value = 1
    reactomeHover.value = []
  },
  { immediate: true }
)

watch([pageSize, searchKeyword, tableSortField, tableSortOrder], () => {
  currentPage.value = 1
})
</script>

<style scoped>
.reactome-card {
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  padding: 20px;
  background: #fff;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
}

.reactome-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.reactome-header h3 {
  margin: 0;
  font-size: 20px;
}

.reactome-subtitle {
  margin: 4px 0 0;
  color: #6b7280;
}

.reactome-meta {
  margin: 4px 0 0;
  font-size: 13px;
  color: #94a3b8;
}

.reactome-actions {
  display: flex;
  gap: 8px;
}

.reactome-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.reactome-tabs {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

.reactome-tab {
  border: 1px solid #d1d5db;
  background: #fff;
  padding: 4px 14px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
}

.reactome-tab.active {
  background: #0f172a;
  color: #fff;
}

.reactome-bar-view {
  margin-top: 20px;
}

.reactome-bar-item {
  margin-bottom: 12px;
  cursor: pointer;
}

.reactome-bar-label {
  font-weight: 600;
  margin-bottom: 4px;
}

.reactome-bar-track {
  width: 100%;
  background: #f5f5f5;
  border-radius: 6px;
  overflow: hidden;
}

.reactome-bar-fill {
  height: 28px;
  border-radius: 6px;
}

.reactome-bar-tooltip {
  min-width: 220px;
  line-height: 1.4;
}

.tooltip-title {
  display: block;
  margin-bottom: 4px;
}

.reactome-bar-footer {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #777;
}

.reactome-export-icons {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 600;
}

.reactome-export-icons span {
  cursor: pointer;
  transition: color 0.2s;
}

.reactome-export-icons span:hover {
  color: #c62828;
}

.exporting-text {
  font-size: 13px;
  color: #999;
  display: flex;
  align-items: center;
  gap: 6px;
}

.reactome-table-view {
  margin-top: 20px;
}

.reactome-table-controls {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 14px;
}

.reactome-table-controls select,
.reactome-table-controls input {
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.reactome-search {
  display: flex;
  align-items: center;
  gap: 8px;
}

.reactome-table-wrapper {
  overflow-x: auto;
}

.reactome-table-wrapper table {
  width: 100%;
  border-collapse: collapse;
}

.reactome-table-wrapper th,
.reactome-table-wrapper td {
  border: 1px solid #e0e0e0;
  padding: 10px;
  text-align: left;
}

.reactome-table-wrapper th {
  background: #fafafa;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sort-indicator {
  margin-left: 6px;
}

.reactome-hover-genes {
  margin-top: 12px;
  padding: 10px;
  border: 1px dashed #c62828;
  border-radius: 8px;
  background: #fff8f8;
  font-size: 14px;
}

.reactome-table-footer {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 14px;
}

.reactome-pagination button {
  border: 1px solid #ccc;
  background: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 8px;
}

.reactome-pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.reactome-footnote {
  margin-top: 8px;
  font-size: 13px;
  color: #777;
}

.reactome-asterisk {
  color: #c62828;
  margin-left: 4px;
}
</style>
