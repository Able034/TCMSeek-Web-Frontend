<template>
  <div class="disease-detail-page">
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

      <!-- 疾病详情 -->
      <div v-else-if="disease" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="disease-overview">
          <div class="header-left">
            <el-icon class="disease-icon">
              <Operation />
            </el-icon>
            <div class="header-info">
              <h1>{{ disease.diseaseName || disease.diseaseId }}</h1>
              <div class="sub-info">
                <span class="disease-id">{{ disease.diseaseId }}</span>
              </div>
              <div class="id-badge" v-if="disease.source">
                <el-tag type="success" size="large">{{ $t('common.source') }}: {{ disease.source }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息汇总表 -->
        <div class="summary-section card" id="disease-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.disease.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr>
                <td class="label-cell">{{ $t('medicine.disease.id') }}</td>
                <td class="value-cell">{{ disease.diseaseId }}</td>
              </tr>
              <tr v-if="disease.diseaseName">
                <td class="label-cell">{{ $t('medicine.disease.name') }}</td>
                <td class="value-cell">{{ disease.diseaseName }}</td>
              </tr>
              <tr v-if="disease.source">
                <td class="label-cell">{{ $t('common.source') }}</td>
                <td class="value-cell">{{ disease.source }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab标签页 -->
        <div class="tabs-section card" id="disease-related">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 相关基因 -->
            <el-tab-pane :label="$t('medicine.disease.relatedGenes')" name="genes">
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

            <!-- 相关方剂 -->
            <el-tab-pane :label="$t('medicine.disease.relatedPrescriptions')" name="prescriptions">
              <div v-if="prescriptionsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="prescriptions.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="prescriptions" border stripe>
                  <el-table-column :label="$t('medicine.formula.id')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">
                        {{ row.tcmPrescriptionId }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.formula.name')" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">
                        {{ row.nameZh }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="pinyinName" :label="$t('medicine.formula.pinyin')" min-width="150" />
                  <el-table-column prop="effectsZh" :label="$t('medicine.formula.effects')" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="prescriptionsPagination.page"
                    v-model:page-size="prescriptionsPagination.pageSize"
                    :total="prescriptionsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handlePrescriptionsPageChange"
                    @size-change="handlePrescriptionsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关中药 -->
            <el-tab-pane :label="$t('medicine.disease.relatedHerbs')" name="herbs">
              <div v-if="herbsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="herbs.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="herbs" border stripe>
                  <el-table-column :label="$t('medicine.herb.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToHerbDetail(row.tcmHerbId)">{{ row.tcmHerbId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.herb.name')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToHerbDetail(row.tcmHerbId)">{{ row.herbNameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="pinyinName" :label="$t('medicine.herb.pinyin')" min-width="150" />
                  <el-table-column prop="latinName" :label="$t('medicine.herb.latin')" min-width="200" />
                  <el-table-column prop="efficacyZh" :label="$t('medicine.herb.efficacy')" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="herbsPagination.page"
                    v-model:page-size="herbsPagination.pageSize"
                    :total="herbsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleHerbsPageChange"
                    @size-change="handleHerbsPageChange"
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
import { ArrowLeft, Loading, WarningFilled, InfoFilled, Operation } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  getDiseaseDetail, 
  getDiseaseGenes, 
  getDiseasePrescriptions,
  getDiseaseHerbs
} from '@/api/medicine'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const disease = ref(null)

const anchorSections = computed(() => {
  if (!disease.value) return []

  return [
    { id: 'disease-overview', labelKey: 'common.anchorOverview' },
    { id: 'disease-info', labelKey: 'medicine.disease.basicInfo' },
    { id: 'disease-related', labelKey: 'medicine.disease.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('genes')

// 相关基因
const genes = ref([])
const genesLoading = ref(false)
const genesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关方剂
const prescriptions = ref([])
const prescriptionsLoading = ref(false)
const prescriptionsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关中药
const herbs = ref([])
const herbsLoading = ref(false)
const herbsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取疾病详情
const fetchDiseaseDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const diseaseId = route.params.id
    if (!diseaseId) {
      error.value = t('medicine.disease.invalidId')
      return
    }
    
    const response = await getDiseaseDetail(diseaseId)
    
    if (response.code === 200 && response.data) {
      disease.value = response.data
      // 自动加载第一个tab的数据
      loadGenes()
    } else {
      error.value = response.msg || t('common.loadFailed')
    }
  } catch (err) {
    console.error('加载疾病详情失败:', err)
    error.value = t('common.networkError')
  } finally {
    loading.value = false
  }
}

// 加载基因数据
const loadGenes = async () => {
  if (!disease.value) return
  
  genesLoading.value = true
  try {
    const response = await getDiseaseGenes(disease.value.diseaseId, {
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

// 加载方剂数据
const loadPrescriptions = async () => {
  if (!disease.value) return
  
  prescriptionsLoading.value = true
  try {
    const response = await getDiseasePrescriptions(disease.value.diseaseId, {
      page: prescriptionsPagination.value.page,
      pageSize: prescriptionsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      prescriptions.value = response.rows || []
      prescriptionsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载方剂失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    prescriptionsLoading.value = false
  }
}

// 加载中药数据
const loadHerbs = async () => {
  if (!disease.value) return
  
  herbsLoading.value = true
  try {
    const response = await getDiseaseHerbs(disease.value.diseaseId, {
      page: herbsPagination.value.page,
      pageSize: herbsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      herbs.value = response.rows || []
      herbsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载中药失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    herbsLoading.value = false
  }
}

// 分页处理
const handleGenesPageChange = () => {
  loadGenes()
}

const handlePrescriptionsPageChange = () => {
  loadPrescriptions()
}

const handleHerbsPageChange = () => {
  loadHerbs()
}

// Tab切换处理
const handleTabChange = (tabName) => {
  switch (tabName) {
    case 'genes':
      if (genes.value.length === 0) loadGenes()
      break
    case 'prescriptions':
      if (prescriptions.value.length === 0) loadPrescriptions()
      break
    case 'herbs':
      if (herbs.value.length === 0) loadHerbs()
      break
  }
}

// 跳转到基因详情
const goToGeneDetail = (geneId) => {
  if (geneId) {
    router.push({
      name: 'GeneDetail',
      params: { id: geneId }
    })
  }
}

// 跳转到方剂详情
const goToPrescriptionDetail = (prescriptionId) => {
  if (prescriptionId) {
    router.push({
      name: 'PrescriptionDetail',
      params: { id: prescriptionId }
    })
  }
}

// 跳转到中药详情
const goToHerbDetail = (herbId) => {
  if (herbId) {
    router.push({
      name: 'HerbDetail',
      params: { id: herbId }
    })
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchDiseaseDetail()
})
</script>

<style scoped>
.disease-detail-page {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
  background: #f8fffe;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.back-button {
  margin-bottom: 20px;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.loading-icon,
.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
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

.card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-left {
  display: flex;
  gap: 20px;
  flex: 1;
}

.disease-icon {
  font-size: 64px;
  color: #2d8659;
}

.header-info h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  color: #2c3e50;
}

.sub-info {
  margin-bottom: 15px;
}

.disease-id {
  color: #606266;
  font-size: 16px;
}

.id-badge {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 24px;
  color: #2c3e50;
}

.section-title .el-icon {
  font-size: 28px;
  color: #2d8659;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
}

.info-table tr {
  border-bottom: 1px solid #ebeef5;
}

.info-table tr:last-child {
  border-bottom: none;
}

.label-cell {
  padding: 15px 10px;
  font-weight: 600;
  color: #606266;
  width: 200px;
  vertical-align: top;
}

.value-cell {
  padding: 15px 10px;
  color: #303133;
}

.tabs-section {
  min-height: 400px;
}

.tab-loading,
.tab-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: #909399;
}

.tab-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.clickable {
  color: #2d8659;
  cursor: pointer;
  transition: color 0.3s;
}

.clickable:hover {
  color: #1a5f4a;
  text-decoration: underline;
}
</style>



