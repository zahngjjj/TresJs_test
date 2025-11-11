<template>
  <div class="dxf-canvas-viewer">
    <h1>🎨 DXF 文件转 Canvas 渲染器</h1>
    
    <!-- 文件上传和控制面板 -->
    <div class="control-panel">
      <div class="file-upload-section">
        <h3>📁 DXF 文件上传</h3>
        <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
          <input 
            type="file" 
            ref="fileInput" 
            @change="handleFileSelect" 
            accept=".dxf"
            style="display: none"
          >
          <div class="upload-content" @click="$refs.fileInput.click()">
            <div class="upload-icon">📄</div>
            <p>点击选择或拖拽 DXF 文件到此处</p>
            <small>支持 .dxf 格式文件</small>
          </div>
        </div>
        
        <div class="sample-files" v-if="!dxfData">
          <h4>或选择示例文件：</h4>
          <button @click="loadSampleDXF('sample1')" class="sample-btn">
            📐 建筑平面图
          </button>
          <button @click="loadSampleDXF('sample2')" class="sample-btn">
            ⚙️ 机械零件图
          </button>
        </div>
      </div>

      <div class="render-controls" v-if="dxfData">
        <h3>🎛️ 渲染控制</h3>
        
        <div class="layer-controls">
          <h4>图层控制</h4>
          <div class="layer-list">
            <div v-for="layer in layers" :key="layer.name" class="layer-item">
              <label>
                <input 
                  type="checkbox" 
                  v-model="layer.visible" 
                  @change="redrawCanvas"
                >
                <span class="layer-color" :style="{ backgroundColor: layer.color }"></span>
                <span>{{ layer.name }} ({{ layer.count }})</span>
              </label>
            </div>
          </div>
        </div>

        <div class="entity-controls">
          <h4>实体类型</h4>
          <div class="entity-list">
            <label v-for="(enabled, type) in entityTypes" :key="type">
              <input 
                type="checkbox" 
                v-model="entityTypes[type]" 
                @change="redrawCanvas"
              >
              <span>{{ getEntityTypeName(type) }} ({{ getEntityCount(type) }})</span>
            </label>
          </div>
        </div>

        <div class="view-controls">
          <h4>视图控制</h4>
          <div class="control-buttons">
            <button @click="zoomIn">🔍+ 放大</button>
            <button @click="zoomOut">🔍- 缩小</button>
            <button @click="resetView">🎯 重置视图</button>
            <button @click="fitToCanvas">📐 适应画布</button>
          </div>
          
          <div class="view-info">
            <p>缩放: {{ Math.round(scale * 100) }}%</p>
            <p>偏移: ({{ Math.round(offsetX) }}, {{ Math.round(offsetY) }})</p>
          </div>
        </div>

        <div class="render-options">
          <h4>渲染选项</h4>
          <label>
            <input type="checkbox" v-model="renderOptions.showGrid" @change="redrawCanvas">
            显示网格
          </label>
          <label>
            <input type="checkbox" v-model="renderOptions.showAxes" @change="redrawCanvas">
            显示坐标轴
          </label>
          <label>
            <input type="checkbox" v-model="renderOptions.antiAlias" @change="redrawCanvas">
            抗锯齿
          </label>
          <label>
            <input type="checkbox" v-model="renderOptions.showBounds" @change="redrawCanvas">
            显示边界框
          </label>
        </div>
      </div>
    </div>

    <!-- 解析状态面板 -->
    <div class="status-panel" v-if="isLoading || dxfData">
      <div class="status-header">
        <h3>📊 解析状态</h3>
        <button v-if="dxfData" @click="exportCanvas" class="export-btn">💾 导出图像</button>
      </div>
      
      <div v-if="isLoading" class="loading-info">
        <div class="loading-spinner"></div>
        <p>正在解析 DXF 文件...</p>
      </div>
      
      <div v-if="dxfData" class="dxf-info">
        <div class="info-grid">
          <div class="info-item">
            <span>文件版本:</span>
            <span>{{ dxfData.header?.ACADVER || 'Unknown' }}</span>
          </div>
          <div class="info-item">
            <span>实体总数:</span>
            <span>{{ dxfData.entities?.length || 0 }}</span>
          </div>
          <div class="info-item">
            <span>图层数量:</span>
            <span>{{ layers.length }}</span>
          </div>
          <div class="info-item">
            <span>图纸范围:</span>
            <span>{{ formatBounds(bounds) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Canvas 画布 -->
    <div class="canvas-container">
      <canvas 
        ref="canvas" 
        @mousedown="startPan"
        @mousemove="handlePan"
        @mouseup="endPan"
        @wheel="handleZoom"
        :style="{ cursor: isPanning ? 'grabbing' : 'grab' }"
      ></canvas>
      
      <div class="canvas-overlay" v-if="!dxfData">
        <div class="overlay-content">
          <h2>🎨 DXF Canvas 渲染器</h2>
          <p>上传 DXF 文件开始渲染</p>
        </div>
      </div>
    </div>

    <!-- 实体详情面板 -->
    <div class="entity-details" v-if="selectedEntity">
      <h3>🔍 实体详情</h3>
      <div class="entity-info">
        <p><strong>类型:</strong> {{ selectedEntity.type }}</p>
        <p><strong>图层:</strong> {{ selectedEntity.layer || 'Default' }}</p>
        <p><strong>颜色:</strong> {{ selectedEntity.color || 'ByLayer' }}</p>
        <div v-if="selectedEntity.type === 'LINE'">
          <p><strong>起点:</strong> ({{ selectedEntity.start?.x?.toFixed(2) }}, {{ selectedEntity.start?.y?.toFixed(2) }})</p>
          <p><strong>终点:</strong> ({{ selectedEntity.end?.x?.toFixed(2) }}, {{ selectedEntity.end?.y?.toFixed(2) }})</p>
        </div>
        <div v-if="selectedEntity.type === 'CIRCLE'">
          <p><strong>圆心:</strong> ({{ selectedEntity.center?.x?.toFixed(2) }}, {{ selectedEntity.center?.y?.toFixed(2) }})</p>
          <p><strong>半径:</strong> {{ selectedEntity.radius?.toFixed(2) }}</p>
        </div>
        <div v-if="selectedEntity.type === 'ARC'">
          <p><strong>圆心:</strong> ({{ selectedEntity.center?.x?.toFixed(2) }}, {{ selectedEntity.center?.y?.toFixed(2) }})</p>
          <p><strong>半径:</strong> {{ selectedEntity.radius?.toFixed(2) }}</p>
          <p><strong>起始角:</strong> {{ selectedEntity.startAngle?.toFixed(2) }}°</p>
          <p><strong>结束角:</strong> {{ selectedEntity.endAngle?.toFixed(2) }}°</p>
        </div>
      </div>
      <button @click="selectedEntity = null" class="close-btn">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

// 基础状态
const canvas = ref(null)
const fileInput = ref(null)
const dxfData = ref(null)
const isLoading = ref(false)
const selectedEntity = ref(null)

// 视图控制
const scale = ref(1)
const offsetX = ref(0)
const offsetY = ref(0)
const isPanning = ref(false)
const lastPanPoint = ref({ x: 0, y: 0 })

// 图层和实体控制
const layers = ref([])
const entityTypes = reactive({
  LINE: true,
  CIRCLE: true,
  ARC: true,
  POLYLINE: true,
  LWPOLYLINE: true,
  TEXT: true,
  POINT: true,
  INSERT: true
})

// 渲染选项
const renderOptions = reactive({
  showGrid: true,
  showAxes: true,
  antiAlias: true,
  showBounds: false
})

// 图纸边界
const bounds = ref({
  minX: 0, minY: 0, maxX: 0, maxY: 0
})

// DXF 解析器 (简化版实现)
class SimpleDXFParser {
  constructor() {
    this.entities = []
    this.layers = new Map()
    this.header = {}
  }

  parseSync(dxfText) {
    console.log('开始解析 DXF 文件...')
    
    const lines = dxfText.split('\n').map(line => line.trim())
    let currentSection = null
    let currentEntity = null
    let groupCode = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 检查是否是组码
      if (/^\d+$/.test(line)) {
        groupCode = parseInt(line)
        continue
      }
      
      // 处理不同的组码
      if (groupCode !== null) {
        this.processGroupCode(groupCode, line, currentSection, currentEntity)
        
        // 检查节开始
        if (groupCode === 2) {
          if (line === 'HEADER') currentSection = 'HEADER'
          else if (line === 'ENTITIES') currentSection = 'ENTITIES'
          else if (line === 'TABLES') currentSection = 'TABLES'
        }
        
        // 检查实体开始
        if (groupCode === 0 && currentSection === 'ENTITIES') {
          if (currentEntity) {
            this.entities.push(currentEntity)
          }
          currentEntity = this.createEntity(line)
        }
        
        groupCode = null
      }
    }
    
    // 添加最后一个实体
    if (currentEntity) {
      this.entities.push(currentEntity)
    }
    
    console.log(`解析完成，共找到 ${this.entities.length} 个实体`)
    
    return {
      entities: this.entities,
      layers: Array.from(this.layers.values()),
      header: this.header
    }
  }
  
  processGroupCode(code, value, section, entity) {
    if (!entity) return
    
    switch (code) {
      case 8: // 图层名
        entity.layer = value
        if (!this.layers.has(value)) {
          this.layers.set(value, {
            name: value,
            color: this.getRandomColor(),
            visible: true
          })
        }
        break
      case 10: // X 坐标
        if (!entity.start) entity.start = {}
        entity.start.x = parseFloat(value)
        break
      case 20: // Y 坐标
        if (!entity.start) entity.start = {}
        entity.start.y = parseFloat(value)
        break
      case 11: // X 坐标 (终点)
        if (!entity.end) entity.end = {}
        entity.end.x = parseFloat(value)
        break
      case 21: // Y 坐标 (终点)
        if (!entity.end) entity.end = {}
        entity.end.y = parseFloat(value)
        break
      case 40: // 半径
        entity.radius = parseFloat(value)
        break
      case 50: // 起始角度
        entity.startAngle = parseFloat(value)
        break
      case 51: // 结束角度
        entity.endAngle = parseFloat(value)
        break
      case 62: // 颜色
        entity.color = parseInt(value)
        break
    }
  }
  
  createEntity(type) {
    const entity = { type: type.toUpperCase() }
    
    // 为不同类型的实体设置默认属性
    switch (entity.type) {
      case 'CIRCLE':
        entity.center = { x: 0, y: 0 }
        entity.radius = 1
        break
      case 'ARC':
        entity.center = { x: 0, y: 0 }
        entity.radius = 1
        entity.startAngle = 0
        entity.endAngle = 360
        break
      case 'LINE':
        entity.start = { x: 0, y: 0 }
        entity.end = { x: 0, y: 0 }
        break
    }
    
    return entity
  }
  
  getRandomColor() {
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080']
    return colors[Math.floor(Math.random() * colors.length)]
  }
}

// 文件处理
const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    loadDXFFile(file)
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  const file = event.dataTransfer.files[0]
  if (file && file.name.toLowerCase().endsWith('.dxf')) {
    loadDXFFile(file)
  }
}

