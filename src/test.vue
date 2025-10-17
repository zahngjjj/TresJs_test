<template>
  <div class="dxf-viewer">
    <div class="controls">
      <h3>DXF 文件查看器</h3>
      
      <!-- 文件上传 -->
      <div class="file-upload">
        <input 
          type="file" 
          @change="handleFileUpload" 
          accept=".dxf"
          ref="fileInput"
        />
        <button @click="loadSampleDXF">加载示例 DXF</button>
      </div>
      
      <!-- 图层控制 -->
      <div class="layer-controls" v-if="layers.length > 0">
        <h4>图层控制</h4>
        <div v-for="layer in layers" :key="layer.name" class="layer-item">
          <label>
            <input 
              type="checkbox" 
              :checked="layer.visible" 
              @change="toggleLayer(layer.name)"
            />
            <span :style="{ color: layer.color }">{{ layer.name }}</span>
            <span class="entity-count">({{ layer.count }} 个实体)</span>
          </label>
        </div>
      </div>
      
      <!-- 统计信息 -->
      <div class="stats" v-if="dxfData">
        <h4>文件信息</h4>
        <p>实体总数: {{ dxfData.entities?.length || 0 }}</p>
        <p>图层数量: {{ layers.length }}</p>
        <p>文件版本: {{ dxfData.header?.['$ACADVER'] || '未知' }}</p>
      </div>
    </div>
    
    <!-- Three.js 渲染区域 -->
    <div class="canvas-container">
      <TresCanvas 
        ref="canvasRef"
        clear-color="#f0f0f0" 
        :window-size="true"
        @created="onCanvasCreated"
      >
        <!-- 相机 -->
        <TresPerspectiveCamera 
          ref="cameraRef"
          :position="[50, 50, 50]" 
          :look-at="[0, 0, 0]"
          :fov="75"
          :near="0.1"
          :far="1000"
        />
        
        <!-- 光源 -->
        <TresAmbientLight :intensity="0.6" />
        <TresDirectionalLight 
          :position="[10, 10, 5]" 
          :intensity="0.8"
          cast-shadow
        />
        
        <!-- DXF 实体容器 -->
        <TresGroup ref="dxfGroup">
          <!-- 动态渲染的 DXF 实体将在这里添加 -->
        </TresGroup>
        
        <!-- 网格辅助线 -->
        <TresGridHelper :args="[100, 50]" />
        
        <!-- 坐标轴辅助线 -->
        <TresAxesHelper :args="[10]" />
        
        <!-- 轨道控制器 -->
        <OrbitControls 
          :enable-damping="true"
          :damping-factor="0.05"
        />
      </TresCanvas>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>正在解析 DXF 文件...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import * as THREE from 'three'

// 响应式数据
const canvasRef = ref()
const dxfGroup = ref()
const cameraRef = ref()
const fileInput = ref()
const loading = ref(false)
const dxfData = ref(null)
const layers = ref([])
const scene = ref(null)

// DXF 解析器类（简化版本）
class SimpleDXFParser {
  constructor() {
    this.entities = []
    this.layers = new Map()
  }
  
  // 解析 DXF 文本内容
  parseSync(dxfText) {
    const lines = dxfText.split('\n').map(line => line.trim())
    const entities = []
    const header = {}
    
    let currentSection = null
    let currentEntity = null
    let groupCode = null
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 检测组码
      if (line.match(/^\d+$/)) {
        groupCode = parseInt(line)
        continue
      }
      
      // 处理不同的组码
      if (groupCode !== null) {
        switch (groupCode) {
          case 0: // 实体类型或段标识
            if (line === 'SECTION') {
              currentSection = lines[i + 2] // 下一个非组码行是段名
            } else if (line === 'ENDSEC') {
              currentSection = null
            } else if (currentSection === 'ENTITIES') {
              // 保存上一个实体
              if (currentEntity) {
                entities.push(currentEntity)
              }
              // 开始新实体
              currentEntity = { type: line, layer: '0' }
            }
            break
          case 8: // 图层名
            if (currentEntity) {
              currentEntity.layer = line
            }
            break
          case 10: // X 坐标
            if (currentEntity) {
              if (!currentEntity.start) currentEntity.start = {}
              currentEntity.start.x = parseFloat(line)
            }
            break
          case 20: // Y 坐标
            if (currentEntity) {
              if (!currentEntity.start) currentEntity.start = {}
              currentEntity.start.y = parseFloat(line)
            }
            break
          case 11: // 终点 X 坐标
            if (currentEntity) {
              if (!currentEntity.end) currentEntity.end = {}
              currentEntity.end.x = parseFloat(line)
            }
            break
          case 21: // 终点 Y 坐标
            if (currentEntity) {
              if (!currentEntity.end) currentEntity.end = {}
              currentEntity.end.y = parseFloat(line)
            }
            break
          case 40: // 半径
            if (currentEntity) {
              currentEntity.radius = parseFloat(line)
            }
            break
        }
        groupCode = null
      }
    }
    
