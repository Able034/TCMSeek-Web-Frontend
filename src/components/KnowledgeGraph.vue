<template>
  <div class="knowledge-graph-container">
    <div class="graph-header">
      <div class="header-title-row">
        <h3>{{ title }}</h3>
        <div class="usage-tips">
          <el-icon><InfoFilled /></el-icon>
          <!-- <span>💡 提示：拖动节点可调整位置，双击节点恢复自动布局</span> -->
        </div>
      </div>
      <div class="legend">
        <div class="legend-item">
          <span class="legend-dot herb"></span>
          <span>药材 Herb</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot compound"></span>
          <span>化合物 Compound</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot gene"></span>
          <span>基因 Gene</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot prescription"></span>
          <span>方剂 Prescription</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot disease"></span>
          <span>疾病 Disease</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot syndrome"></span>
          <span>证候 Syndrome</span>
        </div>
      </div>
    </div>
    <div class="graph-container-wrapper">
      <div ref="graphContainer" class="graph-svg-container"></div>
      <!-- 缩放控制按钮 -->
      <div class="zoom-controls">
        <el-button-group>
          <el-button @click="zoomIn" :icon="ZoomIn" circle title="放大" />
          <el-button @click="zoomOut" :icon="ZoomOut" circle title="缩小" />
          <el-button @click="resetZoom" :icon="RefreshRight" circle title="重置" />
        </el-button-group>
      </div>
    </div>
    <div v-if="loading" class="graph-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>加载知识图谱中...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as d3 from 'd3'
import { Loading, ZoomIn, ZoomOut, RefreshRight, InfoFilled } from '@element-plus/icons-vue'