const loadDXFFile = async (file) => {
  isLoading.value = true
  
  try {
    const text = await file.text()
    await parseDXF(text)
  } catch (error) {
    console.error('DXF 文件加载失败:', error)
    alert('DXF 文件解析失败，请检查文件格式')
  } finally {
    isLoading.value = false
  }
}

const loadSampleDXF = async (sampleType) => {
  isLoading.value = true
  
  try {
    // 生成示例 DXF 数据
    const sampleData = generateSampleDXF(sampleType)
    await parseDXF(sampleData)
  } catch (error) {
    console.error('示例文件加载失败:', error)
  } finally {
    isLoading.value = false
  }
}

// DXF 解析
const parseDXF = async (dxfText) => {
  console.log('开始解析 DXF...')
  
  const parser = new SimpleDXFParser()
  const parsed = parser.parseSync(dxfText)
  
  dxfData.value = parsed
  
  // 设置图层
  layers.value = parsed.layers.map(layer => ({
    ...layer,
    count: parsed.entities.filter(e => e.layer === layer.name).length
  }))
  
  // 计算边界
  calculateBounds(parsed.entities)
  
  // 初始化画布
  await nextTick()
  initCanvas()
  redrawCanvas()
}

// 生成示例 DXF 数据
const generateSampleDXF = (type) => {
  if (type === 'sample1') {
    // 建筑平面图示例
    return `0
SECTION
2
ENTITIES
0
LINE
8
WALLS
10
0
20
0
11
100
21
0
0
LINE
8
WALLS
10
100
20
0
11
100
21
80
0
LINE
8
WALLS
10
100
20
80
11
0
21
80
0
LINE
8
WALLS
10
0
20
80
11
0
21
0
0
CIRCLE
8
FURNITURE
10
20
20
20
40
20
15
0
CIRCLE
8
FURNITURE
10
80
20
60
40
10
0
ENDSEC
0
EOF`
  } else {
    // 机械零件图示例
    return `0
SECTION
2
ENTITIES
0
CIRCLE
8
OUTLINE
10
50
20
50
40
25
0
CIRCLE
8
HOLES
10
50
20
50
40
5
0
CIRCLE
8
HOLES
10
30
20
30
40
3
0
CIRCLE
8
HOLES
10
70
20
30
40
3
0
CIRCLE
8
HOLES
10
30
20
70
40
3
0
CIRCLE
8
HOLES
10
70
20
70
40
3
0
LINE
8
CENTERLINE
10
25
20
50
11
75
21
50
0
LINE
8
CENTERLINE
10
50
20
25
11
50
21
75
0
ENDSEC
0
EOF`
  }
}

