<template>
  <div class="prescription-detail-page">
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

      <!-- 方剂详情 -->
      <div v-else-if="prescription" class="detail-content">
        <!-- 头部信息 -->
        <div class="detail-header card" id="prescription-overview">
          <div class="header-left">
            <el-icon class="prescription-icon">
              <Document />
            </el-icon>
            <div class="header-info">
              <h1>{{ prescription.nameZh || prescription.name }}</h1>
              <div class="sub-info">
                <span class="pinyin" v-if="prescription.pinyinName">{{ prescription.pinyinName }}</span>
              </div>
              <div class="id-badge">
                <el-tag type="primary" size="large">{{ prescription.tcmPrescriptionId }}</el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 基本信息 -->
        <div class="summary-section card" id="prescription-summary">
          <h2 class="section-title">
            <el-icon><InfoFilled /></el-icon>
            {{ $t('medicine.formula.basicInfo') }}
          </h2>
          <table class="info-table">
            <tbody>
              <tr v-if="prescription.nameZh">
                <td class="label-cell">{{ $t('medicine.formula.name') }}</td>
                <td class="value-cell">{{ prescription.nameZh }}</td>
              </tr>
              <tr v-if="prescription.pinyinName">
                <td class="label-cell">{{ $t('medicine.formula.pinyin') }}</td>
                <td class="value-cell">{{ prescription.pinyinName }}</td>
              </tr>
              <tr v-if="prescription.source">
                <td class="label-cell">{{ $t('medicine.formula.source') }}</td>
                <td class="value-cell">{{ prescription.source }}</td>
              </tr>
              <tr v-if="prescription.effectsZh || prescription.effects">
                <td class="label-cell">{{ $t('medicine.formula.effects') }}</td>
                <td class="value-cell function-cell">
                  <div v-if="prescription.effectsZh">{{ prescription.effectsZh }}</div>
                  <div v-if="prescription.effects" class="en-text">{{ prescription.effects }}</div>
                </td>
              </tr>
              <tr v-if="prescription.indicationsZh || prescription.indicationsEn">
                <td class="label-cell">{{ $t('medicine.formula.indication') }}</td>
                <td class="value-cell function-cell">
                  <div v-if="prescription.indicationsZh">{{ prescription.indicationsZh }}</div>
                  <div v-if="prescription.indicationsEn" class="en-text">{{ prescription.indicationsEn }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 关联数据 Tab 页 -->
        <div class="related-tabs card" id="prescription-related">
          <h2 class="section-title">
            <el-icon><Connection /></el-icon>
            {{ $t('medicine.formula.relatedData') }}
          </h2>
          
          <el-tabs v-model="activeTab" @tab-change="handleTabChange">
            <!-- 核心中药 Tab -->
            <el-tab-pane :label="$t('medicine.formula.coreHerbs')" name="coreHerbs">
              <div v-if="coreHerbsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="coreHerbs.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="coreHerbs" border stripe>
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
                    v-model:current-page="coreHerbsPagination.page"
                    v-model:page-size="coreHerbsPagination.pageSize"
                    :total="coreHerbsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleCoreHerbsPageChange"
                    @size-change="handleCoreHerbsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 其他中药 Tab -->
            <el-tab-pane :label="$t('medicine.formula.otherHerbs')" name="otherHerbs">
              <div v-if="otherHerbsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="otherHerbs.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="otherHerbs" border stripe>
                  <el-table-column prop="tcmHerbId" label="中药ID" min-width="120" />
                  <el-table-column prop="herbNameZh" label="中药名称" min-width="120" />
                  <el-table-column prop="pinyinName" label="拼音名" min-width="150" />
                  <el-table-column prop="latinName" label="拉丁名" min-width="150" />
                  <el-table-column prop="efficacyZh" label="功效" min-width="200" />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="otherHerbsPagination.page"
                    v-model:page-size="otherHerbsPagination.pageSize"
                    :total="otherHerbsPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleOtherHerbsPageChange"
                    @size-change="handleOtherHerbsPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 相关疾病 Tab -->
            <el-tab-pane :label="$t('medicine.formula.diseases')" name="diseases">
              <div v-if="diseasesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
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

            <!-- 相关症状 Tab -->
            <el-tab-pane :label="$t('medicine.formula.symptoms')" name="symptoms">
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

            <!-- 相关证候 Tab -->
            <el-tab-pane :label="$t('medicine.formula.syndromes')" name="syndromes">
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
                  <el-table-column prop="syndromeDefinitionZh" :label="$t('medicine.syndrome.definition')" min-width="200" />
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

            <!-- 相关医案 Tab -->
            <el-tab-pane :label="$t('medicine.formula.medicalCases')" name="medicalCases">
              <div v-if="medicalCasesLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="medicalCases.length === 0" class="tab-empty">
                <el-empty :description="$t('common.noData')" />
              </div>
              <div v-else>
                <el-table :data="medicalCases" border stripe>
                  <el-table-column :label="$t('medicine.medicalCase.id')" min-width="140">
                    <template #default="{ row }">
                      <span class="clickable" @click="goToMedicalCaseDetail(row.medCaseId)">{{ row.medCaseId }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('medicine.medicalCase.physician')" min-width="100">
                    <template #default="{ row }">
                      {{ row.physician || '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="tcmDisease" :label="$t('medicine.medicalCase.tcmDisease')" min-width="120" />
                  <el-table-column prop="wmDisease" :label="$t('medicine.medicalCase.wmDisease')" min-width="120" />
                  <el-table-column prop="tcmTreatment" :label="$t('medicine.medicalCase.treatment')" min-width="200" show-overflow-tooltip />
                </el-table>
                <div class="tab-pagination">
                  <el-pagination
                    v-model:current-page="medicalCasesPagination.page"
                    v-model:page-size="medicalCasesPagination.pageSize"
                    :total="medicalCasesPagination.total"
                    :page-sizes="[10, 20, 50]"
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleMedicalCasesPageChange"
                    @size-change="handleMedicalCasesPageChange"
                  />
                </div>
              </div>
            </el-tab-pane>

            <!-- 转录组学数据 Tab -->
            <el-tab-pane :label="$t('medicine.formula.transcriptomics')" name="transcriptomics">
              <div v-if="transcriptomicsLoading" class="tab-loading">
                <el-icon class="loading-icon"><Loading /></el-icon>
                <p>{{ $t('common.loading') }}...</p>
              </div>
              <div v-else-if="transcriptomicsData.length === 0" class="tab-empty">
                <el-empty :description="$t('medicine.formula.noTranscriptomics')" />
              </div>
              <div v-else class="transcriptomics-content">
                <!-- 统计卡片 -->
                <div class="stats-cards">
                  <div class="stat-card">
                    <div class="stat-icon total">
                      <el-icon><DataAnalysis /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.totalGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.formula.totalGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon up">
                      <el-icon><Top /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.upregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.formula.upregulatedGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon down">
                      <el-icon><Bottom /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.downregulatedGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.formula.downregulatedGenes') }}</div>
                    </div>
                  </div>
                  <div class="stat-card">
                    <div class="stat-icon significant">
                      <el-icon><Star /></el-icon>
                    </div>
                    <div class="stat-info">
                      <div class="stat-value">{{ statistics.significantGenes || 0 }}</div>
                      <div class="stat-label">{{ $t('medicine.formula.significantGenes') }}</div>
                    </div>
                  </div>
                </div>

                <!-- 内部 Tabs -->
                <el-tabs v-model="transcriptomicsView" class="inner-tabs">
                  <!-- 火山图 -->
                  <el-tab-pane :label="$t('medicine.formula.volcanoPlot')" name="volcano">
                    <div ref="volcanoChartRef" class="chart-container"></div>
                  </el-tab-pane>

                  <!-- 热图 -->
                  <el-tab-pane :label="$t('medicine.formula.heatmap')" name="heatmap">
                    <div ref="heatmapChartRef" class="chart-container"></div>
                  </el-tab-pane>

                  <!-- 差异基因列表 -->
                  <el-tab-pane :label="$t('medicine.formula.geneList')" name="geneList">
                    <!-- 筛选栏 -->
                    <div class="filter-bar">
                      <el-select v-model="geneListFilter.direction" :placeholder="$t('medicine.formula.filterByDirection')" style="width: 200px; margin-right: 12px;">
                        <el-option :label="$t('medicine.formula.allDirections')" value="all"></el-option>
                        <el-option :label="$t('medicine.formula.upregulated')" value="up"></el-option>
                        <el-option :label="$t('medicine.formula.downregulated')" value="down"></el-option>
                      </el-select>
                      <el-select v-model="geneListFilter.significance" :placeholder="$t('medicine.formula.filterBySignificance')" style="width: 200px;">
                        <el-option :label="$t('medicine.formula.allGenes')" value="all"></el-option>
                        <el-option :label="$t('medicine.formula.significantOnly')" value="significant"></el-option>
                      </el-select>
                    </div>

                    <!-- 基因列表表格 -->
                    <el-table :data="pagedGeneList" border stripe class="gene-list-table" height="500">
                      <el-table-column :label="$t('medicine.gene.name')" min-width="120" fixed>
                        <template #default="{ row }">
                          <span class="gene-symbol-link">{{ row.geneName || row.gene_name }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.formula.log2FC')" min-width="120" sortable prop="log2FcAvg">
                        <template #default="{ row }">
                          <span :class="['log2fc-value', row.direction]">
                            {{ (row.log2FcAvg || row.log2_fc_avg)?.toFixed(3) }}
                          </span>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.formula.pValue')" min-width="120" sortable prop="pValue">
                        <template #default="{ row }">
                          {{ (row.pValue || row.p_value) === 0 ? '< 1e-300' : (row.pValue || row.p_value)?.toExponential(3) }}
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.formula.direction')" min-width="100">
                        <template #default="{ row }">
                          <el-tag :type="row.direction === 'up' ? 'danger' : 'primary'" size="small">
                            {{ row.direction === 'up' ? $t('medicine.formula.upregulated') : $t('medicine.formula.downregulated') }}
                          </el-tag>
                        </template>
                      </el-table-column>
                      <el-table-column :label="$t('medicine.formula.significance')" min-width="100">
                        <template #default="{ row }">
                          <span class="significance-label">{{ row.significanceLabel || row.significance_label }}</span>
                        </template>
                      </el-table-column>
                    </el-table>
                    
                    <!-- 分页组件 -->
                    <div class="tab-pagination">
                      <el-pagination
                        v-model:current-page="geneListPagination.page"
                        v-model:page-size="geneListPagination.pageSize"
                        :total="geneListPagination.total"
                        :page-sizes="[25, 50, 100, 200]"
                        layout="total, sizes, prev, pager, next, jumper"
                        @current-change="handleGeneListPageChange"
                        @size-change="handleGeneListPageChange"
                      />
                    </div>
                  </el-tab-pane>

                  <!-- 组成中药对比 -->
                  <el-tab-pane :label="$t('medicine.formula.herbsComparison')" name="herbsComparison">
                    <div v-if="herbsTranscriptomicsLoading" class="tab-loading">
                      <el-icon class="loading-icon"><Loading /></el-icon>
                      <p>{{ $t('common.loading') }}...</p>
                    </div>
                    <div v-else-if="herbsTranscriptomicsData.length === 0" class="tab-empty">
                      <el-empty :description="$t('medicine.formula.noHerbsTranscriptomics')" />
                    </div>
                    <div v-else>
                      <!-- 中药对比热图 -->
                      <div class="comparison-section">
                        <h3 class="section-subtitle">{{ $t('medicine.formula.herbsHeatmap') }}</h3>
                        <div ref="herbsComparisonChartRef" class="chart-container" style="height: 600px;"></div>
                      </div>
                      
                      <!-- 韦恩图 - 共同和特异性基因 -->
                      <div class="comparison-section">
                        <h3 class="section-subtitle">{{ $t('medicine.formula.vennDiagram') }}</h3>
                        <div class="venn-container">
                          <div ref="vennChartRef" class="chart-container" style="height: 500px;"></div>
                          <div class="venn-stats">
                            <div class="stat-item" v-for="stat in vennStats" :key="stat.herb">
                              <el-tag :type="stat.color" size="large">{{ stat.herb }}</el-tag>
                              <span class="stat-value">{{ stat.specific }} 特异性基因</span>
                            </div>
                            <div class="stat-item common">
                              <el-tag type="success" size="large">{{ $t('medicine.formula.commonGenes') }}</el-tag>
                              <span class="stat-value">{{ commonGenes.length }} 共同基因</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </el-tab-pane>

                  <!-- 协同效应分析 -->
                  <el-tab-pane :label="$t('medicine.formula.synergyAnalysis')" name="synergy">
                    <div v-if="transcriptomicsData.length === 0 || herbsTranscriptomicsData.length === 0" class="tab-empty">
                      <el-empty :description="$t('medicine.formula.noSynergyData')" />
                    </div>
                    <div v-else>
                      <!-- 协同效应统计 -->
                      <div class="synergy-stats">
                        <div class="synergy-card">
                          <div class="synergy-icon unique">
                            <el-icon><Promotion /></el-icon>
                          </div>
                          <div class="synergy-info">
                            <div class="synergy-value">{{ synergyAnalysis.uniqueGenes || 0 }}</div>
                            <div class="synergy-label">{{ $t('medicine.formula.formulaUniqueGenes') }}</div>
                          </div>
                        </div>
                        <div class="synergy-card">
                          <div class="synergy-icon enhanced">
                            <el-icon><TrendCharts /></el-icon>
                          </div>
                          <div class="synergy-info">
                            <div class="synergy-value">{{ synergyAnalysis.enhancedGenes || 0 }}</div>
                            <div class="synergy-label">{{ $t('medicine.formula.enhancedGenes') }}</div>
                          </div>
                        </div>
                        <div class="synergy-card">
                          <div class="synergy-icon weakened">
                            <el-icon><Sort /></el-icon>
                          </div>
                          <div class="synergy-info">
                            <div class="synergy-value">{{ synergyAnalysis.weakenedGenes || 0 }}</div>
                            <div class="synergy-label">{{ $t('medicine.formula.weakenedGenes') }}</div>
                          </div>
                        </div>
                      </div>

                      <!-- 协同效应散点图 -->
                      <div class="synergy-section">
                        <h3 class="section-subtitle">{{ $t('medicine.formula.synergyScatter') }}</h3>
                        <div ref="synergyChartRef" class="chart-container" style="height: 600px;"></div>
                      </div>

                      <!-- 协同效应基因列表 -->
                      <div class="synergy-section">
                        <h3 class="section-subtitle">{{ $t('medicine.formula.synergyGeneList') }}</h3>
                        <el-tabs v-model="synergyGeneTab">
                          <el-tab-pane :label="$t('medicine.formula.formulaUniqueGenes')" name="unique">
                            <el-table :data="synergyGeneList.unique.slice(0, 50)" border stripe max-height="400">
                              <el-table-column prop="geneName" :label="$t('medicine.gene.name')" width="120" />
                              <el-table-column prop="formulaLog2fc" :label="$t('medicine.formula.formulaLog2FC')" width="120">
                                <template #default="{ row }">
                                  <span :class="['log2fc-value', row.formulaDirection]">{{ row.formulaLog2fc?.toFixed(3) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column prop="formulaPvalue" :label="$t('medicine.formula.pValue')" width="120">
                                <template #default="{ row }">{{ row.formulaPvalue?.toExponential(3) }}</template>
                              </el-table-column>
                              <el-table-column :label="$t('medicine.formula.herbsStatus')" min-width="200">
                                <template #default="{ row }">
                                  <el-tag size="small" type="info">{{ row.herbsStatus }}</el-tag>
                                </template>
                              </el-table-column>
                            </el-table>
                          </el-tab-pane>
                          <el-tab-pane :label="$t('medicine.formula.enhancedGenes')" name="enhanced">
                            <el-table :data="synergyGeneList.enhanced.slice(0, 50)" border stripe max-height="400">
                              <el-table-column prop="geneName" :label="$t('medicine.gene.name')" width="120" />
                              <el-table-column :label="$t('medicine.formula.formulaEffect')" width="120">
                                <template #default="{ row }">
                                  <span class="log2fc-value up">{{ row.formulaLog2fc?.toFixed(3) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column :label="$t('medicine.formula.avgHerbEffect')" width="120">
                                <template #default="{ row }">
                                  <span class="log2fc-value">{{ row.avgHerbLog2fc?.toFixed(3) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column :label="$t('medicine.formula.enhancementRatio')" width="120">
                                <template #default="{ row }">
                                  <el-tag type="danger" size="small">{{ row.enhancementRatio?.toFixed(2) }}x</el-tag>
                                </template>
                              </el-table-column>
                            </el-table>
                          </el-tab-pane>
                          <el-tab-pane :label="$t('medicine.formula.weakenedGenes')" name="weakened">
                            <el-table :data="synergyGeneList.weakened.slice(0, 50)" border stripe max-height="400">
                              <el-table-column prop="geneName" :label="$t('medicine.gene.name')" width="120" />
                              <el-table-column :label="$t('medicine.formula.formulaEffect')" width="120">
                                <template #default="{ row }">
                                  <span class="log2fc-value">{{ row.formulaLog2fc?.toFixed(3) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column :label="$t('medicine.formula.avgHerbEffect')" width="120">
                                <template #default="{ row }">
                                  <span class="log2fc-value">{{ row.avgHerbLog2fc?.toFixed(3) }}</span>
                                </template>
                              </el-table-column>
                              <el-table-column :label="$t('medicine.formula.weakeningRatio')" width="120">
                                <template #default="{ row }">
                                  <el-tag type="info" size="small">{{ row.weakeningRatio?.toFixed(2) }}x</el-tag>
                                </template>
                              </el-table-column>
                            </el-table>
                          </el-tab-pane>
                        </el-tabs>
                      </div>
                    </div>
                  </el-tab-pane>
                </el-tabs>
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
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Loading, WarningFilled, Document, InfoFilled, Connection, DataAnalysis, Top, Bottom, Star, Promotion, TrendCharts, Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { 
  getPrescriptionDetail,
  getPrescriptionCoreHerbs,
  getPrescriptionOtherHerbs,
  getPrescriptionDiseases,
  getPrescriptionSymptoms,
  getPrescriptionSyndromes,
  getPrescriptionMedicalCases,
  getPrescriptionTranscriptomics,
  getPrescriptionTranscriptomicsStatistics,
  getPrescriptionHerbsTranscriptomics
} from '@/api'
import { useI18n } from 'vue-i18n'
import AnchorNavigation from '@/components/AnchorNavigation.vue'
import * as echarts from 'echarts'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const prescription = ref(null)

const anchorSections = computed(() => {
  if (!prescription.value) return []

  return [
    { id: 'prescription-overview', labelKey: 'common.anchorOverview' },
    { id: 'prescription-summary', labelKey: 'medicine.formula.basicInfo' },
    { id: 'prescription-related', labelKey: 'medicine.formula.relatedData' }
  ]
})

// Tab 相关
const activeTab = ref('coreHerbs')

// 核心中药相关
const coreHerbs = ref([])
const coreHerbsLoading = ref(false)
const coreHerbsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

// 其他中药相关
const otherHerbs = ref([])
const otherHerbsLoading = ref(false)
const otherHerbsPagination = ref({
  page: 1,
  pageSize: 10,
  total: 0
})

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

// 医案相关
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
const statistics = ref({
  totalGenes: 0,
  upregulatedGenes: 0,
  downregulatedGenes: 0,
  significantGenes: 0
})
const transcriptomicsView = ref('volcano')
const volcanoChartRef = ref(null)
const heatmapChartRef = ref(null)
const herbsComparisonChartRef = ref(null)
let volcanoChart = null
let heatmapChart = null
let herbsComparisonChart = null
const geneListFilter = ref({
  direction: 'all',
  significance: 'all'
})

// 基因列表分页
const geneListPagination = ref({
  page: 1,
  pageSize: 50,  // 每页50条
  total: 0
})

// 组成中药转录组学数据
const herbsTranscriptomicsData = ref([])
const herbsTranscriptomicsLoading = ref(false)

// 韦恩图相关
const vennChartRef = ref(null)
let vennChart = null
const vennStats = ref([])
const commonGenes = ref([])

// 协同效应分析相关
const synergyChartRef = ref(null)
let synergyChart = null
const synergyGeneTab = ref('unique')
const synergyAnalysis = ref({
  uniqueGenes: 0,
  enhancedGenes: 0,
  weakenedGenes: 0
})
const synergyGeneList = ref({
  unique: [],
  enhanced: [],
  weakened: []
})

// 筛选后的基因列表（全部数据）
const filteredGeneList = computed(() => {
  let filtered = [...transcriptomicsData.value]
  
  if (geneListFilter.value.direction !== 'all') {
    filtered = filtered.filter(gene => gene.direction === geneListFilter.value.direction)
  }
  
  if (geneListFilter.value.significance === 'significant') {
    filtered = filtered.filter(gene => gene.significance === 'significant')
  }
  
  // 更新总数
  geneListPagination.value.total = filtered.length
  
  return filtered
})

// 当前页显示的基因列表（分页后）
const pagedGeneList = computed(() => {
  const start = (geneListPagination.value.page - 1) * geneListPagination.value.pageSize
  const end = start + geneListPagination.value.pageSize
  return filteredGeneList.value.slice(start, end)
})

// 处理基因列表分页变化
const handleGeneListPageChange = () => {
  // 分页变化时无需额外操作，computed 会自动更新
}

// 监听筛选条件变化，重置到第一页
watch([() => geneListFilter.value.direction, () => geneListFilter.value.significance], () => {
  geneListPagination.value.page = 1
})

// 获取方剂详情
const fetchPrescriptionDetail = async () => {
  loading.value = true
  error.value = null
  
  try {
    const prescriptionId = route.params.id
    if (!prescriptionId) {
      error.value = t('medicine.formula.invalidId')
      return
    }

    const response = await getPrescriptionDetail(prescriptionId)
    
    if (response.code === 200) {
      prescription.value = response.data
      // 初次加载时加载第一个Tab的数据
      loadCoreHerbs()
    } else {
      error.value = response.msg || t('common.loadFailed')
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('加载方剂详情失败:', err)
    error.value = t('common.networkError')
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 加载核心中药数据
const loadCoreHerbs = async () => {
  if (!prescription.value) return
  
  coreHerbsLoading.value = true
  try {
    const response = await getPrescriptionCoreHerbs(prescription.value.tcmPrescriptionId, {
      page: coreHerbsPagination.value.page,
      pageSize: coreHerbsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      coreHerbs.value = response.rows || []
      coreHerbsPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载核心中药数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    coreHerbsLoading.value = false
  }
}

// 加载其他中药数据
const loadOtherHerbs = async () => {
  if (!prescription.value) return
  
  otherHerbsLoading.value = true
  try {
    const response = await getPrescriptionOtherHerbs(prescription.value.tcmPrescriptionId, {
      page: otherHerbsPagination.value.page,
      pageSize: otherHerbsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      otherHerbs.value = response.rows || []
      otherHerbsPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载其他中药数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    otherHerbsLoading.value = false
  }
}

// 加载疾病数据
const loadDiseases = async () => {
  if (!prescription.value) return
  
  diseasesLoading.value = true
  try {
    const response = await getPrescriptionDiseases(prescription.value.tcmPrescriptionId, {
      page: diseasesPagination.value.page,
      pageSize: diseasesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      diseases.value = response.rows || []
      diseasesPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载疾病数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    diseasesLoading.value = false
  }
}

// 加载症状数据
const loadSymptoms = async () => {
  if (!prescription.value) return
  
  symptomsLoading.value = true
  try {
    const response = await getPrescriptionSymptoms(prescription.value.tcmPrescriptionId, {
      page: symptomsPagination.value.page,
      pageSize: symptomsPagination.value.pageSize
    })
    
    if (response.code === 200) {
      symptoms.value = response.rows || []
      symptomsPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载症状数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    symptomsLoading.value = false
  }
}

// 加载证候数据
const loadSyndromes = async () => {
  if (!prescription.value) return
  
  syndromesLoading.value = true
  try {
    const response = await getPrescriptionSyndromes(prescription.value.tcmPrescriptionId, {
      page: syndromesPagination.value.page,
      pageSize: syndromesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      syndromes.value = response.rows || []
      syndromesPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载证候数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    syndromesLoading.value = false
  }
}

// 加载医案数据
const loadMedicalCases = async () => {
  if (!prescription.value) return
  
  medicalCasesLoading.value = true
  try {
    const response = await getPrescriptionMedicalCases(prescription.value.tcmPrescriptionId, {
      page: medicalCasesPagination.value.page,
      pageSize: medicalCasesPagination.value.pageSize
    })
    
    if (response.code === 200) {
      medicalCases.value = response.rows || []
      medicalCasesPagination.value.total = response.total || 0
    } else {
      ElMessage.error(response.msg || t('common.loadFailed'))
    }
  } catch (err) {
    console.error('加载医案数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    medicalCasesLoading.value = false
  }
}

// 处理核心中药分页
const handleCoreHerbsPageChange = () => {
  loadCoreHerbs()
}

// 处理其他中药分页
const handleOtherHerbsPageChange = () => {
  loadOtherHerbs()
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

// 处理医案分页
const handleMedicalCasesPageChange = () => {
  loadMedicalCases()
}

// Tab 切换时懒加载数据
const handleTabChange = (tabName) => {
  switch (tabName) {
    case 'coreHerbs':
      if (coreHerbs.value.length === 0) loadCoreHerbs()
      break
    case 'otherHerbs':
      if (otherHerbs.value.length === 0) loadOtherHerbs()
      break
    case 'diseases':
      if (diseases.value.length === 0) loadDiseases()
      break
    case 'symptoms':
      if (symptoms.value.length === 0) loadSymptoms()
      break
    case 'syndromes':
      if (syndromes.value.length === 0) loadSyndromes()
      break
    case 'medicalCases':
      if (medicalCases.value.length === 0) loadMedicalCases()
      break
    case 'transcriptomics':
      if (transcriptomicsData.value.length === 0) loadTranscriptomics()
      break
  }
}

// 加载转录组学数据
const loadTranscriptomics = async () => {
  if (!prescription.value) return
  
  transcriptomicsLoading.value = true
  try {
    // 同时加载转录组学数据和统计信息
    const [dataResponse, statsResponse, herbsResponse] = await Promise.all([
      getPrescriptionTranscriptomics(prescription.value.tcmPrescriptionId),
      getPrescriptionTranscriptomicsStatistics(prescription.value.tcmPrescriptionId),
      getPrescriptionHerbsTranscriptomics(prescription.value.tcmPrescriptionId)
    ])
    
    if (dataResponse.code === 200) {
      transcriptomicsData.value = dataResponse.data || []
    }
    
    if (statsResponse.code === 200) {
      statistics.value = statsResponse.data || {
        totalGenes: 0,
        upregulatedGenes: 0,
        downregulatedGenes: 0,
        significantGenes: 0
      }
    }
    
    if (herbsResponse.code === 200) {
      herbsTranscriptomicsData.value = herbsResponse.data || []
    }
    
    // 等待 DOM 更新后初始化图表
    await nextTick()
    setTimeout(() => {
      initVolcanoPlot()
      initHeatmap()
      initHerbsComparison()
      calculateVennData()
      calculateSynergyAnalysis()
    }, 100)
  } catch (err) {
    console.error('加载转录组学数据失败:', err)
    ElMessage.error(t('common.networkError'))
  } finally {
    transcriptomicsLoading.value = false
  }
}

// 计算韦恩图数据
const calculateVennData = () => {
  if (herbsTranscriptomicsData.value.length === 0) return
  
  // 按中药分组基因
  const herbGenesMap = new Map()
  herbsTranscriptomicsData.value.forEach(item => {
    const herbName = item.herbNameZh || item.herb_name_zh
    const geneName = item.geneName || item.gene_name
    const significance = item.significance
    
    if (!herbName || !geneName) return
    
    // 只统计显著基因
    if (significance === 'significant') {
      if (!herbGenesMap.has(herbName)) {
        herbGenesMap.set(herbName, new Set())
      }
      herbGenesMap.get(herbName).add(geneName)
    }
  })
  
  const herbs = Array.from(herbGenesMap.keys()).slice(0, 5) // 最多5个中药
  const genesSets = herbs.map(herb => herbGenesMap.get(herb))
  
  // 计算共同基因（所有中药都影响的）
  if (genesSets.length > 0) {
    let common = new Set(genesSets[0])
    for (let i = 1; i < genesSets.length; i++) {
      common = new Set([...common].filter(x => genesSets[i].has(x)))
    }
    commonGenes.value = Array.from(common)
  }
  
  // 计算每个中药的特异性基因
  const colors = ['primary', 'success', 'warning', 'danger', 'info']
  vennStats.value = herbs.map((herb, index) => {
    const herbGenes = genesSets[index]
    // 特异性基因 = 该中药的基因 - 共同基因
    const specific = [...herbGenes].filter(g => !commonGenes.value.includes(g))
    return {
      herb,
      specific: specific.length,
      total: herbGenes.size,
      color: colors[index]
    }
  })
  
  // 初始化韦恩图
  nextTick(() => {
    if (vennChartRef.value) {
      initVennDiagram()
    }
  })
}

// 计算协同效应分析
const calculateSynergyAnalysis = () => {
  if (transcriptomicsData.value.length === 0 || herbsTranscriptomicsData.value.length === 0) return
  
  // 创建方剂基因的Map
  const formulaGenesMap = new Map()
  transcriptomicsData.value.forEach(gene => {
    const geneName = gene.geneName || gene.gene_name
    const log2fc = gene.log2FcAvg || gene.log2_fc_avg
    const pvalue = gene.pValue || gene.p_value
    const direction = gene.direction
    const significance = gene.significance
    
    if (geneName) {
      formulaGenesMap.set(geneName, { log2fc, pvalue, direction, significance })
    }
  })
  
  // 创建中药基因的Map（按基因聚合）
  const herbGenesMap = new Map()
  herbsTranscriptomicsData.value.forEach(item => {
    const geneName = item.geneName || item.gene_name
    const log2fc = item.log2FcAvg || item.log2_fc_avg
    
    if (!geneName || log2fc === undefined) return
    
    if (!herbGenesMap.has(geneName)) {
      herbGenesMap.set(geneName, [])
    }
    herbGenesMap.get(geneName).push(log2fc)
  })
  
  const unique = []
  const enhanced = []
  const weakened = []
  
  // 分析每个方剂基因
  formulaGenesMap.forEach((formulaData, geneName) => {
    const herbData = herbGenesMap.get(geneName)
    
    if (!herbData || herbData.length === 0) {
      // 方剂特有基因（在单个中药中没有显著影响）
      if (formulaData.significance === 'significant') {
        unique.push({
          geneName,
          formulaLog2fc: formulaData.log2fc,
          formulaPvalue: formulaData.pvalue,
          formulaDirection: formulaData.direction,
          herbsStatus: '单味药中无显著变化'
        })
      }
    } else {
      // 计算中药平均效应
      const avgHerbLog2fc = herbData.reduce((sum, val) => sum + val, 0) / herbData.length
      const absFormulaLog2fc = Math.abs(formulaData.log2fc)
      const absAvgHerbLog2fc = Math.abs(avgHerbLog2fc)
      
      // 增强效应（方剂效应 > 平均中药效应）
      if (absFormulaLog2fc > absAvgHerbLog2fc * 1.5 && formulaData.significance === 'significant') {
        enhanced.push({
          geneName,
          formulaLog2fc: formulaData.log2fc,
          avgHerbLog2fc,
          enhancementRatio: absFormulaLog2fc / (absAvgHerbLog2fc || 0.01)
        })
      }
      
      // 减弱效应（方剂效应 < 平均中药效应）
      if (absFormulaLog2fc < absAvgHerbLog2fc * 0.7 && absAvgHerbLog2fc > 1) {
        weakened.push({
          geneName,
          formulaLog2fc: formulaData.log2fc,
          avgHerbLog2fc,
          weakeningRatio: absFormulaLog2fc / absAvgHerbLog2fc
        })
      }
    }
  })
  
  // 排序
  enhanced.sort((a, b) => b.enhancementRatio - a.enhancementRatio)
  weakened.sort((a, b) => a.weakeningRatio - b.weakeningRatio)
  
  synergyAnalysis.value = {
    uniqueGenes: unique.length,
    enhancedGenes: enhanced.length,
    weakenedGenes: weakened.length
  }
  
  synergyGeneList.value = {
    unique,
    enhanced,
    weakened
  }
  
  // 初始化协同效应散点图
  nextTick(() => {
    if (synergyChartRef.value) {
      initSynergyChart()
    }
  })
}

// 初始化火山图
const initVolcanoPlot = () => {
  if (!volcanoChartRef.value || transcriptomicsData.value.length === 0) {
    console.warn('火山图容器未就绪或无数据')
    return
  }
  
  if (volcanoChart) {
    volcanoChart.dispose()
  }
  
  // 使用 Canvas 渲染器（性能更好）
  volcanoChart = echarts.init(volcanoChartRef.value, null, { renderer: 'canvas' })
  
  // 调试：查看数据格式
  console.log('转录组数据样本:', transcriptomicsData.value.slice(0, 3))
  
  // 准备火山图数据
  const upregulated = []
  const downregulated = []
  const notSignificant = []
  
  transcriptomicsData.value.forEach(gene => {
    // 处理可能的字段名差异（驼峰 vs 下划线）
    const geneName = gene.geneName || gene.gene_name
    const log2fc = gene.log2FcAvg || gene.log2_fc_avg
    let pvalue = gene.pValue || gene.p_value
    const direction = gene.direction
    const significance = gene.significance
    
    // 验证数据有效性
    if (!geneName || log2fc === undefined || pvalue === undefined || pvalue < 0) {
      return
    }
    
    // 处理 p值为0的情况（极度显著，设置一个极小值避免无穷大）
    if (pvalue === 0) {
      pvalue = 1e-300  // 设置为一个极小的非零值
    }
    
    const point = {
      name: geneName,
      value: [parseFloat(log2fc), -Math.log10(parseFloat(pvalue))]
    }
    
    if (significance === 'significant') {
      if (direction === 'up') {
        upregulated.push(point)
      } else {
        downregulated.push(point)
      }
    } else {
      // 对不显著的基因进行采样（只显示30%）以提升性能
      if (Math.random() < 0.3) {
        notSignificant.push(point)
      }
    }
  })
  
  console.log('火山图数据点数:', {
    upregulated: upregulated.length,
    downregulated: downregulated.length,
    notSignificant: notSignificant.length,
    note: '不显著基因已采样至30%以提升性能'
  })
  
  const option = {
    title: {
      text: t('medicine.formula.volcanoPlot'),
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f4a'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const data = transcriptomicsData.value.find(g => (g.geneName || g.gene_name) === params.name)
        if (data) {
          const geneName = data.geneName || data.gene_name
          const log2fc = data.log2FcAvg || data.log2_fc_avg
          const pvalue = data.pValue || data.p_value
          const direction = data.direction
          const significanceLabel = data.significanceLabel || data.significance_label
          
          return `${geneName}<br/>
                  Log2FC: ${log2fc.toFixed(3)}<br/>
                  P-value: ${pvalue === 0 ? '< 1e-300' : pvalue.toExponential(3)}<br/>
                  Direction: ${direction}<br/>
                  Significance: ${significanceLabel}`
        }
        return params.name
      }
    },
    legend: {
      data: [
        {
          name: t('medicine.formula.upregulated'),
          icon: 'circle',
          itemStyle: { color: '#f56c6c' }
        },
        {
          name: t('medicine.formula.downregulated'),
          icon: 'circle',
          itemStyle: { color: '#409eff' }
        },
        {
          name: t('medicine.formula.notSignificant'),
          icon: 'circle',
          itemStyle: { color: '#909399' }
        }
      ],
      top: 40,
      left: 'center',
      textStyle: {
        fontSize: 14
      }
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      name: 'Log2 Fold Change',
      nameLocation: 'center',
      nameGap: 30,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#e0e0e0'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      }
    },
    yAxis: {
      name: '-Log10(P-value)',
      nameLocation: 'center',
      nameGap: 40,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold'
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
          color: '#e0e0e0'
        }
      },
      axisLine: {
        lineStyle: {
          color: '#666'
        }
      }
    },
    series: [
      {
        name: t('medicine.formula.upregulated'),
        type: 'scatter',
        data: upregulated,
        symbolSize: 6,
        itemStyle: {
          color: '#f56c6c'
        },
        animation: false,
        progressive: 1000,  // 渐进式渲染
        progressiveThreshold: 2000
      },
      {
        name: t('medicine.formula.downregulated'),
        type: 'scatter',
        data: downregulated,
        symbolSize: 6,
        itemStyle: {
          color: '#409eff'
        },
        animation: false,
        progressive: 1000,
        progressiveThreshold: 2000
      },
      {
        name: t('medicine.formula.notSignificant'),
        type: 'scatter',
        data: notSignificant,
        symbolSize: 4,
        itemStyle: {
          color: '#909399'
        },
        animation: false,
        progressive: 1000,
        progressiveThreshold: 2000
      }
    ]
  }
  
  volcanoChart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    volcanoChart?.resize()
  })
}

// 初始化热图
const initHeatmap = () => {
  if (!heatmapChartRef.value || transcriptomicsData.value.length === 0) {
    console.warn('热图容器未就绪或无数据')
    return
  }
  
  if (heatmapChart) {
    heatmapChart.dispose()
  }
  
  // 使用 Canvas 渲染器
  heatmapChart = echarts.init(heatmapChartRef.value, null, { renderer: 'canvas' })
  
  // 取Top 50 差异基因（处理字段名兼容性）
  const top50Genes = [...transcriptomicsData.value]
    .filter(g => {
      const log2fc = g.log2FcAvg || g.log2_fc_avg
      return log2fc !== undefined && log2fc !== null
    })
    .sort((a, b) => {
      const aLog2fc = Math.abs(a.log2FcAvg || a.log2_fc_avg || 0)
      const bLog2fc = Math.abs(b.log2FcAvg || b.log2_fc_avg || 0)
      return bLog2fc - aLog2fc
    })
    .slice(0, 50)
  
  const geneNames = top50Genes.map(g => g.geneName || g.gene_name)
  const data = top50Genes.map((g, i) => [0, i, parseFloat(g.log2FcAvg || g.log2_fc_avg)])
  
  console.log('热图Top50基因数量:', top50Genes.length)
  
  const option = {
    title: {
      text: t('medicine.formula.heatmap') + ' (Top 50 DEGs)',
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f4a'
      }
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const gene = top50Genes[params.value[1]]
        const geneName = gene.geneName || gene.gene_name
        const log2fc = gene.log2FcAvg || gene.log2_fc_avg
        const pvalue = gene.pValue || gene.p_value
        const direction = gene.direction
        
        return `${geneName}<br/>
                Log2FC: ${log2fc.toFixed(3)}<br/>
                P-value: ${pvalue === 0 ? '< 1e-300' : pvalue.toExponential(3)}<br/>
                Direction: ${direction}`
      }
    },
    grid: {
      left: '15%',
      right: '5%',
      bottom: '5%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [t('medicine.formula.log2FC')],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: geneNames,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -Math.max(...top50Genes.map(g => Math.abs(g.log2FcAvg))),
      max: Math.max(...top50Genes.map(g => Math.abs(g.log2FcAvg))),
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: {
        color: ['#2E5DD8', '#FFFFFF', '#D84B4B']
      }
    },
    series: [{
      name: 'Gene Expression',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      animation: false,  // 关闭动画
      emphasis: {
        disabled: true  // 禁用高亮效果提升性能
      }
    }]
  }
  
  heatmapChart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    heatmapChart?.resize()
  })
}

// 初始化中药对比图
const initHerbsComparison = () => {
  if (!herbsComparisonChartRef.value || herbsTranscriptomicsData.value.length === 0) {
    console.warn('中药对比图容器未就绪或无数据')
    return
  }
  
  if (herbsComparisonChart) {
    herbsComparisonChart.dispose()
  }
  
  // 使用 Canvas 渲染器
  herbsComparisonChart = echarts.init(herbsComparisonChartRef.value, null, { renderer: 'canvas' })
  
  console.log('中药转录组数据样本:', herbsTranscriptomicsData.value.slice(0, 3))
  
  // 按中药分组（处理字段名兼容性）
  const herbsMap = new Map()
  herbsTranscriptomicsData.value.forEach(item => {
    const herbName = item.herbNameZh || item.herb_name_zh
    if (!herbName) return
    
    if (!herbsMap.has(herbName)) {
      herbsMap.set(herbName, [])
    }
    herbsMap.get(herbName).push(item)
  })
  
  console.log('分组后的中药数量:', herbsMap.size)
  
  // 准备每个中药的Top 20基因
  const herbNames = Array.from(herbsMap.keys()).slice(0, 8) // 最多显示8个中药
  const allGenes = new Set()
  
  herbNames.forEach(herbName => {
    const genes = herbsMap.get(herbName)
      .filter(g => {
        const log2fc = g.log2FcAvg || g.log2_fc_avg
        return log2fc !== undefined && log2fc !== null
      })
      .sort((a, b) => {
        const aLog2fc = Math.abs(a.log2FcAvg || a.log2_fc_avg || 0)
        const bLog2fc = Math.abs(b.log2FcAvg || b.log2_fc_avg || 0)
        return bLog2fc - aLog2fc
      })
      .slice(0, 20)
    genes.forEach(g => {
      const geneName = g.geneName || g.gene_name
      if (geneName) allGenes.add(geneName)
    })
  })
  
  const geneNames = Array.from(allGenes)
  const data = []
  
  herbNames.forEach((herbName, herbIndex) => {
    const herbGenes = herbsMap.get(herbName)
    geneNames.forEach((geneName, geneIndex) => {
      const gene = herbGenes.find(g => (g.geneName || g.gene_name) === geneName)
      if (gene) {
        const log2fc = gene.log2FcAvg || gene.log2_fc_avg
        data.push([herbIndex, geneIndex, parseFloat(log2fc)])
      }
    })
  })
  
  console.log('中药对比热图数据点数:', data.length)
  
  const option = {
    title: {
      text: t('medicine.formula.herbsComparison'),
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a5f4a'
      }
    },
    tooltip: {
      position: 'top',
      formatter: (params) => {
        const herbName = herbNames[params.value[0]]
        const geneName = geneNames[params.value[1]]
        const log2fc = params.value[2]
        return `${herbName}<br/>${geneName}<br/>Log2FC: ${log2fc.toFixed(3)}`
      }
    },
    grid: {
      left: '15%',
      right: '10%',
      bottom: '10%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: herbNames,
      splitArea: {
        show: true
      },
      axisLabel: {
        rotate: 45,
        interval: 0
      }
    },
    yAxis: {
      type: 'category',
      data: geneNames,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: -5,
      max: 5,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      inRange: {
        color: ['#2E5DD8', '#FFFFFF', '#D84B4B']
      }
    },
    series: [{
      name: 'Herb-Gene Expression',
      type: 'heatmap',
      data: data,
      label: {
        show: false
      },
      animation: false,  // 关闭动画
      emphasis: {
        disabled: true  // 禁用高亮效果提升性能
      }
    }]
  }
  
  herbsComparisonChart.setOption(option)
  
  // 响应式调整
  window.addEventListener('resize', () => {
    herbsComparisonChart?.resize()
  })
}

// 初始化韦恩图（简化实现 - 使用柱状图展示）
const initVennDiagram = () => {
  if (!vennChartRef.value || vennStats.value.length === 0) return
  
  if (vennChart) {
    vennChart.dispose()
  }
  
  vennChart = echarts.init(vennChartRef.value, null, { renderer: 'canvas' })
  
  const herbs = vennStats.value.map(s => s.herb)
  const specificGenes = vennStats.value.map(s => s.specific)
  const totalGenes = vennStats.value.map(s => s.total)
  
  const option = {
    title: {
      text: '各中药特异性与共同基因分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#1a5f4a'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['特异性基因', '共同基因'],
      top: 40
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: herbs,
      axisLabel: {
        rotate: 30,
        interval: 0
      }
    },
    yAxis: {
      type: 'value',
      name: '基因数量'
    },
    series: [
      {
        name: '特异性基因',
        type: 'bar',
        data: specificGenes,
        itemStyle: { color: '#409eff' }
      },
      {
        name: '共同基因',
        type: 'bar',
        data: new Array(herbs.length).fill(commonGenes.value.length),
        itemStyle: { color: '#67c23a' }
      }
    ]
  }
  
  vennChart.setOption(option)
  
  window.addEventListener('resize', () => {
    vennChart?.resize()
  })
}

// 初始化协同效应散点图
const initSynergyChart = () => {
  if (!synergyChartRef.value) return
  
  if (synergyChart) {
    synergyChart.dispose()
  }
  
  synergyChart = echarts.init(synergyChartRef.value, null, { renderer: 'canvas' })
  
  // 准备散点图数据
  const uniquePoints = []
  const enhancedPoints = []
  const weakenedPoints = []
  
  synergyGeneList.value.unique.slice(0, 100).forEach(gene => {
    uniquePoints.push({
      name: gene.geneName,
      value: [gene.formulaLog2fc, -Math.log10(gene.formulaPvalue || 0.001)]
    })
  })
  
  synergyGeneList.value.enhanced.slice(0, 100).forEach(gene => {
    enhancedPoints.push({
      name: gene.geneName,
      value: [gene.formulaLog2fc, gene.avgHerbLog2fc]
    })
  })
  
  synergyGeneList.value.weakened.slice(0, 100).forEach(gene => {
    weakenedPoints.push({
      name: gene.geneName,
      value: [gene.formulaLog2fc, gene.avgHerbLog2fc]
    })
  })
  
  const option = {
    title: {
      text: '方剂 vs 中药协同效应',
      left: 'center',
      textStyle: {
        fontSize: 18,
        color: '#1a5f4a'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        return `${params.name}<br/>
                方剂效应: ${params.value[0]?.toFixed(3)}<br/>
                中药效应: ${params.value[1]?.toFixed(3)}`
      }
    },
    legend: {
      data: ['方剂特有', '增强效应', '减弱效应'],
      top: 40
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '20%',
      containLabel: true
    },
    xAxis: {
      name: '方剂 Log2FC',
      nameLocation: 'center',
      nameGap: 30,
      splitLine: {
        lineStyle: { type: 'dashed' }
      }
    },
    yAxis: {
      name: '中药平均 Log2FC',
      nameLocation: 'center',
      nameGap: 40,
      splitLine: {
        lineStyle: { type: 'dashed' }
      }
    },
    series: [
      {
        name: '方剂特有',
        type: 'scatter',
        data: uniquePoints,
        symbolSize: 8,
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '增强效应',
        type: 'scatter',
        data: enhancedPoints,
        symbolSize: 8,
        itemStyle: { color: '#f56c6c' }
      },
      {
        name: '减弱效应',
        type: 'scatter',
        data: weakenedPoints,
        symbolSize: 8,
        itemStyle: { color: '#409eff' }
      }
    ]
  }
  
  synergyChart.setOption(option)
  
  window.addEventListener('resize', () => {
    synergyChart?.resize()
  })
}

// 监听内部 Tab 切换
watch(transcriptomicsView, async (newView) => {
  await nextTick()
  setTimeout(() => {
    if (newView === 'volcano') {
      initVolcanoPlot()
    } else if (newView === 'heatmap') {
      initHeatmap()
    } else if (newView === 'herbsComparison') {
      initHerbsComparison()
    }
  }, 50)
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 跳转到中药详情页
const goToHerbDetail = (herbId) => {
  if (herbId) {
    router.push({
      name: 'HerbDetail',
      params: { id: herbId }
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
const goToMedicalCaseDetail = (medCaseId) => {
  if (medCaseId) {
    router.push({
      name: 'MedicalCaseDetail',
      params: { id: medCaseId }
    })
  }
}

onMounted(() => {
  fetchPrescriptionDetail()
})
</script>

<style scoped>
.prescription-detail-page {
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

.prescription-icon {
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

.id-badge {
  margin-top: 8px;
}

/* 信息汇总表 */
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

.en-text {
  color: #666;
  font-style: italic;
  margin-top: 8px;
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
  background: linear-gradient(135deg, #f8fffe 0%, #e8f5ef 100%);
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
  color: white;
}

.stat-icon.up {
  background: linear-gradient(135deg, #f56c6c 0%, #e03e3e 100%);
  color: white;
}

.stat-icon.down {
  background: linear-gradient(135deg, #409eff 0%, #2a7de1 100%);
  color: white;
}

.stat-icon.significant {
  background: linear-gradient(135deg, #ffa500 0%, #ff8c00 100%);
  color: white;
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
  height: 500px;
  margin: 20px 0;
}

.filter-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8fffe;
  border-radius: 8px;
}

.gene-list-table {
  margin-top: 20px;
}

.gene-symbol-link {
  color: #2d8659;
  font-weight: 600;
  cursor: pointer;
}

.gene-symbol-link:hover {
  color: #52c41a;
  text-decoration: underline;
}

.log2fc-value {
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.log2fc-value.up {
  color: #f56c6c;
}

.log2fc-value.down {
  color: #409eff;
}

.significance-label {
  font-weight: 700;
  font-family: monospace;
  font-size: 14px;
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

/* 韦恩图和协同效应样式 */
.comparison-section {
  margin-bottom: 40px;
}

.section-subtitle {
  font-size: 18px;
  font-weight: 600;
  color: #1a5f4a;
  margin-bottom: 20px;
  padding-left: 12px;
  border-left: 4px solid #2d8659;
}

.venn-container {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.venn-stats {
  flex-shrink: 0;
  width: 300px;
  padding: 20px;
  background: #f8fffe;
  border-radius: 12px;
  border: 2px solid #e8f5ef;
}

.venn-stats .stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e8f5ef;
}

.venn-stats .stat-item:last-child {
  border-bottom: none;
}

.venn-stats .stat-item.common {
  background: #e8f5ef;
  padding: 16px;
  border-radius: 8px;
  margin-top: 12px;
}

.venn-stats .stat-value {
  font-weight: 600;
  color: #1a5f4a;
}

/* 协同效应样式 */
.synergy-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.synergy-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: linear-gradient(135deg, #ffffff 0%, #f8fffe 100%);
  border-radius: 12px;
  border: 2px solid #e8f5ef;
  transition: all 0.3s ease;
}

.synergy-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(45, 134, 89, 0.15);
}

.synergy-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: white;
}

.synergy-icon.unique {
  background: linear-gradient(135deg, #e6a23c 0%, #d48806 100%);
}

.synergy-icon.enhanced {
  background: linear-gradient(135deg, #f56c6c 0%, #e03e3e 100%);
}

.synergy-icon.weakened {
  background: linear-gradient(135deg, #409eff 0%, #2a7de1 100%);
}

.synergy-info {
  flex: 1;
}

.synergy-value {
  font-size: 36px;
  font-weight: 700;
  color: #1a5f4a;
  line-height: 1.2;
}

.synergy-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.synergy-section {
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .venn-container {
    flex-direction: column;
  }
  
  .venn-stats {
    width: 100%;
  }
  
  .synergy-stats {
    grid-template-columns: 1fr;
  }
  
  .synergy-card {
    padding: 16px;
  }
  
  .synergy-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }
  
  .synergy-value {
    font-size: 28px;
  }
}
</style>



