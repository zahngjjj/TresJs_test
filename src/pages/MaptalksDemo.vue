<template>
  <div class="maptalks-demo">
    <div class="sidebar">
      <h3>城市 3D 可视化</h3>
      <div class="row">
        <label>高度缩放</label>
        <input type="range" min="0.5" max="3" step="0.01" v-model.number="heightScale" />
        <span class="value">{{ heightScale.toFixed(2) }}</span>
      </div>
      <p class="tip">OSM 底图 + maptalks.three 多边形拉伸</p>
    </div>
    <div ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import * as maptalks from 'maptalks'
import { ThreeLayer } from 'maptalks.three'

// 地图容器
const mapContainer = ref(null)
// 高度缩放
const heightScale = ref(1.0)

let map, tileLayer, threeLayer
let meshes = []

// 示例：以上海为中心，构造三个示例建筑多边形
const center = [121.4737, 31.2304] // [lng, lat]
function rect(lng, lat, dx, dy) {
  // 构造矩形 Polygon，闭合
  return [
    [lng - dx, lat - dy],
    [lng - dx, lat + dy],
    [lng + dx, lat + dy],
    [lng + dx, lat - dy],
    [lng - dx, lat - dy],
  ]
}
const buildingsGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { name: 'Tower A', height: 100 },
      geometry: { type: 'Polygon', coordinates: [rect(center[0] - 0.0010, center[1], 0.00018, 0.00014)] },
    },
    {
      type: 'Feature',
      properties: { name: 'Tower B', height: 60 },
      geometry: { type: 'Polygon', coordinates: [rect(center[0] + 0.0010, center[1] + 0.0007, 0.00015, 0.00012)] },
    },
    {
      type: 'Feature',
      properties: { name: 'Mall', height: 40 },
      geometry: { type: 'Polygon', coordinates: [rect(center[0] + 0.0004, center[1] - 0.0010, 0.00030, 0.00022)] },
    },
  ],
}

function buildCity() {
  // 清空旧 mesh
  meshes.forEach(m => threeLayer.removeMesh(m))
  meshes = []

  const material = new THREE.MeshPhongMaterial({ color: '#e74c3c' }) // 主色（底部颜色）
  // 遍历 GeoJSON 特征，转为 maptalks Geometry 再拉伸
  for (const f of buildingsGeoJSON.features) {
    const geom = maptalks.GeoJSON.toGeometry(f)
    const height = (f.properties?.height || 30) * heightScale.value

    // 使用 toExtrudePolygon 直接拉伸多边形为 3D 体块
    const mesh = threeLayer.toExtrudePolygon(
      geom,
      {
        height,
        topColor: '#ffdddd',   // 顶部颜色
        bottomColor: '#b32424',// 侧面/底色
        interactive: false,    // 简化示例：不做拾取
      },
      material
    )
    threeLayer.addMesh(mesh)
    meshes.push(mesh)
  }
}

function init() {
  const container = mapContainer.value
  if (!container) return

  // 显式设置容器尺寸，避免 0×0
  container.style.width = '100%'
  container.style.height = 'calc(100vh - 120px)'

  // 基础地图
  map = new maptalks.Map(container, {
    center,
    zoom: 16,
    pitch: 60,
    bearing: 20,
    attribution: false,
    seamlessZoom: true,
    maxPitch: 65,
  })

  tileLayer = new maptalks.TileLayer('base', {
    urlTemplate: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: ['a', 'b', 'c'],
  })
  map.addLayer(tileLayer)

  // three.js 渲染层
  threeLayer = new ThreeLayer('three', {
    forceRenderOnMoving: true,
    forceRenderOnRotating: true,
    identifyCountOnEvent: 0,
  }).addTo(map)

  // 初始化 three 场景
  threeLayer.prepareToDraw = (gl, scene, camera) => {
    console.log('[MaptalksDemo] prepareToDraw called. Scene ready.')
    scene.add(new THREE.AmbientLight(0xffffff, 0.6))
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6)
    dirLight.position.set(3, 10, 5)
    scene.add(dirLight)

    buildCity()
  }
}

onMounted(() => {
  init()
})

onUnmounted(() => {
  meshes.forEach(m => threeLayer?.removeMesh(m))
  meshes = []
  threeLayer?.remove()
  tileLayer?.remove()
  map?.remove()
})

// 调整高度缩放时重建体块
watch(heightScale, () => {
  if (threeLayer) buildCity()
})
</script>

<style scoped>
.maptalks-demo {
  /* 用固定高度而不是 min-height，保证子元素 height:100% 生效 */
  height: calc(100vh - 120px);
  display: flex;
  background: #0f1116;
  color: #cdd6f4;
}

.sidebar {
  width: 280px;
  padding: 12px 14px;
  background: #0c0e13;
  border-right: 1px solid #1b1f2a;
}

.sidebar h3 {
  margin: 0 0 12px;
  color: #e6edf5;
}

.row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 0;
}
.row label {
  width: 88px;
  color: #9aa5b1;
}
.row input[type="range"] {
  flex: 1;
}
.row .value {
  width: 52px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #aab4c3;
}
.tip {
  margin-top: 12px;
  font-size: 12px;
  color: #9aa5b1;
}

.map-container {
  flex: 1;
  width: 100%;
  height: 100%;
  /* 明确声明，避免父元素非固定高度时出现 0 高 */
  min-height: 300px;
}
</style>