    // 添加最后一个实体
    if (currentEntity) {
      entities.push(currentEntity)
    }
    
    return {
      entities,
      header,
      layers: this.layers
    }
  }
}

// 创建示例 DXF 内容
const createSampleDXF = () => {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1015
0
ENDSEC
0
SECTION
2
ENTITIES
0
LINE
8
WALL
10
0.0
20
0.0
30
0.0
11
100.0
21
0.0
31
0.0
0
LINE
8
WALL
10
100.0
20
0.0
30
0.0
11
100.0
21
100.0
31
0.0
0
LINE
8
WALL
10
100.0
20
100.0
30
0.0
11
0.0
21
100.0
31
0.0
0
LINE
8
WALL
10
0.0
20
100.0
30
0.0
11
0.0
21
0.0
31
0.0
0
LINE
8
DOOR
10
20.0
20
0.0
30
0.0
11
40.0
21
0.0
31
0.0
0
LINE
8
WINDOW
10
60.0
20
100.0
30
0.0
11
80.0
21
100.0
31
0.0
0
CIRCLE
8
FURNITURE
10
50.0
20
50.0
30
0.0
40
15.0
0
ENDSEC
0
EOF`
}

// 获取图层颜色
const getLayerColor = (layerName) => {
  const colors = {
    'WALL': '#ff0000',
    'DOOR': '#00ff00', 
    'WINDOW': '#0000ff',
    'FURNITURE': '#ff00ff',
    '0': '#ffffff'
  }
  return colors[layerName] || '#cccccc'
}

// 渲染 DXF 实体到 Three.js 场景
const renderDXFEntities = (dxfData) => {
  console.log('开始渲染 DXF 实体:', dxfData)
  
  if (!scene.value) {
    console.error('Scene 未初始化')
    return
  }
  
  // 等待 dxfGroup 引用可用
  nextTick(() => {
    if (!dxfGroup.value) {
      console.error('dxfGroup 引用未找到')
      return
    }
    
    // 清除现有实体
    while (dxfGroup.value.children.length > 0) {
      dxfGroup.value.remove(dxfGroup.value.children[0])
    }
    
    // 统计图层信息
    const layerStats = new Map()
    let renderedCount = 0
    
    console.log('实体数量:', dxfData.entities?.length || 0)
    
    dxfData.entities?.forEach((entity, index) => {
      console.log(`处理实体 ${index}:`, entity)
      
      let object3D = null
      const layerName = entity.layer || '0'
      const color = getLayerColor(layerName)
      
      // 更新图层统计
      if (!layerStats.has(layerName)) {
        layerStats.set(layerName, { count: 0, color })
      }
      layerStats.get(layerName).count++
      
      switch (entity.type) {
        case 'LINE':
          if (entity.start && entity.end) {
            console.log(`创建线条: (${entity.start.x}, ${entity.start.y}) -> (${entity.end.x}, ${entity.end.y})`)
            const points = [
              new THREE.Vector3(entity.start.x, entity.start.y, 0),
              new THREE.Vector3(entity.end.x, entity.end.y, 0)
            ]
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({ 
              color: color,
              linewidth: 3
            })
            object3D = new THREE.Line(geometry, material)
            renderedCount++
          }
          break
          
        case 'CIRCLE':
          if (entity.start && entity.radius) {
            console.log(`创建圆形: 中心(${entity.start.x}, ${entity.start.y}), 半径${entity.radius}`)
            const geometry = new THREE.RingGeometry(entity.radius * 0.95, entity.radius, 32)
            const material = new THREE.MeshBasicMaterial({ 
              color: color,
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.8
            })
            object3D = new THREE.Mesh(geometry, material)
            object3D.position.set(entity.start.x, entity.start.y, 0)
            renderedCount++
          }
          break
          
        case 'POLYLINE':
          // 处理多段线
          if (entity.vertices && entity.vertices.length > 1) {
            console.log(`创建多段线: ${entity.vertices.length} 个顶点`)
            const points = entity.vertices.map(v => 
              new THREE.Vector3(v.x, v.y, 0)
            )
            const geometry = new THREE.BufferGeometry().setFromPoints(points)
            const material = new THREE.LineBasicMaterial({ color: color })
            object3D = new THREE.Line(geometry, material)
            renderedCount++
          }
          break
      }
      
      if (object3D) {
        object3D.userData.layer = layerName
        object3D.userData.entityType = entity.type
        dxfGroup.value.add(object3D)
        console.log(`成功添加 ${entity.type} 到场景`)
      } else {
        console.warn(`无法创建实体:`, entity)
      }
    })
    
    console.log(`总共渲染了 ${renderedCount} 个实体`)
    
    // 更新图层列表
    layers.value = Array.from(layerStats.entries()).map(([name, stats]) => ({
      name,
      visible: true,
      color: stats.color,
      count: stats.count
    }))
    
    console.log('图层信息:', layers.value)
    
    // 调整相机位置以查看所有对象
    if (renderedCount > 0) {
      // 计算包围盒
      const box = new THREE.Box3()
      dxfGroup.value.traverse((child) => {
        if (child.geometry) {
          child.geometry.computeBoundingBox()
          if (child.geometry.boundingBox) {
            box.expandByObject(child)
          }
        }
      })
      
      if (!box.isEmpty()) {
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        
        console.log('包围盒中心:', center)
        console.log('包围盒尺寸:', size)
        
        // 更新相机位置
        const camera = scene.value.children.find(child => child.type === 'PerspectiveCamera')
        if (camera) {
          const distance = maxDim * 2
          camera.position.set(
            center.x + distance,
            center.y + distance,
            center.z + distance
          )
          camera.lookAt(center)
          console.log('相机位置已调整:', camera.position)
        }
      }
    }
  })
}

// 切换图层可见性
const toggleLayer = (layerName) => {
  const layer = layers.value.find(l => l.name === layerName)
  if (layer) {
    layer.visible = !layer.visible
    
    // 更新场景中的对象
    if (dxfGroup.value) {
      dxfGroup.value.children.forEach(obj => {
        if (obj.userData.layer === layerName) {
          obj.visible = layer.visible
        }
      })
    }
  }
}

// 处理文件上传
const handleFileUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  loading.value = true
  
  try {
    const text = await file.text()
    const parser = new SimpleDXFParser()
    const parsed = parser.parseSync(text)
    
    dxfData.value = parsed
    
    // 等待场景初始化完成后再渲染
    const waitForScene = () => {
      if (scene.value) {
        renderDXFEntities(parsed)
        console.log('DXF 文件解析成功:', parsed)
      } else {
        console.log('等待场景初始化...')
        setTimeout(waitForScene, 100)
      }
    }
    
    waitForScene()
    
  } catch (error) {
    console.error('DXF 文件解析失败:', error)
    alert('DXF 文件解析失败，请检查文件格式')
  } finally {
    loading.value = false
  }
}

// 加载示例 DXF
const loadSampleDXF = () => {
  loading.value = true
  
  setTimeout(() => {
    try {
      const sampleDXF = createSampleDXF()
      const parser = new SimpleDXFParser()
      const parsed = parser.parseSync(sampleDXF)
      
      dxfData.value = parsed
      
      // 等待场景初始化完成后再渲染
      const waitForScene = () => {
        if (scene.value) {
          renderDXFEntities(parsed)
          console.log('示例 DXF 加载成功:', parsed)
        } else {
          console.log('等待场景初始化...')
          setTimeout(waitForScene, 100)
        }
      }
      
      waitForScene()
      
    } catch (error) {
      console.error('示例 DXF 加载失败:', error)
    } finally {
      loading.value = false
    }
  }, 500)
}

// Canvas 创建回调
const onCanvasCreated = ({ scene: threeScene, camera }) => {
  scene.value = threeScene
  console.log('Three.js 场景创建成功')
  console.log('场景对象:', threeScene)
  console.log('相机对象:', camera)
  console.log('场景初始化完成，可以开始渲染')
}

// 组件挂载
onMounted(() => {
  console.log('DXF 查看器组件已挂载')
})
</script>

<style scoped>
.dxf-viewer {
  display: flex;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.controls {
  width: 300px;
  padding: 20px;
  background: #f5f5f5;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.controls h3 {
  margin-top: 0;
  color: #333;
}

.file-upload {
  margin-bottom: 20px;
}

.file-upload input[type="file"] {
  width: 100%;
  margin-bottom: 10px;
  padding: 5px;
}

.file-upload button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.file-upload button:hover {
  background: #0056b3;
}

.layer-controls {
  margin-bottom: 20px;
}

.layer-controls h4 {
  margin-bottom: 10px;
  color: #333;
}

.layer-item {
  margin-bottom: 8px;
}

.layer-item label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.layer-item input[type="checkbox"] {
  margin-right: 8px;
}

.entity-count {
  margin-left: auto;
  font-size: 12px;
  color: #666;
}

.stats {
  padding: 15px;
  background: white;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.stats h4 {
  margin-top: 0;
  color: #333;
}

.stats p {
  margin: 5px 0;
  font-size: 14px;
}

.canvas-container {
  flex: 1;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>