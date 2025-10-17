<template>
  <div class="svg-viewer">
    <h1>🚀 超大SVG文件优化加载器</h1>
    
    <!-- 文件选择和配置面板 -->
    <div class="config-panel">
      <div class="file-section">
        <h3>📁 文件选择</h3>
        <select v-model="selectedFile" @change="loadSVG" class="file-select">
          <option value="">请选择SVG文件</option>
          <option value="cad_test.svg">小文件 - cad_test.svg</option>
          <option value="cad_test_2.svg">中等文件 - cad_test_2.svg</option>
          <option value="simple3_copy_new.svg">超大文件 - simple3_copy_new.svg (1.8M行)</option>
        </select>
      </div>

      <div class="optimization-section" v-if="selectedFile">
        <h3>⚡ 性能优化配置</h3>
        <div class="optimization-grid">
          <div class="optimization-item">
            <label>
              <input type="checkbox" v-model="config.enableVirtualization">
              虚拟化渲染 (推荐)
            </label>
            <small>只渲染可见区域的元素</small>
          </div>
          
          <div class="optimization-item">
            <label>
              <input type="checkbox" v-model="config.enableChunkedLoading">
              分块加载
            </label>
            <small>分批次加载，避免卡顿</small>
          </div>
          
          <div class="optimization-item">
            <label>
              <input type="checkbox" v-model="config.enableLOD">
              细节层次 (LOD)
            </label>
            <small>根据缩放级别调整细节</small>
          </div>
          
          <div class="optimization-item">
            <label>
              <input type="checkbox" v-model="config.enableCulling">
              视锥剔除
            </label>
            <small>隐藏视野外的元素</small>
          </div>
        </div>

        <div class="performance-controls">
          <div class="control-group">
            <label>块大小: {{ config.chunkSize }}</label>
            <input type="range" v-model="config.chunkSize" min="500" max="10000" step="500">
          </div>
          
          <div class="control-group">
            <label>渲染延迟: {{ config.renderDelay }}ms</label>
            <input type="range" v-model="config.renderDelay" min="1" max="50" step="1">
          </div>
          
          <div class="control-group">
            <label>LOD 阈值: {{ config.lodThreshold }}</label>
            <input type="range" v-model="config.lodThreshold" min="0.1" max="2" step="0.1">
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态面板 -->
    <div class="status-panel" v-if="isLoading || loadingStats.totalElements > 0">
      <div class="loading-header">
        <h3>📊 加载状态</h3>
        <button v-if="isLoading" @click="cancelLoading" class="cancel-btn">取消加载</button>
      </div>
      
      <div class="progress-section">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loadingProgress + '%' }"></div>
          <span class="progress-text">{{ Math.round(loadingProgress) }}%</span>
        </div>
        
        <div class="loading-details">
          <div class="detail-item">
            <span>已加载:</span>
            <span>{{ loadingStats.loadedElements.toLocaleString() }} / {{ loadingStats.totalElements.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span>渲染中:</span>
            <span>{{ loadingStats.renderedElements.toLocaleString() }}</span>
          </div>
          <div class="detail-item">
            <span>加载速度:</span>
            <span>{{ loadingStats.loadingSpeed.toLocaleString() }} 元素/秒</span>
          </div>
          <div class="detail-item">
            <span>内存使用:</span>
            <span>{{ formatBytes(loadingStats.memoryUsage) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- SVG 显示区域 -->
    <div class="svg-container" ref="svgContainer">
      <div v-if="!selectedFile" class="placeholder">
        <div class="placeholder-content">
          <h2>🎨 选择一个SVG文件开始</h2>
          <p>支持超大文件的优化加载</p>
        </div>
      </div>
      
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在加载 {{ selectedFile }}...</p>
        <p class="loading-tip">{{ currentLoadingTip }}</p>
      </div>
    </div>

    <!-- 控制面板 -->
    <div class="control-bar" v-if="svgElement">
      <div class="zoom-controls">
        <button @click="zoomOut">🔍-</button>
        <span>{{ Math.round(zoomLevel * 100) }}%</span>
        <button @click="zoomIn">🔍+</button>
        <button @click="resetZoom">重置</button>
      </div>
      
      <div class="view-controls">
        <button @click="fitToView">适应窗口</button>
        <button @click="toggleWireframe">{{ showWireframe ? '填充' : '线框' }}</button>
        <button @click="togglePerformanceMode">{{ performanceMode ? '质量模式' : '性能模式' }}</button>
      </div>
      
      <div class="info-display">
        <span>可见元素: {{ visibleElements }}</span>
        <span>FPS: {{ currentFPS }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 基础状态
const selectedFile = ref('')
const svgContainer = ref(null)
const svgElement = ref(null)
const isLoading = ref(false)
const loadingProgress = ref(0)
const zoomLevel = ref(1)
const showWireframe = ref(false)
const performanceMode = ref(false)

// 优化配置
const config = reactive({
  enableVirtualization: true,
  enableChunkedLoading: true,
  enableLOD: true,
  enableCulling: true,
  chunkSize: 2000,
  renderDelay: 10,
  lodThreshold: 0.5
})

// 加载统计
const loadingStats = reactive({
  totalElements: 0,
  loadedElements: 0,
  renderedElements: 0,
  loadingSpeed: 0,
  memoryUsage: 0,
  startTime: 0
})

// 性能监控
const visibleElements = ref(0)
const currentFPS = ref(0)
const currentLoadingTip = ref('')

// 加载控制
let loadingController = null
let animationFrameId = null
let fpsCounter = 0
let lastFpsTime = 0

// 加载提示
const loadingTips = [
  '正在解析SVG结构...',
  '正在优化路径数据...',
  '正在应用性能优化...',
  '正在构建虚拟化层...',
  '正在渲染可见元素...'
]

// 主要加载函数
const loadSVG = async () => {
  if (!selectedFile.value || !svgContainer.value) return
  
  // 重置状态
  resetLoadingState()
  isLoading.value = true
  
  try {
    console.log(`开始加载超大SVG: ${selectedFile.value}`)
    
    // 创建加载控制器
    loadingController = new AbortController()
    
    // 开始加载
    await loadSVGWithOptimization()
    
    console.log('SVG加载完成')
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('SVG加载失败:', error)
    }
  } finally {
    isLoading.value = false
    loadingController = null
  }
}

// 优化加载实现
const loadSVGWithOptimization = async () => {
  loadingStats.startTime = Date.now()
  currentLoadingTip.value = loadingTips[0]
  
  // 1. 获取SVG数据
  const response = await fetch(`/image/${selectedFile.value}`, {
    signal: loadingController.signal
  })
  const svgText = await response.text()
  
  currentLoadingTip.value = loadingTips[1]
  
  // 2. 解析SVG
  const parser = new DOMParser()
  const svgDoc = parser.parseFromString(svgText, 'image/svg+xml')
  const originalSvg = svgDoc.querySelector('svg')
  
  if (!originalSvg) throw new Error('无效的SVG文件')
  
  // 3. 创建优化的SVG容器
  const optimizedSvg = createOptimizedSVG(originalSvg)
  svgContainer.value.innerHTML = ''
  svgContainer.value.appendChild(optimizedSvg)
  svgElement.value = optimizedSvg
  
  currentLoadingTip.value = loadingTips[2]
  
  // 4. 获取所有路径元素
  const paths = Array.from(originalSvg.querySelectorAll('path'))
  loadingStats.totalElements = paths.length
  
  currentLoadingTip.value = loadingTips[3]
  
  // 5. 应用优化策略
  if (config.enableChunkedLoading) {
    await loadPathsInChunks(paths, optimizedSvg)
  } else {
    await loadPathsDirectly(paths, optimizedSvg)
  }
  
  currentLoadingTip.value = loadingTips[4]
  
  // 6. 启动性能监控
  startPerformanceMonitoring()
  
  // 7. 应用视图优化
  if (config.enableVirtualization) {
    setupVirtualization()
  }
}

// 创建优化的SVG容器
const createOptimizedSVG = (originalSvg) => {
  const svg = originalSvg.cloneNode(false)
  svg.style.width = '100%'
  svg.style.height = '100%'
  svg.style.overflow = 'visible'
  
  // 添加性能优化属性
  svg.style.shapeRendering = performanceMode.value ? 'optimizeSpeed' : 'auto'
  svg.style.textRendering = performanceMode.value ? 'optimizeSpeed' : 'auto'
  
  return svg
}

// 分块加载路径
const loadPathsInChunks = async (paths, targetSvg) => {
  const chunkSize = config.chunkSize
  const totalChunks = Math.ceil(paths.length / chunkSize)
  
  for (let i = 0; i < totalChunks; i++) {
    if (loadingController.signal.aborted) break
    
    const start = i * chunkSize
    const end = Math.min(start + chunkSize, paths.length)
    const chunk = paths.slice(start, end)
    
    // 处理当前块
    await processChunk(chunk, targetSvg, i, totalChunks)
    
    // 更新进度
    loadingStats.loadedElements = end
    loadingProgress.value = (end / paths.length) * 100
    
    // 计算加载速度
    const elapsed = (Date.now() - loadingStats.startTime) / 1000
    loadingStats.loadingSpeed = Math.round(end / elapsed)
    
    // 延迟以避免阻塞UI
    if (i < totalChunks - 1) {
      await new Promise(resolve => setTimeout(resolve, config.renderDelay))
    }
  }
}

// 处理单个块
const processChunk = async (chunk, targetSvg, chunkIndex, totalChunks) => {
  return new Promise(resolve => {
    requestAnimationFrame(() => {
      chunk.forEach(path => {
        const optimizedPath = optimizePath(path)
        targetSvg.appendChild(optimizedPath)
        loadingStats.renderedElements++
      })
      
      // 更新内存使用估算
      loadingStats.memoryUsage = loadingStats.renderedElements * 150 // 估算每个元素150字节
      
      resolve()
    })
  })
}

// 优化单个路径
const optimizePath = (originalPath) => {
  const path = originalPath.cloneNode(true)
  
  // 应用LOD优化
  if (config.enableLOD) {
    applyLODOptimization(path)
  }
  
  // 添加虚拟化属性
  if (config.enableVirtualization) {
    path.setAttribute('data-virtual', 'true')
  }
  
  // 性能模式优化
  if (performanceMode.value) {
    path.style.shapeRendering = 'optimizeSpeed'
  }
  
  return path
}

// 应用LOD优化
const applyLODOptimization = (path) => {
  const strokeWidth = parseFloat(path.getAttribute('stroke-width') || '1')
  
  if (strokeWidth < config.lodThreshold) {
    path.classList.add('lod-low')
    path.style.opacity = '0.3'
  } else if (strokeWidth < config.lodThreshold * 2) {
    path.classList.add('lod-medium')
    path.style.opacity = '0.7'
  } else {
    path.classList.add('lod-high')
  }
}

// 设置虚拟化
const setupVirtualization = () => {
  if (!svgElement.value) return
  
  // 监听滚动和缩放事件
  svgContainer.value.addEventListener('scroll', updateVisibleElements)
  window.addEventListener('resize', updateVisibleElements)
  
  // 初始更新
  updateVisibleElements()
}

// 更新可见元素
const updateVisibleElements = () => {
  if (!config.enableVirtualization || !svgElement.value) return
  
  const containerRect = svgContainer.value.getBoundingClientRect()
  const paths = svgElement.value.querySelectorAll('path[data-virtual="true"]')
  
  let visible = 0
  
  paths.forEach(path => {
    const pathRect = path.getBoundingClientRect()
    const isVisible = !(
      pathRect.bottom < containerRect.top ||
      pathRect.top > containerRect.bottom ||
      pathRect.right < containerRect.left ||
      pathRect.left > containerRect.right
    )
    
    if (isVisible) {
      path.style.display = 'block'
      visible++
    } else if (config.enableCulling) {
      path.style.display = 'none'
    }
  })
  
  visibleElements.value = visible
}

// 性能监控
const startPerformanceMonitoring = () => {
  const updateFPS = () => {
    fpsCounter++
    const now = Date.now()
    
    if (now - lastFpsTime >= 1000) {
      currentFPS.value = fpsCounter
      fpsCounter = 0
      lastFpsTime = now
    }
    
    animationFrameId = requestAnimationFrame(updateFPS)
  }
  
  updateFPS()
}

// 控制函数
const cancelLoading = () => {
  if (loadingController) {
    loadingController.abort()
  }
}

const resetLoadingState = () => {
  loadingProgress.value = 0
  Object.assign(loadingStats, {
    totalElements: 0,
    loadedElements: 0,
    renderedElements: 0,
    loadingSpeed: 0,
    memoryUsage: 0,
    startTime: 0
  })
}

const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 10)
  applyZoom()
}

const zoomOut = () => {
  zoomLevel.value = Math.max(zoomLevel.value / 1.2, 0.1)
  applyZoom()
}

const resetZoom = () => {
  zoomLevel.value = 1
  applyZoom()
}

const applyZoom = () => {
  if (svgElement.value) {
    svgElement.value.style.transform = `scale(${zoomLevel.value})`
    svgElement.value.style.transformOrigin = 'center center'
    
    // 更新可见元素
    if (config.enableVirtualization) {
      updateVisibleElements()
    }
  }
}

const fitToView = () => {
  if (!svgElement.value) return
  
  const containerRect = svgContainer.value.getBoundingClientRect()
  const svgRect = svgElement.value.getBoundingClientRect()
  
  const scaleX = containerRect.width / svgRect.width
  const scaleY = containerRect.height / svgRect.height
  
  zoomLevel.value = Math.min(scaleX, scaleY) * 0.9
  applyZoom()
}

const toggleWireframe = () => {
  showWireframe.value = !showWireframe.value
  
  if (svgElement.value) {
    const paths = svgElement.value.querySelectorAll('path')
    paths.forEach(path => {
      if (showWireframe.value) {
        path.style.fill = 'none'
        path.style.strokeWidth = '0.5'
      } else {
        path.style.fill = path.getAttribute('fill') || 'none'
        path.style.strokeWidth = path.getAttribute('stroke-width') || '1'
      }
    })
  }
}

const togglePerformanceMode = () => {
  performanceMode.value = !performanceMode.value
  
  if (svgElement.value) {
    svgElement.value.style.shapeRendering = performanceMode.value ? 'optimizeSpeed' : 'auto'
    svgElement.value.style.textRendering = performanceMode.value ? 'optimizeSpeed' : 'auto'
  }
}

// 工具函数
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 生命周期
onMounted(() => {
  console.log('超大SVG加载器已初始化')
})

onUnmounted(() => {
  if (loadingController) {
    loadingController.abort()
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})
</script>

<style scoped>
.svg-viewer {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.svg-viewer h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 2.5em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 配置面板 */
.config-panel {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 20px;
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.file-section h3,
.optimization-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 1.2em;
}

.file-select {
  width: 100%;
  padding: 12px;
  border: 2px solid #dee2e6;
  border-radius: 8px;
  font-size: 16px;
  background: white;
  transition: border-color 0.3s;
}

.file-select:focus {
  outline: none;
  border-color: #007bff;
}

.optimization-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
}

.optimization-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.optimization-item label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  cursor: pointer;
}

.optimization-item small {
  color: #6c757d;
  font-size: 0.85em;
  margin-left: 24px;
}

.performance-controls {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-group label {
  font-size: 0.9em;
  color: #495057;
  font-weight: 500;
}

.control-group input[type="range"] {
  width: 100%;
}

/* 状态面板 */
.status-panel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.loading-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.loading-header h3 {
  margin: 0;
  font-size: 1.3em;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #28a745, #20c997);
  transition: width 0.3s ease;
  border-radius: 15px;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.loading-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 6px;
}

/* SVG容器 */
.svg-container {
  width: 100%;
  height: 600px;
  border: 2px solid #dee2e6;
  border-radius: 12px;
  overflow: auto;
  position: relative;
  background: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.placeholder-content {
  text-align: center;
  color: #6c757d;
}

.placeholder-content h2 {
  margin: 0 0 10px 0;
  color: #495057;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-tip {
  font-size: 0.9em;
  opacity: 0.8;
  margin-top: 10px;
}

/* 控制栏 */
.control-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-top: 20px;
  border: 1px solid #e9ecef;
}

.zoom-controls,
.view-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-controls button,
.view-controls button {
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.zoom-controls button:hover,
.view-controls button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

.info-display {
  display: flex;
  gap: 20px;
  font-size: 0.9em;
  color: #495057;
}

/* LOD样式 */
.lod-low {
  opacity: 0.3 !important;
}

.lod-medium {
  opacity: 0.7 !important;
}

.lod-high {
  opacity: 1 !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .config-panel {
    grid-template-columns: 1fr;
  }
  
  .optimization-grid {
    grid-template-columns: 1fr;
  }
  
  .performance-controls {
    grid-template-columns: 1fr;
  }
  
  .loading-details {
    grid-template-columns: 1fr;
  }
  
  .control-bar {
    flex-direction: column;
    gap: 15px;
  }
}
</style>