<template>
  <div>
    <!--Header-->
  

    <!--Body-->
    <div class="px-5 bg-light">
      <el-row :gutter="20" id="results-dashboard">
        <!-- ChEA -->
        <el-col :xl="12" class="d-flex align-items-stretch mb-4">
          <el-card class="w-100">
            <template #header>
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <el-button 
                    type="primary" 
                    link 
                    @click="cheaDialogVisible = true"
                    class="expand-button"
                  >
                    <el-icon><Expand /></el-icon>
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <span class="navbar-brand"><b>Step 1.</b> Transcription Factor Enrichment Analysis (TFEA)</span>
                  <el-radio-group v-model="cheaActiveTab" size="small" class="tab-toggle">
                    <el-radio-button label="bar">Bargraph</el-radio-button>
                    <el-radio-button label="table">Table</el-radio-button>
                  </el-radio-group>
                </div>
                <el-popover
                  placement="left"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button class="info-popover-button" type="primary" link>
                      <el-icon><QuestionFilled /></el-icon>
                    </el-button>
                  </template>
                  <div>
                    <p>Transcription Factor Enrichment Analysis (TFEA) is the first step of the X2K pipeline. It <b>predicts transcription factors that are predicted to regulate the input gene list</b> by performing gene set enrichment analysis using different transcription factor gene set libraries, for example, integrated target genes for transcription factors as determined by ChIP-seq experiments (ChEA).</p>
                    <p class="mt-3">A ranked list of the <b>top predicted transcription factors</b> is displayed as a bar graph or as a table. The results can be downloaded as a spreadsheet.</p>
                    <p class="mt-3">The enriched transcription factors are used as input for the next step of the X2K pipeline, the <b>protein-protein interaction expansion</b>.</p>
                    <p class="mt-3 text-muted font-italic">Note: the results from the TFEA are computational predictions and experimentalists should consider this carefully before attempting to validate any of these predictions experimentally.</p>
                  </div>
                </el-popover>
              </div>
            </template>

            <div class="dash-nav-tabs">
              <div v-if="cheaActiveTab === 'bar'">
                <div id="bargraph-chea" class="bargraph">
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                       class="chea-chart"
                       width="100%" height="100%" viewBox="-20 0 1020 600"></svg>
                </div>
              </div>
              <div v-else>
                <div class="table-toolbar">
                  <el-input
                    v-model="cheaSearch"
                    size="small"
                    clearable
                    placeholder="Search transcription factor"
                    style="max-width: 240px"
                  />
                </div>
                <el-table 
                  :data="cheaPagedData" 
                  border
                  stripe
                  style="width: 100%"
                  max-height="500"
                >
                  <el-table-column prop="rank" label="Rank" width="80" />
                  <el-table-column prop="simpleName" label="Transcription Factor" min-width="200" />
                  <el-table-column prop="pvalue" label="Hypergeometric P-value" min-width="180">
                    <template #default="{ row }">
                      {{ formatPValue(row.pvalue) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="enrichedTargets" label="Enriched Targets" min-width="200">
                    <template #default="{ row }">
                      {{ row.enrichedTargets?.length || 0 }}
                    </template>
                  </el-table-column>
                </el-table>
                <div class="table-pagination" v-if="filteredCheaTableData.length > tablePageSize">
                  <el-pagination
                    layout="prev, pager, next"
                    :page-size="tablePageSize"
                    :total="filteredCheaTableData.length"
                    v-model:current-page="cheaPage"
                    small
                    background
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- G2N -->
        <el-col :xl="12" class="d-flex align-items-stretch mb-4">
          <el-card class="w-100">
            <template #header>
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <el-button 
                    type="primary" 
                    link 
                    @click="g2nDialogVisible = true"
                    class="expand-button"
                  >
                    <el-icon><Expand /></el-icon>
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <span class="navbar-brand"><b>Step 2.</b> Protein-Protein Interaction Expansion</span>
                </div>
                <el-popover
                  placement="left"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button class="info-popover-button" type="primary" link>
                      <el-icon><QuestionFilled /></el-icon>
                    </el-button>
                  </template>
                  <div>
                    <p>Protein-Protein Interaction Expansion is the second step of the X2K pipeline. In this step X2K <b>expands the list</b> of enriched transcription factors by identifying proteins that physically interact with these transcription factors using the Genes2Networks (G2N) algorithm. To achieve this, data from many Protein-Protein Interaction databases is integrated.</p>
                    <p class="mt-3">A <b>subnetwork of connected transcription factors and their interacting proteins is visualized as a ball-and-stick diagram</b>. Transcription factors are the pink nodes, while the proteins that connect them are in grey. The size of the nodes in the network is proportional to their degree.</p>
                    <p class="mt-3">The proteins that were identified in the network expansion step are used as input for the final step of the X2K pipeline, the <b>Kinase Enrichment Analysis</b>.</p>
                    <p class="mt-3 text-muted font-italic">Note: the results from the network expansion step are computational predictions, experimentalists should consider this carefully before attempting to validate any of these predictions experimentally.</p>
                  </div>
                </el-popover>
              </div>
            </template>

            <div id="network-g2n" class="card-body h-100" style="position: relative;">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="g2n-svg h-100 w-100"
                   preserveAspectRatio="xMinYMin"></svg>
              <!-- Zoom controls will be added by D3 -->
            </div>
          </el-card>
        </el-col>

        <!-- KEA -->
        <el-col :xl="12" class="d-flex align-items-stretch mb-4">
          <el-card class="w-100">
            <template #header>
              <div class="d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center flex-wrap gap-2">
                  <el-button 
                    type="primary" 
                    link 
                    @click="keaDialogVisible = true"
                    class="expand-button"
                  >
                    <el-icon><Expand /></el-icon>
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <span class="navbar-brand"><b>Step 3.</b> Kinase Enrichment Analysis (KEA)</span>
                  <el-radio-group v-model="keaActiveTab" size="small" class="tab-toggle">
                    <el-radio-button label="bar">Bargraph</el-radio-button>
                    <el-radio-button label="table">Table</el-radio-button>
                  </el-radio-group>
                </div>
                <el-popover
                  placement="left"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button class="info-popover-button" type="primary" link>
                      <el-icon><QuestionFilled /></el-icon>
                    </el-button>
                  </template>
                  <div>
                    <p>Kinase Enrichment Analysis (KEA) is the third and final step of the X2K pipeline. KEA <b>predicts the protein kinases that are likely the regulators of the expanded protein-protein interaction network</b> from the previous step. KEA performs enrichment analysis on the list of proteins from the subnetwork using gene set libraries from kinase-substrate interaction databases.</p>
                    <p class="mt-3">A ranked list of the <b>top predicted kinases</b> is displayed as a bar graph and table. The results can be downloaded as a spreadsheet.</p>
                    <p class="mt-3">The top kinases are displayed alongside the predicted transcription factors (Step 1) and expanded regulatory network (Step 2) in the <b>eXpression2Kinases network</b>.</p>
                    <p class="mt-3 text-muted font-italic">Note: the results from the kinase enrichment analysis step are computational predictions, experimentalists should consider this carefully before attempting to validate any of these predictions experimentally.</p>
                  </div>
                </el-popover>
              </div>
            </template>

            <div class="dash-nav-tabs">
              <div v-if="keaActiveTab === 'bar'">
                <div id="bargraph-kea" class="bargraph">
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                       class="kea-chart"
                       width="100%" height="100" viewBox="-20 0 1020 600"></svg>
                </div>
              </div>
              <div v-else>
                <div class="table-toolbar">
                  <el-input
                    v-model="keaSearch"
                    size="small"
                    clearable
                    placeholder="Search transcription factor"
                    style="max-width: 240px"
                  />
                </div>
                <el-table 
                  :data="keaPagedData" 
                  border
                  stripe
                  style="width: 100%"
                  max-height="710"
                >
                  <el-table-column prop="rank" label="Rank" width="80" />
                  <el-table-column prop="simpleName" label="Transcription Factor" min-width="200" />
                  <el-table-column prop="pvalue" label="Hypergeometric P-value" min-width="180">
                    <template #default="{ row }">
                      {{ formatPValue(row.pvalue) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="enrichedTargets" label="Enriched Targets" min-width="200">
                    <template #default="{ row }">
                      {{ row.enrichedTargets?.length || 0 }}
                    </template>
                  </el-table-column>
                </el-table>
                <div class="table-pagination" v-if="filteredKeaTableData.length > tablePageSize">
                  <el-pagination
                    layout="prev, pager, next"
                    :page-size="tablePageSize"
                    :total="filteredKeaTableData.length"
                    v-model:current-page="keaPage"
                    small
                    background
                  />
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- X2K -->
        <el-col :xl="12" class="d-flex align-items-stretch mb-4">
          <el-card class="w-100 h-100">
            <template #header>
              <div class="d-flex align-items-center justify-content-between">
                <div class="d-flex align-items-center">
                  <el-button 
                    type="primary" 
                    link 
                    @click="x2kDialogVisible = true"
                    class="expand-button"
                  >
                    <el-icon><Expand /></el-icon>
                    <el-icon><Download /></el-icon>
                  </el-button>
                  <span class="navbar-brand"><b>Step 4.</b> eXpression2Kinases Network</span>
                </div>
                <el-popover
                  placement="left"
                  :width="400"
                  trigger="click"
                >
                  <template #reference>
                    <el-button class="info-popover-button" type="primary" link>
                      <el-icon><QuestionFilled /></el-icon>
                    </el-button>
                  </template>
                  <div>
                    <p>The eXpression2Kinases (X2K) network displays the <b>inferred upstream regulatory network predicted to regulate the input list</b> of genes by integrating the results from the TFEA (Step 1), the network expansion (Step 2), and the kinase enrichment (Step 3).</p>
                    <p class="mt-3">Pink nodes represent the <b>top transcription factors</b> predicted to regulate the expression of the input gene list; orange nodes represent proteins that <b>physically interact with the enriched transcription factors and connect them</b>. Blue nodes represent the <b>top predicted protein kinases</b> known to phosphorylate the proteins within the expanded subnetwork.</p>
                    <p class="mt-3">Green network edges/links represent <b>kinase-substrate phosphorylation</b> interactions between kinases and their substrates, while grey network edges represent <b>physical protein-protein interactions</b>.</p>
                    <p class="mt-3 text-muted font-italic">Note: this network is a results of computational predictions, experimentalists should consider this carefully before attempting to validate any of these predictions experimentally.</p>
                  </div>
                </el-popover>
              </div>
            </template>

            <div id="x2k-network" class="card-body h-100" style="position: relative;">
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="x2k-svg h-100 w-100" id="x2ksvg"
                   preserveAspectRatio="xMinYMin"></svg>
              <!-- Zoom controls will be added by D3 -->
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- Modals -->
    <el-dialog 
      v-model="cheaDialogVisible" 
      title="Transcription Factor Enrichment Analysis (TFEA)"
      width="80%"
    >
      <div id="chea-results-modal">
        <el-tabs v-model="cheaModalActiveTab">
          <el-tab-pane label="Bargraph" name="bar">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                 class="chea-chart"
                 width="100%" height="600" viewBox="-20 0 1020 600"></svg>
          </el-tab-pane>
          <el-tab-pane label="Table" name="table">
            <el-table 
              :data="cheaTableData" 
              border
              stripe
              style="width: 100%"
              max-height="500"
            >
              <el-table-column prop="rank" label="Rank" width="80" />
              <el-table-column prop="simpleName" label="Transcription Factor" min-width="200" />
              <el-table-column prop="pvalue" label="Hypergeometric P-value" min-width="180">
                <template #default="{ row }">
                  {{ formatPValue(row.pvalue) }}
                </template>
              </el-table-column>
              <el-table-column prop="enrichedTargets" label="Enriched Targets" min-width="200">
                <template #default="{ row }">
                  {{ row.enrichedTargets?.length || 0 }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span>Download results as:</span>
        <el-button type="primary" plain @click="downloadCheaCSV">CSV</el-button>
        <el-button type="primary" plain @click="downloadCheaSVG">SVG</el-button>
        <el-button type="primary" plain @click="downloadCheaPNG">PNG</el-button>
        <el-button type="primary" plain @click="downloadCheaCytoscape">Cytoscape JSON</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="g2nDialogVisible" 
      title="Protein-Protein Interaction Expansion"
      width="80%"
    >
      <div id="network-g2n-modal" class="h-100">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="g2n-svg h-100 w-100"
             preserveAspectRatio="xMinYMin"></svg>
      </div>
      <template #footer>
        <span>Download results as:</span>
        <el-button type="primary" plain @click="downloadG2NCSV">CSV</el-button>
        <el-button type="primary" plain @click="downloadG2NSVG">SVG</el-button>
        <el-button type="primary" plain @click="downloadG2NPNG">PNG</el-button>
        <el-button type="primary" plain @click="downloadG2NCytoscape">Cytoscape JSON</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="keaDialogVisible" 
      title="Kinase Enrichment Analysis (KEA)"
      width="80%"
    >
      <div id="kea-results-modal">
        <el-tabs v-model="keaModalActiveTab">
          <el-tab-pane label="Bargraph" name="bar">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
                 class="kea-chart"
                 width="100%" height="600" viewBox="-20 0 1020 600"></svg>
          </el-tab-pane>
          <el-tab-pane label="Table" name="table">
            <el-table 
              :data="keaTableData" 
              border
              stripe
              style="width: 100%"
              max-height="500"
            >
              <el-table-column prop="rank" label="Rank" width="80" />
              <el-table-column prop="simpleName" label="Transcription Factor" min-width="200" />
              <el-table-column prop="pvalue" label="Hypergeometric P-value" min-width="180">
                <template #default="{ row }">
                  {{ formatPValue(row.pvalue) }}
                </template>
              </el-table-column>
              <el-table-column prop="enrichedTargets" label="Enriched Targets" min-width="200">
                <template #default="{ row }">
                  {{ row.enrichedTargets?.length || 0 }}
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <span>Download results as:</span>
        <el-button type="primary" plain @click="downloadKeaCSV">CSV</el-button>
        <el-button type="primary" plain @click="downloadKeaSVG">SVG</el-button>
        <el-button type="primary" plain @click="downloadKeaPNG">PNG</el-button>
        <el-button type="primary" plain @click="downloadKeaCytoscape">Cytoscape JSON</el-button>
      </template>
    </el-dialog>

    <el-dialog 
      v-model="x2kDialogVisible" 
      title="eXpression2Kinases Network"
      width="80%"
    >
      <div id="x2k-network-modal" class="h-100">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" class="x2k-svg h-100 w-100" id="x2ksvg-modal"
             preserveAspectRatio="xMinYMin"></svg>
      </div>
      <template #footer>
        <span>Download results as:</span>
        <el-button type="primary" plain @click="downloadX2KCSV">CSV</el-button>
        <el-button type="primary" plain @click="downloadX2KSVG">SVG</el-button>
        <el-button type="primary" plain @click="downloadX2KPNG">PNG</el-button>
        <el-button type="primary" plain @click="downloadX2KCytoscape">Cytoscape JSON</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import * as d3 from 'd3'
import { runX2K } from '@/api/x2k'
import { Expand, Download, QuestionFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'X2KAnalysis',
  components: {
    Expand,
    Download,
    QuestionFilled
  },
  props: {
    geneList: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const route = useRoute()
    // Tab states
    const cheaActiveTab = ref('bar')
    const keaActiveTab = ref('bar')
    const cheaModalActiveTab = ref('bar')
    const keaModalActiveTab = ref('bar')
    
    // Dialog states
    const cheaDialogVisible = ref(false)
    const g2nDialogVisible = ref(false)
    const keaDialogVisible = ref(false)
    const x2kDialogVisible = ref(false)
    
    // Data
    const cheaData = ref([])
    const keaData = ref([])
    const g2nData = ref(null)
    const x2kData = ref(null)
    const loading = ref(false)
    
    // Chart instances
    let cheaChartSvg = null
    let keaChartSvg = null
    let g2nSimulation = null
    let x2kSimulation = null
    
    // Table data, search, and pagination
    const cheaTableData = ref([])
    const keaTableData = ref([])
    const cheaPage = ref(1)
    const keaPage = ref(1)
    const cheaSearch = ref('')
    const keaSearch = ref('')
    const tablePageSize = 10
    const filteredCheaTableData = computed(() => {
      const q = cheaSearch.value.trim().toLowerCase()
      if (!q) return cheaTableData.value
      return cheaTableData.value.filter(d =>
        (d.simpleName || d.name || '').toLowerCase().includes(q)
      )
    })
    const filteredKeaTableData = computed(() => {
      const q = keaSearch.value.trim().toLowerCase()
      if (!q) return keaTableData.value
      return keaTableData.value.filter(d =>
        (d.simpleName || d.name || '').toLowerCase().includes(q)
      )
    })
    const cheaPagedData = computed(() => {
      const start = (cheaPage.value - 1) * tablePageSize
      return filteredCheaTableData.value.slice(start, start + tablePageSize)
    })
    const keaPagedData = computed(() => {
      const start = (keaPage.value - 1) * tablePageSize
      return filteredKeaTableData.value.slice(start, start + tablePageSize)
    })
    
    // Format p-value
    const formatPValue = (pvalue) => {
      if (!pvalue || pvalue < 0) return 'N/A'
      if (pvalue < 1e-100) return '< 1e-100'
      return pvalue.toExponential(2)
    }
    
    // Draw horizontal bar chart for ChEA/KEA (matching official website style)
    const drawBarChart = (data, containerSelector, isKea = false) => {
      console.log(`Drawing bar chart for ${isKea ? 'KEA' : 'ChEA'} with selector:`, containerSelector)
      console.log('Data:', data)
      
      const container = document.querySelector(containerSelector)
      if (!container) {
        console.error('Container not found:', containerSelector)
        return
      }
      
      if (!data || data.length === 0) {
        console.warn('No data to draw')
        return
      }
      
      // Get or create SVG
      let svg = d3.select(container).select('svg')
      if (svg.empty()) {
        console.log('Creating new SVG')
        svg = d3.select(container)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', '0 0 1000 600')
      } else {
        // Clear previous content
        svg.selectAll('*').remove()
      }
      
      const width = 1000
      const height = 600
      const margin = { top: 50, right: 150, bottom: 40, left: 120 }
      const chartWidth = width - margin.left - margin.right
      const chartHeight = height - margin.top - margin.bottom
      
      // Sort by p-value (ascending) - most significant first
      const sortedData = [...data]
        .filter(d => d.pvalue > 0)
        .sort((a, b) => a.pvalue - b.pvalue)
        .slice(0, 20) // Top 20 (most significant p-values first)
      
      if (sortedData.length === 0) return
      
      // Calculate -log10(pvalue)
      const logValues = sortedData.map(d => -Math.log10(d.pvalue))
      const maxLogValue = Math.max(...logValues)
      const minLogValue = Math.min(...logValues)
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)
      
      // Y scale (categories - transcription factors/kinases)
      const yScale = d3.scaleBand()
        .domain(sortedData.map((d, i) => i))
        .range([0, chartHeight])
        .padding(0.15)
      
      // X scale (-log10 pvalue) - horizontal
      const xScale = d3.scaleLinear()
        .domain([0, maxLogValue * 1.1])
        .range([0, chartWidth])
      
      // Color scheme: red/pink for ChEA, blue for KEA
      const barColor = isKea ? '#4169e1' : '#ff69b4'
      
      // Draw bars (horizontal)
      const bars = g.selectAll('.bar')
        .data(sortedData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', 0)
        .attr('y', (d, i) => yScale(i))
        .attr('width', d => xScale(-Math.log10(d.pvalue)))
        .attr('height', yScale.bandwidth())
        .attr('fill', barColor)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', function(event, d) {
          d3.select(this).attr('opacity', 0.8)
          showTooltip(event, d, isKea)
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1)
          hideTooltip()
        })
      
      // Add p-value labels at the end of bars
      g.selectAll('.pvalue-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'pvalue-label')
        .attr('x', d => xScale(-Math.log10(d.pvalue)) + 5)
        .attr('y', (d, i) => yScale(i) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('font-size', '11px')
        .attr('fill', '#333')
        .attr('font-weight', 'normal')
        .text(d => formatPValue(d.pvalue))
      
      // Add name labels on y-axis
      g.selectAll('.name-label')
        .data(sortedData)
        .enter()
        .append('text')
        .attr('class', 'name-label')
        .attr('x', -5)
        .attr('y', (d, i) => yScale(i) + yScale.bandwidth() / 2)
        .attr('dy', '0.35em')
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', '#333')
        .text(d => d.simpleName || d.name.replace('_ENCODE', ''))
      
      // X axis (at top for horizontal bars)
      const xAxis = d3.axisTop(xScale)
        .ticks(10)
        .tickFormat(d => d.toFixed(1))
        .tickPadding(6)
      
      g.append('g')
        .attr('class', 'x-axis')
        .call(xAxis)
        .selectAll('text')
        .attr('font-size', '11px')
        .attr('fill', '#666')
      
      // X axis label
      g.append('text')
        .attr('x', chartWidth / 2)
        .attr('y', -30)
        .attr('text-anchor', 'middle')
        .attr('font-size', '13px')
        .attr('fill', '#333')
        .text('-log10(p-value)')
      
      // Y axis (left side)
      const yAxis = d3.axisLeft(yScale)
        .tickSize(0)
        .tickFormat('')
      
      g.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
    }
    
    // Show tooltip
    const showTooltip = (event, d, isKea) => {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'x2k-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '9999')
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`)
        .html(`
          <div><strong>${d.simpleName || d.name}</strong></div>
          <div>P-value: ${formatPValue(d.pvalue)}</div>
          <div>Z-score: ${d.zscore || 'N/A'}</div>
          <div>Combined Score: ${d.combinedScore || 'N/A'}</div>
        `)
    }
    
    const hideTooltip = () => {
      d3.selectAll('.x2k-tooltip').remove()
    }
    
    // Draw network graph for G2N/X2K
    const drawNetwork = (data, containerSelector, isX2K = false) => {
      console.log(`Drawing network for ${isX2K ? 'X2K' : 'G2N'} with selector:`, containerSelector)
      console.log('Network data:', data)
      
      const container = document.querySelector(containerSelector)
      if (!container) {
        console.error('Container not found:', containerSelector)
        return
      }
      
      if (!data) {
        console.warn('No data provided')
        return
      }
      
      // Handle different data structures: {network: {nodes, interactions}} or {nodes, interactions}
      const networkData = data.network || data
      if (!networkData || !networkData.nodes) {
        console.warn('No network data found:', data)
        return
      }
      
      // Support selectors pointing to either the container div or the SVG itself
      const isSvgElement = container instanceof SVGElement
      const sizeContainer = isSvgElement ? (container.parentElement || container) : container
      
      let svgElement
      if (isSvgElement) {
        svgElement = container
      } else {
        svgElement = container.querySelector('svg')
        if (!svgElement) {
          console.log('Creating new SVG for network')
          svgElement = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          svgElement.setAttribute('class', isX2K ? 'x2k-svg' : 'g2n-svg')
          svgElement.setAttribute('preserveAspectRatio', 'xMinYMin meet')
          container.appendChild(svgElement)
        }
      }
      
      const svg = d3.select(svgElement)
      svg.selectAll('*').remove()
      
      const width = (sizeContainer?.clientWidth || svgElement.clientWidth || svgElement.parentElement?.clientWidth || 800)
      const height = (sizeContainer?.clientHeight || svgElement.clientHeight || svgElement.parentElement?.clientHeight || 600)
      
      svg
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMinYMin meet')
      
      const nodes = networkData.nodes || []
      const interactions = networkData.interactions || []
      
      if (nodes.length === 0) return
      
      // Convert interactions from indices to node references
      const links = interactions.map(link => ({
        source: nodes[link.source],
        target: nodes[link.target]
      })).filter(link => link.source && link.target)
      
      // Node colors based on type (matching official website)
      const nodeColors = {
        tf: isX2K ? '#ff69b4' : '#ff0000',  // Red for G2N, Pink for X2K transcription factors
        kinase: '#4169e1',  // Blue for kinases (X2K only)
        other: isX2K ? '#808080' : '#808080'  // Grey for intermediate proteins
      }
      
      // Node sizes based on degree
      const nodeDegrees = {}
      links.forEach(link => {
        const sourceId = link.source.name
        const targetId = link.target.name
        nodeDegrees[sourceId] = (nodeDegrees[sourceId] || 0) + 1
        nodeDegrees[targetId] = (nodeDegrees[targetId] || 0) + 1
      })
      
      const maxDegree = Math.max(...Object.values(nodeDegrees), 1)
      
      // Create force simulation
      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.name).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(d => {
          const degree = nodeDegrees[d.name] || 1
          return 5 + (degree / maxDegree) * 15
        }))
      
      const g = svg.append('g')
      
      // Create zoom behavior
      const zoom = d3.zoom()
        .scaleExtent([0.1, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
      
      svg.call(zoom)
      
      // Add zoom controls
      const zoomControls = svg.append('g')
        .attr('class', 'zoom-controls')
        .attr('transform', `translate(${width - 60}, 20)`)
      
      // Zoom in button
      zoomControls.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', '#fff')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => {
          svg.transition().call(zoom.scaleBy, 1.3)
        })
      
      zoomControls.append('text')
        .attr('x', 15)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('fill', '#666')
        .style('pointer-events', 'none')
        .text('+')
      
      // Zoom out button
      zoomControls.append('rect')
        .attr('x', 0)
        .attr('y', 35)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', '#fff')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => {
          svg.transition().call(zoom.scaleBy, 0.7)
        })
      
      zoomControls.append('text')
        .attr('x', 15)
        .attr('y', 55)
        .attr('text-anchor', 'middle')
        .attr('font-size', '18px')
        .attr('fill', '#666')
        .style('pointer-events', 'none')
        .text('−')
      
      // Reset button
      zoomControls.append('rect')
        .attr('x', 0)
        .attr('y', 70)
        .attr('width', 30)
        .attr('height', 30)
        .attr('fill', '#fff')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 1)
        .attr('rx', 4)
        .style('cursor', 'pointer')
        .on('click', () => {
          svg.transition().call(zoom.transform, d3.zoomIdentity)
        })
      
      zoomControls.append('text')
        .attr('x', 15)
        .attr('y', 90)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .style('pointer-events', 'none')
        .text('↺')
      
      // Draw links
      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', isX2K ? '#90EE90' : '#999')
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6)
      
      // Draw nodes
      const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('circle')
        .data(nodes)
        .enter()
        .append('circle')
        .attr('r', d => {
          const degree = nodeDegrees[d.name] || 1
          return 5 + (degree / maxDegree) * 15
        })
        .attr('fill', d => nodeColors[d.type] || '#808080')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended))
      
      // Add labels
      const label = g.append('g')
        .attr('class', 'labels')
        .selectAll('text')
        .data(nodes)
        .enter()
        .append('text')
        .text(d => d.name.replace('_ENCODE', ''))
        .attr('font-size', isX2K ? '10px' : '9px')
        .attr('text-anchor', isX2K ? 'start' : 'middle')
        .attr('dx', isX2K ? 8 : 0)
        .attr('dy', isX2K ? 4 : '0.35em')
        .attr('fill', isX2K ? '#333' : '#000')
        .style('pointer-events', 'none')

      // Build adjacency for hover highlighting
      const adjacency = new Map()
      nodes.forEach(n => adjacency.set(n.name, new Set()))
      links.forEach(l => {
        adjacency.get(l.source.name)?.add(l.target.name)
        adjacency.get(l.target.name)?.add(l.source.name)
      })

      const resetHighlight = () => {
        node
          .style('opacity', 1)
          .attr('stroke-width', 2)
        label.style('opacity', 1)
        link
          .attr('stroke', isX2K ? '#90EE90' : '#999')
          .attr('stroke-opacity', 0.6)
      }

      const highlightNeighbors = (d) => {
        const neighbors = adjacency.get(d.name) || new Set()
        const isConnected = (l) => (l.source.name === d.name && neighbors.has(l.target.name)) ||
          (l.target.name === d.name && neighbors.has(l.source.name))

        node
          .style('opacity', n => (n.name === d.name || neighbors.has(n.name)) ? 1 : 0.15)
          .attr('stroke-width', n => n.name === d.name ? 3 : 2)
        label.style('opacity', n => (n.name === d.name || neighbors.has(n.name)) ? 1 : 0.15)
        link
          .attr('stroke-opacity', l => isConnected(l) ? 0.9 : 0.05)
          .attr('stroke', l => isConnected(l) ? (isX2K ? '#90EE90' : '#999') : '#ccc')
      }

      node
        .on('mouseover', function(event, d) {
          highlightNeighbors(d)
        })
        .on('mouseout', function() {
          resetHighlight()
        })
      
      // Add legend (fixed position, not affected by zoom)
      const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', 'translate(20, 20)')
        .style('pointer-events', 'none')
      
      // Add background for legend
      const legendBg = legend.append('rect')
        .attr('x', -5)
        .attr('y', -5)
        .attr('width', 180)
        .attr('height', isX2K ? 105 : 65)
        .attr('fill', 'rgba(255, 255, 255, 0.9)')
        .attr('stroke', '#ddd')
        .attr('stroke-width', 1)
        .attr('rx', 4)
      
      if (isX2K) {
        // X2K legend: Transcription factor (pink), Intermediate protein (grey), Kinase (blue)
        // Phosphorylation (green line), PPI (grey line)
        const legendItems = [
          { color: '#ff69b4', label: 'Transcription factor', type: 'circle' },
          { color: '#808080', label: 'Intermediate protein', type: 'circle' },
          { color: '#4169e1', label: 'Kinase', type: 'circle' },
          { color: '#90EE90', label: 'Phosphorylation', type: 'line' },
          { color: '#999', label: 'PPI', type: 'line' }
        ]
        
        legendItems.forEach((item, i) => {
          const legendItem = legend.append('g')
            .attr('transform', `translate(5, ${i * 20})`)
          
          if (item.type === 'circle') {
            legendItem.append('circle')
              .attr('r', 6)
              .attr('fill', item.color)
              .attr('stroke', '#fff')
              .attr('stroke-width', 1)
          } else {
            legendItem.append('line')
              .attr('x1', 0)
              .attr('y1', 0)
              .attr('x2', 12)
              .attr('y2', 0)
              .attr('stroke', item.color)
              .attr('stroke-width', 2)
          }
          
          legendItem.append('text')
            .attr('x', item.type === 'circle' ? 12 : 18)
            .attr('y', 4)
            .attr('font-size', '11px')
            .attr('fill', '#333')
            .text(item.label)
        })
      } else {
        // G2N legend: Transcription factor (red), Intermediate protein (grey), PPI (grey line)
        const legendItems = [
          { color: '#ff0000', label: 'Transcription factor', type: 'circle' },
          { color: '#808080', label: 'Intermediate protein', type: 'circle' },
          { color: '#999', label: 'PPI', type: 'line' }
        ]
        
        legendItems.forEach((item, i) => {
          const legendItem = legend.append('g')
            .attr('transform', `translate(5, ${i * 20})`)
          
          if (item.type === 'circle') {
            legendItem.append('circle')
              .attr('r', 6)
              .attr('fill', item.color)
              .attr('stroke', '#fff')
              .attr('stroke-width', 1)
          } else {
            legendItem.append('line')
              .attr('x1', 0)
              .attr('y1', 0)
              .attr('x2', 12)
              .attr('y2', 0)
              .attr('stroke', item.color)
              .attr('stroke-width', 2)
          }
          
          legendItem.append('text')
            .attr('x', item.type === 'circle' ? 12 : 18)
            .attr('y', 4)
            .attr('font-size', '11px')
            .attr('fill', '#333')
            .text(item.label)
        })
      }
      
      // Update positions on simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y)
        
        node.attr('cx', d => d.x).attr('cy', d => d.y)
        label.attr('x', d => d.x).attr('y', d => d.y)
      })
      
      // Drag functions
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      }
      
      function dragged(event, d) {
        d.fx = event.x
        d.fy = event.y
      }
      
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0)
        d.fx = null
        d.fy = null
      }
      
      if (isX2K) {
        x2kSimulation = simulation
      } else {
        g2nSimulation = simulation
      }
    }
    
    const showNetworkTooltip = (event, d) => {
      const tooltip = d3.select('body').append('div')
        .attr('class', 'x2k-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('z-index', '9999')
        .style('left', `${event.pageX + 10}px`)
        .style('top', `${event.pageY - 10}px`)
        .html(`
          <div><strong>${d.name}</strong></div>
          <div>Type: ${d.type}</div>
          ${d.pvalue > 0 ? `<div>P-value: ${formatPValue(d.pvalue)}</div>` : ''}
        `)
    }
    
    const hideNetworkTooltip = () => {
      d3.selectAll('.x2k-tooltip').remove()
    }
    
    // Get gene list from props or route
    const getGeneList = () => {
      // First try props
      if (props.geneList && props.geneList.length > 0) {
        return props.geneList
      }
      
      // Then try route query token
      const token = route.query.token
      if (token) {
        try {
          const stored = sessionStorage.getItem(token)
          if (stored) {
            const data = JSON.parse(stored)
            return data.genes || []
          }
        } catch (error) {
          console.error('Failed to parse stored gene list:', error)
        }
      }
      
      return []
    }
    
    // Load data
    const loadData = async () => {
      const geneList = getGeneList()
      
      if (!geneList || geneList.length === 0) {
        ElMessage.warning('Please provide a gene list')
        return
      }
      
      loading.value = true
      try {
        console.log('Loading X2K data with gene list:', geneList)
        const result = await runX2K(geneList, props.options)
        
        console.log('X2K Result:', result)
        
        cheaData.value = Array.isArray(result.ChEA) ? result.ChEA : []
        keaData.value = Array.isArray(result.KEA) ? result.KEA : []
        
        // Handle G2N: could be {type: "G2N", network: {...}} or {network: {...}} or {nodes: [...], interactions: [...]}
        if (result.G2N) {
          if (result.G2N.network) {
            g2nData.value = result.G2N.network
          } else if (result.G2N.nodes) {
            g2nData.value = result.G2N
          } else {
            g2nData.value = null
          }
        } else {
          g2nData.value = null
        }
        
        // Handle X2K: could be {type: "X2K", network: {...}} or {network: {...}} or {nodes: [...], interactions: [...]}
        if (result.X2K) {
          if (result.X2K.network) {
            x2kData.value = result.X2K.network
          } else if (result.X2K.nodes) {
            x2kData.value = result.X2K
          } else {
            x2kData.value = null
          }
        } else {
          x2kData.value = null
        }
        
        console.log('ChEA data:', cheaData.value)
        console.log('KEA data:', keaData.value)
        console.log('G2N data:', g2nData.value)
        console.log('X2K data:', x2kData.value)
        
        // Prepare table data
        cheaTableData.value = cheaData.value.map((d, i) => ({
          ...d,
          rank: i + 1
        }))
        cheaPage.value = 1
        
        keaTableData.value = keaData.value.map((d, i) => ({
          ...d,
          rank: i + 1
        }))
        keaPage.value = 1
        
        // Draw charts after a short delay to ensure DOM is ready
        await nextTick()
        setTimeout(() => {
          console.log('Starting to draw charts...')
          console.log('ChEA data length:', cheaData.value.length)
          console.log('KEA data length:', keaData.value.length)
          console.log('G2N data:', g2nData.value)
          console.log('X2K data:', x2kData.value)
          
          // Step 1: ChEA Bar Chart
          if (cheaData.value.length > 0) {
            console.log('Drawing ChEA bar chart...')
            const cheaContainer = document.querySelector('#bargraph-chea')
            if (cheaContainer) {
              drawBarChart(cheaData.value, '#bargraph-chea .chea-chart', false)
            } else {
              console.error('ChEA container not found')
            }
          } else {
            console.warn('No ChEA data to draw')
          }
          
          // Step 3: KEA Bar Chart
          if (keaData.value.length > 0) {
            console.log('Drawing KEA bar chart...')
            const keaContainer = document.querySelector('#bargraph-kea')
            if (keaContainer) {
              drawBarChart(keaData.value, '#bargraph-kea .kea-chart', true)
            } else {
              console.error('KEA container not found')
            }
          } else {
            console.warn('No KEA data to draw')
          }
          
          // Step 2: G2N Network
          if (g2nData.value) {
            const g2nNetwork = g2nData.value.network || g2nData.value
            if (g2nNetwork && g2nNetwork.nodes && g2nNetwork.nodes.length > 0) {
              console.log('Drawing G2N network...')
              const g2nContainer = document.querySelector('#network-g2n')
              if (g2nContainer) {
                drawNetwork(g2nData.value, '#network-g2n .g2n-svg', false)
              } else {
                console.error('G2N container not found')
              }
            } else {
              console.warn('G2N network data is empty')
            }
          } else {
            console.warn('No G2N data to draw')
          }
          
          // Step 4: X2K Network
          if (x2kData.value) {
            const x2kNetwork = x2kData.value.network || x2kData.value
            if (x2kNetwork && x2kNetwork.nodes && x2kNetwork.nodes.length > 0) {
              console.log('Drawing X2K network...')
              const x2kContainer = document.querySelector('#x2k-network')
              if (x2kContainer) {
                drawNetwork(x2kData.value, '#x2k-network .x2k-svg', true)
              } else {
                console.error('X2K container not found')
              }
            } else {
              console.warn('X2K network data is empty')
            }
          } else {
            console.warn('No X2K data to draw')
          }
        }, 300)
      } catch (error) {
        console.error('Failed to load X2K data:', error)
        ElMessage.error('Failed to load X2K analysis results: ' + (error.message || 'Unknown error'))
      } finally {
        loading.value = false
      }
    }
    
    // Reset pagination on search
    watch(cheaSearch, () => {
      cheaPage.value = 1
    })
    
    watch(keaSearch, () => {
      keaPage.value = 1
    })
    
    // Watch for dialog opens to redraw charts
    watch(cheaDialogVisible, (visible) => {
      if (visible) {
        nextTick(() => {
          setTimeout(() => {
            drawBarChart(cheaData.value, '#chea-results-modal .chea-chart', false)
          }, 100)
        })
      }
    })
    
    watch(keaDialogVisible, (visible) => {
      if (visible) {
        nextTick(() => {
          setTimeout(() => {
            drawBarChart(keaData.value, '#kea-results-modal .kea-chart', true)
          }, 100)
        })
      }
    })
    
    watch(g2nDialogVisible, (visible) => {
      if (visible && g2nData.value) {
        nextTick(() => {
          setTimeout(() => {
            drawNetwork(g2nData.value, '#network-g2n-modal .g2n-svg', false)
          }, 100)
        })
      }
    })
    
    watch(x2kDialogVisible, (visible) => {
      if (visible && x2kData.value) {
        nextTick(() => {
          setTimeout(() => {
            drawNetwork(x2kData.value, '#x2k-network-modal .x2k-svg', true)
          }, 100)
        })
      }
    })
    
    // Download functions
    const downloadCSV = (data, filename) => {
      if (!data || data.length === 0) {
        ElMessage.warning('No data to download')
        return
      }
      
      const headers = ['Rank', 'Name', 'Simple Name', 'P-value', 'Z-score', 'Combined Score', 'Enriched Targets Count']
      const rows = data.map((d, i) => [
        i + 1,
        d.name || '',
        d.simpleName || '',
        d.pvalue || '',
        d.zscore || '',
        d.combinedScore || '',
        d.enrichedTargets?.length || 0
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }
    
    const downloadSVG = (selector, filename) => {
      const svg = document.querySelector(selector)
      if (!svg) {
        ElMessage.warning('Chart not found')
        return
      }
      
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }
    
    const downloadPNG = async (selector, filename) => {
      const svg = document.querySelector(selector)
      if (!svg) {
        ElMessage.warning('Chart not found')
        return
      }
      
      try {
        const svgData = new XMLSerializer().serializeToString(svg)
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const img = new Image()
        
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
        const url = URL.createObjectURL(svgBlob)
        
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)
          canvas.toBlob((blob) => {
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = filename
            link.click()
            URL.revokeObjectURL(url)
          })
        }
        
        img.src = url
      } catch (error) {
        console.error('Failed to export PNG:', error)
        ElMessage.error('Failed to export PNG')
      }
    }
    
    const downloadCytoscape = (data, filename) => {
      if (!data) {
        ElMessage.warning('No network data to download')
        return
      }
      
      const networkData = data.network || data
      if (!networkData || !networkData.nodes) {
        ElMessage.warning('No network data to download')
        return
      }
      
      const nodes = networkData.nodes || []
      const interactions = networkData.interactions || []
      
      const links = interactions.map(link => ({
        data: {
          id: `${nodes[link.source]?.name}-${nodes[link.target]?.name}`,
          source: nodes[link.source]?.name,
          target: nodes[link.target]?.name
        }
      }))
      
      const cytoscapeNodes = nodes.map(node => ({
        data: {
          id: node.name,
          label: node.name,
          type: node.type,
          pvalue: node.pvalue
        }
      }))
      
      const cytoscapeData = {
        elements: {
          nodes: cytoscapeNodes,
          edges: links
        }
      }
      
      const blob = new Blob([JSON.stringify(cytoscapeData, null, 2)], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()
    }
    
    // ChEA download functions
    const downloadCheaCSV = () => downloadCSV(cheaData.value, 'chea_results.csv')
    const downloadCheaSVG = () => downloadSVG('#bargraph-chea .chea-chart', 'chea_chart.svg')
    const downloadCheaPNG = () => downloadPNG('#bargraph-chea .chea-chart', 'chea_chart.png')
    const downloadCheaCytoscape = () => {
      ElMessage.info('Cytoscape export not available for ChEA results')
    }
    
    // KEA download functions
    const downloadKeaCSV = () => downloadCSV(keaData.value, 'kea_results.csv')
    const downloadKeaSVG = () => downloadSVG('#bargraph-kea .kea-chart', 'kea_chart.svg')
    const downloadKeaPNG = () => downloadPNG('#bargraph-kea .kea-chart', 'kea_chart.png')
    const downloadKeaCytoscape = () => {
      ElMessage.info('Cytoscape export not available for KEA results')
    }
    
    // G2N download functions
    const downloadG2NCSV = () => {
      if (!g2nData.value) {
        ElMessage.warning('No G2N data to download')
        return
      }
      const networkData = g2nData.value.network || g2nData.value
      if (!networkData || !networkData.nodes) {
        ElMessage.warning('No G2N data to download')
        return
      }
      const nodes = networkData.nodes || []
      downloadCSV(nodes.map(n => ({ name: n.name, type: n.type, pvalue: n.pvalue })), 'g2n_results.csv')
    }
    const downloadG2NSVG = () => downloadSVG('#network-g2n .g2n-svg', 'g2n_network.svg')
    const downloadG2NPNG = () => downloadPNG('#network-g2n .g2n-svg', 'g2n_network.png')
    const downloadG2NCytoscape = () => downloadCytoscape(g2nData.value, 'g2n_network.json')
    
    // X2K download functions
    const downloadX2KCSV = () => {
      if (!x2kData.value) {
        ElMessage.warning('No X2K data to download')
        return
      }
      const networkData = x2kData.value.network || x2kData.value
      if (!networkData || !networkData.nodes) {
        ElMessage.warning('No X2K data to download')
        return
      }
      const nodes = networkData.nodes || []
      downloadCSV(nodes.map(n => ({ name: n.name, type: n.type, pvalue: n.pvalue })), 'x2k_network.csv')
    }
    const downloadX2KSVG = () => downloadSVG('#x2k-network .x2k-svg', 'x2k_network.svg')
    const downloadX2KPNG = () => downloadPNG('#x2k-network .x2k-svg', 'x2k_network.png')
    const downloadX2KCytoscape = () => downloadCytoscape(x2kData.value, 'x2k_network.json')
    
    // Load test data from JSON file (for development/testing)
    const loadTestData = async () => {
      try {
        const response = await fetch('/PPI_Hub_Proteins_x2k.json')
        const testData = await response.json()
        
        console.log('Loaded test data:', testData)
        
        // Process test data to match expected format
        cheaData.value = Array.isArray(testData.ChEA) ? testData.ChEA : []
        keaData.value = Array.isArray(testData.KEA) ? testData.KEA : []
        
        // Handle G2N: {type: "G2N", network: {nodes, interactions}}
        if (testData.G2N) {
          g2nData.value = testData.G2N.network || testData.G2N
        }
        
        // Handle X2K: {type: "X2K", network: {nodes, interactions}}
        if (testData.X2K) {
          x2kData.value = testData.X2K.network || testData.X2K
        }
        
        console.log('Processed ChEA:', cheaData.value)
        console.log('Processed KEA:', keaData.value)
        console.log('Processed G2N:', g2nData.value)
        console.log('Processed X2K:', x2kData.value)
        
      // Prepare table data
      cheaTableData.value = cheaData.value.map((d, i) => ({
        ...d,
        rank: i + 1
      }))
      cheaPage.value = 1
      cheaSearch.value = ''
      
      keaTableData.value = keaData.value.map((d, i) => ({
        ...d,
        rank: i + 1
      }))
      keaPage.value = 1
      keaSearch.value = ''
        
        // Draw charts
        await nextTick()
        setTimeout(() => {
          console.log('Starting to draw charts from test data...')
          
          // Step 1: ChEA Bar Chart
          if (cheaData.value.length > 0) {
            console.log('Drawing ChEA bar chart from test data...')
            const cheaContainer = document.querySelector('#bargraph-chea')
            if (cheaContainer) {
              drawBarChart(cheaData.value, '#bargraph-chea .chea-chart', false)
            }
          }
          
          // Step 3: KEA Bar Chart
          if (keaData.value.length > 0) {
            console.log('Drawing KEA bar chart from test data...')
            const keaContainer = document.querySelector('#bargraph-kea')
            if (keaContainer) {
              drawBarChart(keaData.value, '#bargraph-kea .kea-chart', true)
            }
          }
          
          // Step 2: G2N Network
          if (g2nData.value) {
            const g2nNetwork = g2nData.value.network || g2nData.value
            if (g2nNetwork && g2nNetwork.nodes && g2nNetwork.nodes.length > 0) {
              console.log('Drawing G2N network from test data...')
              const g2nContainer = document.querySelector('#network-g2n')
              if (g2nContainer) {
                drawNetwork(g2nData.value, '#network-g2n .g2n-svg', false)
              }
            }
          }
          
          // Step 4: X2K Network
          if (x2kData.value) {
            const x2kNetwork = x2kData.value.network || x2kData.value
            if (x2kNetwork && x2kNetwork.nodes && x2kNetwork.nodes.length > 0) {
              console.log('Drawing X2K network from test data...')
              const x2kContainer = document.querySelector('#x2k-network')
              if (x2kContainer) {
                drawNetwork(x2kData.value, '#x2k-network .x2k-svg', true)
              }
            }
          }
        }, 300)
      } catch (error) {
        console.error('Failed to load test data:', error)
      }
    }
    
    // Load data on mount
    onMounted(async () => {
      const geneList = getGeneList()
      if (geneList && geneList.length > 0) {
        loadData()
      } else {
        // If no gene list, try to load test data
        console.log('No gene list provided, loading test data...')
        await loadTestData()
      }
    })
    
    // Watch for gene list changes (from props)
    watch(() => props.geneList, () => {
      const geneList = getGeneList()
      if (geneList && geneList.length > 0) {
        loadData()
      }
    }, { deep: true })
    
    // Watch for route query changes
    watch(() => route.query.token, () => {
      const geneList = getGeneList()
      if (geneList && geneList.length > 0) {
        loadData()
      }
    })
    
    return {
      cheaActiveTab,
      keaActiveTab,
      cheaModalActiveTab,
      keaModalActiveTab,
      cheaDialogVisible,
      g2nDialogVisible,
      keaDialogVisible,
      x2kDialogVisible,
      cheaTableData,
      keaTableData,
      formatPValue,
      downloadCheaCSV,
      downloadCheaSVG,
      downloadCheaPNG,
      downloadCheaCytoscape,
      downloadKeaCSV,
      downloadKeaSVG,
      downloadKeaPNG,
      downloadKeaCytoscape,
      downloadG2NCSV,
      downloadG2NSVG,
      downloadG2NPNG,
      downloadG2NCytoscape,
      downloadX2KCSV,
      downloadX2KSVG,
      downloadX2KPNG,
      downloadX2KCytoscape,
      loading,
      cheaPagedData,
      keaPagedData,
      filteredCheaTableData,
      filteredKeaTableData,
      cheaPage,
      keaPage,
      cheaSearch,
      keaSearch,
      tablePageSize
    }
  }
}
</script>

<style scoped>
.bargraph {
  min-height: 720px;
  width: 100%;
  background: #fff;
}

.bargraph svg {
  width: 100%;
  height: 100%;
  display: block;
}

.card-body {
  min-height: 720px;
  background: #fff;
  position: relative;
}

.card-body.h-100 {
  height: 100%;
  min-height: 720px;
  background: #fff;
  position: relative;
}


.card-body svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}



/* Network graph styles */
.network-container {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
}

.zoom-controls rect:hover {
  fill: #f0f0f0;
}

.legend {
  font-family: Arial, sans-serif;
}

:deep(.x2k-tooltip) {
  font-family: Arial, sans-serif;
}

:deep(.el-table) {
  font-size: 14px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  font-weight: 600;
}

.dash-nav-tabs :deep(.el-tabs__content) {
  padding: 20px 0;
}

.tab-toggle {
  margin-left: 8px;
}

.table-pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.table-toolbar {
  margin-bottom: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
