<template>
  <div class="compound-detail-page">
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

      <!-- 化合物详情 -->
      <div v-else-if="compound" class="detail-content">
        <div class="main-sections">
        <!-- 头部信息 -->
        <div class="detail-header card" id="section-overview">
          <div class="header-left">
            <el-icon class="compound-icon">
              <Operation />
            </el-icon>
            <div class="header-info">
              <h1>{{ compound.compoundName || compound.molecularFormula || 'Compound' }}</h1>
              <div class="sub-info">
                <span class="inchikey">{{ compound.inchikey }}</span>
              </div>
              <div class="id-badge" v-if="compound.pubchemCid">
                <el-tag type="success" size="large">PubChem: {{ compound.pubchemCid }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息汇总表 -->
        <div class="summary-section card" id="section-basic-info">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.compound.basicInfo') }}
          </h2>
          <div v-if="structureImageUrl" class="structure-preview">
            <div class="structure-image-wrapper" v-if="!structureImageFailed">
              <img
                class="structure-image"
                :src="structureImageUrl"
                :alt="`${compound.compoundName || compound.inchikey || 'compound'} structure`"
                loading="lazy"
                @error="handleStructureImageError"
              />
            </div>
            <div v-else class="structure-image-fallback">
              <el-icon><WarningFilled /></el-icon>
              <span>{{ $t('CompoundDetail_Basic.gjjzsb') }}</span>
            </div>
            <div class="structure-caption">
              <div class="structure-caption-title">{{ $t('CompoundDetail_Basic.jgtx') }}</div>
              <div class="structure-caption-subtitle">
                {{ $t('CompoundDetail_Basic.ind') }}
              </div>
              <a
                v-if="!structureImageFailed"
                class="structure-link"
                :href="structureImageUrl"
                target="_blank"
                rel="noopener"
              >
                {{ $t('CompoundDetail_Basic.newwind') }}
              </a>
            </div>
          </div>
          <div class="info-grid" v-if="basicInfoItems.length">
            <div
              v-for="item in basicInfoItems"
              :key="item.key"
              class="info-item"
            >
              <div class="info-item-label">{{ item.label }}</div>
              <div class="info-item-value" :class="item.className">
                {{ item.value }}
              </div>
            </div>
          </div>
        </div>

        <!-- ADMET性质 -->
        <div class="admet-section card" id="section-admet" v-if="admet">
          <h2 class="section-title">
            <el-icon><DataAnalysis /></el-icon>
            {{ $t('medicine.compound.admetProperties') }}
          </h2>
          
          <!-- 分类型参数 - 图表展示 -->
          <div class="admet-chart-section">
            <h3 class="subsection-title">ADMET</h3>
            <div ref="admetChartRef" class="admet-chart"></div>
          </div>

          <!-- 数值型参数 - 表格展示 -->
          <el-collapse v-model="activeCollapseNames">
            <el-collapse-item title="ADMET" name="1" >
              <table class="admet-table">
                <thead>
                  <tr>
                    <th>{{ $t('medicine.compound.parameterName') }}</th>
                    <th>{{ $t('medicine.compound.value') }}</th>
                    <th>{{ $t('medicine.compound.unit') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="admet.caco2 != null">
                    <td class="label-cell">Caco-2 </td>
                    <td class="value-cell">{{ admet.caco2.toFixed(3) }}</td>
                    <td class="unit-cell">cm/s</td>
                  </tr>
                  <tr v-if="admet.ppbr != null">
                    <td class="label-cell">PPBR </td>
                    <td class="value-cell">{{ admet.ppbr.toFixed(3) }}</td>
                    <td class="unit-cell">%</td>
                  </tr>
                  <tr v-if="admet.clearanceMicrosome != null">
                    <td class="label-cell">Clearance Microsome</td>
                    <td class="value-cell">{{ admet.clearanceMicrosome.toFixed(3) }}</td>
                    <td class="unit-cell">mL/min/kg</td>
                  </tr>
                  <tr v-if="admet.ld50 != null">
                    <td class="label-cell">LD50 </td>
                    <td class="value-cell">{{ admet.ld50.toFixed(3) }}</td>
                    <td class="unit-cell">mg/kg</td>
                  </tr>
                  <tr v-if="admet.lipophilicity != null">
                    <td class="label-cell">Lipophilicity </td>
                    <td class="value-cell">{{ admet.lipophilicity.toFixed(3) }}</td>
                    <td class="unit-cell">LogP</td>
                  </tr>
                  <tr v-if="admet.solubility != null">
                    <td class="label-cell">Solubility</td>
                    <td class="value-cell">{{ admet.solubility.toFixed(3) }}</td>
                    <td class="unit-cell">LogS (mol/L)</td>
                  </tr>
                  <tr v-if="admet.freesolv != null">
                    <td class="label-cell">FreeSolv</td>
                    <td class="value-cell">{{ admet.freesolv.toFixed(3) }}</td>
                    <td class="unit-cell">kcal/mol</td>
                  </tr>
                </tbody>
              </table>
            </el-collapse-item>
          </el-collapse>
        </div>

        <!-- 关联数据 Tab 页 -->
        <div class="related-tabs card" id="section-related">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.compound.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 关联中药材 Tab -->
            <el-tab-pane :label="$t('medicine.compound.relatedHerbs')" name="herbs">
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
                  <el-table-column :label="$t('medicine.herb.name')" min-width="150">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToHerbDetail(row.tcmHerbId)">{{ row.herbNameZh }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="pinyinName" :label="$t('medicine.herb.pinyin')" min-width="150" />
                  <el-table-column prop="efficacyCategory" :label="$t('medicine.herb.category')" min-width="120" />
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

            <!-- 关联靶标 Tab -->
            <el-tab-pane :label="$t('medicine.compound.relatedTargets')" name="targets">
              <div v-if="targetsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="targets.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="targets" border stripe>
                  <el-table-column :label="$t('medicine.compound.geneSymbol')" min-width="120">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToGeneDetail(row.tcmTarId)">
                        {{ row.symbol }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="geneEntrezId" label="Entrez ID" min-width="120" />
                  <el-table-column prop="uniprotId" label="UniProt ID" min-width="120" />
                  <el-table-column prop="description" :label="$t('medicine.compound.description')" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="targetsPagination.page"
                    v-model:page-size="targetsPagination.pageSize"
                    :total="targetsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleTargetsPageChange"
                    @size-change="handleTargetsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 转录组学数据 Tab -->
            <el-tab-pane :label="$t('medicine.compound.transcriptomics')" name="transcriptomics">
              <div v-if="transcriptomicsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="!transcriptomicsData || transcriptomicsData.length === 0" class="tab-empty">
                <el-empty :description="$t('medicine.compound.noTranscriptomicsData')" />
              </div>
              <div v-else class="transcriptomics-content">
                <!-- 统计信息卡片 -->
                <div class="stats-cards">
                  <div class="stat-card">
                    <div class="stat-icon total">
                      <el-icon><DataAnalysis /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.totalGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.compound.totalGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon up">
                      <el-icon><Top /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.upregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.compound.upregulatedGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon down">
                      <el-icon><Bottom /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.downregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.compound.downregulatedGenes') }}</div>
                    </div>
                  </div>
                </div>

                <!-- 可视化和列表切换 -->
                <el-tabs v-model="transcriptomicsView" class="inner-tabs">
                  <!-- 火山图 -->
                  <el-tab-pane :label="$t('medicine.compound.volcanoPlot')" name="volcano">
                    <div class="chart-container" ref="volcanoChartRef" style="height: 600px;"></div>
                  </el-tab-pane>

                  <!-- 热图 -->
                  <el-tab-pane :label="$t('medicine.compound.heatmap')" name="heatmap">
                    <div class="chart-container" ref="heatmapChartRef" style="height: 600px;"></div>
                  </el-tab-pane>

                  <!-- 差异基因列表 -->
                  <el-tab-pane :label="$t('medicine.compound.geneList')" name="list">
                    <!-- 筛选器 -->
                    <div class="filter-bar">
                      <el-select 
                        v-model="geneListFilter.direction" 
                        :placeholder="$t('medicine.compound.filterByDirection')"
                        clearable
                        style="width: 200px;"
                        @change="filterGeneList"
                      >
                        <el-option :label="$t('medicine.compound.allDirections')" value=""></el-option>
                        <el-option :label="$t('medicine.compound.upregulated')" value="up"></el-option>
                        <el-option :label="$t('medicine.compound.downregulated')" value="down"></el-option>
                      </el-select>

                      <el-select 
                        v-model="geneListFilter.significance" 
                        :placeholder="$t('medicine.compound.filterBySignificance')"
                        clearable
                        style="width: 200px;"
                        @change="filterGeneList"
                      >
                        <el-option :label="$t('common.all')" value=""></el-option>
                        <el-option :label="$t('medicine.compound.significant')" value="significant"></el-option>
                        <el-option :label="$t('medicine.compound.notSignificant')" value="not_significant"></el-option>
                      </el-select>
                    </div>

                    <!-- 基因列表表格 -->
                    <el-table 
                      :data="paginatedGeneList" 
                      class="gene-list-table"
                      @row-click="goToGeneDetail"
                    >
                      <el-table-column prop="geneSymbol" :label="$t('medicine.gene.symbol')" width="120">
                        <template #default="{ row }">
                          <span class="gene-symbol-link">{{ row.geneSymbol || row.geneEntrezId }}</span>
                        </template>
                      </el-table-column>
                      <!-- <el-table-column prop="geneDescription" :label="$t('medicine.gene.description')" min-width="200" /> -->
                      <el-table-column prop="log2FcAvg" :label="$t('medicine.compound.log2FC')" width="200" sortable>
                        <template #default="{ row }">
                          <span :class="['log2fc-value', row.direction]">
                            {{ row.log2FcAvg ? row.log2FcAvg.toFixed(2) : '-' }}
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="pValue" :label="$t('medicine.compound.pValue')" width="180" sortable>
                        <template #default="{ row }">
                          {{ row.pValue ? row.pValue.toExponential(2) : '-' }}
                        </template>
                      </el-table-column>
                      <el-table-column prop="direction" :label="$t('medicine.compound.direction')" width="250">
                        <template #default="{ row }">
                          <el-tag :type="row.direction === 'up' ? 'danger' : 'primary'" size="small">
                            {{ row.direction === 'up' ? $t('medicine.compound.upregulated') : $t('medicine.compound.downregulated') }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column prop="significanceLabel" :label="$t('medicine.herb.significance')" width="180" align="center">
                        <template #default="{ row }">
                           <span class="significance-label">{{ row.significanceLabel || 'ns' }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column prop="source" :label="$t('common.source')" width="200">
                        <template #default="{ row }">
                         <el-tag size="small">{{ row.source }}</el-tag>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div class="gene-pagination" v-if="geneListPagination.total > 0">
                      <el-pagination
                        layout="total, sizes, prev, pager, next"
                        :current-page="geneListPagination.page"
                        :page-size="geneListPagination.pageSize"
                        :page-sizes="[10, 20, 50, 100]"
                        :total="geneListPagination.total"
                        @current-change="handleGenePageChange"
                        @size-change="handleGenePageSizeChange"
                      />
                    </div>
                  </el-tab-pane>
                </el-tabs>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
        </div>

        <AnchorNavigation :sections="anchorSections" />

        </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loading, WarningFilled, InfoFilled, Connection, Operation, DataAnalysis, Top, Bottom } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import AnchorNavigation from '@/components/AnchorNavigation.vue'
import { 
  getCompoundDetail, 
  getCompoundTargets, 
  getCompoundADMET,
  getCompoundHerbs,
  getCompoundTranscriptomics,
  getCompoundTranscriptomicsStatistics,
  getGeneDetailByEntrezId
} from '@/api'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'

const { t, te } = useI18n()
const translate = (key, fallback) => {
  if (typeof te === 'function' && te(key)) {
    return t(key)
  }
  return fallback
}
const route = useRoute()
const router = useRouter()
const activeCollapseNames = ref(['1'])
const loading = ref(true)
const error = ref(null)
const compound = ref(null)
const admet = ref(null)
const structureImageFailed = ref(false)

const structureImageUrl = computed(() => {
  if (!compound.value?.inchikey) return ''
  const key = encodeURIComponent(compound.value.inchikey)
  return `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/inchikey/${key}/PNG?record_type=2d&image_size=large`
})

const basicInfoItems = computed(() => {
  const c = compound.value
  if (!c) return []
  const items = []
  const pushItem = (condition, key, label, value, className) => {
    if (!condition) return
    items.push({
      key,
      label,
      value,
      className
    })
  }

  pushItem(Boolean(c.compoundName), 'compoundName', t('medicine.compound.name'), c.compoundName)
  pushItem(true, 'inchikey', 'InChIKey', c.inchikey || '-')
  pushItem(Boolean(c.molecularFormula), 'molecularFormula', t('medicine.compound.formula'), c.molecularFormula)
  pushItem(Boolean(c.molecularWeight), 'molecularWeight', t('medicine.compound.weight'), c.molecularWeight)
  pushItem(c.exactMass != null, 'exactMass', t('medicine.compound.exactMass'), c.exactMass)
  pushItem(Boolean(c.canonicalSmiles), 'canonicalSmiles', t('medicine.compound.smiles'), c.canonicalSmiles, 'smiles-cell')
  pushItem(Boolean(c.pubchemCid), 'pubchemCid', 'PubChem CID', c.pubchemCid)
  pushItem(c.logp != null, 'logp', 'LogP', c.logp)
  pushItem(c.tpsa != null, 'tpsa', 'TPSA', c.tpsa)
  pushItem(c.heavyAtomCount != null, 'heavyAtomCount', t('medicine.compound.heavyAtomCount'), c.heavyAtomCount)
  pushItem(c.numAtoms != null, 'numAtoms', t('medicine.compound.atomCount'), c.numAtoms)
  pushItem(c.numBonds != null, 'numBonds', t('medicine.compound.bondCount'), c.numBonds)
  pushItem(c.numRings != null, 'numRings', t('medicine.compound.ringCount'), c.numRings)
  pushItem(c.rotatableBonds != null, 'rotatableBonds', t('medicine.compound.rotatableBonds'), c.rotatableBonds)
  pushItem(c.fractionCsp3 != null, 'fractionCsp3', t('medicine.compound.fractionCsp3'), c.fractionCsp3)
  pushItem(c.hbondDonors != null, 'hbondDonors', t('medicine.compound.hbondDonors'), c.hbondDonors)
  pushItem(c.hbondAcceptors != null, 'hbondAcceptors', t('medicine.compound.hbondAcceptors'), c.hbondAcceptors)

  return items
})

watch(
  () => compound.value?.inchikey,
  () => {
    structureImageFailed.value = false
  }
)

const handleStructureImageError = () => {
  structureImageFailed.value = true
}

// ADMET图表相关
const admetChartRef = ref(null)
let admetChart = null

// Tab 相关
const activeTab = ref('herbs')

// 中药材相关
const herbs = ref([])
const herbsLoading = ref(false)
const herbsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 靶标相关
const targets = ref([])
const targetsLoading = ref(false)
const targetsPagination = ref({
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

// 基因列表筛选
const geneListFilter = ref({
  direction: '',
  significance: ''
})

const geneListPagination = ref({
  page: 1,
  pageSize: 20,
  total: 0
})

// 过滤后的基因列表
const filteredGeneList = computed(() => {
  let result = transcriptomicsData.value || []
  
  // 按方向筛选
  if (geneListFilter.value.direction) {
    result = result.filter(gene => gene.direction === geneListFilter.value.direction)
  }
  
  // 按显著性筛选
  if (geneListFilter.value.significance) {
    result = result.filter(gene => gene.significance === geneListFilter.value.significance)
  }
  
  return result
})

const paginatedGeneList = computed(() => {
  const start = (geneListPagination.value.page - 1) * geneListPagination.value.pageSize
  return filteredGeneList.value.slice(start, start + geneListPagination.value.pageSize)
})

watch(filteredGeneList, (newList) => {
  geneListPagination.value.total = newList.length
  if ((geneListPagination.value.page - 1) * geneListPagination.value.pageSize >= newList.length) {
    geneListPagination.value.page = 1
  }
}, { immediate: true })

// 锚点导航
const anchorSections = computed(() => {
  if (!compound.value) return []

  const sections = [
    { id: 'section-overview', labelKey: 'common.anchorOverview' },
    { id: 'section-basic-info', labelKey: 'medicine.compound.basicInfo' }
  ]

  if (admet.value) {
    sections.push({ id: 'section-admet', labelKey: 'medicine.compound.admetProperties' })
  }

  sections.push({ id: 'section-related', labelKey: 'medicine.compound.relatedData' })

  return sections
})

// 获取化合物详情
const fetchCompoundDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const inchikey = route.params.inchikey
    if (!inchikey) {
      error.value = t('medicine.compound.invalidInchikey')
      return
    }

    const response = await getCompoundDetail(inchikey)
    
    if (response.code === 200) {
      compound.value = response.data
      // 化合物详情加载成功后，加载默认Tab的数据
      loadHerbs()
      
      // 加载ADMET数据
      loadADMET()
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载化合物详情失败:', err)
    error.value = t('common.networkError')
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 跳转到基因详情
// 跳转到基因详情（支持 entrezId、tcmTarId 或包含这些字段的对象）
const goToGeneDetail = async (geneIdOrEntrezIdOrRow) => {
  if (!geneIdOrEntrezIdOrRow) return
  
  try {
    let entrezId = null
    let tcmTarId = null
    
    // 判断参数类型
    if (typeof geneIdOrEntrezIdOrRow === 'object') {
      // 如果是对象（表格行点击），提取 geneEntrezId
      entrezId = geneIdOrEntrezIdOrRow.geneEntrezId
      tcmTarId = geneIdOrEntrezIdOrRow.tcmTarId
    } else if (typeof geneIdOrEntrezIdOrRow === 'number' || !isNaN(geneIdOrEntrezIdOrRow)) {
      // 如果是数字，认为是 entrezId
      entrezId = geneIdOrEntrezIdOrRow
    } else {
      // 如果是字符串，认为是 tcmTarId
      tcmTarId = geneIdOrEntrezIdOrRow
    }
    
    // 如果有 entrezId 但没有 tcmTarId，通过 entrezId 查询
    if (entrezId && !tcmTarId) {
      console.log('🔍 根据 Entrez ID 查询基因:', entrezId)
      const response = await getGeneDetailByEntrezId(entrezId)
      
      if (response.code === 200 && response.data) {
        tcmTarId = response.data.tcmTarId
        console.log('✅ 找到基因 ID:', tcmTarId)
      } else {
        ElMessage.warning(t('geneDetail.geneNotFound'))
        return
      }
    }
    
    // 跳转到基因详情页
    if (tcmTarId) {
      router.push({
        name: 'GeneDetail',
        params: { id: tcmTarId }
      })
    } else {
      ElMessage.warning(t('geneDetail.invalidGeneId'))
    }
  } catch (error) {
    console.error('跳转基因详情失败:', error)
    ElMessage.error(t('geneDetail.navigateFailed'))
  }
}

// 返回上一页
// 初始化ADMET图表
const initAdmetChart = () => {
  if (!admetChartRef.value || !admet.value) return
  
  // 如果图表已存在，先销毁
  if (admetChart) {
    admetChart.dispose()
  }
  
  // 定义分类型参数（按数据库字段命名）
  const categoryParams = [
    { key: 'bioavailability', name: 'Bioavailability', category: 'Absorb' },
    { key: 'hia', name: 'HIA', category: 'Absorb' },
    { key: 'pampa', name: 'PAMPA', category: 'Absorb' },
    { key: 'pgp', name: 'Pgp', category: 'Absorb' },
    { key: 'bbbp', name: 'BBBP', category: 'Distribution' },
    { key: 'skin', name: 'Skin', category: 'Distribution' },
    { key: 'cyp1a2Inhibition', name: 'CYP1A2 Inhibition', category: 'Metabolism' },
    { key: 'cyp2c9Inhibition', name: 'CYP2C9 Inhibition', category: 'Metabolism' },
    { key: 'cyp2c9Substrate', name: 'CYP2C9 Substrate', category: 'Metabolism' },
    { key: 'cyp2c19Inhibition', name: 'CYP2C19 Inhibition', category: 'Metabolism' },
    { key: 'cyp2d6Inhibition', name: 'CYP2D6 Inhibition', category: 'Metabolism' },
    { key: 'cyp2d6Substrate', name: 'CYP2D6 Substrate', category: 'Metabolism' },
    { key: 'cyp3a4Inhibition', name: 'CYP3A4 Inhibition', category: 'Metabolism' },
    { key: 'cyp3a4Substrate', name: 'CYP3A4 Substrate', category: 'Metabolism' },
    { key: 'ames', name: 'Ames', category: 'Toxicity' },
    { key: 'carcinogens', name: 'Carcinogens', category: 'Toxicity' },
    { key: 'dili', name: 'DILI', category: 'Toxicity' },
    { key: 'clintox', name: 'ClinTox', category: 'Toxicity' },
    { key: 'hergBlockers', name: 'hERG Blockers', category: 'Toxicity' },
    { key: 'hergKarim', name: 'hERG Karim', category: 'Toxicity' }
  ]
  
  // 准备数据
  const categories = ['Absorb', 'Distribution', 'Metabolism', 'Toxicity']
  const data = []
  
  categoryParams.forEach(param => {
    if (admet.value[param.key] != null) {
      const value = admet.value[param.key]
      // 判断是阴性还是阳性
      // INT类型字段（bioavailability, hia, carcinogens, clintox, cyp2c9_inhibition, cyp2d6_inhibition）：直接0/1判断
      // DOUBLE类型字段（其他）：使用阈值0.5判断
      let isPositive = false
      if (typeof value === 'number') {
        // 对于数值型，使用阈值判断（>0.5或=1视为阳性）
        isPositive = value > 0.5 || value === 1
      }
      
      data.push({
        name: param.name,
        value: [categories.indexOf(param.category), param.name, isPositive ? 1 : 0],
        category: param.category,
        isPositive: isPositive,
        rawValue: value
      })
    }
  })
  
  // 创建图表
  admetChart = echarts.init(admetChartRef.value)
  
  const negativeLabel = t('medicine.compound.negative')
  const positiveLabel = t('medicine.compound.positive')

  const option = {
    title: {
      text: 'ADMET',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      formatter: (params) => {
        const item = params.data
        return `${item.name}<br/>
                ${t('medicine.compound.category')}: ${item.category}<br/>
                ${t('medicine.compound.result')}: ${item.isPositive ? t('medicine.compound.positive') : t('medicine.compound.negative')}<br/>
                ${t('medicine.compound.rawValue')}: ${item.rawValue.toFixed(3)}`
      }
    },
    legend: {
      data: [negativeLabel, positiveLabel],
      top: 35,
      itemWidth: 20,
      itemHeight: 14
    },
    grid: {
      left: '15%',
      right: '10%',
      top: '20%',
      bottom: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        fontSize: 12,
        fontWeight: 'bold'
      },
      axisTick: {
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'category',
      data: categoryParams.map(p => p.name),
      axisLabel: {
        fontSize: 11,
        width: 100,
        overflow: 'truncate'
      }
    },
    series: [
      {
        name: negativeLabel,
        type: 'scatter',
        symbolSize: 18,
        data: data.filter(d => !d.isPositive).map(d => ({
          ...d,
          itemStyle: { color: '#52c41a' }
        })),
        itemStyle: {
          color: '#52c41a'
        },
        emphasis: {
          scale: 1.3
        }
      },
      {
        name: positiveLabel,
        type: 'scatter',
        symbolSize: 18,
        data: data.filter(d => d.isPositive).map(d => ({
          ...d,
          itemStyle: { color: '#ff4d4f' }
        })),
        itemStyle: {
          color: '#ff4d4f'
        },
        emphasis: {
          scale: 1.3
        }
      }
    ]
  }
  
  admetChart.setOption(option)
  
  // 响应式
  window.addEventListener('resize', () => {
    if (admetChart) {
      admetChart.resize()
    }
  })
}

const goBack = () => {
  router.back()
}

// 跳转到药材详情页
const goToHerbDetail = (herbId) => {
  if (herbId) {
    router.push({
      name: 'HerbDetail',
      params: { id: herbId }
    })
  }
}

// 加载关联中药材
const loadHerbs = async () => {
  if (!compound.value) return
  
  herbsLoading.value = true
  try {
    const response = await getCompoundHerbs(compound.value.inchikey, {
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
    console.error('加载中药材失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    herbsLoading.value = false
  }
}

// 加载关联靶标
const loadTargets = async () => {
  if (!compound.value) return
  
  targetsLoading.value = true
  try {
    const response = await getCompoundTargets(compound.value.inchikey, {
      page: targetsPagination.value.page,
      pageSize: targetsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      targets.value = response.rows || []
      targetsPagination.value.total = response.total || 0
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载靶标失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    targetsLoading.value = false
  }
}

// 加载ADMET数据
const loadADMET = async () => {
  if (!compound.value) return
  
  try {
    const response = await getCompoundADMET(compound.value.inchikey)
    
    if (response.code === 200) {
      admet.value = response.data
    }
  } catch (err) {
    console.log('ADMET数据不存在')
  }
}

// 处理中药材分页
const handleHerbsPageChange = () => {
  loadHerbs()
}

// 处理靶标分页
const handleTargetsPageChange = () => {
  loadTargets()
}

// Tab切换处理
const handleTabChange = (tabName) => {
  if (tabName === 'targets' && targets.value.length === 0) {
    loadTargets()
  } else if (tabName === 'transcriptomics' && transcriptomicsData.value.length === 0) {
    loadTranscriptomics()
  }
}

// 加载转录组学数据
const loadTranscriptomics = async () => {
  transcriptomicsLoading.value = true
  
  try {
    const inchikey = route.params.inchikey
    
    // 加载统计信息
    const statsResponse = await getCompoundTranscriptomicsStatistics(inchikey)
    if (statsResponse.code === 200) {
      statistics.value = statsResponse.data || {}
    }
    
    // 加载转录组学数据
    const response = await getCompoundTranscriptomics(inchikey)
    if (response.code === 200) {
      transcriptomicsData.value = response.data || []
      
      // 等待DOM更新完成
      await nextTick()
      
      // 延迟初始化图表，确保内部tabs也渲染完成
      setTimeout(() => {
        // 只初始化当前活动的视图
        if (transcriptomicsView.value === 'volcano') {
          initVolcanoPlot()
        } else if (transcriptomicsView.value === 'heatmap') {
          initHeatmap()
        }
      }, 100)
    } else {
      ElMessage.warning(response.msg || t('common.loadFailed'))
    }
  } catch (error) {
    console.error('加载转录组学数据失败:', error)
    ElMessage.error(t('common.networkError'))
  } finally {
    transcriptomicsLoading.value = false
  }
}

// 初始化火山图
const initVolcanoPlot = () => {
  if (!volcanoChartRef.value) {
    console.warn('⚠️ 火山图容器未准备好')
    return
  }
  
  if (transcriptomicsData.value.length === 0) {
    console.warn('⚠️ 转录组学数据为空')
    return
  }
  
  console.log('🌋 初始化火山图，数据量:', transcriptomicsData.value.length)
  
  // 销毁旧图表
  if (volcanoChart) {
    volcanoChart.dispose()
  }
  
  // 创建新图表
  volcanoChart = echarts.init(volcanoChartRef.value)
  
  // 准备数据
  const upregulated = []
  const downregulated = []
  const notSignificant = []
  
  transcriptomicsData.value.forEach(gene => {
    const log2 = typeof gene.log2FcAvg === 'number' ? gene.log2FcAvg : 0
    const safePValue = gene.pValue && gene.pValue > 0 ? gene.pValue : Number.MIN_VALUE
    const point = {
      name: gene.geneSymbol || gene.geneEntrezId,
      value: [log2, -Math.log10(safePValue)],
      geneEntrezId: gene.geneEntrezId,
      geneSymbol: gene.geneSymbol,
      ...gene
    }
    
    if (gene.significance === 'significant') {
      if (gene.direction === 'up') {
        upregulated.push(point)
      } else {
        downregulated.push(point)
      }
    } else {
      notSignificant.push(point)
    }
  })
  
  const option = {
    title: {
      text: t('medicine.compound.volcanoPlot'),
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = params.data
        return `
          <strong>${data.name}</strong><br/>
          Log2FC: ${data.value[0].toFixed(2)}<br/>
          -Log10(P): ${data.value[1].toFixed(2)}<br/>
          P-value: ${data.pValue.toExponential(2)}<br/>
          ${data.geneDescription || ''}
        `
      }
    },
    legend: {
      data: [
        t('medicine.compound.upregulated'),
        t('medicine.compound.downregulated'),
        t('medicine.compound.notSignificant')
      ],
      top: 40
    },
    xAxis: {
      name: t('medicine.compound.log2FC'),
      nameLocation: 'center',
      nameGap: 30,
      axisLine: { lineStyle: { color: '#666' } }
    },
    yAxis: {
      name: '-Log10(P-value)',
      nameLocation: 'center',
      nameGap: 40,
      axisLine: { lineStyle: { color: '#666' } }
    },
    series: [
      {
        name: t('medicine.compound.upregulated'),
        type: 'scatter',
        data: upregulated,
        symbolSize: 8,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: t('medicine.compound.downregulated'),
        type: 'scatter',
        data: downregulated,
        symbolSize: 8,
        itemStyle: { color: '#409eff' }
      },
      {
        name: t('medicine.compound.notSignificant'),
        type: 'scatter',
        data: notSignificant,
        symbolSize: 6,
        itemStyle: { color: '#ccc' }
      }
    ],
    grid: {
      left: 80,
      right: 40,
      top: 100,
      bottom: 80
    }
  }
  
  volcanoChart.setOption(option)
  
  // 添加点击事件（传递 entrezId）
  volcanoChart.on('click', (params) => {
    if (params.data && params.data.geneEntrezId) {
      console.log('🖱️ 点击基因:', params.data.geneSymbol, 'Entrez ID:', params.data.geneEntrezId)
      goToGeneDetail(params.data.geneEntrezId)
    }
  })
}

// 初始化热图
const initHeatmap = () => {
  if (!heatmapChartRef.value) {
    console.warn('⚠️ 热图容器未准备好')
    return
  }
  
  if (transcriptomicsData.value.length === 0) {
    console.warn('⚠️ 转录组学数据为空')
    return
  }
  
  console.log('🔥 初始化热图，数据量:', transcriptomicsData.value.length)
  
  // 销毁旧图表
  if (heatmapChart) {
    heatmapChart.dispose()
  }
  
  // 创建新图表
  heatmapChart = echarts.init(heatmapChartRef.value)
  
  // 取Top 50差异表达基因
  const top50Genes = [...transcriptomicsData.value]
    .sort((a, b) => Math.abs(b.log2FcAvg) - Math.abs(a.log2FcAvg))
    .slice(0, 50)
  
  const geneNames = top50Genes.map(gene => gene.geneSymbol || gene.geneEntrezId)
  const leftLabels = geneNames.map((name, index) => (index % 2 === 0 ? name : ''))
  const rightLabels = geneNames.map((name, index) => (index % 2 === 1 ? name : ''))
  const heatmapData = top50Genes.map((gene, idx) => [0, idx, gene.log2FcAvg])
  
  const option = {
    title: {
      text: t('medicine.compound.heatmap') + ' (Top 50)',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const gene = top50Genes[params.data[1]]
        return `
          <strong>${gene.geneSymbol || gene.geneEntrezId}</strong><br/>
          Log2FC: ${gene.log2FcAvg.toFixed(2)}<br/>
          P-value: ${gene.pValue.toExponential(2)}
        `
      }
    },
    grid: {
      left: 150,
      right: 80,
      top: 60,
      bottom: 30
    },
    xAxis: {
      type: 'category',
      data: ['Expression'],
      show: false
    },
    yAxis: [
      {
        type: 'category',
        data: leftLabels,
        axisLabel: {
          fontSize: 10,
          interval: 0,
          align: 'right',
          padding: [0, 8, 0, 0]
        },
        axisLine: { show: false },
        axisTick: { show: false },
        position: 'left'
      },
      {
        type: 'category',
        data: rightLabels,
        axisLabel: {
          fontSize: 10,
          interval: 0,
          align: 'left',
          padding: [0, 0, 0, 8]
        },
        axisLine: { show: false },
        axisTick: { show: false },
        position: 'right'
      }
    ],
    visualMap: {
      min: -5,
      max: 5,
      calculable: true,
      orient: 'vertical',
      right: 10,
      top: 80,
      inRange: {
        color: ['#0000ff', '#ffffff', '#ff0000']
      },
      text: ['High', 'Low']
    },
    series: [{
      name: 'Gene Expression',
      type: 'heatmap',
      data: heatmapData,
      label: {
        show: false
      },
      emphasis: {
        itemStyle: {
          borderColor: '#333',
          borderWidth: 1
        }
      }
    }]
  }
  
  heatmapChart.setOption(option)
}

// 筛选基因列表
const filterGeneList = () => {
  geneListPagination.value.page = 1
}

const handleGenePageChange = (page) => {
  geneListPagination.value.page = page
}

const handleGenePageSizeChange = (size) => {
  geneListPagination.value.pageSize = size
  geneListPagination.value.page = 1
}

// 监听转录组学视图变化，初始化对应图表
watch(transcriptomicsView, async (newView) => {
  console.log('🔄 切换到视图:', newView)
  await nextTick()
  
  // 添加小延迟，确保DOM完全渲染
  setTimeout(() => {
    if (newView === 'volcano') {
      initVolcanoPlot()
    } else if (newView === 'heatmap') {
      initHeatmap()
    }
  }, 50)
})

onMounted(() => {
  fetchCompoundDetail()
})

// 监听ADMET数据变化，初始化图表
watch(admet, async (newValue) => {
  if (newValue) {
    await nextTick()
    initAdmetChart()
  }
})

</script>

<style scoped>
.compound-detail-page {
  padding: 40px 0;
  min-height: calc(100vh - 80px);
  background: #f8fffe;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-content {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.main-sections {
  flex: 1;
  min-width: 0;
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

.compound-icon {
  font-size: 64px;
  color: #1890ff;
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

.inchikey {
  font-size: 14px;
  color: #666;
  font-family: monospace;
}

.id-badge {
  margin-top: 8px;
}

/* 信息汇总表 */
.summary-section,
.admet-section {
  padding: 30px;
}

.structure-preview {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.structure-image-wrapper {
  padding: 16px;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.structure-image {
  width: 240px;
  max-width: 100%;
  display: block;
}

.structure-image-fallback {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  background: #fff7e6;
  color: #d46b08;
  border: 1px dashed #ffd591;
}

.structure-caption {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 220px;
}

.structure-caption-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a5f4a;
}

.structure-caption-subtitle {
  font-size: 14px;
  color: #666;
}

.structure-link {
  color: #2d8659;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-style: dotted;
}

.structure-link:hover {
  color: #52c41a;
  text-decoration-style: solid;
}

/* ADMET图表区域 */
.admet-chart-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.subsection-title {
  font-size: 16px;
  font-weight: 600;
  color: #2d8659;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #2d8659;
}

.admet-chart {
  width: 100%;
  height: 500px;
  min-height: 500px;
}

/* ADMET分类样式 */
.admet-category {
  margin-bottom: 30px;
}

.admet-category:last-child {
  margin-bottom: 0;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a5f4a;
  padding: 12px 16px;
  background: linear-gradient(135deg, #e8f5ef 0%, #f0f9f5 100%);
  border-left: 4px solid #2d8659;
  border-radius: 4px;
  margin: 0 0 16px 0;
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

.info-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 1400px) {
  .info-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1024px) {
  .info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px 18px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
}

.info-item-label {
  font-size: 14px;
  color: #1a5f4a;
  font-weight: 600;
}

.info-item-value {
  color: #333;
  font-size: 15px;
  font-weight: 600;
  word-break: break-word;
}

.admet-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.admet-table thead th {
  background: #2d8659;
  color: #fff;
  padding: 12px 20px;
  font-weight: 600;
  text-align: left;
  border-bottom: 2px solid #1a5f4a;
}

.admet-table tr {
  border-bottom: 1px solid #f0f0f0;
}

.admet-table tr:last-child {
  border-bottom: none;
}

.admet-table tbody tr:hover {
  background: #f0f9f5;
}

.admet-table .label-cell {
  width: 200px;
  padding: 16px 20px;
  font-weight: 600;
  color: #1a5f4a;
  background: #f8fffe;
  vertical-align: top;
}

.admet-table .value-cell {
  padding: 16px 20px;
  color: #333;
  line-height: 1.8;
  text-align: center;
  font-weight: 600;
  font-size: 15px;
}

.unit-cell {
  padding: 16px 20px;
  color: #666;
  line-height: 1.8;
  font-size: 13px;
  font-style: italic;
}

.smiles-cell {
  font-family: monospace;
  font-size: 12px;
  word-break: break-all;
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
  margin-top: 20px;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f6f9fc 0%, #fff 100%);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.up {
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
}

.stat-icon.down {
  background: linear-gradient(135deg, #409eff 0%, #3498db 100%);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #2c3e50;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.inner-tabs {
  margin-top: 20px;
}

.chart-container {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.gene-list-table {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.gene-symbol-link {
  color: #52c41a;
  cursor: pointer;
  font-weight: 600;
}

.gene-symbol-link:hover {
  text-decoration: underline;
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
  /* 居中 */
  display: flex;
  justify-content: center;  /* 水平居中 */
  align-items: center;  
}

.gene-pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
