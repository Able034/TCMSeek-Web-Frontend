<template>
  <div class="sigma-graph-container">
    <div class="graph-header">
      <h3 class="graph-title">
        <el-icon><Connection /></el-icon>
        {{ title }}
      </h3>
      <div class="graph-stats" v-if="stats.nodes > 0">
        <el-tag type="success" size="large">{{ stats.nodes }} {{ $t('common.nodes') }}</el-tag>
        <el-tag type="info" size="large">{{ stats.edges }} {{ $t('common.edges') }}</el-tag>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="graph-loading">
      <el-icon class="loading-icon"><Loading /></el-icon>
      <p>{{ $t('common.loading') }}...</p>
    </div>

    <!-- 控制面板 -->
    <div v-if="!loading && stats.nodes > 0" class="graph-controls">
      <el-button-group>
        <el-button @click="zoomIn" size="small" title="放大">
          <el-icon><ZoomIn /></el-icon>
        </el-button>
        <el-button @click="zoomOut" size="small" title="缩小">
          <el-icon><ZoomOut /></el-icon>
        </el-button>
      </el-button-group>
    </div>

    <!-- Sigma 容器 -->
    <div ref="sigmaContainer" class="sigma-container" :class="{ 'loading': loading }"></div>

    <!-- 图例 -->
    <div v-if="!loading && stats.nodes > 0" class="graph-legend">
      <div class="legend-title">{{ $t('common.legend') }}</div>
      <div class="legend-items">
        <div class="legend-item" v-for="item in legendItems" :key="item.type">
          <span class="legend-dot" :style="{ backgroundColor: item.color }"></span>
          <span class="legend-label">{{ item.label }}</span>
        </div>
      </div>
    </div>

    <!-- 节点信息提示 -->
    <div v-if="hoveredNode" class="node-tooltip" :style="tooltipStyle">
      <div class="tooltip-title">{{ hoveredNode.label }}</div>
      <div class="tooltip-type">{{ hoveredNode.type }}</div>
      <div class="tooltip-connections" v-if="hoveredNode.degree">
        {{ $t('common.connections') }}: {{ hoveredNode.degree }}
      </div>
    </div>

    <!-- 使用提示 -->
    <div v-if="!loading && stats.nodes > 0" class="usage-tips">
      <el-icon><InfoFilled /></el-icon>
      <span>{{ $t('common.graphTips') }}</span>
      <span class="tip-separator">|</span>
      <span>{{ $t('common.hoverHighlight') }}</span>
      <span class="tip-separator">|</span>
      <span>{{ $t('common.doubleClickNode') }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Connection, Loading, ZoomIn, ZoomOut, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import Sigma from 'sigma'
import Graph from 'graphology'
import forceAtlas2 from 'graphology-layout-forceatlas2'
import louvain from 'graphology-communities-louvain'

const { t } = useI18n()

// Props
const props = defineProps({
  data: {
    type: Object,
    required: true,
    default: () => ({ nodes: [], links: [] })
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: 'Knowledge Graph'
  },
  showLabels: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const sigmaContainer = ref(null)
let sigmaInstance = null
let graph = null
let layoutWorker = null

const stats = ref({ nodes: 0, edges: 0 })
const hoveredNode = ref(null)
const tooltipStyle = ref({})

// 节点颜色配置
const nodeColors = {
  herb: '#2d8659',          // 药材：深绿色
  prescription: '#1f2937',  // 方剂：黑色
  compound: '#3b82f6',      // 化合物：蓝色
  gene: '#ef4444',          // 基因：红色
  disease: '#f59e0b',       // 疾病：橙色
  syndrome: '#8b5cf6',      // 证候：紫色
  symptom: '#ec4899',       // 中医症状：粉色
  wm_symptom: '#06b6d4',    // 西医症状：青色
  center: '#ff6b00'         // 中心节点：橙红色（醒目且不与其他颜色冲突）
}

// 图例
const legendItems = computed(() => [
  { type: 'center', label: '⭐ ' + t('graph.centerNode'), color: nodeColors.center, isSpecial: true },
  { type: 'herb', label: t('medicine.herb.title'), color: nodeColors.herb },
  { type: 'prescription', label: t('medicine.prescription.title'), color: nodeColors.prescription },
  { type: 'compound', label: t('medicine.compound.title'), color: nodeColors.compound },
  { type: 'gene', label: t('medicine.gene.title'), color: nodeColors.gene },
  { type: 'disease', label: t('medicine.disease.title'), color: nodeColors.disease },
  { type: 'syndrome', label: t('medicine.syndrome.title'), color: nodeColors.syndrome },
  { type: 'symptom', label: t('graph.tcmSymptom'), color: nodeColors.symptom },
  { type: 'wm_symptom', label: t('graph.wmSymptom'), color: nodeColors.wm_symptom }
])

// 初始化图谱
const initGraph = () => {
  if (!sigmaContainer.value || props.loading) return

  console.log('🎨 初始化 Sigma.js 图谱...')
  
  // 兼容 links 和 edges 两种字段名
  const edges = props.data.links || props.data.edges || []
  const nodes = props.data.nodes || []
  
  console.log('📊 数据:', nodes.length, '个节点,', edges.length, '条边')

  // 重置布局标志
  isLayoutRunning = false

  // 清理旧实例（重要：先 kill sigma 再清理 graph）
  if (sigmaInstance) {
    try {
      sigmaInstance.kill()
      console.log('✅ 旧 Sigma 实例已清理')
    } catch (e) {
      console.warn('清理 Sigma 实例时出错:', e)
    }
    sigmaInstance = null
  }

  if (graph) {
    try {
      graph.clear()
      console.log('✅ 旧 Graph 数据已清理')
    } catch (e) {
      console.warn('清理 Graph 时出错:', e)
    }
    graph = null
  }

  // 如果没有数据，不初始化
  if (!nodes || nodes.length === 0) {
    console.log('⚠️ 没有节点数据')
    return
  }

  // 创建新图
  graph = new Graph()

  // 计算节点统计信息
  const nodeTypeCount = {}
  nodes.forEach(node => {
    const type = node.type || 'default'
    nodeTypeCount[type] = (nodeTypeCount[type] || 0) + 1
  })
  
  console.log('📊 节点类型统计:', Object.entries(nodeTypeCount).map(([type, count]) => 
    `${type}: ${count}个`
  ).join(', '))

  // 大规模数据布局策略：均匀随机分布在整个画布上
  // 根据节点总数计算画布大小，确保节点间有足够间距
  const totalNodes = nodes.length
  const nodeDensity = 0.0005  // 降低密度系数（从0.0015降到0.0005），画布扩大约1.7倍
  const canvasArea = totalNodes / nodeDensity  // 总画布面积
  const canvasSize = Math.sqrt(canvasArea)  // 画布边长
  
  console.log(`📐 画布计算: ${totalNodes}个节点, 画布大小${canvasSize.toFixed(0)}px × ${canvasSize.toFixed(0)}px, 密度${nodeDensity}`)

  // 添加节点 - 完全随机均匀分布
  nodes.forEach(node => {
    try {
      const nodeType = node.type || 'default'
      const nodeColor = nodeColors[nodeType] || '#999999'
      const isCenter = node.isCenter === true
      
      // 中心节点放在原点，其他节点随机分布
      let x, y
      if (isCenter) {
        x = 0
        y = 0
      } else {
        x = (Math.random() - 0.5) * canvasSize
        y = (Math.random() - 0.5) * canvasSize
      }
      
      graph.addNode(node.id, {
        label: isCenter ? `⭐ ${node.label || node.id}` : (node.label || node.id),  // 中心节点添加星标
        nodeType: nodeType,  // 保存类型信息
        isCenter: isCenter,  // ⭐ 重要：标记中心节点
        size: isCenter ? 20 : 3,  // 中心节点更大
        color: isCenter ? nodeColors.center : nodeColor,  // 中心节点使用橙红色
        originalColor: isCenter ? nodeColors.center : nodeColor,  // 保存原始颜色
        x: x,
        y: y,
        borderColor: isCenter ? '#fff' : undefined,  // 中心节点添加白色边框
        borderSize: isCenter ? 3 : 0  // 边框宽度
      })
      
      if (isCenter) {
        console.log(`⭐ 中心节点已添加: ${node.label} (${node.id}) at (0, 0)`)
      }
    } catch (err) {
      console.warn('添加节点失败:', node.id, err)
    }
  })

  // 添加边（针对大规模数据优化）
  edges.forEach((link, index) => {
    try {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source
      const targetId = typeof link.target === 'object' ? link.target.id : link.target
      
      if (graph.hasNode(sourceId) && graph.hasNode(targetId)) {
        graph.addEdge(sourceId, targetId, {
          size: 0.3,           // 进一步减小边宽度（大规模图谱）
          color: '#f0f0f0',    // 深灰色，适配黑色背景
          type: 'line'         // 使用直线，性能更好
        })
      }
    } catch (err) {
      console.warn('添加边失败:', link, err)
    }
  })

  stats.value = {
    nodes: graph.order,
    edges: graph.size
  }

  console.log('✅ 图数据构建完成:', stats.value.nodes, '个节点,', stats.value.edges, '条边')

  // 根据节点度数调整节点大小（模拟第一张图的效果）
  let minDegree = Infinity
  let maxDegree = 0
  
  graph.forEachNode((node) => {
    const degree = graph.degree(node)
    minDegree = Math.min(minDegree, degree)
    maxDegree = Math.max(maxDegree, degree)
  })
  
  console.log(`📊 节点度数范围: ${minDegree} - ${maxDegree}`)
  
  graph.forEachNode((node, attrs) => {
    const degree = graph.degree(node)
    
    // 中心节点保持固定大小，更大更突出
    if (attrs.isCenter) {
      graph.setNodeAttribute(node, 'size', 25)  // 中心节点固定为 25
      graph.setNodeAttribute(node, 'degree', degree)
      graph.setNodeAttribute(node, 'zIndex', 999)  // 中心节点在最上层
    } else {
      // 度数越大，节点越大（对数缩放避免差异过大）
      const normalizedDegree = (degree - minDegree) / (maxDegree - minDegree || 1)
      const size = 3 + normalizedDegree * 12  // 3px 到 15px（给中心节点留空间）
      
      graph.setNodeAttribute(node, 'size', size)
      graph.setNodeAttribute(node, 'degree', degree)
    }
  })
  
  // 检测社区结构（可选，用于着色）
  // const communities = louvain(graph)
  // console.log('🏘️ 检测到社区数量:', new Set(Object.values(communities)).size)
  
  console.log('✅ 节点大小已根据度数调整')

  // 初始位置已经按聚类设置，不需要额外的圆形布局
  // circular.assign(graph)

  // 创建 Sigma 实例
  try {
    sigmaInstance = new Sigma(graph, sigmaContainer.value, {
      renderEdgeLabels: false,
      defaultNodeColor: '#999',
      defaultEdgeColor: '#e5e5e5',
      labelSize: 12,
      labelWeight: '600',
      labelColor: { color: '#000' },  // 黑色标签
      enableEdgeEvents: true,
      nodeBorderColor: { attribute: 'borderColor' },  // 启用节点边框
      nodeBorderSize: { attribute: 'borderSize' },
      // 社区图谱优化配置
      hideEdgesOnMove: true,           // 移动时隐藏边
      hideLabelsOnMove: false,         // 移动时也显示标签（重要节点）
      renderLabels: props.showLabels,
      labelRenderedSizeThreshold: 1,   // 降低阈值，更容易显示标签
      labelDensity: 0.5,               // 提高标签密度
      labelGridCellSize: 100,
      zIndex: true,
      // 额外的性能优化
      minCameraRatio: 0.1,
      maxCameraRatio: 10
    })

    console.log('✅ Sigma 实例创建成功')

    // 绑定事件
    bindEvents()

    // 立即调整视图到合适的初始位置
    setTimeout(() => {
      fitGraphToView(true)  // focusOnCenter = true
      console.log('📷 初始视图已自动调整')
      
      // 在视图调整后再开始布局
      setTimeout(() => {
        startLayout()
      }, 300)
    }, 100)

  } catch (err) {
    console.error('❌ Sigma 实例创建失败:', err)
  }
}

// Props - 添加 emit
const emit = defineEmits(['nodeDoubleClick'])

// 绑定事件
const bindEvents = () => {
  if (!sigmaInstance) return

  // 节点双击事件
  sigmaInstance.on('doubleClickNode', ({ node }) => {
    const nodeData = graph.getNodeAttributes(node)
    console.log('双击节点:', nodeData)
    
    // 发送事件给父组件
    emit('nodeDoubleClick', {
      id: node,
      label: nodeData.label,
      type: nodeData.nodeType,
      isCenter: nodeData.isCenter
    })
  })

  // 节点悬停
  sigmaInstance.on('enterNode', ({ node }) => {
    const nodeData = graph.getNodeAttributes(node)
    const degree = graph.degree(node)
    
    hoveredNode.value = {
      label: nodeData.label,
      type: t(`medicine.${nodeData.nodeType}.title`) || nodeData.nodeType,
      degree: degree
    }

    // 获取所有相邻节点和相关的边
    const neighbors = new Set(graph.neighbors(node))
    const connectedEdges = new Set()
    
    // 收集所有连接到当前节点的边
    graph.forEachEdge(node, (edge) => {
      connectedEdges.add(edge)
    })

    // 高亮当前节点和相邻节点，暗化其他节点
    graph.forEachNode((n, attrs) => {
      if (n === node) {
        // 当前节点：放大并高亮
        if (!attrs.originalSize) {
          graph.setNodeAttribute(n, 'originalSize', attrs.size)
          graph.setNodeAttribute(n, 'originalColor', attrs.color)
        }
        graph.setNodeAttribute(n, 'size', attrs.originalSize * 2)
        graph.setNodeAttribute(n, 'highlighted', true)
        graph.setNodeAttribute(n, 'zIndex', attrs.isCenter ? 999 : 1)  // 中心节点始终在最上层
      } else if (neighbors.has(n)) {
        // 相邻节点：保持原样但稍微放大
        if (!attrs.originalSize) {
          graph.setNodeAttribute(n, 'originalSize', attrs.size)
          graph.setNodeAttribute(n, 'originalColor', attrs.color)
        }
        graph.setNodeAttribute(n, 'size', attrs.originalSize * 1.5)
        graph.setNodeAttribute(n, 'highlighted', true)
        graph.setNodeAttribute(n, 'zIndex', attrs.isCenter ? 999 : 0)  // 中心节点始终在最上层
      } else {
        // 其他节点：暗化（但中心节点保持可见）
        if (!attrs.originalColor) {
          graph.setNodeAttribute(n, 'originalColor', attrs.color)
        }
        // 中心节点即使不相关也保持可见
        if (attrs.isCenter) {
          graph.setNodeAttribute(n, 'color', attrs.originalColor)
          graph.setNodeAttribute(n, 'zIndex', 999)
        } else {
          graph.setNodeAttribute(n, 'color', '#e0e0e0')  // 深灰色，适配黑色背景
          graph.setNodeAttribute(n, 'zIndex', 0)
        }
      }
    })

    // 高亮连接的边，暗化其他边
    graph.forEachEdge((edge, attrs) => {
      if (connectedEdges.has(edge)) {
        // 连接的边：高亮显示
        if (!attrs.originalColor) {
          graph.setEdgeAttribute(edge, 'originalColor', attrs.color)
          graph.setEdgeAttribute(edge, 'originalSize', attrs.size)
        }
        graph.setEdgeAttribute(edge, 'color', '#ff6b6b')  // 高亮为亮青色，适配暗色背景
        graph.setEdgeAttribute(edge, 'size', 2)           // 加粗
        graph.setEdgeAttribute(edge, 'zIndex', 1)
      } else {
        // 其他边：暗化
        if (!attrs.originalColor) {
          graph.setEdgeAttribute(edge, 'originalColor', attrs.color)
        }
        graph.setEdgeAttribute(edge, 'color', '#fafafa')  // 几乎不可见，适配黑色背景
        graph.setEdgeAttribute(edge, 'zIndex', 0)
      }
    })

    sigmaInstance.refresh()
  })

  sigmaInstance.on('leaveNode', () => {
    hoveredNode.value = null

    // 恢复所有节点
    graph.forEachNode((n, attrs) => {
      graph.removeNodeAttribute(n, 'highlighted')
      
      // 恢复zIndex（中心节点保持在最上层）
      if (attrs.isCenter) {
        graph.setNodeAttribute(n, 'zIndex', 999)
      } else {
        graph.removeNodeAttribute(n, 'zIndex')
      }
      
      if (attrs.originalSize) {
        graph.setNodeAttribute(n, 'size', attrs.originalSize)
      }
      if (attrs.originalColor) {
        graph.setNodeAttribute(n, 'color', attrs.originalColor)
      }
    })

    // 恢复所有边
    graph.forEachEdge((edge, attrs) => {
      graph.removeEdgeAttribute(edge, 'zIndex')
      if (attrs.originalSize) {
        graph.setEdgeAttribute(edge, 'size', attrs.originalSize)
      }
      if (attrs.originalColor) {
        graph.setEdgeAttribute(edge, 'color', attrs.originalColor)
      }
    })

    sigmaInstance.refresh()
  })

  // 鼠标移动（更新 tooltip 位置）
  sigmaInstance.getMouseCaptor().on('mousemove', (e) => {
    if (hoveredNode.value) {
      tooltipStyle.value = {
        left: `${e.x + 10}px`,
        top: `${e.y + 10}px`
      }
    }
  })
}

// 自动调整视图以中心节点为焦点
const fitGraphToView = (focusOnCenter = true) => {
  if (!graph || !sigmaInstance) return

  try {
    // 查找中心节点
    let centerNode = null
    let centerNodePos = null
    
    if (focusOnCenter) {
      graph.forEachNode((node, attrs) => {
        if (attrs.isCenter) {
          centerNode = node
          centerNodePos = { x: attrs.x, y: attrs.y }
        }
      })
    }
    
    // 计算所有节点的边界
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    graph.forEachNode((node, attrs) => {
      const x = attrs.x
      const y = attrs.y
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    })
    
    // 计算中心点和范围
    let centerX, centerY
    if (centerNodePos && focusOnCenter) {
      // 优先使用中心节点的位置
      centerX = centerNodePos.x
      centerY = centerNodePos.y
      console.log(`🎯 聚焦中心节点: (${centerX.toFixed(0)}, ${centerY.toFixed(0)})`)
    } else {
      // 否则使用所有节点的几何中心
      centerX = (minX + maxX) / 2
      centerY = (minY + maxY) / 2
    }
    
    const rangeX = maxX - minX
    const rangeY = maxY - minY
    
    // 获取容器尺寸
    const containerWidth = sigmaContainer.value?.clientWidth || window.innerWidth
    const containerHeight = sigmaContainer.value?.clientHeight || 700
    
    // 计算需要的缩放比例（添加 50% 的边距，让视图更宽松）
    const ratioX = rangeX / containerWidth
    const ratioY = rangeY / containerHeight
    const ratio = Math.max(ratioX, ratioY) * 1.8  // 1.8 是边距系数，确保能看到所有节点
    
    // 获取相机并设置新状态
    const camera = sigmaInstance.getCamera()
    camera.animate(
      {
        x: centerX,
        y: centerY,
        ratio: Math.max(ratio, 0.5), // 确保 ratio 不会太小（至少0.5）
        angle: 0
      },
      {
        duration: 500,
        easing: 'quadraticInOut'
      }
    )
    
    console.log(`📷 视图已调整: 中心(${centerX.toFixed(0)}, ${centerY.toFixed(0)}), 范围(${rangeX.toFixed(0)} × ${rangeY.toFixed(0)}), ratio=${ratio.toFixed(3)}`)
  } catch (error) {
    console.error('调整视图失败:', error)
  }
}

// 布局运行标志
let isLayoutRunning = false

// 开始 ForceAtlas2 布局（LinLog 模式，社区结构分离）
const startLayout = () => {
  if (!graph) return
  
  // 防止重复运行
  if (isLayoutRunning) {
    console.log('⚠️ 布局已在运行中，跳过')
    return
  }

  isLayoutRunning = true
  console.log('🚀 开始 ForceAtlas2 社区布局计算（LinLog 模式）...')

  const settings = forceAtlas2.inferSettings(graph)
  
  // 运行布局（针对社区结构优化）
  let iterations = 0
  const maxIterations = 150  // 减少迭代次数，避免过度收缩
  
  let layoutRunning = true
  
  const runLayout = () => {
    if (iterations < maxIterations && layoutRunning) {
      // 执行 ForceAtlas2 迭代 - LinLog 模式让社区自然分离
      forceAtlas2.assign(graph, { 
        iterations: 1,
        settings: {
          ...settings,
          gravity: 1,             // 适中的引力，防止飞散
          scalingRatio: 10,       // 适中的排斥力
          slowDown: 5,            // 放慢速度，让布局更稳定
          barnesHutOptimize: true,
          barnesHutTheta: 0.5,    // 优化大规模计算
          linLogMode: true,       // ⭐ 关键：启用 LinLog 模式，社区会自然分离
          strongGravityMode: false,
          edgeWeightInfluence: 1,
          outboundAttractionDistribution: false  // 不使用出度分布
        }
      })
      
      // ⭐ 重要：固定中心节点位置，防止它被推走
      graph.forEachNode((node, attrs) => {
        if (attrs.isCenter) {
          graph.setNodeAttribute(node, 'x', 0)
          graph.setNodeAttribute(node, 'y', 0)
        }
      })
      
      if (sigmaInstance) {
        sigmaInstance.refresh()
      }
      
      iterations++
      
      // 每30次迭代输出进度
      if (iterations % 30 === 0) {
        console.log(`📈 布局进度: ${iterations}/${maxIterations} (${(iterations/maxIterations*100).toFixed(0)}%)`)
      }
      
      requestAnimationFrame(runLayout)
    } else {
      layoutRunning = false
      isLayoutRunning = false  // 重置标志
      console.log('✅ 社区布局计算完成 - 社区结构应已分离')
    }
  }

  requestAnimationFrame(runLayout)
}

// 缩放控制
const zoomIn = () => {
  if (sigmaInstance) {
    const camera = sigmaInstance.getCamera()
    camera.animatedZoom({ duration: 300 })
  }
}

const zoomOut = () => {
  if (sigmaInstance) {
    const camera = sigmaInstance.getCamera()
    camera.animatedUnzoom({ duration: 300 })
  }
}

// 监听数据变化（使用节流避免频繁重建）
let updateTimer = null
watch(() => props.data, (newData, oldData) => {
  // 只在节点数量变化时才重新初始化
  const nodeCountChanged = !oldData || (newData.nodes?.length !== oldData.nodes?.length)
  const newEdges = newData.links || newData.edges || []
  const oldEdges = oldData ? (oldData.links || oldData.edges || []) : []
  const edgeCountChanged = !oldData || (newEdges.length !== oldEdges.length)
  
  if (nodeCountChanged || edgeCountChanged) {
    console.log('📡 数据更新，重新初始化图谱')
    
    // 清除之前的定时器
    if (updateTimer) {
      clearTimeout(updateTimer)
    }
    
    // 延迟100ms执行，避免连续更新
    updateTimer = setTimeout(() => {
      initGraph()
      updateTimer = null
    }, 100)
  }
}, { deep: true })

watch(() => props.showLabels, (show) => {
  if (sigmaInstance) {
    sigmaInstance.setSetting('renderLabels', show)
  }
})

// 生命周期
onMounted(() => {
  console.log('🎬 SigmaGraph 组件挂载')
  setTimeout(() => {
    initGraph()
  }, 100)
})

onBeforeUnmount(() => {
  console.log('🛑 清理 Sigma 实例')
  
  // 清理定时器
  if (updateTimer) {
    clearTimeout(updateTimer)
    updateTimer = null
  }
  
  if (sigmaInstance) {
    try {
      sigmaInstance.kill()
    } catch (e) {
      console.warn('卸载时清理 Sigma 失败:', e)
    }
    sigmaInstance = null
  }
  
  if (graph) {
    try {
      graph.clear()
    } catch (e) {
      console.warn('卸载时清理 Graph 失败:', e)
    }
    graph = null
  }
})
</script>

<style scoped>
.sigma-graph-container {
  position: relative;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.graph-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 30px;
  border-bottom: 2px solid #e8f5ef;
}

.graph-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 24px;
  color: #1a5f4a;
  margin: 0;
}

.graph-title .el-icon {
  font-size: 28px;
}

.graph-stats {
  display: flex;
  gap: 10px;
}

.graph-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
  color: #2d8659;
}

.loading-icon {
  font-size: 48px;
  animation: rotate 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.graph-controls {
  display: flex;
  gap: 10px;
  padding: 15px 30px;
  background: #f8fffe;
  border-bottom: 1px solid #e8f5ef;
  align-items: center;
}

.sigma-container {
  width: 100%;
  height: 700px;
  background: #f8fffe;
  position: relative;
}

.sigma-container.loading {
  height: 500px;
}

.graph-legend {
  position: absolute;
  top: 80px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.legend-title {
  font-weight: 600;
  color: #1a5f4a;
  margin-bottom: 10px;
  font-size: 14px;
}

.legend-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 2px solid transparent;
}

.legend-item:first-child .legend-dot {
  border-color: #fff;
  box-shadow: 0 0 0 2px #ff6b00;
}

.legend-label {
  color: #333;
}

.legend-item:first-child .legend-label {
  font-weight: 600;
  color: #ff6b00;
}

.node-tooltip {
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 10px 15px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tooltip-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.tooltip-type {
  color: #94a3b8;
  font-size: 12px;
  margin-bottom: 4px;
}

.tooltip-connections {
  color: #cbd5e1;
  font-size: 12px;
}

.usage-tips {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(45, 134, 89, 0.9);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.tip-separator {
  margin: 0 4px;
  opacity: 0.6;
}

@media (max-width: 768px) {
  .graph-controls {
    flex-wrap: wrap;
    padding: 10px 15px;
  }

  .sigma-container {
    height: 500px;
  }

  .graph-legend {
    top: 60px;
    right: 10px;
    padding: 10px;
  }
}
</style>