// 边界计算
const calculateBounds = (entities) => {
  let minX = Infinity, minY = Infinity
  let maxX = -Infinity, maxY = -Infinity
  
  entities.forEach(entity => {
    switch (entity.type) {
      case 'LINE':
        if (entity.start && entity.end) {
          minX = Math.min(minX, entity.start.x, entity.end.x)
          minY = Math.min(minY, entity.start.y, entity.end.y)
          maxX = Math.max(maxX, entity.start.x, entity.end.x)
          maxY = Math.max(maxY, entity.start.y, entity.end.y)
        }
        break
      case 'CIRCLE':
      case 'ARC':
        if (entity.center && entity.radius) {
          minX = Math.min(minX, entity.center.x - entity.radius)
          minY = Math.min(minY, entity.center.y - entity.radius)
          maxX = Math.max(maxX, entity.center.x + entity.radius)
          maxY = Math.max(maxY, entity.center.y + entity.radius)
        }
        break
    }
  })
  
  bounds.value = { minX, minY, maxX, maxY }
}

// Canvas 初始化
const initCanvas = () => {
  if (!canvas.value) return
  
  const ctx = canvas.value.getContext('2d')
  canvas.value.width = 800
  canvas.value.height = 600
  
  // 设置抗锯齿
  if (renderOptions.antiAlias) {
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
  }
}

