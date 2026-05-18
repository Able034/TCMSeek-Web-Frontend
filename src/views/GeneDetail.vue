<template>
  <div class="gene-detail-page">
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

      <!-- 基因详情 -->
      <div v-else-if="gene" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="gene-overview">
          <div class="header-left">
            <el-icon class="gene-icon">
              <Connection />
            </el-icon>
            <div class="header-info">
              <h1>{{ gene.symbol || 'Gene' }}</h1>
              <div class="sub-info">
                <span class="gene-id">{{ gene.tcmTarId }}</span>
              </div>
              <div class="id-badge" v-if="gene.geneEntrezId">
                <el-tag type="success" size="large">Entrez ID: {{ gene.geneEntrezId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息汇总表 -->
        <div class="summary-section card" id="gene-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.gene.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr>
                <td class="label-cell">{{ $t('medicine.gene.geneId') }}</td>
                <td class="value-cell">{{ gene.tcmTarId }}</td>
              </tr>
              <tr v-if="gene.symbol">
                <td class="label-cell">{{ $t('medicine.gene.symbol') }}</td>
                <td class="value-cell">{{ gene.symbol }}</td>
              </tr>
              <tr v-if="gene.geneEntrezId">
                <td class="label-cell">Entrez ID</td>
                <td class="value-cell">{{ gene.geneEntrezId }}</td>
              </tr>
              <tr v-if="gene.uniprotId">
                <td class="label-cell">UniProt ID</td>
                <td class="value-cell">{{ gene.uniprotId }}</td>
              </tr>
              <tr v-if="gene.ensemblId">
                <td class="label-cell">Ensembl ID</td>
                <td class="value-cell">{{ gene.ensemblId }}</td>
              </tr>
              <tr v-if="gene.typeOfGene">
                <td class="label-cell">{{ $t('medicine.gene.geneType') }}</td>
                <td class="value-cell">{{ gene.typeOfGene }}</td>
              </tr>
              <tr v-if="gene.description">
                <td class="label-cell">{{ $t('medicine.gene.description') }}</td>
                <td class="value-cell">{{ gene.description }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Tab标签页 -->
        <div class="tabs-section card" id="gene-related">
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 相关化合物 -->
            <el-tab-pane :label="$t('medicine.gene.relatedCompounds')" name="compounds">
              <div v-if="compoundsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="compounds.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="compounds" border stripe>
                  <el-table-column :label="$t('medicine.compound.inchikey')" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToCompoundDetail(row.inchikey)">
                        {{ row.inchikey }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.compound.formula')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToCompoundDetail(row.inchikey)">
                        {{ row.molecularFormula || '-' }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="molecularWeight" :label="$t('medicine.compound.weight')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="compoundsPagination.page"
                    v-model:page-size="compoundsPagination.pageSize"
                    :total="compoundsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleCompoundsPageChange"
                    @size-change="handleCompoundsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关疾病 -->
            <el-tab-pane :label="$t('medicine.gene.relatedDiseases')" name="diseases">
              <div v-if="diseasesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="diseases.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="diseases" border stripe>
                  <el-table-column :label="$t('medicine.disease.id')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToDiseaseDetail(row.diseaseId)">{{ row.diseaseId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.disease.name')" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToDiseaseDetail(row.diseaseId)">
                        {{ row.diseaseName || $t('common.noName') }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="source" :label="$t('common.source')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="diseasesPagination.page"
                    v-model:page-size="diseasesPagination.pageSize"
                    :total="diseasesPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleDiseasesPageChange"
                    @size-change="handleDiseasesPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关证候 -->
            <el-tab-pane :label="$t('medicine.gene.relatedSyndromes')" name="syndromes">
              <div v-if="syndromesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="syndromes.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="syndromes" border stripe>
                  <el-table-column :label="$t('medicine.syndrome.id')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">
                        {{ row.tcmSyndromeId }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.syndrome.name')" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">
                        {{ row.syndromeNameZh }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="source" :label="$t('common.source')" min-width="120" />
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

            <!-- 相关通路 -->
            <el-tab-pane :label="$t('medicine.gene.relatedPathways')" name="pathways">
              <div v-if="pathwaysLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="pathways.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="pathways" border stripe>
                  <el-table-column :label="$t('medicine.pathway.id')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPathwayDetail(row.pathwayId)">
                        {{ row.pathwayId }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.pathway.name')" min-width="300">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPathwayDetail(row.pathwayId)">
                        {{ row.name }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="source" :label="$t('common.source')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="pathwaysPagination.page"
                    v-model:page-size="pathwaysPagination.pageSize"
                    :total="pathwaysPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handlePathwaysPageChange"
                    @size-change="handlePathwaysPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关表型 -->
            <el-tab-pane :label="$t('medicine.gene.relatedPhenotypes')" name="phenotypes">
              <div v-if="phenotypesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="phenotypes.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="phenotypes" border stripe>
                  <el-table-column :label="$t('medicine.phenotype.id')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPhenotypeDetail(row.phenotypeId)">
                        {{ row.phenotypeId }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.phenotype.name')" min-width="300">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPhenotypeDetail(row.phenotypeId)">
                        {{ row.phenotypeName }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="source" :label="$t('common.source')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="phenotypesPagination.page"
                    v-model:page-size="phenotypesPagination.pageSize"
                    :total="phenotypesPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handlePhenotypesPageChange"
                    @size-change="handlePhenotypesPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关西医症状 -->
            <el-tab-pane :label="$t('medicine.gene.relatedWmSymptoms')" name="wmSymptoms">
              <div v-if="wmSymptomsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="wmSymptoms.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="wmSymptoms" border stripe>
                  <el-table-column :label="$t('medicine.wmSymptom.id')" min-width="180">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToWmSymptomDetail(row.wmSymptomId)">
                        {{ row.wmSymptomId }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.wmSymptom.name')" min-width="250">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToWmSymptomDetail(row.wmSymptomId)">
                        {{ row.symptomName || '-' }}
                      </span>
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
import { ArrowLeft, Loading, WarningFilled, InfoFilled, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  getGeneDetail, 
  getGeneCompounds, 
  getGeneDiseases,
  getGeneSyndromes,
  getGenePathways,
  getGenePhenotypes,
  getGeneWmSymptoms
} from '@/api/medicine'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const gene = ref(null)

const anchorSections = computed(() => {
  if (!gene.value) return []

  return [
    { id: 'gene-overview', labelKey: 'common.anchorOverview' },
    { id: 'gene-info', labelKey: 'medicine.gene.basicInfo' },
    { id: 'gene-related', labelKey: 'medicine.gene.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('compounds')

// 相关化合物
const compounds = ref([])
const compoundsLoading = ref(false)
const compoundsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关疾病
const diseases = ref([])
const diseasesLoading = ref(false)
const diseasesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关证候
const syndromes = ref([])
const syndromesLoading = ref(false)
const syndromesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关通路
const pathways = ref([])
const pathwaysLoading = ref(false)
const pathwaysPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关表型
const phenotypes = ref([])
const phenotypesLoading = ref(false)
const phenotypesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 相关西医症状
const wmSymptoms = ref([])
const wmSymptomsLoading = ref(false)
const wmSymptomsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 获取基因详情
const fetchGeneDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const geneId = route.params.id
    if (!geneId) {
      error.value = t('medicine.gene.invalidId')
      return
    }
    
    const response = await getGeneDetail(geneId)
    
    if (response.code === 200 && response.data) {
      gene.value = response.data
      // 自动加载第一个tab的数据
      loadCompounds()
    } else {
      error.value = response.msg || t('common.loadFailed')
    }
  } catch (err) {
    console.error('加载基因详情失败:', err)
    error.value = t('common.networkError')
  } finally {
    loading.value = false
  }
}

// 加载化合物数据
const loadCompounds = async () => {
  if (!gene.value) return
  
  compoundsLoading.value = true
  try {
    const response = await getGeneCompounds(gene.value.tcmTarId, {
      page: compoundsPagination.value.page,
      pageSize: compoundsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      compounds.value = response.data?.rows || []
      compoundsPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载化合物失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    compoundsLoading.value = false
  }
}

// 加载疾病数据
const loadDiseases = async () => {
  if (!gene.value) return
  
  diseasesLoading.value = true
  try {
    const response = await getGeneDiseases(gene.value.tcmTarId, {
      page: diseasesPagination.value.page,
      pageSize: diseasesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      diseases.value = response.data?.rows || []
      diseasesPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载疾病失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    diseasesLoading.value = false
  }
}

// 加载证候数据
const loadSyndromes = async () => {
  if (!gene.value) return
  
  syndromesLoading.value = true
  try {
    const response = await getGeneSyndromes(gene.value.tcmTarId, {
      page: syndromesPagination.value.page,
      pageSize: syndromesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      syndromes.value = response.data?.rows || []
      syndromesPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载证候失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    syndromesLoading.value = false
  }
}

// 加载通路数据
const loadPathways = async () => {
  if (!gene.value) return
  
  pathwaysLoading.value = true
  try {
    const response = await getGenePathways(gene.value.tcmTarId, {
      page: pathwaysPagination.value.page,
      pageSize: pathwaysPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      pathways.value = response.data?.rows || []
      pathwaysPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载通路失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    pathwaysLoading.value = false
  }
}

// 加载表型数据
const loadPhenotypes = async () => {
  if (!gene.value) return
  
  phenotypesLoading.value = true
  try {
    const response = await getGenePhenotypes(gene.value.tcmTarId, {
      page: phenotypesPagination.value.page,
      pageSize: phenotypesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      phenotypes.value = response.data?.rows || []
      phenotypesPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载表型失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    phenotypesLoading.value = false
  }
}

// 加载西医症状数据
const loadWmSymptoms = async () => {
  if (!gene.value) return
  
  wmSymptomsLoading.value = true
  try {
    const response = await getGeneWmSymptoms(gene.value.tcmTarId, {
      page: wmSymptomsPagination.value.page,
      pageSize: wmSymptomsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      // 数据在 response.data 中
      wmSymptoms.value = response.data?.rows || []
      wmSymptomsPagination.value.total = response.data?.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载西医症状失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    wmSymptomsLoading.value = false
  }
}

// 分页处理
const handleCompoundsPageChange = () => {
  loadCompounds()
}

const handleDiseasesPageChange = () => {
  loadDiseases()
}

const handleSyndromesPageChange = () => {
  loadSyndromes()
}

const handlePathwaysPageChange = () => {
  loadPathways()
}

const handlePhenotypesPageChange = () => {
  loadPhenotypes()
}

const handleWmSymptomsPageChange = () => {
  loadWmSymptoms()
}

// Tab切换处理
const handleTabChange = (tabName) => {
  switch (tabName) {
    case 'compounds':
      if (compounds.value.length === 0) loadCompounds()
      break
    case 'diseases':
      if (diseases.value.length === 0) loadDiseases()
      break
    case 'syndromes':
      if (syndromes.value.length === 0) loadSyndromes()
      break
    case 'pathways':
      if (pathways.value.length === 0) loadPathways()
      break
    case 'phenotypes':
      if (phenotypes.value.length === 0) loadPhenotypes()
      break
    case 'wmSymptoms':
      if (wmSymptoms.value.length === 0) loadWmSymptoms()
      break
  }
}

// 跳转到化合物详情
const goToCompoundDetail = (inchikey) => {
  if (inchikey) {
    router.push({
      name: 'CompoundDetail',
      params: { inchikey }
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

// 跳转到疾病详情
const goToDiseaseDetail = (diseaseId) => {
  if (diseaseId) {
    router.push({
      name: 'DiseaseDetail',
      params: { id: diseaseId }
    })
  }
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

// 跳转到通路详情
const goToPathwayDetail = (pathwayId) => {
  if (pathwayId) {
    router.push({
      name: 'PathwayDetail',
      params: { id: pathwayId }
    })
  }
}

// 跳转到表型详情
const goToPhenotypeDetail = (phenotypeId) => {
  if (phenotypeId) {
    router.push({
      name: 'PhenotypeDetail',
      params: { id: phenotypeId }
    })
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchGeneDetail()
})
</script>

<style scoped>
.gene-detail-page {
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

.gene-icon {
  font-size: 64px;
  color: #ef4444;
}

.header-info h1 {
  margin: 0 0 10px 0;
  font-size: 36px;
  color: #2c3e50;
}

.sub-info {
  margin-bottom: 15px;
}

.gene-id {
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
  color: #ef4444;
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
