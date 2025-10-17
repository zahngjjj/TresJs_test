<template>
  <div class="svg-demo-container">
    <h1>🧩 SVG CAD 图层控制演示</h1>
    <p class="description">
      演示通过 JavaScript 直接操作 SVG DOM 元素来控制 CAD 图层的显示/隐藏
    </p>

    <!-- 控制面板 -->
    <div class="control-panel">
      <h3>📋 图层控制面板</h3>
      <div class="layer-controls">
        <div class="layer-item">
          <label>
            <input 
              type="checkbox" 
              v-model="layers.black" 
              @change="toggleLayer('black')"
            />
            <span class="layer-color black"></span>
            黑色图层 (主要结构)
          </label>
        </div>
        
        <div class="layer-item">
          <label>
            <input 
              type="checkbox" 
              v-model="layers.orange" 
              @change="toggleLayer('orange')"
            />
            <span class="layer-color orange"></span>
            橙色图层 (辅助线条)
          </label>
        </div>
        
        <div class="layer-item">
          <label>
            <input 
              type="checkbox" 
              v-model="layers.cyan" 
              @change="toggleLayer('cyan')"
            />
            <span class="layer-color cyan"></span>
            青色图层 (网格/标注)
          </label>
        </div>
      </div>

      <!-- 新增：元素控制 -->
      <div class="element-controls">
        <h4>🏠 元素控制</h4>
        <div class="element-item">
          <label>
            <input 
              type="checkbox" 
              v-model="elements.first" 
              @change="toggleElement('first')"
            />
            <span class="element-indicator">🏠</span>
            第1个元素 (左侧建筑)
          </label>
        </div>
        
        <div class="animation-controls">
          <button 
            @click="startAnimation" 
            :disabled="isAnimating || !elements.first"
            class="btn btn-animation"
          >
            {{ isAnimating ? '🔄 动画中...' : '🎬 开始移动动画' }}
          </button>
          <button 
            @click="stopAnimation" 
            :disabled="!isAnimating"
            class="btn btn-stop"
          >
            ⏹️ 停止动画
          </button>
        </div>
      </div>

      <div class="batch-controls">
        <button @click="showAllLayers" class="btn btn-primary">
          👁️ 显示全部
        </button>
        <button @click="hideAllLayers" class="btn btn-secondary">
          🙈 隐藏全部
        </button>
        <button @click="resetView" class="btn btn-info">
          🔄 重置视图
        </button>
      </div>
    </div>

    <!-- SVG 显示区域 -->
    <div class="svg-container">
      <div class="svg-wrapper" ref="svgWrapper">
        <!-- SVG 将通过 JavaScript 动态加载 -->
      </div>
      
      <!-- 缩放控制 -->
      <div class="zoom-controls">
        <button @click="zoomIn" class="zoom-btn">🔍+</button>
        <button @click="zoomOut" class="zoom-btn">🔍-</button>
        <button @click="resetZoom" class="zoom-btn">📐</button>
        <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      </div>
    </div>

    <!-- 信息面板 -->
    <div class="info-panel">
      <h4>📊 图层信息</h4>
      <div class="layer-stats">
        <div>黑色路径: {{ pathCounts.black }} 个</div>
        <div>橙色路径: {{ pathCounts.orange }} 个</div>
        <div>青色路径: {{ pathCounts.cyan }} 个</div>
        <div>总计: {{ pathCounts.total }} 个路径</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, reactive } from 'vue'

// 响应式数据
const svgWrapper = ref(null)
const svgElement = ref(null)
const zoomLevel = ref(1)

// 图层状态
const layers = reactive({
  black: true,
  orange: true,
  cyan: true
})

// 元素状态
const elements = reactive({
  first: true
})

// 动画状态
const isAnimating = ref(false)
const animationId = ref(null)
const animationOffset = reactive({
  x: 0,
  y: 0
})

// 路径统计
const pathCounts = reactive({
  black: 0,
  orange: 0,
  cyan: 0,
  total: 0
})

// 加载 SVG 文件
const loadSVG = async () => {
  try {
    const response = await fetch('/image/cad_test_2.svg')
    const svgText = await response.text()
    
    // 将 SVG 插入到容器中
    svgWrapper.value.innerHTML = svgText
    svgElement.value = svgWrapper.value.querySelector('svg')
    
    if (svgElement.value) {
      // 设置 SVG 样式
      svgElement.value.style.width = '100%'
      svgElement.value.style.height = 'auto'
      svgElement.value.style.maxWidth = '800px'
      
      // 分析和分类路径
      analyzePaths()
      
      // 分析和分类元素
      analyzeElements()
      
      console.log('SVG 加载成功')
    }
  } catch (error) {
    console.error('SVG 加载失败:', error)
  }
}