// Canvas 重绘
const redrawCanvas = () => {
  if (!canvas.value || !dxfData.value) return
  
  const ctx = canvas.value.getContext('2d')
  const width = canvas.value.width
  const height = canvas.value.height
  
  // 清空画布
  ctx.clearRect(0, 0, width, height)
  
  // 设置变换
  ctx.save()
  ctx.translate(width / 2 + offsetX.value, height / 2 + offsetY.value)
  ctx.scale(scale.value, -scale.value) // Y轴翻转
  
  // 绘制网格
  if (renderOptions.showGrid) {
    drawGrid(ctx, width, height)
  }
  
  // 绘制坐标轴
  if (renderOptions.showAxes) {
    drawAxes(ctx, width, height)
  }
  
  // 绘制边界框
  if (renderOptions.showBounds) {
    drawBounds(ctx)
  }
  
  // 绘制实体
  drawEntities(ctx)
  
  ctx.restore()
}

// 绘制网格
const drawGrid = (ctx, width, height) => {
  ctx.strokeStyle = '#f0f0f0'
  ctx.lineWidth = 1 / scale.value
  
  const gridSize = 20
  const startX = -width / (2 * scale.value) - offsetX.value / scale.value
  const endX = width / (2 * scale.value) - offsetX.value / scale.value
  const startY = -height / (2 * scale.value) + offsetY.value / scale.value
  const endY = height / (2 * scale.value) + offsetY.value / scale.value
  
  // 垂直线
  for (let x = Math.floor(startX / gridSize) * gridSize; x <= endX; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, startY)
    ctx.lineTo(x, endY)
    ctx.stroke()
  }
  
  // 水平线
  for (let y = Math.floor(startY / gridSize) * gridSize; y <= endY; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(startX, y)
    ctx.lineTo(endX, y)
    ctx.stroke()
  }
}

