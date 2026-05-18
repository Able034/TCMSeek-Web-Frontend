<template>
  <div class="syndrome-detail-page">
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

      <!-- 证候详情 -->
      <div v-else-if="syndrome" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="syndrome-overview">
          <div class="header-left">
            <el-icon class="syndrome-icon">
              <Tickets />
            </el-icon>
            <div class="header-info">
              <h1>{{ syndrome.syndromeNameZh }}</h1>
              <div class="sub-info">
                <span class="pinyin" v-if="syndrome.syndromePinyin">{{ syndrome.syndromePinyin }}</span>
                <span class="english" v-if="syndrome.syndromeEnglish">{{ syndrome.syndromeEnglish }}</span>
              </div>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ syndrome.tcmSyndromeId }}</el-tag>
                <el-tag v-if="syndrome.categoryZh" type="success" size="large" style="margin-left: 8px">{{ syndrome.categoryZh }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="summary-section card" id="syndrome-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.syndrome.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="syndrome.syndromeNameZh">
                <td class="label-cell">{{ $t('medicine.syndrome.name') }}</td>
                <td class="value-cell">{{ syndrome.syndromeNameZh }}</td>
              </tr>
              <tr v-if="syndrome.syndromeEnglish">
                <td class="label-cell">{{ $t('medicine.syndrome.english') }}</td>
                <td class="value-cell">{{ syndrome.syndromeEnglish }}</td>
              </tr>
              <tr v-if="syndrome.syndromePinyin">
                <td class="label-cell">{{ $t('medicine.syndrome.pinyin') }}</td>
                <td class="value-cell">{{ syndrome.syndromePinyin }}</td>
              </tr>
              <tr v-if="syndrome.categoryZh">
                <td class="label-cell">{{ $t('medicine.syndrome.category') }}</td>
                <td class="value-cell">{{ syndrome.categoryZh }}</td>
              </tr>
              <tr v-if="syndrome.categoryEn">
                <td class="label-cell">{{ $t('medicine.syndrome.categoryEn') }}</td>
                <td class="value-cell">{{ syndrome.categoryEn }}</td>
              </tr>
              <tr v-if="syndrome.source">
                <td class="label-cell">{{ $t('medicine.syndrome.source') }}</td>
                <td class="value-cell">{{ syndrome.source }}</td>
              </tr>
              <tr v-if="syndrome.syndromeDefinitionZh">
                <td class="label-cell">{{ $t('medicine.syndrome.definition') }}</td>
                <td class="value-cell function-cell">{{ syndrome.syndromeDefinitionZh }}</td>
              </tr>
              <tr v-if="syndrome.syndromeDescriptionEn">
                <td class="label-cell">{{ $t('medicine.syndrome.descriptionEn') }}</td>
                <td class="value-cell function-cell">{{ syndrome.syndromeDescriptionEn }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关联数据 -->
        <div class="related-tabs card" id="syndrome-related">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.syndrome.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 关联症状 -->
            <el-tab-pane :label="$t('medicine.syndrome.relatedSymptoms')" name="symptoms">
              <div v-if="symptomsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="symptoms.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="symptoms" border stripe>
                  <el-table-column :label="$t('medicine.symptom.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSymptomDetail(row.tcmSymptomId)">{{ row.tcmSymptomId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.symptom.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSymptomDetail(row.tcmSymptomId)">{{ row.symptomNameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="symptomPinyin" :label="$t('medicine.symptom.pinyin')" min-width="150" />
                  <el-table-column prop="symptomDefinition" :label="$t('medicine.symptom.definition')" min-width="200" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="symptomsPagination.page"
                    v-model:page-size="symptomsPagination.pageSize"
                    :total="symptomsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleSymptomsPageChange"
                    @size-change="handleSymptomsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 关联中药 -->
            <el-tab-pane :label="$t('medicine.syndrome.relatedHerbs')" name="herbs">
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
            <el-tab-pane :label="$t('medicine.syndrome.relatedPrescriptions')" name="prescriptions">
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
import { ArrowLeft, Loading, WarningFilled, Tickets, InfoFilled, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getSyndromeDetail, getSyndromeSymptoms, getSyndromeHerbs, getSyndromePrescriptions } from '@/api'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const syndrome = ref(null)

const anchorSections = computed(() => {
  if (!syndrome.value) return []

  return [
    { id: 'syndrome-overview', labelKey: 'common.anchorOverview' },
    { id: 'syndrome-info', labelKey: 'medicine.syndrome.basicInfo' },
    { id: 'syndrome-related', labelKey: 'medicine.syndrome.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('symptoms')

// 症状相关
const symptoms = ref([])
const symptomsLoading = ref(false)
const symptomsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

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

// 获取证候详情
const fetchSyndromeDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const syndromeId = route.params.id
    if (!syndromeId) {
      error.value = t('medicine.syndrome.invalidId')
      return
    }

    const response = await getSyndromeDetail(syndromeId)
    
    if (response.code === 200) {
      syndrome.value = response.data
      // 默认加载症状数据
      loadSymptoms()
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载证候详情失败:', err)
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

// 跳转到症状详情
const goToSymptomDetail = (symptomId) => {
  if (symptomId) {
    router.push({
      name: 'SymptomDetail',
      params: { id: symptomId }
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

// 跳转到方剂详情
const goToPrescriptionDetail = (prescriptionId) => {
  if (prescriptionId) {
    router.push({
      name: 'PrescriptionDetail',
      params: { id: prescriptionId }
    })
  }
}

// 加载关联症状
const loadSymptoms = async () => {
  if (!syndrome.value) return
  
  symptomsLoading.value = true
  try {
    const response = await getSyndromeSymptoms(syndrome.value.tcmSyndromeId, {
      page: symptomsPagination.value.page,
      pageSize: symptomsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      symptoms.value = response.rows || []
      symptomsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载关联症状失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    symptomsLoading.value = false
  }
}

// 加载关联中药
const loadHerbs = async () => {
  if (!syndrome.value) return
  
  herbsLoading.value = true
  try {
    const response = await getSyndromeHerbs(syndrome.value.tcmSyndromeId, {
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
  if (!syndrome.value) return
  
  prescriptionsLoading.value = true
  try {
    const response = await getSyndromePrescriptions(syndrome.value.tcmSyndromeId, {
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

// 处理症状分页
const handleSymptomsPageChange = () => {
  loadSymptoms()
}

// 处理中药分页
const handleHerbsPageChange = () => {
  loadHerbs()
}

// 处理方剂分页
const handlePrescriptionsPageChange = () => {
  loadPrescriptions()
}

// Tab切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'symptoms' && symptoms.value.length === 0) {
    loadSymptoms()
  } else if (tabName === 'herbs' && herbs.value.length === 0) {
    loadHerbs()
  } else if (tabName === 'prescriptions' && prescriptions.value.length === 0) {
    loadPrescriptions()
  }
}

onMounted(() => {
  fetchSyndromeDetail()
})
</script>

<style scoped>
.syndrome-detail-page {
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

.syndrome-icon {
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
}

.pinyin {
  font-size: 18px;
  color: #666;
  font-style: italic;
}

.english {
  font-size: 16px;
  color: #999;
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








