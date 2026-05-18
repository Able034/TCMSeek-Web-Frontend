<template>
  <div class="medical-case-detail-page">
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

      <!-- 医案详情 -->
      <div v-else-if="medicalCase" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card">
          <div class="header-left">
            <el-icon class="case-icon">
              <Document />
            </el-icon>
            <div class="header-info">
              <h1>{{ $t('medicine.medicalCase.title') }}</h1>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ medicalCase.medCaseId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="summary-section card">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.medicalCase.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="medicalCase.physician">
                <td class="label-cell">{{ $t('medicine.medicalCase.physician') }}</td>
                <td class="value-cell">{{ medicalCase.physician }}</td>
              </tr>
              <tr v-if="medicalCase.tcmDisease">
                <td class="label-cell">{{ $t('medicine.medicalCase.tcmDisease') }}</td>
                <td class="value-cell">{{ medicalCase.tcmDisease }}</td>
              </tr>
              <tr v-if="medicalCase.wmDisease">
                <td class="label-cell">{{ $t('medicine.medicalCase.wmDisease') }}</td>
                <td class="value-cell">{{ medicalCase.wmDisease }}</td>
              </tr>
              <tr v-if="medicalCase.tcmSyndrome">
                <td class="label-cell">{{ $t('medicine.medicalCase.syndrome') }}</td>
                <td class="value-cell">{{ medicalCase.tcmSyndrome }}</td>
              </tr>
              <tr v-if="medicalCase.tcmTreatment">
                <td class="label-cell">{{ $t('medicine.medicalCase.treatment') }}</td>
                <td class="value-cell function-cell">{{ medicalCase.tcmTreatment }}</td>
              </tr>
              <tr v-if="medicalCase.prescription">
                <td class="label-cell">{{ $t('medicine.medicalCase.prescription') }}</td>
                <td class="value-cell">{{ medicalCase.prescription }}</td>
              </tr>
              <tr v-if="medicalCase.herbComposition">
                <td class="label-cell">{{ $t('medicine.medicalCase.herbComposition') }}</td>
                <td class="value-cell function-cell">{{ medicalCase.herbComposition }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 症状与体征 -->
        <div class="symptoms-section card" v-if="medicalCase.tcmSymptoms || medicalCase.wmSymptoms || medicalCase.pulseCondition || medicalCase.tongueAppearance || medicalCase.urinationDefecation">
          <h2 class="section-title">
            <el-icon><View /></el-icon>
            {{ $t('medicine.medicalCase.symptomsAndSigns') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="medicalCase.tcmSymptoms">
                <td class="label-cell">{{ $t('medicine.medicalCase.tcmSymptoms') }}</td>
                <td class="value-cell function-cell">{{ medicalCase.tcmSymptoms }}</td>
              </tr>
              <tr v-if="medicalCase.wmSymptoms">
                <td class="label-cell">{{ $t('medicine.medicalCase.wmSymptoms') }}</td>
                <td class="value-cell function-cell">{{ medicalCase.wmSymptoms }}</td>
              </tr>
              <tr v-if="medicalCase.pulseCondition">
                <td class="label-cell">{{ $t('medicine.medicalCase.pulseCondition') }}</td>
                <td class="value-cell">{{ medicalCase.pulseCondition }}</td>
              </tr>
              <tr v-if="medicalCase.tongueAppearance">
                <td class="label-cell">{{ $t('medicine.medicalCase.tongueAppearance') }}</td>
                <td class="value-cell">{{ medicalCase.tongueAppearance }}</td>
              </tr>
              <tr v-if="medicalCase.urinationDefecation">
                <td class="label-cell">{{ $t('medicine.medicalCase.urinationDefecation') }}</td>
                <td class="value-cell">{{ medicalCase.urinationDefecation }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 医案报告全文 -->
        <div class="case-report-section card" v-if="medicalCase.caseReport">
          <h2 class="section-title">
            <el-icon><Reading /></el-icon>
            {{ $t('medicine.medicalCase.caseReport') }}
          </h2>
          <div class="case-report-content">
            {{ medicalCase.caseReport }}
          </div>
        </div>

        <!-- 关联数据 -->
        <div class="related-tabs card">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.medicalCase.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 关联方剂 -->
            <el-tab-pane :label="$t('medicine.medicalCase.relatedPrescriptions')" name="prescriptions">
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

            <!-- 关联中药 -->
            <el-tab-pane :label="$t('medicine.medicalCase.relatedHerbs')" name="herbs">
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
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loading, WarningFilled, Document, InfoFilled, View, Reading, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMedicalCaseDetail, getMedicalCasePrescriptions, getMedicalCaseHerbs } from '@/api'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const medicalCase = ref(null)

// Tab 相关
const activeTab = ref('prescriptions')

// 方剂相关
const prescriptions = ref([])
const prescriptionsLoading = ref(false)
const prescriptionsPagination = ref({
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

// 获取医案详情
const fetchMedicalCaseDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const caseId = route.params.id
    if (!caseId) {
      error.value = t('medicine.medicalCase.invalidId')
      return
    }

    const response = await getMedicalCaseDetail(caseId)
    
    if (response.code === 200) {
      medicalCase.value = response.data
      // 默认加载方剂数据
      loadPrescriptions()
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载医案详情失败:', err)
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

// 加载关联方剂
const loadPrescriptions = async () => {
  if (!medicalCase.value) return
  
  prescriptionsLoading.value = true
  try {
    const response = await getMedicalCasePrescriptions(medicalCase.value.medCaseId, {
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

// 加载关联中药
const loadHerbs = async () => {
  if (!medicalCase.value) return
  
  herbsLoading.value = true
  try {
    const response = await getMedicalCaseHerbs(medicalCase.value.medCaseId, {
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

// 处理方剂分页
const handlePrescriptionsPageChange = () => {
  loadPrescriptions()
}

// 处理中药分页
const handleHerbsPageChange = () => {
  loadHerbs()
}

// Tab切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'prescriptions' && prescriptions.value.length === 0) {
    loadPrescriptions()
  } else if (tabName === 'herbs' && herbs.value.length === 0) {
    loadHerbs()
  }
}

onMounted(() => {
  fetchMedicalCaseDetail()
})
</script>

<style scoped>
.medical-case-detail-page {
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

.case-icon {
  font-size: 64px;
  color: #2d8659;
}

.header-info h1 {
  font-size: 32px;
  color: #1a5f4a;
  margin: 0 0 12px 0;
}

.id-badge {
  margin-top: 12px;
}

/* 信息表 */
.summary-section,
.symptoms-section {
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

/* 医案报告 */
.case-report-section {
  padding: 30px;
}

.case-report-content {
  padding: 20px;
  background: #f8fffe;
  border-radius: 8px;
  line-height: 2;
  white-space: pre-wrap;
  color: #333;
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

  .related-tabs, .summary-section, .symptoms-section, .case-report-section {
    padding: 20px;
  }

  .label-cell {
    width: 120px;
    padding: 12px 16px;
  }
}
</style>