// 绘制坐标轴
const drawAxes = (ctx) => {
  ctx.strokeStyle = '#666'
  ctx.lineWidth = 2 / scale.value
  
  // X轴
  ctx.beginPath()
  ctx.moveTo(-1000, 0)
  ctx.lineTo(1000, 0)
  ctx.stroke()
  
  // Y轴
  ctx.beginPath()
  ctx.moveTo(0, -1000)
  ctx.lineTo(0, 1000)
  ctx.stroke()
}

// 绘制边界框
const drawBounds = (ctx) => {
  const { minX, minY, maxX, maxY } = bounds.value
  
  ctx.strokeStyle = '#ff0000'
  ctx.lineWidth = 2 / scale.value
  ctx.setLineDash([5 / scale.value, 5 / scale.value])
  
  ctx.beginPath()
  ctx.rect(minX, minY, maxX - minX, maxY - minY)
  ctx.stroke()
  
  ctx.setLineDash([])
}

// 绘制实体
const drawEntities = (ctx) => {
  dxfData.value.entities.forEach(entity => {
    if (!entityTypes[entity.type]) return
    
    const layer = layers.value.find(l => l.name === entity.layer)
    if (layer && !layer.visible) return
    
    // 设置样式
    ctx.strokeStyle = layer?.color || '#000000'
    ctx.lineWidth = 1 / scale.value
    
    switch (entity.type) {
      case 'LINE':
        drawLine(ctx, entity)
        break
      case 'CIRCLE':
        drawCircle(ctx, entity)
        break
      case 'ARC':
        drawArc(ctx, entity)
        break
    }
  })
}

// 绘制线段
const drawLine = (ctx, entity) => {
  if (!entity.start || !entity.end) return
  
  ctx.beginPath()
  ctx.moveTo(entity.start.x, entity.start.y)
  ctx.lineTo(entity.end.x, entity.end.y)
  ctx.stroke()
}

// 绘制圆
const drawCircle = (ctx, entity) => {
  if (!entity.center || !entity.radius) return
  
  ctx.beginPath()
  ctx.arc(entity.center.x, entity.center.y, entity.radius, 0, 2 * Math.PI)
  ctx.stroke()
}

// 绘制圆弧
const drawArc = (ctx, entity) => {
  if (!entity.center || !entity.radius) return
  
  const startAngle = (entity.startAngle || 0) * Math.PI / 180
  const endAngle = (entity.endAngle || 360) * Math.PI / 180
  
  ctx.beginPath()
  ctx.arc(entity.center.x, entity.center.y, entity.radius, startAngle, endAngle)
  ctx.stroke()
}

// 视图控制
const zoomIn = () => {
  scale.value = Math.min(scale.value * 1.2, 10)
  redrawCanvas()
}

const zoomOut = () => {
  scale.value = Math.max(scale.value / 1.2, 0.1)
  redrawCanvas()
}

const resetView = () => {
  scale.value = 1
  offsetX.value = 0
  offsetY.value = 0
  redrawCanvas()
}

const fitToCanvas = () => {
  if (!bounds.value || !canvas.value) return
  
  const { minX, minY, maxX, maxY } = bounds.value
  const width = canvas.value.width
  const height = canvas.value.height
  
  const boundsWidth = maxX - minX
  const boundsHeight = maxY - minY
  
  if (boundsWidth === 0 || boundsHeight === 0) return
  
  const scaleX = (width * 0.8) / boundsWidth
  const scaleY = (height * 0.8) / boundsHeight
  
  scale.value = Math.min(scaleX, scaleY)
  
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  
  offsetX.value = -centerX * scale.value
  offsetY.value = centerY * scale.value
  
  redrawCanvas()
}

// 鼠标交互
const startPan = (event) => {
  isPanning.value = true
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
}

