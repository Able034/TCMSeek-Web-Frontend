<template>
  <div class="structure-page">
    <div class="container">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1>{{ $t('structure.title') }}</h1>
        <p>{{ $t('structure.description') }}</p>
      </div>

      <el-alert
        v-if="rdkitStatusChecked"
        :title="rdkitAvailable ? (rdkitStatusMessage || 'RDKit 服务可用') : 'RDKit 不可用，无法进行结构搜索'"
        :type="rdkitAvailable ? 'success' : 'error'"
        :closable="false"
        class="status-alert"
        show-icon
      />

      <!-- ChemDoodle 编辑器 -->
      <div class="editor-card">
        <div class="editor-header">
          <h2>{{ $t('structure.editorTitle') }}</h2>
          <div class="actions">
            <el-button @click="clear" size="small">
              <el-icon>
                <Delete />
              </el-icon>
              {{ $t('structure.clear') }}
            </el-button>
            <el-button @click="search" type="primary" :loading="searching">
              <el-icon>
                <Search />
              </el-icon>
              {{ $t('structure.searchButton') }}
            </el-button>
          </div>
        </div>

        <!-- 搜索控件 -->
        <div class="search-controls">
          <div class="search-type-control">
            <span class="control-label">{{ $t('structure.searchType') }}</span>
            <el-radio-group v-model="searchType" size="small">
              <el-radio-button
                v-for="option in searchTypeOptions"
                :key="option.value"
                :label="option.value"
              >
                {{ $t(option.labelKey) }}
              </el-radio-button>
            </el-radio-group>
          </div>

          <div class="similarity-control" v-if="searchType === 'similarity'">
            <div class="control-header">
              <span class="control-label">{{ $t('structure.threshold') }}</span>
              <span class="threshold-label">{{ (threshold * 100).toFixed(0) }}%</span>
            </div>
            <el-slider
              v-model="threshold"
              :min="thresholdRange.min"
              :max="thresholdRange.max"
              :step="0.01"
              show-input
              :show-input-controls="false"
            />
          </div>
        </div>

        <!-- 加载提示 -->
        <div v-if="loading" class="loading-tip">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          <span>{{ $t('structure.loadingEditor') }}...</span>
        </div>

        <!-- ChemDoodle 容器 - 必须是 canvas 元素 -->
        <canvas id="sketcher-container"></canvas>
      </div>

      <!-- 搜索结果 -->
      <div v-if="results.length > 0" class="results-card">
        <h3>{{ $t('structure.resultsTitle') }}</h3>
        <p class="count">{{ $t('structure.foundResults', { count: results.length }) }}</p>
        <el-table :data="results" stripe>
          <el-table-column prop="inchikey" label="InChIKey" width="300" show-overflow-tooltip />
          <el-table-column prop="smiles" label="SMILES" show-overflow-tooltip />
          <el-table-column
            v-if="searchType === 'similarity'"
            prop="similarity"
            :label="$t('structurePage.similarity')"
            width="120"
          >
            <template #default="{ row }">
              {{ row.similarity ? (row.similarity * 100).toFixed(1) + '%' : '-' }}
            </template>
          </el-table-column>
          <el-table-column label="Operation" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="viewCompound(row.inchikey)">
                {{ $t('medicine.compound.viewDetail') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-else-if="searched && results.length === 0" class="empty">
        <el-empty :description="$t('structure.noResults')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Delete, Search, Loading } from '@element-plus/icons-vue'
import { searchByStructure, checkRdkitStatus } from '@/api/compound'

const router = useRouter()
const { t } = useI18n()

const loading = ref(true)
const searching = ref(false)
const searched = ref(false)
const searchType = ref('full')
const threshold = ref(0.8)
const results = ref([])
const rdkitAvailable = ref(true)
const rdkitStatusChecked = ref(false)
const rdkitStatusMessage = ref('')

const searchTypeOptions = [
  { value: 'full', labelKey: 'structure.fullStructure' },
  { value: 'sub', labelKey: 'structure.subStructure' },
  { value: 'similarity', labelKey: 'structure.similarity' }
]

const thresholdRange = {
  min: 0.1,
  max: 1
}

// ChemDoodle Sketcher 实例
let sketcher = null

// 初始化 ChemDoodle
const init = () => {
  let attempts = 0
  const maxAttempts = 20

  const tryInit = () => {
    attempts++

    // 检查 ChemDoodle 是否加载
    if (typeof ChemDoodle === 'undefined' || !ChemDoodle.SketcherCanvas) {
      if (attempts < maxAttempts) {
        setTimeout(tryInit, 500)
      } else {
        loading.value = false
        ElMessage.error(t('structurePage.chemdoodleLoadFailed'))
      }
      return
    }

    try {
      // 修改元素颜色（官网推荐）
      ChemDoodle.ELEMENT['H'].jmolColor = 'black'
      ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130'

      // 创建编辑器
      sketcher = new ChemDoodle.SketcherCanvas('sketcher-container', 900, 500, {
        useServices: false,
        oneMolecule: false
      })

      // 配置样式
      sketcher.styles.atoms_displayTerminalCarbonLabels_2D = true
      sketcher.styles.atoms_useJMOLColors = true
      sketcher.styles.bonds_clearOverlaps_2D = true
      sketcher.styles.shapes_color = 'c10000'

      // 重绘
      sketcher.repaint()

      loading.value = false
      ElMessage.success(t('structure.sketcherReady'))
    } catch (error) {
      loading.value = false
      ElMessage.error(t('structurePage.editorInitFailed') + ': ' + error.message)
    }
  }

  tryInit()
}

// 清空
const clear = () => {
  if (sketcher) {
    sketcher.clear()
    ElMessage.success(t('structure.cleared'))
  }
}

// 检查 RDKit 状态
const fetchRdkitStatus = async () => {
  try {
    const response = await checkRdkitStatus()
    rdkitAvailable.value = true
    rdkitStatusMessage.value = response.data || ''
  } catch (error) {
    rdkitAvailable.value = false
    rdkitStatusMessage.value = 'RDKit 不可用，无法进行结构搜索'
    ElMessage.error(rdkitStatusMessage.value)
  } finally {
    rdkitStatusChecked.value = true
  }
}

// 搜索
const search = async () => {
  if (!sketcher) {
    ElMessage.warning(t('structure.sketcherNotReady'))
    return
  }

  try {
    const mol = sketcher.getMolecule()
    if (!mol || mol.atoms.length === 0) {
      ElMessage.warning(t('structure.emptyStructure'))
      return
    }

    if (!rdkitStatusChecked.value) {
      await fetchRdkitStatus()
    }
    if (!rdkitAvailable.value) {
      ElMessage.error(rdkitStatusMessage.value || 'RDKit 不可用，无法进行结构搜索')
      return
    }

    // 获取 MOL 文件
    const molFile = ChemDoodle.writeMOL(mol)

    searching.value = true

    const payload = {
      type: searchType.value,
      molFile
    }

    if (searchType.value === 'similarity') {
      const clampedThreshold = Math.min(Math.max(threshold.value, thresholdRange.min), thresholdRange.max)
      payload.threshold = Number(clampedThreshold.toFixed(2))
    }

    // 调用后端 API
    const response = await searchByStructure(payload)

    results.value = response.data || []
    searched.value = true

    if (results.value.length > 0) {
      ElMessage.success(t('structure.foundResults', { count: results.value.length }))
    } else {
      ElMessage.info(t('structure.noResults'))
    }
  } catch (error) {
    ElMessage.error(t('structure.searchFailed'))
  } finally {
    searching.value = false
  }
}

// 查看化合物详情
const viewCompound = (inchikey) => {
  router.push({
    name: 'CompoundDetail',
    params: { inchikey: inchikey }
  })
}

// 生命周期
onMounted(() => {
  init()
  fetchRdkitStatus()
})

onUnmounted(() => {
  if (sketcher) {
    sketcher = null
  }
})
</script>

<style scoped>
.structure-page {
  min-height: calc(100vh - 80px);
  background: #f8fffe;
  padding: 40px 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.status-alert {
  margin-bottom: 16px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 10px;
}

.page-header p {
  font-size: 16px;
  color: #666;
}

/* 卡片通用样式 */
.editor-card,
.options-card,
.examples-card,
.results-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 30px;
  margin-bottom: 30px;
}

/* 编辑器 */
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.editor-header h2 {
  font-size: 20px;
  font-weight: 600;
  color: #2d8659;
  margin: 0;
}

.actions {
  display: flex;
  gap: 10px;
}

.search-controls {
  margin-bottom: 20px;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-type-control {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.search-type-control .el-radio-group {
  display: flex;
  gap: 8px;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: #2d8659;
}

.similarity-control {
  border: 1px solid #e0f1e8;
  border-radius: 8px;
  padding: 16px;
  background: #f9fffc;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.threshold-label {
  font-weight: 600;
  color: #1a5f4a;
}

.loading-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #2d8659;
  font-size: 16px;
}

.loading-tip .el-icon {
  font-size: 24px;
}

/* ChemDoodle 的 canvas 元素 */
#sketcher-container {
  display: block !important;
  width: 900px !important;
  height: 500px !important;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: crosshair;
  position: relative;
  z-index: 1;
}

/* 确保 ChemDoodle 添加的样式不会隐藏 canvas */
:deep(.ChemDoodleWebComponent) {
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* 其他卡片 */
.options-card h3,
.examples-card h3,
.results-card h3 {
  font-size: 18px;
  font-weight: 600;
  color: #2d8659;
  margin-bottom: 20px;
}

.examples {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.count {
  color: #666;
  margin-bottom: 20px;
}

.empty {
  padding: 60px 0;
}
</style>
