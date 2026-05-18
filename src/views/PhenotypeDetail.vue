<template>
  <div class="phenotype-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-button-wrapper">
        <button class="back-button" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <!-- 内容区域 -->
        <div v-else-if="phenotype" class="content-wrapper">
          <!-- 基本信息卡片 -->
          <div class="card detail-header" id="phenotype-overview">
          <div class="header-icon">
            <el-icon><Platform /></el-icon>
          </div>
          <div class="header-content">
            <h1 class="phenotype-name">{{ phenotype.phenotypeName }}</h1>
            <div class="phenotype-meta">
              <span class="meta-item">
                <el-icon><Ticket /></el-icon>
                <strong>{{ $t('medicine.phenotype.id') }}:</strong>
                {{ phenotype.phenotypeId }}
              </span>
              <span class="meta-item">
                <el-icon><Document /></el-icon>
                <strong>{{ $t('medicine.phenotype.source') }}:</strong>
                {{ phenotype.source || 'HPO' }}
              </span>
            </div>
            <div class="external-link">
              <a 
                :href="`https://hpo.jax.org/app/browse/term/${phenotype.phenotypeId}`" 
                target="_blank"
                rel="noopener noreferrer"
                class="hpo-link"
              >
                <el-icon><Link /></el-icon>
                {{ $t('medicine.phenotype.viewInHPO') }}
              </a>
            </div>
          </div>
        </div>

        <!-- 统计信息卡片 -->
          <div class="card statistics-card" id="phenotype-stats">
          <h2>{{ $t('medicine.phenotype.statistics') }}</h2>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><DataLine /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ statistics.targetCount || 0 }}</div>
                <div class="stat-label">{{ $t('medicine.phenotype.relatedGenes') }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs 选项卡 -->
          <div class="card tabs-card" id="phenotype-related">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <!-- 关联靶标/基因 Tab -->
            <el-tab-pane 
              :label="$t('medicine.phenotype.relatedTargets')" 
              name="targets"
            >
              <div class="tab-content">
                <!-- 搜索框 -->
                <div class="search-bar-inline">
                  <el-input
                    v-model="targetsKeyword"
                    :placeholder="$t('medicine.phenotype.searchTargets')"
                    clearable
                    @clear="loadTargets"
                    @keyup.enter="loadTargets"
                  >
                    <template #prefix>
                      <el-icon><Search /></el-icon>
                    </template>
                  </el-input>
                  <el-button type="primary" @click="loadTargets">
                    {{ $t('common.search') }}
                  </el-button>
                </div>

                <!-- 加载状态 -->
                <div v-if="targetsLoading" class="loading-state">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <p>{{ $t('common.loading') }}...</p>
                </div>

                <!-- 空数据 -->
                <div v-else-if="targets.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><Document /></el-icon>
                  <p>{{ $t('common.noData') }}</p>
                </div>

                <!-- 数据表格 -->
                <div v-else class="related-table-wrapper">
                  <table class="related-table">
                    <thead>
                      <tr>
                        <th>{{ $t('medicine.gene.id') }}</th>
                        <th>{{ $t('medicine.gene.symbol') }}</th>
                        <th>{{ $t('medicine.gene.uniprotId') }}</th>
                        <th>{{ $t('medicine.gene.ensemblId') }}</th>
                        <th>{{ $t('medicine.gene.description') }}</th>
                        <th>{{ $t('medicine.gene.type') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr 
                        v-for="target in targets" 
                        :key="target.tcmTarId"
                        @click="goToGeneDetail(target.tcmTarId)"
                        class="clickable-row"
                      >
                        <td class="id-cell">{{ target.tcmTarId }}</td>
                        <td class="symbol-cell">
                          <strong>{{ target.symbol || '-' }}</strong>
                        </td>
                        <td>{{ target.uniprotId || '-' }}</td>
                        <td>{{ target.ensemblId || '-' }}</td>
                        <td class="description-cell">{{ target.description || '-' }}</td>
                        <td>{{ target.typeOfGene || '-' }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- 分页 -->
                  <div class="pagination-wrapper">
                    <el-pagination
                      v-model:current-page="targetsPagination.page"
                      :page-size="targetsPagination.pageSize"
                      :total="targetsPagination.total"
                      layout="total, prev, pager, next, jumper"
                      @current-change="handleTargetsPageChange"
                      background
                    />
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <!-- 知识图谱 Tab -->
            <el-tab-pane 
              :label="$t('medicine.phenotype.knowledgeGraph')" 
              name="graph"
            >
              <div class="tab-content">
                <div v-if="graphLoading" class="loading-state">
                  <el-icon class="loading-icon"><Loading /></el-icon>
                  <p>{{ $t('common.loading') }}...</p>
                </div>
                <div v-else-if="!graphData.nodes || graphData.nodes.length === 0" class="empty-state">
                  <el-icon class="empty-icon"><Share /></el-icon>
                  <p>{{ $t('common.noData') }}</p>
                </div>
                <div v-else class="graph-container">
                  <SigmaGraph 
                    :data="graphData"
                    :center-id="phenotype.phenotypeId"
                    :height="600"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <AnchorNavigation :sections="anchorSections" />
      </div>

      <!-- 错误状态 -->
      <div v-else class="error-container">
        <el-icon class="error-icon"><WarnTriangleFilled /></el-icon>
        <p>{{ $t('common.loadFailed') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft, Loading, Platform, Ticket, Document, Link,
  DataLine, Search, WarnTriangleFilled, Share
} from '@element-plus/icons-vue'
import {
  getPhenotypeDetail,
  getPhenotypeTargets,
  getPhenotypeStatistics,
  getPhenotypeGraph
} from '@/api/medicine'
import SigmaGraph from '@/components/SigmaGraph.vue'
import AnchorNavigation from '@/components/AnchorNavigation.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 表型ID
const phenotypeId = ref(route.params.id)

// 数据状态
const loading = ref(true)
const phenotype = ref(null)
const statistics = ref({})

const anchorSections = computed(() => {
  if (!phenotype.value) return []

  return [
    { id: 'phenotype-overview', labelKey: 'common.anchorOverview' },
    { id: 'phenotype-stats', labelKey: 'medicine.phenotype.statistics' },
    { id: 'phenotype-related', labelKey: 'medicine.phenotype.relatedData' }
  ]
})

// Tabs
const activeTab = ref('targets')

// 关联靶标/基因
const targets = ref([])
const targetsLoading = ref(false)
const targetsKeyword = ref('')
const targetsPagination = ref({ page: 1, pageSize: 10, total: 0 })

// 知识图谱
const graphData = ref({ nodes: [], edges: [] })
const graphLoading = ref(false)

// 返回
const goBack = () => {
  router.back()
}

// 跳转到基因详情
const goToGeneDetail = (geneId) => {
  router.push(`/gene/${geneId}`)
}

// 加载表型基本信息
const loadPhenotypeDetail = async () => {
  loading.value = true
  try {
    const response = await getPhenotypeDetail(phenotypeId.value)
    if (response.code === 200) {
      phenotype.value = response.data
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载表型详情失败:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    loading.value = false
  }
}

// 加载统计信息
const loadStatistics = async () => {
  try {
    const response = await getPhenotypeStatistics(phenotypeId.value)
    if (response.code === 200) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('加载统计信息失败:', error)
  }
}

// 加载关联靶标/基因
const loadTargets = async () => {
  targetsLoading.value = true
  try {
    const response = await getPhenotypeTargets(phenotypeId.value, {
      page: targetsPagination.value.page,
      pageSize: targetsPagination.value.pageSize,
      keyword: targetsKeyword.value
    })
    if (response.code === 200) {
      targets.value = response.rows || []
      targetsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载关联靶标失败:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    targetsLoading.value = false
  }
}

// 加载知识图谱数据
const loadGraphData = async () => {
  graphLoading.value = true
  try {
    const response = await getPhenotypeGraph(phenotypeId.value)
    if (response.code === 200) {
      graphData.value = response.data
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载知识图谱失败:', error)
    ElMessage.error(t('common.loadFailed'))
  } finally {
    graphLoading.value = false
  }
}

// Tab 切换
const handleTabClick = (tab) => {
  const tabName = tab.props.name
  if (tabName === 'targets' && targets.value.length === 0) {
    loadTargets()
  } else if (tabName === 'graph' && graphData.value.nodes.length === 0) {
    loadGraphData()
  }
}

// 分页变化
const handleTargetsPageChange = (page) => {
  targetsPagination.value.page = page
  loadTargets()
}

// 初始化
onMounted(() => {
  loadPhenotypeDetail()
  loadStatistics()
  loadTargets()
})
</script>

<style scoped>
.phenotype-detail-page {
  min-height: 100vh;
  background: linear-gradient(135deg,#2d8659 0%, #1a5f4a 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.back-button-wrapper {
  margin-bottom: 20px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 8px;
  color: #2d8659;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.back-button:hover {
  background: white;
  transform: translateX(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 基本信息 */
.detail-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.header-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-icon .el-icon {
  font-size: 40px;
  color: white;
}

.header-content {
  flex: 1;
}

.phenotype-name {
  font-size: 28px;
  font-weight: 700;
  color: #2d8659;
  margin-bottom: 16px;
}

.phenotype-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  font-size: 14px;
}

.meta-item .el-icon {
  color: #2d8659;
}

.meta-item strong {
  color: #2c3e50;
}

.external-link {
  margin-top: 16px;
}

.hpo-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #f0f2f5;
  border-radius: 6px;
  color: #2d8659;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s;
}

.hpo-link:hover {
  background: #2d8659;
  color: white;
}

/* 统计信息 */
.statistics-card h2 {
  font-size: 20px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #2d865915 0%, #1a5f4a15 100%);
  border-radius: 10px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #2d8659;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #606266;
}

/* Tabs */
.tabs-card {
  padding: 20px;
}

.tab-content {
  padding: 20px 0;
}

/* 搜索栏 */
.search-bar-inline {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar-inline .el-input {
  flex: 1;
}

/* 表格 */
.related-table-wrapper {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.related-table {
  width: 100%;
  border-collapse: collapse;
}

.related-table thead {
  background: #f5f7fa;
}

.related-table th {
  padding: 14px 16px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  border-bottom: 2px solid #e4e7ed;
}

.related-table tbody tr {
  transition: all 0.3s;
  cursor: pointer;
}

.related-table tbody tr:hover {
  background: #f0f2f5;
}

.related-table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f0f2f5;
  font-size: 14px;
  color: #606266;
}

.id-cell {
  color: #2d8659;
  font-weight: 500;
}

.symbol-cell strong {
  color: #2c3e50;
}

.description-cell {
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: center;
  background: #fafafa;
}

/* 加载和空状态 */
.loading-container,
.loading-state,
.empty-state,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #909399;
}

.loading-icon,
.empty-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-icon {
  animation: rotate 1.5s linear infinite;
  color: #2d8659;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-icon {
  color: #f56c6c;
}

/* 图谱容器 */
.graph-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
  background: #f9fafb;
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .search-bar-inline {
    flex-direction: column;
  }

  .related-table {
    font-size: 12px;
  }

  .related-table th,
  .related-table td {
    padding: 10px 8px;
  }
}
</style>