const handlePan = (event) => {
  if (!isPanning.value) return
  
  const deltaX = event.clientX - lastPanPoint.value.x
  const deltaY = event.clientY - lastPanPoint.value.y
  
  offsetX.value += deltaX
  offsetY.value += deltaY
  
  lastPanPoint.value = { x: event.clientX, y: event.clientY }
  
  redrawCanvas()
}

const endPan = () => {
  isPanning.value = false
}

const handleZoom = (event) => {
  event.preventDefault()
  
  const delta = event.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.max(0.1, Math.min(10, scale.value * delta))
  
  // 以鼠标位置为中心缩放
  const rect = canvas.value.getBoundingClientRect()
  const mouseX = event.clientX - rect.left - canvas.value.width / 2
  const mouseY = event.clientY - rect.top - canvas.value.height / 2
  
  offsetX.value = mouseX - (mouseX - offsetX.value) * (newScale / scale.value)
  offsetY.value = mouseY - (mouseY - offsetY.value) * (newScale / scale.value)
  
  scale.value = newScale
  redrawCanvas()
}

// 导出功能
const exportCanvas = () => {
  if (!canvas.value) return
  
  const link = document.createElement('a')
  link.download = 'dxf-canvas-export.png'
  link.href = canvas.value.toDataURL()
  link.click()
}

// 工具函数
const getEntityTypeName = (type) => {
  const names = {
    LINE: '线段',
    CIRCLE: '圆',
    ARC: '圆弧',
    POLYLINE: '多段线',
    LWPOLYLINE: '轻量多段线',
    TEXT: '文字',
    POINT: '点',
    INSERT: '块插入'
  }
  return names[type] || type
}

const getEntityCount = (type) => {
  if (!dxfData.value) return 0
  return dxfData.value.entities.filter(e => e.type === type).length
}

const formatBounds = (bounds) => {
  if (!bounds) return 'N/A'
  const width = bounds.maxX - bounds.minX
  const height = bounds.maxY - bounds.minY
  return `${width.toFixed(1)} × ${height.toFixed(1)}`
}

// 生命周期
onMounted(() => {
  console.log('DXF Canvas 渲染器已初始化')
})
</script>

<style scoped>
.dxf-canvas-viewer {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color:#333;
}

.dxf-canvas-viewer h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 控制面板 */
.control-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.file-upload-section h3,
.render-controls h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.2em;
}

/* 文件上传区域 */
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 20px;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #f8f9ff;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 3em;
  color: #6c757d;
}

.sample-files {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sample-btn {
  padding: 10px 15px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.sample-btn:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

/* 渲染控制 */
.render-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.layer-controls h4,
.entity-controls h4,
.view-controls h4,
.render-options h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 1em;
}

.layer-list,
.entity-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 150px;
  overflow-y: auto;
}

.layer-item {
  display: flex;
  align-items: center;
}

.layer-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.layer-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid #ddd;
}

.control-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.control-buttons button {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.control-buttons button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.view-info {
  margin-top: 10px;
  font-size: 0.9em;
  color: #6c757d;
}

.render-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.render-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 状态面板 */
.status-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-header h3 {
  margin: 0;
  font-size: 1.3em;
}

.export-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

/* Canvas 容器 */
.canvas-container {
  position: relative;
  width: 100%;
  height: 600px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  display: block;
  max-width: 100%;
  max-height: 100%;
}

.canvas-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248, 249, 250, 0.9);
}

.overlay-content {
  text-align: center;
  color: #6c757d;
}

.overlay-content h2 {
  margin: 0 0 10px 0;
  color: #495057;
}

/* 实体详情面板 */
.entity-details {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  width: 300px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.entity-details h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.entity-info {
  margin-bottom: 15px;
}

.entity-info p {
  margin: 5px 0;
  font-size: 0.9em;
}

.close-btn {
  width: 100%;
  padding: 8px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.close-btn:hover {
  background: #c82333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-panel {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .control-buttons {
    grid-template-columns: 1fr;
  }
  
  .entity-details {
    position: fixed;
    top: auto;
    bottom: 20px;
    right: 20px;
    left: 20px;
    width: auto;
    transform: none;
  }
}
</style>