<template>
  <div class="herb-detail-page">
    <div class="container">
      <!-- 返回按钮 -->
      <div class="back-button">
        <el-button @click="goBack" type="default">
          <el-icon>
            <ArrowLeft />
          </el-icon>
          {{ $t('common.back') }}
        </el-button>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="loading-icon">
          <Loading />
        </el-icon>
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-icon class="error-icon">
          <WarningFilled />
        </el-icon>
        <p>{{ error }}</p>
      </div>

      <!-- 药材详情 -->
      <div v-else-if="herb" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="herb-overview">
          <div class="header-left">
            <el-icon class="herb-icon">
              <GoodsFilled />
            </el-icon>
            <div class="header-info">
              <h1>{{ herb.herbNameZh || herb.name }}</h1>
              <div class="sub-info">
                <span class="pinyin" v-if="herb.pinyinName">{{ herb.pinyinName }}</span>
                <span class="latin" v-if="herb.latinName">{{ herb.latinName }}</span>
              </div>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ herb.tcmHerbId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- SymMap风格的信息汇总表 -->
        <div class="summary-section card" id="herb-summary">
          <h2 class="section-title">
            <el-icon>
              <InfoFilled />
            </el-icon>
            {{ $t('medicine.herb.summary') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="herb.herbNameZh">
                <td class="label-cell">{{ $t('medicine.herb.name') }}</td>
                <td class="value-cell">{{ herb.herbNameZh }}</td>
              </tr>
              <tr v-if="herb.pinyinName">
                <td class="label-cell">{{ $t('medicine.herb.pinyin') }}</td>
                <td class="value-cell">{{ herb.pinyinName }}</td>
              </tr>
              <tr v-if="herb.latinName">
                <td class="label-cell">{{ $t('medicine.herb.latin') }}</td>
                <td class="value-cell">{{ herb.latinName }}</td>
              </tr>
              <tr v-if="herb.englishName">
                <td class="label-cell">{{ $t('medicine.herb.english') }}</td>
                <td class="value-cell">{{ herb.englishName }}</td>
              </tr>
              <tr v-if="herb.type">
                <td class="label-cell">{{ $t('medicine.herb.type') }}</td>
                <td class="value-cell">{{ herb.type }}</td>
              </tr>
              <tr v-if="herb.efficacyCategory">
                <td class="label-cell">{{ $t('medicine.herb.category') }}</td>
                <td class="value-cell">{{ herb.efficacyCategory }}</td>
              </tr>
              <tr v-if="herb.efficacyZh">
                <td class="label-cell">{{ $t('medicine.herb.efficacy') }}</td>
                <td class="value-cell function-cell">{{ herb.efficacyZh }}</td>
              </tr>
              <tr v-if="herb.functionEn">
                <td class="label-cell">Function (EN)</td>
                <td class="value-cell function-cell">{{ herb.functionEn }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关联数据 Tab 页 -->
        <div class="related-tabs card" id="herb-related">
          <h2 class="section-title">
            <el-icon>
              <Connection />
            </el-icon>
            {{ $t('medicine.herb.relatedData') }}
          </h2>

          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 化合物 Tab -->
            <el-tab-pane :label="$t('medicine.herb.compounds')" name="compounds">
              <div v-if="compoundsLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="compounds.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="compounds" border stripe>
                  <el-table-column label="InChIKey" min-width="200">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToCompoundDetail(row.inchikey)">{{ row.inchikey }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.compound.formula')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToCompoundDetail(row.inchikey)">{{ row.molecularFormula
                        }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="molecularWeight" :label="$t('medicine.compound.weight')" min-width="120" />
                  <el-table-column prop="canonicalSmiles" label="SMILES" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="compoundsPagination.page"
                    v-model:page-size="compoundsPagination.pageSize" :total="compoundsPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleCompoundsPageChange" @size-change="handleCompoundsPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关疾病 Tab -->
            <el-tab-pane :label="$t('medicine.herb.diseases')" name="diseases">
              <div v-if="diseasesLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="diseases.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="diseases" border stripe>
                  <el-table-column prop="diseaseId" :label="$t('medicine.disease.id')" min-width="120" />
                  <el-table-column prop="diseaseName" :label="$t('medicine.disease.name')" min-width="200" />
                  <el-table-column prop="source" :label="$t('medicine.disease.source')" min-width="150" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="diseasesPagination.page"
                    v-model:page-size="diseasesPagination.pageSize" :total="diseasesPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleDiseasesPageChange" @size-change="handleDiseasesPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关方剂 Tab -->
            <el-tab-pane :label="$t('medicine.herb.formulas')" name="formulas">
              <div v-if="formulasLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="formulas.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="formulas" border stripe>
                  <el-table-column :label="$t('medicine.prescription.id')" min-width="140">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">{{
                        row.tcmPrescriptionId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.prescription.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToPrescriptionDetail(row.tcmPrescriptionId)">{{ row.nameZh
                        }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="pinyinName" :label="$t('medicine.prescription.pinyin')" min-width="150" />
                  <el-table-column prop="source" :label="$t('medicine.prescription.source')" min-width="120" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="formulasPagination.page"
                    v-model:page-size="formulasPagination.pageSize" :total="formulasPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleFormulasPageChange" @size-change="handleFormulasPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关中医医案 Tab -->
            <el-tab-pane :label="$t('medicine.herb.medicalCases')" name="medicalCases">
              <div v-if="medicalCasesLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="medicalCases.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="medicalCases" border stripe>
                  <el-table-column :label="$t('medicine.medicalCase.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToMedicalCaseDetail(row.medCaseId)">{{ row.medCaseId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="physician" :label="$t('medicine.medicalCase.physician')" min-width="120" />
                  <el-table-column prop="tcmDisease" :label="$t('medicine.medicalCase.tcmDisease')" min-width="150" />
                  <el-table-column prop="tcmSyndrome" :label="$t('medicine.medicalCase.syndrome')" min-width="150"
                    show-overflow-tooltip />
                  <el-table-column prop="tcmTreatment" :label="$t('medicine.medicalCase.treatment')" min-width="150"
                    show-overflow-tooltip />
                  <el-table-column prop="prescription" :label="$t('medicine.medicalCase.prescription')" min-width="150"
                    show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="medicalCasesPagination.page"
                    v-model:page-size="medicalCasesPagination.pageSize" :total="medicalCasesPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleMedicalCasesPageChange" @size-change="handleMedicalCasesPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关症状 Tab -->
            <el-tab-pane :label="$t('medicine.herb.symptoms')" name="symptoms">
              <div v-if="symptomsLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
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
                      <span class="clickable" @click="goToSymptomDetail(row.tcmSymptomId)">{{ row.symptomNameZh
                        }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="symptomPinyin" :label="$t('medicine.symptom.pinyin')" min-width="150" />
                  <el-table-column prop="symptomDefinition" :label="$t('medicine.symptom.definition')"
                    min-width="200" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="symptomsPagination.page"
                    v-model:page-size="symptomsPagination.pageSize" :total="symptomsPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleSymptomsPageChange" @size-change="handleSymptomsPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关证候 Tab -->
            <el-tab-pane :label="$t('medicine.herb.syndromes')" name="syndromes">
              <div v-if="syndromesLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="syndromes.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="syndromes" border stripe>
                  <el-table-column :label="$t('medicine.syndrome.id')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">{{ row.tcmSyndromeId
                        }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.syndrome.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToSyndromeDetail(row.tcmSyndromeId)">{{ row.syndromeNameZh
                        }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="syndromePinyin" :label="$t('medicine.syndrome.pinyin')" min-width="150" />
                  <el-table-column prop="syndromeDefinitionZh" :label="$t('medicine.syndrome.definition')"
                    min-width="200" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination v-model:current-page="syndromesPagination.page"
                    v-model:page-size="syndromesPagination.pageSize" :total="syndromesPagination.total"
                    :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleSyndromesPageChange" @size-change="handleSyndromesPageChange" />
                </div>
              </div>
            </el-tab-pane>

            <!-- 转录组学数据 Tab -->
            <el-tab-pane :label="$t('medicine.herb.transcriptomics')" name="transcriptomics">
              <div v-if="transcriptomicsLoading" class="tab-loading">
                <el-icon class="loading-icon">
                  <Loading />
                </el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="!transcriptomicsData || transcriptomicsData.length === 0" class="tab-empty">
                <el-empty :description="$t('medicine.herb.noTranscriptomicsData')" />
              </div>
              <div v-else class="transcriptomics-content">
                <!-- 统计卡片 -->
                <div class="stats-cards">
                  <div class="stat-card">
                    <div class="stat-icon total">📊</div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.totalGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.herb.totalGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon up">🔺</div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.upregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.herb.upregulatedGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon down">🔻</div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.downregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.herb.downregulatedGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon significant">⭐</div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.significantGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.herb.significantGenes') }}</div>
                    </div>
                  </div>
                </div>

                <!-- 内部Tab：火山图、热图、基因列表 -->
                <el-tabs v-model="transcriptomicsView" class="inner-tabs">
                  <el-tab-pane :label="$t('medicine.herb.volcanoPlot')" name="volcano">
                    <div ref="volcanoChartRef" class="chart-container"></div>
                  </el-tab-pane>

                  <el-tab-pane :label="$t('medicine.herb.heatmap')" name="heatmap">
                    <div ref="heatmapChartRef" class="chart-container"></div>
                  </el-tab-pane>

                  <el-tab-pane :label="$t('medicine.herb.geneList')" name="geneList">
                    <!-- 筛选条件 -->
                    <div class="filter-bar">
                      <el-select v-model="geneListFilter.direction" :placeholder="$t('medicine.herb.filterByDirection')"
                        clearable>
                        <el-option :label="$t('medicine.herb.allDirections')" value="" />
                        <el-option :label="$t('medicine.herb.upregulated')" value="up" />
                        <el-option :label="$t('medicine.herb.downregulated')" value="down" />
                      </el-select>
                      <el-select v-model="geneListFilter.significance"
                        :placeholder="$t('medicine.herb.filterBySignificance')" clearable>
                        <el-option :label="$t('medicine.herb.allGenes')" value="" />
                        <el-option :label="$t('medicine.herb.significantOnly')" value="significant" />
                      </el-select>
                    </div>

                    <!-- 基因列表表格 -->
                    <el-table :data="pagedGeneList" border stripe class="gene-list-table">
                      <el-table-column prop="geneName" :label="$t('medicine.gene.symbol')" min-width="120" />
                      <el-table-column :label="$t('medicine.herb.log2FC')" min-width="120">
                        <template #default="{ row }">
                          <span :class="['log2fc-value', row.direction]">
                            {{ row.log2FcAvg?.toFixed(3) || '-' }}
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.herb.pValue')" min-width="120">
                        <template #default="{ row }">
                          {{ row.pValue?.toExponential(2) || '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.herb.direction')" min-width="100">
                        <template #default="{ row }">
                          <el-tag :type="row.direction === 'up' ? 'danger' : 'primary'" size="small">
                            {{ row.direction === 'up' ? $t('medicine.herb.upregulated') :
                              $t('medicine.herb.downregulated') }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.herb.significance')" min-width="100">
                        <template #default="{ row }">
                          <span class="significance-label">{{ row.significanceLabel || 'ns' }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.herb.source')" min-width="120">
                        <template #default="{ row }">
                          <el-tag>{{ row.source }}</el-tag>
                        </template>
                      </el-table-column>
                    </el-table>

                    <!-- 分页 -->
                    <div class="tab-pagination">
                      <el-pagination v-model:current-page="geneListPagination.page"
                        v-model:page-size="geneListPagination.pageSize" :total="filteredGeneList.length"
                        :page-sizes="[25, 50, 100, 200]" layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleGeneListPageChange" @size-change="handleGeneListPageChange" />
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>

        <AnchorNavigation :sections="anchorSections" />


        <!-- 知识图谱可视化 (Sigma.js) -->
        <div class="knowledge-graph-section">
          <SigmaGraph :data="graphData" :loading="graphLoading"
            :title="$t('medicine.herb.relatedData') + ' - ' + $t('Knowledge Graph')" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loading, WarningFilled, GoodsFilled, InfoFilled, Connection } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import {
  getHerbDetail,
  getHerbCompounds,
  getHerbDiseases,
  getHerbSymptoms,
  getHerbSyndromes,
  getHerbFormulas,
  getHerbMedicalCases,
  getHerbRelatedCompounds,
  batchGetCompoundTargets,
  getHerbTranscriptomics,
  getHerbTranscriptomicsStatistics
} from '@/api'
import * as echarts from 'echarts'
import { useI18n } from 'vue-i18n'
import SigmaGraph from '@/components/SigmaGraph.vue'
import AnchorNavigation from '@/components/AnchorNavigation.vue'
import { el } from 'element-plus/es/locales.mjs'


const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const herb = ref(null)

const anchorSections = computed(() => {
  if (!herb.value) return []

  return [
    { id: 'herb-overview', labelKey: 'common.anchorOverview' },
    { id: 'herb-summary', labelKey: 'medicine.herb.summary' },
    { id: 'herb-related', labelKey: 'medicine.herb.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('compounds')

// 化合物相关
const compounds = ref([])
const compoundsLoading = ref(false)
const compoundsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})
//视图compounds
const viewCompounds = ref([])
const viewCompoundsLoading = ref(false)

// 基因相关（从化合物获取）
const genes = ref([])
const genesLoading = ref(false)
const compoundGeneLinks = ref([])  // 独立存储化合物-基因连接关系

// 疾病相关
const diseases = ref([])
const diseasesLoading = ref(false)
const diseasesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 症状相关
const symptoms = ref([])
const symptomsLoading = ref(false)
const symptomsPagination = ref({
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

// 方剂相关
const formulas = ref([])
const formulasLoading = ref(false)
const formulasPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 中医医案相关
const medicalCases = ref([])
const medicalCasesLoading = ref(false)
const medicalCasesPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 转录组学相关
const transcriptomicsData = ref([])
const transcriptomicsLoading = ref(false)
const statistics = ref({})
const transcriptomicsView = ref('volcano')
const volcanoChartRef = ref(null)
const heatmapChartRef = ref(null)
let volcanoChart = null
let heatmapChart = null

// 基因列表筛选和分页
const geneListFilter = ref({
  direction: '',
  significance: ''
})
const geneListPagination = ref({
  page: 1,
  pageSize: 50
})

// 筛选后的基因列表
const filteredGeneList = computed(() => {
  if (!transcriptomicsData.value) return []

  let filtered = transcriptomicsData.value

  // 按方向筛选
  if (geneListFilter.value.direction) {
    filtered = filtered.filter(gene => gene.direction === geneListFilter.value.direction)
  }

  // 按显著性筛选
  if (geneListFilter.value.significance === 'significant') {
    filtered = filtered.filter(gene => gene.significance === 'significant')
  }

  return filtered
})

// 分页后的基因列表
const pagedGeneList = computed(() => {
  const start = (geneListPagination.value.page - 1) * geneListPagination.value.pageSize
  const end = start + geneListPagination.value.pageSize
  return filteredGeneList.value.slice(start, end)
})

// 获取药材详情
const fetchHerbDetail = async () => {
  loading.value = true
  error.value = null

  try {
    const herbId = route.params.id
    if (!herbId) {
      error.value = t('medicine.herb.invalidId')
      return
    }

    const response = await getHerbDetail(herbId)

    if (response.code === 200) {
      herb.value = response.data
      // 药材详情加载成功后，加载默认Tab的数据
      loadCompounds()

      // 加载知识图谱所需的所有数据
      loadViewCompounds()  // 用于d3图的化合物数据
      loadDiseases()       // 用于d3图的疾病数据
      loadSymptoms()       // 用于d3图的症状数据
      loadSyndromes()      // 用于d3图的证候数据
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载药材详情失败:', err)
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

// 跳转到化合物详情页
const goToCompoundDetail = (inchikey) => {
  if (inchikey) {
    router.push({
      name: 'CompoundDetail',
      params: { inchikey }
    })
  }
}

// 跳转到方剂详情页
const goToPrescriptionDetail = (prescriptionId) => {
  if (prescriptionId) {
    router.push({
      name: 'PrescriptionDetail',
      params: { id: prescriptionId }
    })
  }
}

// 跳转到症状详情页
const goToSymptomDetail = (symptomId) => {
  if (symptomId) {
    router.push({
      name: 'SymptomDetail',
      params: { id: symptomId }
    })
  }
}

// 跳转到证候详情页
const goToSyndromeDetail = (syndromeId) => {
  if (syndromeId) {
    router.push({
      name: 'SyndromeDetail',
      params: { id: syndromeId }
    })
  }
}

// 跳转到医案详情页
const goToMedicalCaseDetail = (caseId) => {
  if (caseId) {
    router.push({
      name: 'MedicalCaseDetail',
      params: { id: caseId }
    })
  }
}

// 加载化合物列表
const loadCompounds = async () => {
  if (!herb.value) return

  compoundsLoading.value = true
  try {
    const response = await getHerbCompounds(herb.value.tcmHerbId, {
      page: compoundsPagination.value.page,
      pageSize: compoundsPagination.value.pageSize
    })

    if (response.code === 200) {
      compounds.value = response.rows || []
      compoundsPagination.value.total = response.total || 0
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
//加载视图compounds
const loadViewCompounds = async () => {
  try {
    const response = await getHerbRelatedCompounds(herb.value.tcmHerbId)
    if (response.code === 200) {
      viewCompounds.value = response.data || []
      // 加载完化合物后，加载基因
      loadGenesFromCompounds()
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载 compound 失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    viewCompoundsLoading.value = false
  }
}

// 从化合物批量加载基因（性能优化：一次请求）
const loadGenesFromCompounds = async () => {
  if (viewCompounds.value.length === 0) return

  genesLoading.value = true
  try {
    // 收集所有有效的 inchikey
    const inchikeys = viewCompounds.value
      .filter(compound => compound.inchikey)
      .map(compound => compound.inchikey)

    if (inchikeys.length === 0) {
      console.log('没有有效的化合物 inchikey')
      return
    }

    console.log(`批量查询 ${inchikeys.length} 个化合物的靶标信息...`)
    console.log('InChIKeys:', inchikeys.slice(0, 5), inchikeys.length > 5 ? `...等${inchikeys.length}个` : '')

    // 批量请求所有化合物的靶标信息
    const response = await batchGetCompoundTargets(inchikeys)

    console.log('后端响应:', response)

    if (response.code === 200 && response.data) {
      // 新的数据结构: { targets: [...], relations: [...] }
      const { targets, relations } = response.data

      if (!targets || !relations) {
        console.warn('数据格式错误，缺少 targets 或 relations')
        return
      }

      console.log(`📊 后端返回数据统计:`)
      console.log(`  - 唯一靶标数: ${targets.length}`)
      console.log(`  - 化合物-靶标关系数: ${relations.length}`)

      // 构建基因Map（直接使用去重后的targets）
      const geneMap = new Map()
      targets.forEach(target => {
        if (target.symbol) {
          geneMap.set(target.symbol, {
            geneSymbol: target.symbol,
            geneName: target.description || target.symbol,
            uniprotId: target.uniprotId
          })
        }
      })

      // 存储基因数据
      genes.value = Array.from(geneMap.values())

      // 存储化合物-基因连接关系（独立的 ref）
      compoundGeneLinks.value = relations.map(rel => ({
        compoundId: rel.inchikey,
        geneSymbol: rel.targetSymbol
      }))

      // 统计每个化合物的靶标数量
      const compoundTargetCount = new Map()
      relations.forEach(rel => {
        const count = compoundTargetCount.get(rel.inchikey) || 0
        compoundTargetCount.set(rel.inchikey, count + 1)
      })

      console.log(`✅ 成功批量加载 ${genes.value.length} 个唯一基因，${compoundGeneLinks.value.length} 个连接关系`)
      console.log(`📈 平均每个化合物有 ${(relations.length / compoundTargetCount.size).toFixed(1)} 个靶标`)
      console.log('🧬 基因列表预览:', genes.value.slice(0, 5).map(g => g.geneSymbol))
      console.log('🔗 连接关系预览:', compoundGeneLinks.value.slice(0, 5))

      // 立即验证数据是否可访问
      console.log('🔍 立即验证: genes.value.length =', genes.value.length)
      console.log('🔍 立即验证: compoundGeneLinks.value.length =', compoundGeneLinks.value.length)
    } else {
      console.warn('批量查询靶标信息失败:', response.msg)
    }
  } catch (err) {
    console.error('批量加载基因失败:', err)
    ElMessage.warning('加载基因靶标信息失败，图谱可能不完整')
  } finally {
    genesLoading.value = false
  }
}

// 加载相关疾病
const loadDiseases = async () => {
  if (!herb.value) return

  diseasesLoading.value = true
  try {
    const response = await getHerbDiseases(herb.value.tcmHerbId, {
      page: diseasesPagination.value.page,
      pageSize: diseasesPagination.value.pageSize
    })

    if (response.code === 200) {
      diseases.value = response.rows || []
      diseasesPagination.value.total = response.total || 0
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

// 加载相关症状
const loadSymptoms = async () => {
  if (!herb.value) return

  symptomsLoading.value = true
  try {
    const response = await getHerbSymptoms(herb.value.tcmHerbId, {
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
    console.error('加载症状失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    symptomsLoading.value = false
  }
}

// 加载相关证候
const loadSyndromes = async () => {
  if (!herb.value) return

  syndromesLoading.value = true
  try {
    const response = await getHerbSyndromes(herb.value.tcmHerbId, {
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
    console.error('加载证候失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    syndromesLoading.value = false
  }
}

// 加载相关方剂
const loadFormulas = async () => {
  if (!herb.value) return

  formulasLoading.value = true
  try {
    const response = await getHerbFormulas(herb.value.tcmHerbId, {
      page: formulasPagination.value.page,
      pageSize: formulasPagination.value.pageSize
    })

    if (response.code === 200) {
      formulas.value = response.rows || []
      formulasPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载方剂失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    formulasLoading.value = false
  }
}

// 加载相关中医医案
const loadMedicalCases = async () => {
  if (!herb.value) return

  medicalCasesLoading.value = true
  try {
    const response = await getHerbMedicalCases(herb.value.tcmHerbId, {
      page: medicalCasesPagination.value.page,
      pageSize: medicalCasesPagination.value.pageSize
    })

    if (response.code === 200) {
      medicalCases.value = response.rows || []
      medicalCasesPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载中医医案失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    medicalCasesLoading.value = false
  }
}

// 处理化合物分页
const handleCompoundsPageChange = () => {
  loadCompounds()
}

// 处理疾病分页
const handleDiseasesPageChange = () => {
  loadDiseases()
}

// 处理症状分页
const handleSymptomsPageChange = () => {
  loadSymptoms()
}

// 处理证候分页
const handleSyndromesPageChange = () => {
  loadSyndromes()
}

// 处理方剂分页
const handleFormulasPageChange = () => {
  loadFormulas()
}

// 处理中医医案分页
const handleMedicalCasesPageChange = () => {
  loadMedicalCases()
}

// 加载转录组学数据
const loadTranscriptomics = async () => {
  if (!herb.value) return

  transcriptomicsLoading.value = true
  try {
    // 并行请求数据和统计信息
    const [dataResponse, statsResponse] = await Promise.all([
      getHerbTranscriptomics(herb.value.tcmHerbId),
      getHerbTranscriptomicsStatistics(herb.value.tcmHerbId)
    ])

    if (dataResponse.code === 200) {
      transcriptomicsData.value = dataResponse.data || []
    }

    if (statsResponse.code === 200) {
      statistics.value = statsResponse.data || {}
    }

    // 等待DOM更新后初始化图表
    await nextTick()
    setTimeout(() => {
      initVolcanoPlot()
      initHeatmap()
    }, 100)
  } catch (err) {
    console.error('加载转录组学数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    transcriptomicsLoading.value = false
  }
}

// 初始化火山图
const initVolcanoPlot = () => {
  if (!volcanoChartRef.value || !transcriptomicsData.value || transcriptomicsData.value.length === 0) {
    console.warn('火山图容器或数据未准备好')
    return
  }

  if (volcanoChart) {
    volcanoChart.dispose()
  }

  volcanoChart = echarts.init(volcanoChartRef.value, null, { renderer: 'canvas' })

  // 准备数据
  const upregulated = []
  const downregulated = []
  const notSignificant = []

  transcriptomicsData.value.forEach(gene => {
    const log2FC = gene.log2FcAvg || 0
    let pvalue = gene.pValue

    // 处理p-value为0的情况
    if (pvalue === 0) {
      pvalue = 1e-300
    }

    if (pvalue < 0) {
      console.log('跳过无效数据点:', gene)
      return
    }

    const negLog10P = -Math.log10(pvalue)
    const point = [log2FC, negLog10P, gene.geneName]

    if (gene.significance === 'significant') {
      if (gene.direction === 'up') {
        upregulated.push(point)
      } else {
        downregulated.push(point)
      }
    } else {
      // 对不显著的点进行采样（30%）以提升性能
      if (Math.random() < 0.3) {
        notSignificant.push(point)
      }
    }
  })

  const option = {
    title: {
      text: t('medicine.herb.volcanoPlot'),
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const [log2FC, negLog10P, geneName] = params.data
        return `${geneName}<br/>Log2FC: ${log2FC.toFixed(3)}<br/>-log10(P): ${negLog10P.toFixed(2)}`
      }
    },
    legend: {
      data: [
        { name: t('medicine.herb.upregulated'), itemStyle: { color: '#f56c6c' } },
        { name: t('medicine.herb.downregulated'), itemStyle: { color: '#409eff' } },
        { name: t('medicine.herb.notSignificant'), itemStyle: { color: '#909399' } }
      ],
      top: 30
    },
    grid: {
      left: '10%',
      right: '10%',
      top: '15%',
      bottom: '15%'
    },
    xAxis: {
      name: 'Log2 Fold Change',
      nameLocation: 'middle',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#999' } }
    },
    yAxis: {
      name: '-Log10(P-value)',
      nameLocation: 'middle',
      nameGap: 40,
      axisLine: { lineStyle: { color: '#999' } }
    },
    series: [
      {
        name: t('medicine.herb.upregulated'),
        type: 'scatter',
        data: upregulated,
        symbolSize: 6,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: t('medicine.herb.downregulated'),
        type: 'scatter',
        data: downregulated,
        symbolSize: 6,
        itemStyle: { color: '#409eff' }
      },
      {
        name: t('medicine.herb.notSignificant'),
        type: 'scatter',
        data: notSignificant,
        symbolSize: 4,
        itemStyle: { color: '#909399', opacity: 0.5 }
      }
    ],
    animation: false
  }

  volcanoChart.setOption(option)
}

// 初始化热图
const initHeatmap = () => {
  if (!heatmapChartRef.value || !transcriptomicsData.value || transcriptomicsData.value.length === 0) {
    console.warn('热图容器或数据未准备好')
    return
  }

  if (heatmapChart) {
    heatmapChart.dispose()
  }

  heatmapChart = echarts.init(heatmapChartRef.value, null, { renderer: 'canvas' })

  // 取Top 50差异表达基因
  const sortedGenes = [...transcriptomicsData.value]
    .sort((a, b) => Math.abs(b.log2FcAvg) - Math.abs(a.log2FcAvg))
    .slice(0, 50)

  const formatGeneName = (gene) => gene.geneName || gene.geneSymbol || gene.geneEntrezId || '-'
  const geneNames = sortedGenes.map(formatGeneName)
  const leftLabels = geneNames.map((name, idx) => (idx % 2 === 0 ? name : ''))
  const rightLabels = geneNames.map((name, idx) => (idx % 2 === 1 ? name : ''))
  const heatmapData = sortedGenes.map((g, idx) => [0, idx, g.log2FcAvg])
  const maxAbsLog2 = Math.max(...sortedGenes.map(g => Math.abs(g.log2FcAvg || 0)), 1) || 1

  const option = {
    title: {
      text: t('medicine.herb.heatmap') + ' (Top 50 DEGs)',
      left: 'center'
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const gene = sortedGenes[params.data[1]]
        return `${gene.geneName}<br/>Log2FC: ${gene.log2FcAvg.toFixed(3)}`
      }
    },
    grid: {
      left: 160,
      right: 160,
      top: '10%',
      bottom: '5%'
    },
    xAxis: {
      type: 'category',
      data: ['Expression'],
      splitArea: { show: true }
    },
    yAxis: [
      {
        type: 'category',
        data: leftLabels,
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          interval: 0,
          align: 'right', // 左侧标签右对齐
          padding: [0, 8, 0, 0],
          formatter: (value, index) => value
        },
        position: 'left'
      },
      {
        type: 'category',
        data: rightLabels,
        position: 'right',
        splitLine: { show: false },
        splitArea: { show: true },
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 10,
          interval: 0,
          align: 'left', // 右侧标签左对齐
          padding: [0, 0, 0, 8],
          formatter: (value, index) => value
        }
      }
    ],
    visualMap: {
      min: -maxAbsLog2,
      max: maxAbsLog2,
      calculable: true,
      orient: 'vertical',
      right: '2%',
      top: 'center',
      inRange: {
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: 'Gene Expression',
      type: 'heatmap',
      data: heatmapData,
      emphasis: { disabled: true },
      progressive: 1000
    }],
    animation: false
  }

  heatmapChart.setOption(option)
}

// 处理基因列表分页
const handleGeneListPageChange = () => {
  // 分页变化时不需要重新加载数据，computed会自动更新
}

// 监听 Tab 切换，懒加载数据
watch(activeTab, (newTab) => {
  // 只有在数据未加载时才加载
  if (newTab === 'compounds' && compounds.value.length === 0) {
    loadCompounds()
  } else if (newTab === 'diseases' && diseases.value.length === 0) {
    loadDiseases()
  } else if (newTab === 'symptoms' && symptoms.value.length === 0) {
    loadSymptoms()
  } else if (newTab === 'syndromes' && syndromes.value.length === 0) {
    loadSyndromes()
  } else if (newTab === 'formulas' && formulas.value.length === 0) {
    loadFormulas()
  } else if (newTab === 'medicalCases' && medicalCases.value.length === 0) {
    loadMedicalCases()
  } else if (newTab === 'transcriptomics' && transcriptomicsData.value.length === 0) {
    loadTranscriptomics()
  }
}, { immediate: false }) // 不需要立即执行，因为在 fetchHerbDetail 中已经加载了

// 监听转录组学内部Tab切换，重新渲染图表
watch(transcriptomicsView, async (newView) => {
  if (!transcriptomicsData.value || transcriptomicsData.value.length === 0) return

  await nextTick()
  setTimeout(() => {
    if (newView === 'volcano') {
      initVolcanoPlot()
    } else if (newView === 'heatmap') {
      initHeatmap()
    }
  }, 50)
})

// 监听筛选条件变化，重置分页
watch(geneListFilter, () => {
  geneListPagination.value.page = 1
}, { deep: true })

// Tab切换处理
const handleTabChange = (tabName) => {
  // watch已经处理了懒加载，这里可以添加其他逻辑
}

// 知识图谱数据准备
const graphLoading = ref(false)

// 构建图谱数据
const graphData = computed(() => {
  try {
    if (!herb.value) {
      console.log('⚠️ 图谱数据: herb 为空')
      return { nodes: [], links: [] }
    }

    const nodes = []
    const links = []

    // 中心节点 - 当前药材
    const herbNode = {
      id: herb.value.tcmHerbId,
      label: herb.value.herbNameZh || herb.value.name,
      type: 'herb',
      isCenter: true
    }
    nodes.push(herbNode)

    console.log('🎨 开始构建图谱数据（Sigma.js - 无限制）...')
    console.log('当前数据量: genes=', genes.value.length, 'compoundGeneLinks=', compoundGeneLinks.value.length)

    // 🚀 Sigma.js 性能优异，直接展示所有数据！
    // 添加所有化合物节点
    viewCompounds.value.forEach((viewCompound, index) => {
      const compoundNode = {
        id: `${viewCompound.inchikey || index}`,
        label: viewCompound.molecularFormula || `Compound ${index + 1}`,
        type: 'compound'
      }
      nodes.push(compoundNode)
      links.push({
        source: herbNode.id,
        target: compoundNode.id
      })
    })

    // 添加所有基因节点（不限制）
    genes.value.forEach((gene, index) => {
      const geneNode = {
        id: `gene_${gene.geneSymbol || index}`,
        label: gene.geneSymbol || `Gene ${index + 1}`,
        type: 'gene'
      }
      nodes.push(geneNode)
    })

    // 添加所有化合物-基因连线
    compoundGeneLinks.value.forEach(link => {
      links.push({
        source: link.compoundId,
        target: `gene_${link.geneSymbol}`
      })
    })

    // 添加所有疾病节点
    diseases.value.forEach((disease, index) => {
      const diseaseNode = {
        id: `disease_${disease.diseaseId || index}`,
        label: disease.diseaseName || `Disease ${index + 1}`,
        type: 'disease'
      }
      nodes.push(diseaseNode)
      links.push({
        source: herbNode.id,
        target: diseaseNode.id
      })
    })

    // 添加所有症状节点
    symptoms.value.forEach((symptom, index) => {
      const symptomNode = {
        id: `symptom_${symptom.tcmSymptomId || index}`,
        label: symptom.symptomNameZh || `Symptom ${index + 1}`,
        type: 'symptom' // 症状使用独立颜色
      }
      nodes.push(symptomNode)
      links.push({
        source: herbNode.id,
        target: symptomNode.id
      })
    })

    // 添加所有证候节点
    syndromes.value.forEach((syndrome, index) => {
      const syndromeNode = {
        id: `syndrome_${syndrome.tcmSyndromeId || index}`,
        label: syndrome.syndromeNameZh || `Syndrome ${index + 1}`,
        type: 'syndrome'
      }
      nodes.push(syndromeNode)
      links.push({
        source: herbNode.id,
        target: syndromeNode.id
      })
    })

    console.log(`📊 图谱数据构建完成（所有数据）:`)
    console.log(`  - 化合物: ${viewCompounds.value.length}`)
    console.log(`  - 基因: ${genes.value.length}`)
    console.log(`  - 化合物-基因连接: ${compoundGeneLinks.value.length}`)
    console.log(`  - 疾病: ${diseases.value.length}`)
    console.log(`  - 症状: ${symptoms.value.length}`)
    console.log(`  - 证候: ${syndromes.value.length}`)
    console.log(`  - 总节点数: ${nodes.length}`)
    console.log(`  - 总连线数: ${links.length}`)
    console.log(`  🚀 Sigma.js 将流畅渲染所有 ${nodes.length} 个节点！`)

    return { nodes, links }
  } catch (error) {
    console.error('❌ 构建图谱数据时出错:', error)
    return { nodes: [], links: [] }
  }
})

// 监听数据变化以更新图谱
watch([viewCompounds, genes, compoundGeneLinks, diseases, symptoms, syndromes], () => {
  // 数据更新时，图谱会自动重绘
}, { deep: true })

onMounted(() => {
  fetchHerbDetail()
})
</script>

<style scoped>
.herb-detail-page {
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

.herb-icon {
  font-size: 64px;
  color: #2d8659;
}

.header-info h1 {
  font-size: 36px;
  color: #1a5f4a;
  margin: 0 0 12px 0;
}

.sub-info {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.pinyin {
  font-size: 18px;
  color: #666;
  font-style: italic;
}

.latin {
  font-size: 16px;
  color: #999;
}

.id-badge {
  margin-top: 8px;
}

/* SymMap风格信息表 */
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

@media (max-width: 768px) {
  .detail-header {
    padding: 24px;
  }

  .header-left {
    flex-direction: column;
  }

  .header-info h1 {
    font-size: 28px;
  }

  .related-tabs {
    padding: 20px;
  }

  :deep(.el-tabs__item) {
    font-size: 14px;
    padding: 0 10px;
  }

  :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }

  .label-cell {
    width: 120px;
    padding: 12px 16px;
  }
}

/* 知识图谱部分 */
.knowledge-graph-section {
  margin-top: 24px;
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

/* 转录组学样式 */
.transcriptomics-content {
  padding: 20px 0;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  border-radius: 12px;
  border: 2px solid #e8f5ef;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(45, 134, 89, 0.15);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.stat-icon.total {
  background: linear-gradient(135deg, #2d8659 0%, #1a5f4a 100%);
}

.stat-icon.up {
  background: linear-gradient(135deg, #f56c6c 0%, #e03e3e 100%);
}

.stat-icon.down {
  background: linear-gradient(135deg, #409eff 0%, #2a7de1 100%);
}

.stat-icon.significant {
  background: linear-gradient(135deg, #e6a23c 0%, #d48806 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1a5f4a;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.inner-tabs {
  margin-top: 20px;
}

.chart-container {
  width: 100%;
  height: 600px;
  margin: 20px 0;
}

.filter-bar {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-bar .el-select {
  width: 200px;
}

.gene-list-table {
  margin-top: 20px;
}

.log2fc-value {
  font-weight: 600;
}

.log2fc-value.up {
  color: #f56c6c;
}

.log2fc-value.down {
  color: #409eff;
}

.significance-label {
  font-weight: 600;
  color: #e6a23c;
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .stat-value {
    font-size: 24px;
  }

  .chart-container {
    height: 400px;
  }

  .filter-bar {
    flex-direction: column;
  }

  .filter-bar .el-select {
    width: 100% !important;
  }
}
</style>