const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ nodes: [], links: [] })
  },
  title: {
    type: String,
    default: '知识图谱 Knowledge Graph'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const graphContainer = ref(null)
let svg = null
let simulation = null
let zoom = null
let g = null  // 容器组，用于缩放

// 节点类型对应的颜色
const nodeColors = {
  herb: '#52c41a',      // 绿色 - 药材
  compound: '#faad14',  // 黄色 - 化合物
  gene: '#f5222d',      // 红色 - 基因
  prescription: '#8c8c8c', // 灰色 - 方剂
  disease: '#fa8c16',   // 橙色 - 疾病
  syndrome: '#722ed1'   // 紫色 - 证候
}

// 节点大小
const nodeSizes = {
  herb: 20,
  compound: 8,
  gene: 8,
  prescription: 10,
  disease: 10,
  syndrome: 10
}

// 创建力导向图
const createGraph = () => {
  if (!graphContainer.value || !props.data.nodes || props.data.nodes.length === 0) return

  // 清除之前的图
  d3.select(graphContainer.value).selectAll('*').remove()

  const container = graphContainer.value
  const width = container.clientWidth
  const height = 600

  // 创建SVG
  svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', [0, 0, width, height])

  // 创建缩放行为
  zoom = d3.zoom()
    .scaleExtent([0.1, 10])  // 缩放范围：0.1倍到10倍
    .on('zoom', (event) => {
      g.attr('transform', event.transform)
    })

  // 将缩放行为应用到 SVG
  svg.call(zoom)

  // 创建容器组，用于应用缩放和平移
  g = svg.append('g')

  // 创建箭头标记
  svg.append('defs').selectAll('marker')
    .data(['arrow'])
    .join('marker')
    .attr('id', d => d)
    .attr('viewBox', '0 -5 10 10')
    .attr('refX', 20)
    .attr('refY', 0)
    .attr('markerWidth', 6)
    .attr('markerHeight', 6)
    .attr('orient', 'auto')
    .append('path')
    .attr('d', 'M0,-5L10,0L0,5')
    .attr('fill', '#999')

  // 定义不同类型节点的聚集中心位置
  const clusterCenters = {
    herb: { x: width / 2, y: height / 2 },           // 中心位置 - 药材
    compound: { x: width * 0.2, y: height * 0.25 },  // 左上 - 化合物
    gene: { x: width * 0.8, y: height * 0.25 },      // 右上 - 基因
    prescription: { x: width * 0.8, y: height * 0.75 }, // 右下 - 方剂
    disease: { x: width * 0.2, y: height * 0.75 },   // 左下 - 疾病
    syndrome: { x: width / 2, y: height * 0.85 }     // 底部中心 - 证候
  }

  // 创建力导向模拟（集群布局）
  simulation = d3.forceSimulation(props.data.nodes)
    .force('link', d3.forceLink(props.data.links)
      .id(d => d.id)
      .distance(100)
      .strength(0.3))  // 降低连线强度，让节点更容易聚集
    .force('charge', d3.forceManyBody().strength(-100))  // 降低排斥力
    .force('x', d3.forceX().x(d => clusterCenters[d.type]?.x || width / 2).strength(0.5))  // X轴聚集力
    .force('y', d3.forceY().y(d => clusterCenters[d.type]?.y || height / 2).strength(0.5))  // Y轴聚集力
    .force('collision', d3.forceCollide().radius(d => nodeSizes[d.type] + 5).strength(0.7))  // 碰撞检测

  // 创建连线组（在容器组g中）
  const link = g.append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(props.data.links)
    .join('line')
    .attr('stroke', '#ddd')
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0.6)
    .attr('marker-end', 'url(#arrow)')

  // 创建节点组（在容器组g中）
  const node = g.append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(props.data.nodes)
    .join('g')
    .call(drag(simulation))

  // 添加圆形节点
  node.append('circle')
    .attr('r', d => nodeSizes[d.type])
    .attr('fill', d => nodeColors[d.type])
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'move')  // 改为移动光标，提示可拖动
    .on('dblclick', function(event, d) {
      // 双击节点解除固定，让它重新受力影响
      d.fx = null
      d.fy = null
      simulation.alpha(0.3).restart()
      
      // 视觉反馈：闪烁效果
      d3.select(this)
        .transition()
        .duration(100)
        .attr('stroke', nodeColors[d.type])
        .transition()
        .duration(200)
        .attr('stroke', '#fff')
    })

  // 添加节点标签
  node.append('text')
    .text(d => d.label)
    .attr('x', d => nodeSizes[d.type] + 5)
    .attr('y', 4)
    .attr('font-size', '12px')
    .attr('fill', '#333')
    .style('pointer-events', 'none')

  // 添加交互效果
  node.on('mouseover', function(event, d) {
    // 高亮当前节点
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', nodeSizes[d.type] * 1.5)
      .attr('stroke-width', 3)
      .attr('stroke', nodeColors[d.type])

    // 高亮相关的连线
    link
      .transition()
      .duration(200)
      .attr('stroke', l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          return nodeColors[d.type]
        }
        return '#ddd'
      })
      .attr('stroke-width', l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          return 3
        }
        return 1.5
      })
      .attr('stroke-opacity', l => {
        if (l.source.id === d.id || l.target.id === d.id) {
          return 1
        }
        return 0.2
      })

    // 高亮相关节点
    node.select('circle')
      .transition()
      .duration(200)
      .attr('opacity', n => {
        // 检查是否是相关节点
        const isConnected = props.data.links.some(l => 
          (l.source.id === d.id && l.target.id === n.id) ||
          (l.target.id === d.id && l.source.id === n.id) ||
          n.id === d.id
        )
        return isConnected ? 1 : 0.2
      })

    // 显示节点信息
    showTooltip(event, d)
  })
  .on('mouseout', function(event, d) {
    // 恢复节点
    d3.select(this).select('circle')
      .transition()
      .duration(200)
      .attr('r', nodeSizes[d.type])
      .attr('stroke-width', 2)
      .attr('stroke', '#fff')

    // 恢复连线
    link
      .transition()
      .duration(200)
      .attr('stroke', '#ddd')
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.6)

    // 恢复所有节点
    node.select('circle')
      .transition()
      .duration(200)
      .attr('opacity', 1)

    hideTooltip()
  })

  // 更新节点和连线位置
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)

    node.attr('transform', d => `translate(${d.x},${d.y})`)
  })
}