// 分析路径并按颜色分类
const analyzePaths = () => {
  if (!svgElement.value) return
  
  const paths = svgElement.value.querySelectorAll('path')
  let blackCount = 0, orangeCount = 0, cyanCount = 0
  
  paths.forEach((path, index) => {
    const style = path.getAttribute('style') || ''
    
    // 根据颜色分类并添加类名
    if (style.includes('#000000') || style.includes('black')) {
      path.classList.add('layer-black')
      path.setAttribute('data-layer', 'black')
      blackCount++
    } else if (style.includes('#ffd2aa') || style.includes('orange')) {
      path.classList.add('layer-orange')
      path.setAttribute('data-layer', 'orange')
      orangeCount++
    } else if (style.includes('#00ffff') || style.includes('cyan')) {
      path.classList.add('layer-cyan')
      path.setAttribute('data-layer', 'cyan')
      cyanCount++
    }
    
    // 添加唯一 ID
    path.id = `path-${index}`
  })
  
  // 更新统计
  pathCounts.black = blackCount
  pathCounts.orange = orangeCount
  pathCounts.cyan = cyanCount
  pathCounts.total = paths.length
  
  console.log('路径分析完成:', pathCounts)
}

// 分析和分类元素（按位置区域）
const analyzeElements = () => {
  if (!svgElement.value) return
  
  const paths = svgElement.value.querySelectorAll('path')
  
  paths.forEach((path, index) => {
    const d = path.getAttribute('d') || ''
    
    // 通过路径数据中的坐标判断元素位置
    // 第1个元素：X坐标在 0-20 范围内的路径
    if (isPathInRange(d, 0, 20)) {
      path.classList.add('element-first')
      path.setAttribute('data-element', 'first')
    }
    // 第2个元素：X坐标在 40-60 范围内的路径  
    else if (isPathInRange(d, 40, 60)) {
      path.classList.add('element-second')
      path.setAttribute('data-element', 'second')
    }
    // 第3个元素：X坐标在 80-100 范围内的路径
    else if (isPathInRange(d, 80, 100)) {
      path.classList.add('element-third')
      path.setAttribute('data-element', 'third')
    }
  })
  
  console.log('元素分析完成')
}

// 检查路径是否在指定X坐标范围内
const isPathInRange = (pathData, minX, maxX) => {
  // 提取路径中的X坐标
  const xCoords = []
  const matches = pathData.match(/[ML]\s*([-\d.]+)/g)
  
  if (matches) {
    matches.forEach(match => {
      const x = parseFloat(match.substring(1).trim())
      if (!isNaN(x)) {
        xCoords.push(x)
      }
    })
  }
  
  // 检查是否有坐标在指定范围内
  return xCoords.some(x => x >= minX && x <= maxX)
}

// 切换图层显示/隐藏
const toggleLayer = (layerName) => {
  if (!svgElement.value) return
  
  const paths = svgElement.value.querySelectorAll(`[data-layer="${layerName}"]`)
  const isVisible = layers[layerName]
  
  paths.forEach(path => {
    path.style.display = isVisible ? 'block' : 'none'
    path.style.opacity = isVisible ? '1' : '0'
  })
  
  console.log(`${layerName} 图层 ${isVisible ? '显示' : '隐藏'}`)
}

// 切换元素显示/隐藏
const toggleElement = (elementName) => {
  if (!svgElement.value) return
  
  const paths = svgElement.value.querySelectorAll(`[data-element="${elementName}"]`)
  const isVisible = elements[elementName]
  
  paths.forEach(path => {
    path.style.display = isVisible ? 'block' : 'none'
    path.style.opacity = isVisible ? '1' : '0'
  })
  
  console.log(`${elementName} 元素 ${isVisible ? '显示' : '隐藏'}`)
}

// 开始移动动画
const startAnimation = () => {
  if (isAnimating.value || !elements.first) return
  
  isAnimating.value = true
  animationOffset.x = 0
  animationOffset.y = 0
  
  const animate = () => {
    if (!isAnimating.value) return
    
    // 计算动画偏移量（圆形运动）
    const time = Date.now() * 0.002
    animationOffset.x = Math.sin(time) * 20
    animationOffset.y = Math.cos(time) * 10
    
    // 应用变换到第1个元素
    applyElementTransform('first', animationOffset.x, animationOffset.y)
    
    animationId.value = requestAnimationFrame(animate)
  }
  
  animate()
  console.log('开始移动动画')
}

// 停止动画
const stopAnimation = () => {
  isAnimating.value = false
  if (animationId.value) {
    cancelAnimationFrame(animationId.value)
    animationId.value = null
  }
  
  // 重置元素位置
  applyElementTransform('first', 0, 0)
  animationOffset.x = 0
  animationOffset.y = 0
  
  console.log('停止移动动画')
}

// 应用变换到指定元素
const applyElementTransform = (elementName, offsetX, offsetY) => {
  if (!svgElement.value) return
  
  const paths = svgElement.value.querySelectorAll(`[data-element="${elementName}"]`)
  
  paths.forEach(path => {
    path.style.transform = `translate(${offsetX}px, ${offsetY}px)`
    path.style.transformOrigin = 'center center'
  })
}

