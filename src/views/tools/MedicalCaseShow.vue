<template>
  <div class="medicine-page">
    <div class="container">
      <!-- Search Bar -->
      <div class="search-section card">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            :placeholder="$t('medicine.search1')"
            class="search-input"
            @keyup.enter="handleSearch"
          />
          <button class="btn btn-primary search-btn" @click="handleSearch" :disabled="loading">
            <el-icon v-if="loading"><Loading /></el-icon>
            <el-icon v-else><Search /></el-icon>
            {{$t('medicine.search')}}
          </button>
        </div>
      </div>

      <!-- Content Area -->
      <div class="content-area">
        
          <h2>{{$t('medicine.medicalcaseShow')}}</h2>
          
          <!-- 加载状态 -->
          <div v-if="loading" class="loading-container">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <p>{{ t('common.loading') }}...</p>
          </div>
          
          <!-- 空数据提示 -->
          <div v-else-if="medicalcases.length === 0" class="empty-container">
            <p>{{ t('common.noData') }}</p>
          </div>
          
          <!-- 数据内容 -->
          <template v-else>
          <div class="academic-table-wrapper">
            <table class="academic-table">
              <thead>
                <tr>
                  <th>{{$t('medicine.medicalCase.med_case_id')}}</th>
                  <th>{{$t('medicine.medicalCase.caseReport')}}</th>
                  <th>{{$t('medicine.medicalCase.physician')}}</th>
                  <th>{{$t('medicine.medicalCase.tcmDisease')}}</th>
                  <th>{{$t('medicine.medicalCase.wmDisease')}}</th>
                  <th>{{$t('medicine.medicalCase.tcmSymptoms')}}</th>
                  <th>{{$t('medicine.medicalCase.wmSymptoms')}}</th>
                  <th>{{$t('medicine.medicalCase.urinationDefecation')}}</th>
                  <th>{{$t('medicine.medicalCase.pulseCondition')}}</th>
                  <th>{{$t('medicine.medicalCase.tongueAppearance')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="medicalcase in medicalcases" :key="medicalcase.id" class="table-row">
                  <td class="id-cell clickable" @click="goToMedicalCaseDetail(medicalcase.medCaseId)">{{ medicalcase.medCaseId }}</td>
                  <td @click="goToMedicalCaseDetail(medicalcase.medCaseId)">
                    <div>
                      <strong>{{ medicalcase.caseReport }}</strong>
                    </div>
                  </td>
                  <td>{{ medicalcase.physician || '-' }}</td>
                  <td>{{ medicalcase.tcmDisease || '-' }}</td>
                  <td>{{ medicalcase.wmDisease || '-' }}</td>
                  <td>{{ medicalcase.tcmSymptoms || '-' }}</td>
                  <td>{{ medicalcase.wmSymptoms || '-' }}</td>
                  <td>{{ medicalcase.unrnationDefecation || '-' }}</td>
                  <td>{{ medicalcase.pulseCondition || '-' }}</td>
                  <td>{{ medicalcase.tongueAppearance || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="medicalcasePagination.page"
              :page-size="medicalcasePagination.pageSize"
              :total="medicalcasePagination.total"
              layout="total, prev, pager, next, jumper"
              @current-change="handleMedicalcasesPageChange"
              background
            />
          </div>
          </template>
        </div>
      </div>
    </div>
  
</template>

<script setup>
import { ref, markRaw, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { GoodsFilled, Search, Orange as MedicineIcon, Document, FirstAidKit, Orange, Cherry, Apple, Pear, Files, Notebook, CollectionTag, Finished, WindPower, Loading, Platform } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getMedicalCasesList } from '@/api'
import { useI18n } from 'vue-i18n'
// getMedicalCaseDetail
const { t } = useI18n()
const router = useRouter()
const activeTab = ref('medicalcases')
const searchQuery = ref('')
const loading = ref(false)

// 分页参数
const medicalcasePagination = ref({ page: 1, pageSize: 10, total: 0 })


// 数据列表
const medicalcases = ref([])



// ==================== 数据加载函数 ====================
/**
 * 加载数据列表
 */
const loadMedicalcases = async () => { 
  loading.value = true
  try {
    const response = await getMedicalCasesList({
      page: medicalcasePagination.value.page,
      pageSize: medicalcasePagination.value.pageSize,
      keyword: searchQuery.value
    })
    
    // 后端返回格式: { code: 200, msg: "查询成功", total: 26, rows: [...] }
    if (response.code === 200) {
      const data = response.rows || []
      // 直接使用后端数据，保留所有字段，只添加图标
      medicalcases.value = data.map((medicalcase, index) => ({
        ...medicalcase,  // 保留所有后端字段
      }))
      medicalcasePagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载医案失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    loading.value = false
  }
}

/**
 * 执行搜索
 */
const handleSearch = () => {
  // 重置到第一页
  medicalcasePagination.value.page = 1
  loadMedicalcases()
}

/**
 * 切换分页
 */
const handleMedicalcasesPageChange = (page) => {
  medicalcasePagination.value.page = page
  loadMedicalcases()
}



// 监听tab切换，加载对应数据
watch(activeTab, (newTab) => {
  if (medicalcases.value.length === 0) {
    loadMedicalcases()
  }
})

// ==================== 路由跳转 ====================

/**
 * 跳转到医案详细页面
 */
const goToMedicalCaseDetail = (medicalCaseId) => {
  router.push(`/medical-case/${medicalCaseId}`)
}




// 页面加载时初始化
onMounted(() => {
  loadMedicalcases() // 默认加载医案
})
</script>

<style scoped>

.container{
  max-width: 80%;
  margin: 0 auto;
  padding: 20px;
}
.medicine-page {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
}

.search-section {
  margin-bottom:  40px;
  padding: 40px;
}

.search-bar {
  display: flex;
  gap: 15px;
  max-width: 800px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2d8659;
  box-shadow: 0 0 0 3px rgba(45, 134, 89, 0.1);
}

.search-btn {
  padding: 15px 30px;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.content-area {
  margin-bottom: 60px;
}

/* 学术表格样式 */
.academic-table-wrapper {
  overflow-x: auto;
  margin-bottom: 40px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.academic-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1400px;
}

.academic-table thead {
  background: linear-gradient(135deg, #1a5f4a 0%, #2d8659 100%);
  color: white;
}

.academic-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
}

.academic-table th:last-child {
  border-right: none;
}

.academic-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 13px;
  color: #333;
}

.academic-table tbody tr:hover {
  background: #f0f9f5;
}

.academic-table tbody tr:last-child td {
  border-bottom: none;
}

.id-cell {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2d8659;
}

.clickable {
  cursor: pointer;
  transition: all 0.2s ease;
}

.clickable:hover {
  background-color: #e8f5ef !important;
  color: #2d8659 !important;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #2d8659;
}

.loading-icon {
  font-size: 48px;
  animation: rotate 1.5s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  font-size: 16px;
  color: #666;
}

/* 空数据状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #999;
}

.empty-container p {
  font-size: 16px;
  margin: 0;
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding: 20px 0;
}

.pagination-wrapper :deep(.el-pagination) {
  display: flex;
  gap: 8px;
}

.pagination-wrapper :deep(.el-pagination button:disabled) {
  background-color: #f5f5f5;
}

.pagination-wrapper :deep(.el-pager li.is-active) {
  background-color: #2d8659;
  color: white;
}

.pagination-wrapper :deep(.el-pager li:hover) {
  color: #2d8659;
}

.pagination-wrapper :deep(.el-pagination button:hover) {
  color: #2d8659;
}

/* 搜索按钮禁用状态 */
.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
  }
}
</style>