// 拖拽功能 - 优化版：拖动后节点保持在新位置
const drag = (simulation) => {
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart()
    event.subject.fx = event.subject.x
    event.subject.fy = event.subject.y
    
    // 视觉反馈：拖拽时放大节点
    d3.select(event.sourceEvent.target)
      .transition()
      .duration(100)
      .attr('r', nodeSizes[d.type] * 1.5)
      .attr('stroke-width', 3)
      .attr('stroke', nodeColors[d.type])
  }

  function dragged(event) {
    event.subject.fx = event.x
    event.subject.fy = event.y
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0)
    // 拖拽结束后保持节点固定在新位置（不释放 fx, fy）
    // 如果想让节点继续受力模拟影响，取消下面两行的注释：
    // event.subject.fx = null
    // event.subject.fy = null
    
    // 恢复节点大小
    d3.select(event.sourceEvent.target)
      .transition()
      .duration(200)
      .attr('r', nodeSizes[d.type])
      .attr('stroke-width', 2)
      .attr('stroke', '#fff')
  }

  return d3.drag()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended)
}

// 显示提示框
const showTooltip = (event, d) => {
  const tooltip = d3.select('body').append('div')
    .attr('class', 'graph-tooltip')
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
      <div><strong>${d.label}</strong></div>
      <div>类型: ${getTypeLabel(d.type)}</div>
      ${d.id ? `<div>ID: ${d.id}</div>` : ''}
    `)
}

// 隐藏提示框
const hideTooltip = () => {
  d3.selectAll('.graph-tooltip').remove()
}

// 获取类型标签
const getTypeLabel = (type) => {
  const labels = {
    herb: '药材',
    compound: '化合物',
    gene: '基因',
    prescription: '方剂',
    disease: '疾病',
    syndrome: '证候'
  }
  return labels[type] || type
}

// 缩放控制函数
const zoomIn = () => {
  if (svg && zoom) {
    svg.transition().duration(300).call(zoom.scaleBy, 1.3)
  }
}

const zoomOut = () => {
  if (svg && zoom) {
    svg.transition().duration(300).call(zoom.scaleBy, 0.7)
  }
}

const resetZoom = () => {
  if (svg && zoom) {
    svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
  }
}

// 监听数据变化
watch(() => props.data, () => {
  nextTick(() => {
    createGraph()
  })
}, { deep: true })

// 监听窗口大小变化
onMounted(() => {
  createGraph()
  
  window.addEventListener('resize', () => {
    if (simulation) {
      createGraph()
    }
  })
})
</script>

<style scoped>
.knowledge-graph-container {
  position: relative;
  width: 100%;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.graph-header {
  margin-bottom: 20px;
}

.header-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}

.graph-header h3 {
  font-size: 24px;
  color: #1a5f4a;
  margin: 0;
}

.usage-tips {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
  background: #f0f9ff;
  padding: 6px 12px;
  border-radius: 6px;
  border-left: 3px solid #2d8659;
}

.usage-tips .el-icon {
  color: #2d8659;
  font-size: 16px;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  padding: 12px;
  background: #f8fffe;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.legend-dot.herb {
  background: #52c41a;
}

.legend-dot.compound {
  background: #faad14;
}

.legend-dot.gene {
  background: #f5222d;
}

.legend-dot.prescription {
  background: #8c8c8c;
}

.legend-dot.disease {
  background: #fa8c16;
}

.legend-dot.syndrome {
  background: #722ed1;
}

.graph-container-wrapper {
  position: relative;
  width: 100%;
}

.graph-svg-container {
  width: 100%;
  min-height: 600px;
  border: 1px solid #e8f5ef;
  border-radius: 8px;
  background: #fafafa;
  position: relative;
  overflow: hidden;
  cursor: grab;
}

.graph-svg-container:active {
  cursor: grabbing;
}

.zoom-controls {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.zoom-controls :deep(.el-button) {
  background: white;
  border-color: #e8f5ef;
  color: #2d8659;
}

.zoom-controls :deep(.el-button:hover) {
  background: #e8f5ef;
  border-color: #2d8659;
  color: #1a5f4a;
}

.zoom-controls :deep(.el-button:active) {
  background: #d4ede3;
}

.graph-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #2d8659;
}

.loading-icon {
  font-size: 48px;
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

:deep(svg) {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

@media (max-width: 768px) {
  .header-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .usage-tips {
    font-size: 12px;
    padding: 4px 8px;
  }

  .usage-tips span {
    display: none;
  }

  .usage-tips::after {
    content: '拖动节点调整位置';
    font-size: 11px;
  }

  .legend {
    gap: 12px;
  }

  .legend-item {
    font-size: 12px;
  }

  .graph-svg-container {
    min-height: 400px;
  }
}
</style>