// 显示所有图层
const showAllLayers = () => {
  layers.black = true
  layers.orange = true
  layers.cyan = true
  
  Object.keys(layers).forEach(layer => {
    toggleLayer(layer)
  })
}

// 隐藏所有图层
const hideAllLayers = () => {
  layers.black = false
  layers.orange = false
  layers.cyan = false
  
  Object.keys(layers).forEach(layer => {
    toggleLayer(layer)
  })
}

// 重置视图
const resetView = () => {
  showAllLayers()
  resetZoom()
  stopAnimation()
  elements.first = true
  toggleElement('first')
}

// 缩放功能
const zoomIn = () => {
  zoomLevel.value = Math.min(zoomLevel.value * 1.2, 5)
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
  }
}

// 组件挂载时加载 SVG
onMounted(() => {
  loadSVG()
})

// 组件卸载时清理动画
onUnmounted(() => {
  stopAnimation()
})
</script>

<style scoped>
.svg-demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 10px;
}

.description {
  text-align: center;
  color: #7f8c8d;
  margin-bottom: 30px;
  font-size: 16px;
}

.control-panel {
  background: #f8f9fa;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.control-panel h3 {
  margin-top: 0;
  color: #2c3e50;
}

.layer-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 20px;
}

.layer-item {
  display: flex;
  align-items: center;
}

.layer-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #000000;
}

.layer-item input[type="checkbox"] {
  margin-right: 8px;
  transform: scale(1.2);
}

.layer-color {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 3px;
  margin: 0 8px;
  border: 2px solid #ddd;
}

.layer-color.black {
  background-color: #000000;
}

.layer-color.orange {
  background-color: #ffd2aa;
}

.layer-color.cyan {
  background-color: #00ffff;
}

.batch-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}

.btn-info {
  background-color: #1abc9c;
  color: white;
}

.btn-info:hover {
  background-color: #16a085;
}

.svg-container {
  position: relative;
  background: #000000;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin-bottom: 20px;
  overflow: hidden;
}

.svg-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  overflow: auto;
}

.zoom-controls {
  position: absolute;
  top: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: rgba(255,255,255,0.9);
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.zoom-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 5px;
  background: #3498db;
  color: white;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

.zoom-btn:hover {
  background: #2980b9;
}

.zoom-level {
  text-align: center;
  font-size: 12px;
  color: #7f8c8d;
  margin-top: 5px;
}

.info-panel {
  background: #ecf0f1;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.info-panel h4 {
  margin-top: 0;
  color: #2c3e50;
}

.layer-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.layer-stats div {
  padding: 8px 12px;
  background: white;
  border-radius: 5px;
  font-weight: 500;
}

.element-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid #ecf0f1;
}

.element-controls h4 {
  margin-bottom: 15px;
  color: #2c3e50;
}

.element-item {
  margin-bottom: 15px;
}

.element-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
}

.element-indicator {
  margin: 0 8px;
  font-size: 18px;
}

.animation-controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
}

.btn-animation {
  background-color: #e74c3c;
  color: white;
}

.btn-animation:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-animation:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-stop {
  background-color: #f39c12;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-stop:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.element-info {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.element-info h5 {
  margin-bottom: 10px;
  color: #2c3e50;
}

.element-info div {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 3px;
  margin-bottom: 5px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .layer-controls {
    flex-direction: column;
  }
  
  .batch-controls {
    justify-content: center;
  }
  
  .zoom-controls {
    position: static;
    flex-direction: row;
    justify-content: center;
    margin-top: 15px;
  }
}

/* SVG 路径样式 */
:deep(.layer-black) {
  transition: opacity 0.3s ease;
}

:deep(.layer-orange) {
  transition: opacity 0.3s ease;
}

:deep(.layer-cyan) {
  transition: opacity 0.3s ease;
}

/* 元素样式 */
:deep(.element-first) {
  transition: all 0.3s ease;
  transform-origin: center center;
}

:deep(.element-second) {
  transition: opacity 0.3s ease;
}

:deep(.element-third) {
  transition: opacity 0.3s ease;
}

/* 元素控制样式 */
.element-controls {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.element-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.element-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-weight: 500;
  color: #000000;
}

.element-indicator {
  margin: 0 8px;
  font-size: 16px;
}

.animation-controls {
  margin-top: 15px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-animation {
  background-color: #e74c3c;
  color: white;
}

.btn-animation:hover:not(:disabled) {
  background-color: #c0392b;
}

.btn-animation:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.btn-stop {
  background-color: #f39c12;
  color: white;
}

.btn-stop:hover:not(:disabled) {
  background-color: #e67e22;
}

.btn-stop:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.element-info {
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ddd;
}

.element-info h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #2c3e50;
}

.element-info div {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 3px;
  margin-bottom: 5px;
  font-size: 14px;
}
</style>