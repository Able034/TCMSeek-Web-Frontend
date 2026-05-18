<template>
  <div class="knowledge-graph-page">
    <div class="container">
      <!-- Page Header -->
      <div class="page-header">
        <h1>
          <el-icon><Share /></el-icon>
          {{ $t('graph.title') }}
        </h1>
        <p class="page-description">
          {{ $t('graph.subtitle') }}
        </p>
      </div>

      <!-- Graph Controls -->
      <div class="graph-controls card">
        <!-- 搜索行 -->
        <div class="search-row">
          <div class="category-group">
            <el-select 
              v-model="centerType" 
              :placeholder="$t('graph.selectCategory')" 
              class="category-select"
              @change="handleCenterTypeChange"
            >
              <el-option value="herb" :label="$t('graph.herb')">
                <span><el-icon><Orange /></el-icon> {{ $t('graph.herb') }}</span>
              </el-option>
              <el-option value="prescription" :label="$t('graph.formula')">
                <span><el-icon><Document /></el-icon> {{ $t('graph.formula') }}</span>
              </el-option>
              <el-option value="compound" :label="$t('graph.compound')">
                <span><el-icon><MagicStick /></el-icon> {{ $t('graph.compound') }}</span>
              </el-option>
              <el-option value="gene" :label="$t('graph.gene')">
                <span><el-icon><Connection /></el-icon> {{ $t('graph.gene') }}</span>
              </el-option>
              <el-option value="disease" :label="$t('graph.disease')">
                <span><el-icon><Warning /></el-icon> {{ $t('graph.disease') }}</span>
              </el-option>
              <el-option value="symptom" :label="$t('graph.symptom')">
                <span><el-icon><Operation /></el-icon> {{ $t('graph.symptom') }}</span>
              </el-option>
              <el-option value="syndrome" :label="$t('graph.syndrome')">
                <span><el-icon><Grid /></el-icon> {{ $t('graph.syndrome') }}</span>
              </el-option>
              <el-option value="wm_symptom" :label="$t('graph.wmSymptom')">
                <span><el-icon><FirstAidKit /></el-icon> {{ $t('graph.wmSymptom') }}</span>
              </el-option>
            </el-select>
          </div>

          <div class="search-group">
            <el-autocomplete
              v-model="searchKeyword"
              :placeholder="getCenterTypePlaceholder()"
              :fetch-suggestions="searchSuggestions"
              :trigger-on-focus="false"
              class="search-input"
              @select="handleSelect"
              @input="handleSearchInput"
              @keyup.enter="quickSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
              <template #default="{ item }">
                <div class="suggestion-item">
                  <span class="suggestion-name">{{ item.name }}</span>
                  <span class="suggestion-id">{{ item.id }}</span>
                </div>
              </template>
            </el-autocomplete>
          </div>

          <el-button 
            type="primary" 
            @click="buildGraph" 
            class="submit-btn"
            :loading="loading"
            :disabled="!centerType || !selectedCenterId"
          >
            <el-icon><Search /></el-icon>
            {{ $t('graph.search') }}
          </el-button>

           <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
            >{{ $t('graph.export') }}</el-button>

          <el-button
            :type="showNodeLabels ? 'success' : 'info'"
            plain
            class="label-toggle-btn"
            @click="toggleNodeLabels"
          >
            <el-icon><PriceTag /></el-icon>
            {{ labelToggleText }}
          </el-button>

        </div>

        <!-- 当前选择提示 -->
        <div v-if="selectedCenterId && searchKeyword" class="selection-hint">
          <el-tag size="small" type="success">
            <el-icon><Check /></el-icon>
             ({{ selectedCenterId }})
          </el-tag>
        </div>

        <!-- 关系筛选行 -->
        <div class="filter-row" v-if="centerType">
          <span class="filter-label">{{ $t('graph.relationFilter') }}</span>
          <el-checkbox-group v-model="relationFilters">
            <el-checkbox 
              v-for="relation in getAvailableRelations()" 
              :key="relation.value" 
              :label="relation.value"
            >
              {{ relation.label }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </div>

      <!-- Sigma Graph -->
      <div v-if="hasGraphData">
        <SigmaGraph 
          :data="graphData" 
          :loading="loading"
          :title="$t('graph.visualizationTitle')"
          :show-labels="showNodeLabels"
          @node-double-click="handleNodeDoubleClick"
        />
      </div>

      <!-- 提示信息 -->
      <div v-else class="graph-hint card">
        <el-icon class="hint-icon"><InfoFilled /></el-icon>
        <p>{{ $t('graph.infoDescription') }}</p>
      </div>

      <!-- Statistics -->
      <div class="stats-container" v-if="hasGraphData">
        <el-row :gutter="20">
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#409eff"><DataAnalysis /></el-icon>
                <div class="stat-text">
                  <h3>{{ graphData.nodes?.length || 0 }}</h3>
                  <p>{{ $t('graph.stats.nodes') }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#67c23a"><Connection /></el-icon>
                <div class="stat-text">
                  <h3>{{ graphData.links?.length || 0 }}</h3>
                  <p>{{ $t('graph.stats.relations') }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="8">
            <el-card shadow="hover" class="stat-card">
              <div class="stat-content">
                <el-icon class="stat-icon" color="#f56c6c"><PriceTag /></el-icon>
                <div class="stat-text">
                  <h3>{{ nodeTypeCount }}</h3>
                  <p>{{ $t('graph.stats.relationTypes') }}</p>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { 
  Share, Search, Orange, Document, MagicStick, Connection, 
  DataAnalysis, PriceTag, InfoFilled, Check, Warning, Operation, Grid, FirstAidKit
} from '@element-plus/icons-vue'
import SigmaGraph from '../components/SigmaGraph.vue'
import { getKnowledgeGraph } from '../api/knowledgeGraph'
import { searchCenterNodes } from '../api/medicine'

const { t } = useI18n()

// 搜索相关
const centerType = ref('')
const searchKeyword = ref('')
const selectedCenterId = ref('')
const relationFilters = ref([])
const loading = ref(false)
const showNodeLabels = ref(false)

// 图数据
const graphData = ref({ nodes: [], links: [], nodeCount: 0, edgeCount: 0 })
const hasGraphData = computed(() => graphData.value.nodes && graphData.value.nodes.length > 0)
const labelToggleText = computed(() => {
  const key = showNodeLabels.value ? 'graph.hideNodeLabels' : 'graph.showNodeLabels'
  const fallback = showNodeLabels.value ? '隐藏节点标签' : '显示节点标签'
  const translated = t(key)
  return translated !== key ? translated : fallback
})

// 节点类型统计
const nodeTypeCount = computed(() => {
  if (!graphData.value.nodes) return 0
  const types = new Set(graphData.value.nodes.map(n => n.type))
  return types.size
})

// 关系选项配置
const relationOptions = {
  herb: [
    { value: 'compound', label: t('graph.showCompound') },
    { value: 'disease', label: t('graph.showDisease') },
    { value: 'syndrome', label: t('graph.showSyndrome') },
    { value: 'symptom', label: t('graph.showSymptom') },
    { value: 'prescription', label: t('graph.showFormula') }
  ],
  prescription: [
    { value: 'herb', label: t('graph.showHerb') },
    { value: 'disease', label: t('graph.showDisease') },
    { value: 'syndrome', label: t('graph.showSyndrome') },
    { value: 'symptom', label: t('graph.showSymptom') }
  ],
  compound: [
    { value: 'herb', label: t('graph.showHerb') },
    { value: 'gene', label: t('graph.showGene') }
  ],
  gene: [
    { value: 'compound', label: t('graph.showCompound') },
    { value: 'disease', label: t('graph.showDisease') },
    { value: 'syndrome', label: t('graph.showSyndrome') },
    { value: 'pathway', label: t('graph.showPathway') },
    { value: 'phenotype', label: t('graph.showPhenotype') }
  ],
  disease: [
    { value: 'gene', label: t('graph.showGene') },
    { value: 'herb', label: t('graph.showHerb') },
    { value: 'syndrome', label: t('graph.showSyndrome') }
  ],
  symptom: [
    { value: 'prescription', label: t('graph.showFormula') },
    { value: 'herb', label: t('graph.showHerb') },
    { value: 'syndrome', label: t('graph.showSyndrome') },
    { value: 'wm_symptom', label: t('graph.showWmSymptom') }
  ],
  syndrome: [
    { value: 'prescription', label: t('graph.showFormula') },
    { value: 'symptom', label: t('graph.showSymptom') },
    { value: 'herb', label: t('graph.showHerb') },
    { value: 'gene', label: t('graph.showGene') }
  ],
  wm_symptom: [
    { value: 'symptom', label: t('graph.showSymptom') },
    { value: 'gene', label: t('graph.showGene') }
  ]
}

const getDefaultRelationSelection = (type) => {
  const available = relationOptions[type] || []
  const filtered =
    type === 'herb' ? available.filter((relation) => relation.value !== 'prescription') : available
  return filtered.map((relation) => relation.value)
}

// Neo4j 节点字段映射（id/label/type 推断）
const nodeTypeMappings = [
  { type: 'herb', idKey: 'tcm_herb_id', labelKeys: ['herb_name_zh', 'name_zh', 'latin_name', 'pinyin_name'] },
  { type: 'prescription', idKey: 'tcm_prescription_id', labelKeys: ['name_zh', 'name_en', 'pinyin_name'] },
  { type: 'compound', idKey: 'inchikey', labelKeys: ['compound_name', 'name_zh', 'mol_name', 'english_name'] },
  { type: 'gene', idKey: 'tcm_tar_id', labelKeys: ['symbol', 'target_name', 'name_zh'] },
  { type: 'disease', idKey: 'disease_id', labelKeys: ['disease_name', 'name_zh', 'english_name'] },
  { type: 'symptom', idKey: 'tcm_symptom_id', labelKeys: ['symptom_name_zh', 'name_zh'] },
  { type: 'syndrome', idKey: 'tcm_syndrome_id', labelKeys: ['syndrome_name_zh', 'name_zh'] },
  { type: 'wm_symptom', idKey: 'wm_symptom_id', labelKeys: ['wm_symptom_name', 'name_zh'] },
  { type: 'phenotype', idKey: 'phenotype_id', labelKeys: ['phenotype_name', 'name_zh'] },
  { type: 'pathway', idKey: 'pathway_id', labelKeys: ['pathway_name', 'name_zh'] }
]

const defaultLabelKeys = ['name_zh', 'name_en', 'name', 'label', 'title', 'symbol', 'alias', 'disease_name', 'herb_name_zh', 'syndrome_name_zh', 'symptom_name_zh']

const pickLabelValue = (node, keys, fallback) => {
  if (!node) return fallback
  for (const key of keys) {
    if (node[key]) {
      return node[key]
    }
  }
  return fallback
}

const resolveNodeMeta = (node, { fallbackType, fallbackId, fallbackLabel } = {}) => {
  if (!node && !fallbackId) return null

  let resolvedType = fallbackType || null
  let resolvedId = fallbackId || null
  let resolvedLabel = fallbackLabel || null

  if (node) {
    for (const mapping of nodeTypeMappings) {
      if (node[mapping.idKey]) {
        resolvedType = mapping.type
        resolvedId = node[mapping.idKey]
        resolvedLabel = pickLabelValue(node, mapping.labelKeys, resolvedLabel)
        break
      }
    }

    if (!resolvedLabel) {
      resolvedLabel = pickLabelValue(node, defaultLabelKeys, resolvedLabel)
    }

    if (!resolvedId) {
      resolvedId = node.id || node.uuid || fallbackId
    }
  }

  if (!resolvedId) {
    resolvedId = fallbackId
  }

  if (!resolvedLabel) {
    resolvedLabel = fallbackLabel || resolvedId
  }

  if (!resolvedId) {
    return null
  }

  return {
    id: resolvedId,
    label: resolvedLabel || resolvedId,
    type: resolvedType || fallbackType || 'unknown',
    raw: node
  }
}

const transformNeo4jGraph = (graphResult, { centerType, centerId, centerLabel }) => {
  if (!graphResult) {
    return { nodes: [], links: [], nodeCount: 0, edgeCount: 0 }
  }

  const nodesMap = new Map()
  const relationships = Array.isArray(graphResult.relationships) ? graphResult.relationships : []

  const centerMeta = resolveNodeMeta(graphResult.centerNode, {
    fallbackType: centerType,
    fallbackId: centerId,
    fallbackLabel: centerLabel
  })

  if (!centerMeta) {
    return { nodes: [], links: [], nodeCount: 0, edgeCount: 0 }
  }

  nodesMap.set(centerMeta.id, {
    id: centerMeta.id,
    label: centerMeta.label,
    type: centerMeta.type,
    isCenter: true,
    extra: graphResult.centerNode || {}
  })

  const links = []

  relationships.forEach((rel) => {
    const targetMeta = resolveNodeMeta(rel?.targetNode || {}, {
      fallbackId: rel?.targetNodeId,
      fallbackLabel: rel?.targetNodeName
    })
    if (!targetMeta) return

    if (!nodesMap.has(targetMeta.id)) {
      nodesMap.set(targetMeta.id, {
        id: targetMeta.id,
        label: targetMeta.label,
        type: targetMeta.type,
        isCenter: false,
        extra: rel?.targetNode || {}
      })
    }

    links.push({
      source: centerMeta.id,
      target: targetMeta.id,
      relation: rel?.relType || 'ASSOCIATED_WITH'
    })
  })

  const nodes = Array.from(nodesMap.values())
  return {
    nodes,
    links,
    nodeCount: nodes.length,
    edgeCount: links.length
  }
}

/**
 * 导出
 */
function handleExport() {
  if (!centerType.value) {
    ElMessage.warning(t('graph.selectCenterType') || '请选择中心节点类型')
    return
  }

  if (!selectedCenterId.value) {
    ElMessage.warning(t('graph.selectCenterNode') || '请选择中心节点')
    return
  }

  const params = new URLSearchParams({
    centerType: centerType.value,
    centerId: selectedCenterId.value,
    relations: relationFilters.value.join(',')
  })

  const exportUrl = `/api/web/tcmseek/knowledge-graph/export?${params.toString()}`

  const link = document.createElement('a')
  link.href = exportUrl
  link.download = `knowledge-graph-${centerType.value}-${selectedCenterId.value}.xlsx`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
/**
 * 获取可用的关系选项
 */
const getAvailableRelations = () => {
  if (!centerType.value) return []
  return relationOptions[centerType.value] || []
}

const toggleNodeLabels = () => {
  showNodeLabels.value = !showNodeLabels.value
}

/**
 * 中心类型变化处理
 */
const handleCenterTypeChange = () => {
  // 清空搜索和选择
  searchKeyword.value = ''
  selectedCenterId.value = ''
  graphData.value = { nodes: [], links: [], nodeCount: 0, edgeCount: 0 }
  
  relationFilters.value = getDefaultRelationSelection(centerType.value)
}

/**
 * 获取输入框占位符
 */
const getCenterTypePlaceholder = () => {
  const placeholders = {
    herb: t('graph.herbPlaceholder') || '请输入中药材名称，如：人参',
    prescription: t('graph.formulaPlaceholder') || '请输入方剂名称，如：四君子汤',
    compound: t('graph.compoundPlaceholder') || '请输入化合物InChIKey或分子式',
    gene: t('graph.genePlaceholder') || '请输入基因符号，如：VEGF',
    disease: t('graph.diseasePlaceholder') || '请输入疾病名称，如：diabetes',
    symptom: t('graph.symptomPlaceholder') || '请输入中医症状，如：头痛',
    syndrome: t('graph.syndromePlaceholder') || '请输入中医证候，如：肝郁气滞证',
    wm_symptom: t('graph.wmSymptomPlaceholder') || '请输入西医症状，如：headache'
  }
  return placeholders[centerType.value] || t('graph.searchPlaceholder')
}

/**
 * 搜索建议（自动完成）
 */
const searchSuggestions = async (queryString, cb) => {
  if (!queryString || !centerType.value) {
    cb([])
    return
  }

  try {
    const res = await searchCenterNodes({
      centerType: centerType.value,
      keyword: queryString,
      page: 1,
      pageSize: 50
    })

    if (res.code === 200 && res.data.rows) {
      const suggestions = res.data.rows.map(item => ({
        value: item.name,
        id: item.id,
        name: item.name,
        extra: item.extra
      }))
      cb(suggestions)
    } else {
      cb([])
    }
  } catch (error) {
    console.error('搜索建议失败:', error)
    cb([])
  }
}

/**
 * 搜索输入变化处理
 */
const handleSearchInput = () => {
  // 输入内容改变时，清空已选择的ID
  // 这样可以确保用户必须重新从建议中选择
  if (selectedCenterId.value) {
    selectedCenterId.value = ''
  }
}

/**
 * 选择建议项
 */
const handleSelect = (item) => {
  selectedCenterId.value = item.id
  searchKeyword.value = item.name
  console.log('选择了中心节点:', { id: item.id, name: item.name })
}

/**
 * 快速搜索（回车键）
 */
const quickSearch = () => {
  if (!searchKeyword.value || !centerType.value) {
    return
  }
  
  // 如果没有选择具体的节点，提示用户必须选择
  if (!selectedCenterId.value) {
    ElMessage.warning(t('graph.pleaseSelectFromSuggestions') || '请从搜索建议中选择一个节点')
    return
  }
  
  buildGraph()
}

/**
 * 构建知识图谱
 */
const buildGraph = async () => {
  if (!centerType.value) {
    ElMessage.warning(t('graph.selectCenterType') || '请选择中心节点类型')
    return
  }

  if (!selectedCenterId.value) {
    ElMessage.warning(t('graph.selectCenterNode') || '请选择或输入中心节点')
    return
  }

  loading.value = true

  try {
    console.log('构建Neo4j图谱 - centerType:', centerType.value, 'centerId:', selectedCenterId.value, 'relations:', relationFilters.value)

    const res = await getKnowledgeGraph({
      centerType: centerType.value,
      centerId: selectedCenterId.value,
      relations: relationFilters.value.join(',')
    })

    const normalized = transformNeo4jGraph(res, {
      centerType: centerType.value,
      centerId: selectedCenterId.value,
      centerLabel: searchKeyword.value
    })

    graphData.value = normalized

    if (!normalized.nodes.length) {
      ElMessage.info(t('graph.noData') || '未找到相关数据')
    } else {
      ElMessage.success(
        t('graph.buildSuccess') ||
        `图谱构建成功！节点: ${normalized.nodeCount}, 边: ${normalized.edgeCount}`
      )
    }
  } catch (error) {
    console.error('构建图谱失败:', error)
    ElMessage.error((error?.message) || t('graph.buildError') || '构建图谱时发生错误')
    graphData.value = { nodes: [], links: [], nodeCount: 0, edgeCount: 0 }
  } finally {
    loading.value = false
  }
}

/**
 * 处理节点双击事件
 */
const handleNodeDoubleClick = (nodeData) => {
  console.log('处理双击节点:', nodeData)
  
  // 如果双击的是中心节点，提示用户
  if (nodeData.isCenter) {
    ElMessage.info('当前节点已经是中心节点')
    return
  }
  
  // 节点类型映射到 centerType
  const typeMapping = {
    'herb': 'herb',
    'compound': 'compound',
    'gene': 'gene',
    'prescription': 'prescription',
    'disease': 'disease',     // 疾病
    'symptom': 'symptom',     // 中医症状
    'syndrome': 'syndrome',   // 中医证候
    'wm_symptom': 'wm_symptom' // 西医症状
  }
  
  const newCenterType = typeMapping[nodeData.type]
  
  if (!newCenterType) {
    ElMessage.warning('该节点类型暂不支持作为中心节点')
    return
  }
  
  // 更新搜索参数
  centerType.value = newCenterType
  searchKeyword.value = nodeData.label
  selectedCenterId.value = nodeData.id
  
  // 更新关系筛选（使用默认规则）
  relationFilters.value = getDefaultRelationSelection(centerType.value)
  
  // 提示用户
  ElMessage.success(`切换中心节点为: ${nodeData.label}`)
  
  // 重新构建图谱
  buildGraph()
}
</script>

<style scoped>
.knowledge-graph-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 100px 0 50px;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  font-size: 2.5rem;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.page-header h1 .el-icon {
  font-size: 2.5rem;
  color: #409eff;
}

.page-description {
  font-size: 1.2rem;
  color: #606266;
  margin: 0;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.graph-controls {
  position: relative;
}

.search-row {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.category-group {
  width: 200px;
}

.category-select, .search-input {
  width: 100%;
}

.submit-btn {
  white-space: nowrap;
}

.label-toggle-btn {
  white-space: nowrap;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
}

.suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-name {
  font-weight: 500;
}

.suggestion-id {
  font-size: 0.85em;
  color: #909399;
  margin-left: 10px;
}

.selection-hint {
  padding: 10px 0 0 0;
  font-size: 0.9em;
  color: #67c23a;
}

.selection-hint .el-tag {
  padding: 5px 12px;
}

.selection-hint .el-icon {
  margin-right: 5px;
}

.graph-hint {
  text-align: center;
  padding: 80px 40px;
  color: #909399;
}

.hint-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  opacity: 0.3;
}

.graph-hint p {
  font-size: 1.1rem;
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}

.stats-container {
  margin-top: 25px;
}

.stat-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  font-size: 3rem;
}

.stat-text h3 {
  margin: 0 0 5px 0;
  font-size: 2rem;
  color: #303133;
}

.stat-text p {
  margin: 0;
  color: #909399;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .knowledge-graph-page {
    padding: 80px 0 30px;
  }

  .page-header h1 {
    font-size: 2rem;
  }

  .search-row {
    flex-direction: column;
  }

  .search-group,
  .category-group {
    width: 100%;
    min-width: auto;
  }

  .filter-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
