<template>
  <div class="symptom-detail-page">
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

      <!-- 症状详情 -->
      <div v-else-if="symptom" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="symptom-overview">
          <div class="header-left">
            <el-icon class="symptom-icon">
              <View />
            </el-icon>
            <div class="header-info">
              <h1>{{ symptom.symptomNameZh }}</h1>
              <div class="sub-info">
                <span class="pinyin" v-if="symptom.symptomPinyin">{{ symptom.symptomPinyin }}</span>
                <el-tag v-if="symptom.type" type="info" size="small">{{ symptom.type }}</el-tag>
              </div>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ symptom.tcmSymptomId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="summary-section card" id="symptom-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.symptom.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="symptom.symptomNameZh">
                <td class="label-cell">{{ $t('medicine.symptom.name') }}</td>
                <td class="value-cell">{{ symptom.symptomNameZh }}</td>
              </tr>
              <tr v-if="symptom.symptomPinyin">
                <td class="label-cell">{{ $t('medicine.symptom.pinyin') }}</td>
                <td class="value-cell">{{ symptom.symptomPinyin }}</td>
              </tr>
              <tr v-if="symptom.symptomLocus">
                <td class="label-cell">{{ $t('medicine.symptom.locus') }}</td>
                <td class="value-cell">{{ symptom.symptomLocus }}</td>
              </tr>
              <tr v-if="symptom.symptomProperty">
                <td class="label-cell">{{ $t('medicine.symptom.property') }}</td>
                <td class="value-cell">{{ symptom.symptomProperty }}</td>
              </tr>
              <tr v-if="symptom.type">
                <td class="label-cell">{{ $t('medicine.symptom.type') }}</td>
                <td class="value-cell">{{ symptom.type }}</td>
              </tr>
              <tr v-if="symptom.symptomDefinition">
                <td class="label-cell">{{ $t('medicine.symptom.definition') }}</td>
                <td class="value-cell function-cell">{{ symptom.symptomDefinition }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关联数据 -->
        <div class="related-tabs card" id="symptom-related">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.symptom.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 关联中药 -->
            <el-tab-pane :label="$t('medicine.symptom.relatedHerbs')" name="herbs">
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
                  <el-table-column prop="latinName" :label="$t('medicine.herb.latin')" min-width="150" />
                  <el-table-column prop="efficacyZh" :label="$t('medicine.herb.efficacy')" min-width="200" />
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

            <!-- 关联方剂 -->
            <el-tab-pane :label="$t('medicine.symptom.relatedPrescriptions')" name="prescriptions">
              <div v-if="prescriptionsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="prescriptions.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="prescriptions" border stripe>
                  <el-table-column :label="$t('medicine.prescription.id')" min-width="140">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">{{ row.tcmPrescriptionId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.prescription.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">{{ row.nameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="pinyinName" :label="$t('medicine.prescription.pinyin')" min-width="150" />
                  <el-table-column prop="source" :label="$t('medicine.prescription.source')" min-width="120" />
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

            <!-- 关联证候 -->
            <el-tab-pane :label="$t('medicine.symptom.relatedSyndromes')" name="syndromes">
              <div v-if="syndromesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="syndromes.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="syndromes" border stripe>
                  <el-table-column :label="$t('medicine.syndrome.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">{{ row.tcmSyndromeId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.syndrome.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">{{ row.syndromeNameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="syndromePinyin" :label="$t('medicine.syndrome.pinyin')" min-width="150" />
                  <el-table-column prop="categoryZh" :label="$t('medicine.syndrome.category')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="syndromesPagination.page"
                    v-model:page-size="syndromesPagination.pageSize"
                    :total="syndromesPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleSyndromesPageChange"
                    @size-change="handleSyndromesPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 关联西医症状 -->
            <el-tab-pane :label="$t('medicine.symptom.relatedWmSymptoms')" name="wmSymptoms">
              <div v-if="wmSymptomsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="wmSymptoms.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="wmSymptoms" border stripe>
                  <el-table-column :label="$t('medicine.wmSymptom.id')" min-width="160">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToWmSymptomDetail(row.wmSymptomId)">{{ row.wmSymptomId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.wmSymptom.name')" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToWmSymptomDetail(row.wmSymptomId)">{{ row.symptomName || $t('common.noName') }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="umlsId" :label="$t('medicine.wmSymptom.umlsId')" min-width="150" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="wmSymptomsPagination.page"
                    v-model:page-size="wmSymptomsPagination.pageSize"
                    :total="wmSymptomsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleWmSymptomsPageChange"
                    @size-change="handleWmSymptomsPageChange"
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
import { ArrowLeft, Loading, WarningFilled, View, InfoFilled, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSymptomDetail, getSymptomHerbs, getSymptomPrescriptions, getSymptomSyndromes, getSymptomWmSymptoms } from '@/api'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const symptom = ref(null)

const anchorSections = computed(() => {
  if (!symptom.value) return []

  return [
    { id: 'symptom-overview', labelKey: 'common.anchorOverview' },
    { id: 'symptom-info', labelKey: 'medicine.symptom.basicInfo' },
    { id: 'symptom-related', labelKey: 'medicine.symptom.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('herbs')

// 中药相关
const herbs = ref([])
const herbsLoading = ref(false)
const herbsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 方剂相关
const prescriptions = ref([])
const prescriptionsLoading = ref(false)
const prescriptionsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 证候相关
const syndromes = ref([])
const syndromesLoading = ref(false)
const syndromesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 西医症状相关
const wmSymptoms = ref([])
const wmSymptomsLoading = ref(false)
const wmSymptomsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取症状详情
const fetchSymptomDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const symptomId = route.params.id
    if (!symptomId) {
      error.value = t('medicine.symptom.invalidId')
      return
    }

    const response = await getSymptomDetail(symptomId)
    
    if (response.code === 200) {
      symptom.value = response.data
      // 默认加载中药数据
      loadHerbs()
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载症状详情失败:', err)
    error.value = t('common.networkError')
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
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

// 跳转到方剂详情
const goToPrescriptionDetail = (prescriptionId) => {
  if (prescriptionId) {
    router.push({
      name: 'PrescriptionDetail',
      params: { id: prescriptionId }
    })
  }
}

// 跳转到证候详情
const goToSyndromeDetail = (syndromeId) => {
  if (syndromeId) {
    router.push({
      name: 'SyndromeDetail',
      params: { id: syndromeId }
    })
  }
}

// 加载关联中药
const loadHerbs = async () => {
  if (!symptom.value) return
  
  herbsLoading.value = true
  try {
    const response = await getSymptomHerbs(symptom.value.tcmSymptomId, {
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
    console.error('加载关联中药失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    herbsLoading.value = false
  }
}

// 加载关联方剂
const loadPrescriptions = async () => {
  if (!symptom.value) return
  
  prescriptionsLoading.value = true
  try {
    const response = await getSymptomPrescriptions(symptom.value.tcmSymptomId, {
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
    console.error('加载关联方剂失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    prescriptionsLoading.value = false
  }
}

// 加载关联证候
const loadSyndromes = async () => {
  if (!symptom.value) return
  
  syndromesLoading.value = true
  try {
    const response = await getSymptomSyndromes(symptom.value.tcmSymptomId, {
      page: syndromesPagination.value.page,
      pageSize: syndromesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      syndromes.value = response.rows || []
      syndromesPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载关联证候失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    syndromesLoading.value = false
  }
}

// 加载关联西医症状
const loadWmSymptoms = async () => {
  if (!symptom.value) return
  
  wmSymptomsLoading.value = true
  try {
    const response = await getSymptomWmSymptoms(symptom.value.tcmSymptomId, {
      page: wmSymptomsPagination.value.page,
      pageSize: wmSymptomsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      wmSymptoms.value = response.rows || []
      wmSymptomsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载关联西医症状失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    wmSymptomsLoading.value = false
  }
}

// 处理中药分页
const handleHerbsPageChange = () => {
  loadHerbs()
}

// 处理方剂分页
const handlePrescriptionsPageChange = () => {
  loadPrescriptions()
}

// 处理证候分页
const handleSyndromesPageChange = () => {
  loadSyndromes()
}

// 处理西医症状分页
const handleWmSymptomsPageChange = () => {
  loadWmSymptoms()
}

// 跳转到西医症状详情
const goToWmSymptomDetail = (wmSymptomId) => {
  if (wmSymptomId) {
    router.push({
      name: 'WmSymptomDetail',
      params: { id: wmSymptomId }
    })
  }
}

// Tab切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'herbs' && herbs.value.length === 0) {
    loadHerbs()
  } else if (tabName === 'prescriptions' && prescriptions.value.length === 0) {
    loadPrescriptions()
  } else if (tabName === 'syndromes' && syndromes.value.length === 0) {
    loadSyndromes()
  } else if (tabName === 'wmSymptoms' && wmSymptoms.value.length === 0) {
    loadWmSymptoms()
  }
}

onMounted(() => {
  fetchSymptomDetail()
})
</script>

<style scoped>
.symptom-detail-page {
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

/* Loading 和 Error 状态 */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.loading-icon,
.error-icon {
  font-size: 48px;
  color: #2d8659;
  margin-bottom: 16px;
}

.error-icon {
  color: #f56c6c;
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

/* 卡片通用样式 */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

/* 详情头部 */
.detail-header {
  padding: 40px;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.symptom-icon {
  font-size: 64px;
  color: #2d8659;
}

.header-info h1 {
  font-size: 32px;
  color: #1a5f4a;
  margin: 0 0 12px 0;
}

.sub-info {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  align-items: center;
}

.pinyin {
  font-size: 18px;
  color: #666;
  font-style: italic;
}

.id-badge {
  margin-top: 8px;
}

/* 信息表 */
.summary-section {
  padding: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  color: #1a5f4a;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8f5ef;
}

.section-title .el-icon {
  font-size: 28px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.info-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.info-table tr:last-child {
  border-bottom: none;
}

.label-cell {
  width: 200px;
  padding: 16px 20px;
  font-weight: 600;
  color: #1a5f4a;
  background: #f8fffe;
  vertical-align: top;
}

.value-cell {
  padding: 16px 20px;
  color: #333;
  line-height: 1.8;
}

.function-cell {
  line-height: 2;
  white-space: pre-wrap;
}

/* 关联数据 Tabs */
.related-tabs {
  padding: 30px;
}

.tab-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #2d8659;
}

.tab-loading .loading-icon {
  font-size: 48px;
  animation: rotate 1s linear infinite;
  margin-bottom: 16px;
}

.tab-empty {
  padding: 40px 20px;
}

.tab-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

/* Table样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #e8f5ef !important;
  color: #1a5f4a;
  font-weight: 600;
}

:deep(.el-table td) {
  color: #333;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #f8fffe;
}

/* Tabs样式优化 */
:deep(.el-tabs__item) {
  font-size: 16px;
  font-weight: 500;
  color: #666;
}

:deep(.el-tabs__item.is-active) {
  color: #2d8659;
}

:deep(.el-tabs__active-bar) {
  background-color: #2d8659;
}

:deep(.el-tabs__nav-wrap::after) {
  background-color: #e8f5ef;
}

/* 可点击样式 */
.clickable {
  color: #2d8659;
  cursor: pointer;
  text-decoration: underline;
  text-decoration-style: dotted;
}

.clickable:hover {
  color: #52c41a;
  text-decoration-style: solid;
}

@media (max-width: 768px) {
  .detail-header {
    padding: 24px;
  }

  .header-left {
    flex-direction: column;
  }

  .header-info h1 {
    font-size: 24px;
  }

  .related-tabs, .summary-section {
    padding: 20px;
  }

  .label-cell {
    width: 120px;
    padding: 12px 16px;
  }
}
</style>




