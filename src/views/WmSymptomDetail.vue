<template>
  <div class="wm-symptom-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="goBack" type="default">
          <el-icon><ArrowLeft /></el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon"><WarningFilled /></el-icon>
        <p>{{ error }}</p>
      </div>

      <!-- 西医症状详情 -->
      <div v-else-if="wmSymptom" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="wm-symptom-overview">
          <div class="header-left">
            <el-icon class="symptom-icon">
              <View />
            </el-icon>
            <div class="header-info">
              <h1>{{ wmSymptom.symptomName }}</h1>
              <div class="sub-info">
                <el-tag v-if="wmSymptom.umlsId" type="info" size="small">UMLS: {{ wmSymptom.umlsId }}</el-tag>
              </div>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ wmSymptom.wmSymptomId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="summary-section card" id="wm-symptom-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.wmSymptom.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="wmSymptom.symptomName">
                <td class="label-cell">{{ $t('medicine.wmSymptom.name') }}</td>
                <td class="value-cell">{{ wmSymptom.symptomName }}</td>
              </tr>
              <tr v-if="wmSymptom.wmSymptomId">
                <td class="label-cell">{{ $t('medicine.wmSymptom.id') }}</td>
                <td class="value-cell">{{ wmSymptom.wmSymptomId }}</td>
              </tr>
              <tr v-if="wmSymptom.umlsId">
                <td class="label-cell">{{ $t('medicine.wmSymptom.umlsId') }}</td>
                <td class="value-cell">{{ wmSymptom.umlsId }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关联数据 -->
        <div class="related-tabs card" id="wm-symptom-related">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.wmSymptom.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 关联中医症状 -->
            <el-tab-pane :label="$t('medicine.wmSymptom.relatedTcmSymptoms')" name="tcmSymptoms">
              <div v-if="tcmSymptomsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="tcmSymptoms.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="tcmSymptoms" border stripe>
                  <el-table-column :label="$t('medicine.symptom.id')" min-width="140">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSymptomDetail(row.tcmSymptomId)">{{ row.tcmSymptomId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.symptom.name')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSymptomDetail(row.tcmSymptomId)">{{ row.symptomNameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="symptomPinyin" :label="$t('medicine.symptom.pinyin')" min-width="120" />
                  <el-table-column prop="symptomLocus" :label="$t('medicine.symptom.locus')" min-width="100" />
                  <el-table-column prop="symptomDefinition" :label="$t('medicine.symptom.definition')" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="tcmSymptomsPagination.page"
                    v-model:page-size="tcmSymptomsPagination.pageSize"
                    :total="tcmSymptomsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleTcmSymptomsPageChange"
                    @size-change="handleTcmSymptomsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 关联基因 -->
            <el-tab-pane :label="$t('medicine.wmSymptom.relatedGenes')" name="genes">
              <div v-if="genesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="genes.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="genes" border stripe>
                  <el-table-column :label="$t('medicine.gene.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToGeneDetail(row.tcmTarId)">{{ row.tcmTarId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.gene.symbol')" min-width="100">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToGeneDetail(row.tcmTarId)">{{ row.symbol }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="geneEntrezId" :label="$t('medicine.gene.geneId')" min-width="100" />
                  <el-table-column prop="uniprotId" label="UniProt ID" min-width="120" />
                  <el-table-column prop="description" :label="$t('medicine.gene.description')" min-width="250" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="genesPagination.page"
                    v-model:page-size="genesPagination.pageSize"
                    :total="genesPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleGenesPageChange"
                    @size-change="handleGenesPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <AnchorNavigation :sections="anchorSections" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'
import { ElMessage } from 'element-plus'
import { 
  getWmSymptomDetail,
  getWmSymptomTcmSymptoms,
  getWmSymptomGenes
} from '@/api/medicine'
import { 
  ArrowLeft, 
  Loading, 
  WarningFilled, 
  InfoFilled, 
  Connection, 
  View 
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const wmSymptom = ref(null)

const anchorSections = computed(() => {
  if (!wmSymptom.value) return []

  return [
    { id: 'wm-symptom-overview', labelKey: 'common.anchorOverview' },
    { id: 'wm-symptom-info', labelKey: 'medicine.wmSymptom.basicInfo' },
    { id: 'wm-symptom-related', labelKey: 'medicine.wmSymptom.relatedData' }
  ]
})
const loading = ref(true)
const error = ref(null)
const activeTab = ref('tcmSymptoms')

// 中医症状相关
const tcmSymptoms = ref([])
const tcmSymptomsLoading = ref(false)
const tcmSymptomsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 基因相关
const genes = ref([])
const genesLoading = ref(false)
const genesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 加载西医症状详情
const loadWmSymptom = async () => {
  const wmSymptomId = route.params.id
  if (!wmSymptomId) {
    error.value = t('medicine.wmSymptom.invalidId')
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await getWmSymptomDetail(wmSymptomId)
    if (response.code === 200) {
      wmSymptom.value = response.data
    } else {
      error.value = response.msg || t('common.loadFailed')
    }
  } catch (err) {
    console.error('加载西医症状详情失败:', err)
    error.value = t('common.networkError')
  } finally {
    loading.value = false
  }
}

// 加载中医症状
const loadTcmSymptoms = async () => {
  if (!wmSymptom.value) return
  tcmSymptomsLoading.value = true
  try {
    const response = await getWmSymptomTcmSymptoms(wmSymptom.value.wmSymptomId, {
      page: tcmSymptomsPagination.value.page,
      pageSize: tcmSymptomsPagination.value.pageSize
    })
    if (response.code === 200) {
      tcmSymptoms.value = response.rows || []
      tcmSymptomsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载中医症状失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    tcmSymptomsLoading.value = false
  }
}

// 加载基因
const loadGenes = async () => {
  if (!wmSymptom.value) return
  genesLoading.value = true
  try {
    const response = await getWmSymptomGenes(wmSymptom.value.wmSymptomId, {
      page: genesPagination.value.page,
      pageSize: genesPagination.value.pageSize
    })
    if (response.code === 200) {
      genes.value = response.rows || []
      genesPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载基因失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    genesLoading.value = false
  }
}

// Tab切换
const handleTabChange = (tabName) => {
  if (tabName === 'tcmSymptoms' && tcmSymptoms.value.length === 0) {
    loadTcmSymptoms()
  } else if (tabName === 'genes' && genes.value.length === 0) {
    loadGenes()
  }
}

// 分页处理
const handleTcmSymptomsPageChange = () => {
  loadTcmSymptoms()
}

const handleGenesPageChange = () => {
  loadGenes()
}

// 导航
const goBack = () => {
  router.back()
}

const goToSymptomDetail = (symptomId) => {
  if (symptomId) {
    router.push({
      name: 'SymptomDetail',
      params: { id: symptomId }
    })
  }
}

const goToGeneDetail = (geneId) => {
  if (geneId) {
    router.push({
      name: 'GeneDetail',
      params: { id: geneId }
    })
  }
}

onMounted(async () => {
  await loadWmSymptom()
  if (wmSymptom.value) {
    loadTcmSymptoms()
  }
})
</script>

<style scoped>
.wm-symptom-detail-page {
  min-height: 100vh;
  background: #f8fffe;
  padding: 40px 0;
}

.wm-symptom-detail-page .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.wm-symptom-detail-page .back-button {
  margin-bottom: 20px;
}

.wm-symptom-detail-page .loading-container,
.wm-symptom-detail-page .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.wm-symptom-detail-page .loading-icon,
.wm-symptom-detail-page .error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.wm-symptom-detail-page .loading-icon {
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

.wm-symptom-detail-page .card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.wm-symptom-detail-page .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.wm-symptom-detail-page .detail-header .header-left {
  display: flex;
  gap: 20px;
  flex: 1;
}

.wm-symptom-detail-page .detail-header .symptom-icon {
  font-size: 64px;
  color: #2d8659;
}

.wm-symptom-detail-page .detail-header .header-info {
  flex: 1;
}

.wm-symptom-detail-page .detail-header .header-info h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  color: #2c3e50;
}

.wm-symptom-detail-page .detail-header .sub-info {
  margin-bottom: 15px;
}

.wm-symptom-detail-page .detail-header .id-badge {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.wm-symptom-detail-page .section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #2c3e50;
}

.wm-symptom-detail-page .section-title :deep(.el-icon) {
  font-size: 28px;
  color: #2d8659;
}

.wm-symptom-detail-page .info-table {
  width: 100%;
  border-collapse: collapse;
}

.wm-symptom-detail-page .info-table tr {
  border-bottom: 1px solid #ebeef5;
}

.wm-symptom-detail-page .info-table tr:last-child {
  border-bottom: none;
}

.wm-symptom-detail-page .info-table .label-cell {
  padding: 15px 10px;
  font-weight: 600;
  color: #606266;
  width: 200px;
  vertical-align: top;
}

.wm-symptom-detail-page .info-table .value-cell {
  padding: 15px 10px;
  color: #303133;
}

.wm-symptom-detail-page .related-tabs :deep(.el-tabs__header) {
  margin-bottom: 20px;
}

.wm-symptom-detail-page .related-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
}

.wm-symptom-detail-page .related-tabs .tab-loading,
.wm-symptom-detail-page .related-tabs .tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #909399;
}

.wm-symptom-detail-page .related-tabs :deep(.el-table) {
  margin-bottom: 20px;
}

.wm-symptom-detail-page .related-tabs .clickable {
  color: #2d8659;
  cursor: pointer;
  transition: color 0.3s;
}

.wm-symptom-detail-page .related-tabs .clickable:hover {
  color: #1a5f4a;
  text-decoration: underline;
}

.wm-symptom-detail-page .related-tabs .tab-pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
