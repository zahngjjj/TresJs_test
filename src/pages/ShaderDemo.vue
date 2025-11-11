<template>
  <div class="shader-demo">
    <div class="layout">
      <aside class="panel">
        <h3>Shader 控制</h3>

        <div class="row">
          <label>颜色 A</label>
          <input type="color" v-model="controls.colorA" />
        </div>

        <div class="row">
          <label>颜色 B</label>
          <input type="color" v-model="controls.colorB" />
        </div>

        <div class="row">
          <label>粒子颜色</label>
          <input type="color" v-model="controls.particleColor" />
        </div>

        <div class="row">
          <label>光源强度</label>
          <input type="range" min="0" max="2" step="0.01" v-model.number="controls.lightIntensity" />
          <span class="value">{{ controls.lightIntensity.toFixed(2) }}</span>
        </div>

        <div class="row">
          <label>光源自动移动</label>
          <input type="checkbox" v-model="controls.lightMove" />
        </div>

        <div class="row" v-if="!controls.lightMove">
          <label>X</label>
          <input type="range" min="-2" max="2" step="0.01" v-model.number="controls.lightX" />
          <span class="value">{{ controls.lightX.toFixed(2) }}</span>
        </div>
        <div class="row" v-if="!controls.lightMove">
          <label>Y</label>
          <input type="range" min="0" max="3" step="0.01" v-model.number="controls.lightY" />
          <span class="value">{{ controls.lightY.toFixed(2) }}</span>
        </div>
        <div class="row" v-if="!controls.lightMove">
          <label>Z</label>
          <input type="range" min="-2" max="2" step="0.01" v-model.number="controls.lightZ" />
          <span class="value">{{ controls.lightZ.toFixed(2) }}</span>
        </div>

        <div class="row">
          <label>粒子数量</label>
          <input type="range" min="200" max="6000" step="100" v-model.number="controls.particleCount" />
          <span class="value">{{ controls.particleCount }}</span>
        </div>
      </aside>

      <div class="canvas-wrap">
        <div ref="canvasContainer" style="width:920px;height: 600px;" class="canvas-container"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

// 侧边面板控制项
const controls = reactive({
  colorA: '#4ecdc4',
  colorB: '#f39c12',
  particleColor: '#a29bfe',
  lightMove: true,
  lightX: 0,
  lightY: 1.2,
  lightZ: 0.8,
  lightIntensity: 1.0,
  particleCount: 2000,
})

const canvasContainer = ref(null)

let renderer, scene, camera, orbit, clock, animationId
let sphere, floor, points
let advancedMat, floorMat, particleMat

const toVec3 = (hex) => new THREE.Color(hex).toArray().slice(0, 3)

// GLSL —— 高级材质（法线+动态光源+颜色渐变）
const advancedVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`
const advancedFragment = /* glsl */`
  precision highp float;
  varying vec2 vUv;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  uniform float uTime;
  uniform vec3 uLightPos;
  uniform float uLightIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123);
  }
  float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec3 L = normalize(uLightPos - vWorldPos);
    float diff = max(dot(normalize(vWorldNormal), L), 0.0) * uLightIntensity;

    float t = 0.5 + 0.5 * sin(uTime * 0.8 + vUv.x * 6.0);
    float n = noise(vUv * 8.0 + uTime * 0.2);
    vec3 baseColor = mix(uColorA, uColorB, t) + 0.08 * n;

    vec3 V = normalize(cameraPosition - vWorldPos);
    vec3 H = normalize(L + V);
    float spec = pow(max(dot(normalize(vWorldNormal), H), 0.0), 32.0);

    vec3 color = baseColor * (0.25 + 0.75 * diff) + 0.25 * spec * uLightIntensity;
    gl_FragColor = vec4(color, 1.0);
  }
`

// GLSL —— 地面光斑
const floorVertex = /* glsl */`
  varying vec2 vUv;
  varying vec3 vWorldPos;
  void main(){
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`
const floorFragment = /* glsl */`
  precision highp float;
  varying vec3 vWorldPos;
  uniform vec3 uLightPos;
  uniform float uLightIntensity;

  float gaussian(float d, float sigma) {
    return exp(-(d*d)/(2.0*sigma*sigma));
  }

  void main(){
    float dist = length(vWorldPos.xz - uLightPos.xz);
    float glow = gaussian(dist, 0.4) * uLightIntensity;
    vec3 base = vec3(0.10, 0.12, 0.16);
    vec3 lightCol = vec3(0.75, 0.55, 1.0);
    vec3 color = base + lightCol * glow;
    gl_FragColor = vec4(color, 1.0);
  }
`

// GLSL —— 粒子点精灵
const particleVertex = /* glsl */`
  attribute float aSize;
  uniform float uTime;
  varying float vAlpha;

  void main(){
    float pulse = 0.7 + 0.3 * sin(uTime + position.x * 2.0 + position.y * 2.0);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * pulse * (300.0 / -mvPosition.z);
    vAlpha = pulse;
    gl_Position = projectionMatrix * mvPosition;
  }
`
const particleFragment = /* glsl */`
  precision highp float;
  uniform vec3 uColor;
  varying float vAlpha;

  void main(){
    vec2 uv = gl_PointCoord * 2.0 - 1.0;
    float r = length(uv);
    float alpha = smoothstep(1.0, 0.6, r) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`

function buildParticleGeometry (count) {
  const positions = new Float32Array(count * 3)
  const sizes = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    const i3 = i * 3
    positions[i3 + 0] = (Math.random() - 0.5) * 4.0
    positions[i3 + 1] = Math.random() * 2.0 + 0.2
    positions[i3 + 2] = (Math.random() - 0.5) * 4.0
    sizes[i] = 2.5 + Math.random() * 2.5
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
  return geo
}

function initThree () {
  const container = canvasContainer.value
  if (!container) {
    console.error('canvasContainer 未找到')
    return
  }

  // 尺寸：容器为 0 时回退到窗口
  let width = container.clientWidth
  let height = container.clientHeight
  if (!width || !height) {
    console.warn('容器尺寸为 0，使用窗口尺寸作为回退')
    width = Math.max(1, window.innerWidth - 280)   // 面板约 280px
    height = Math.max(1, window.innerHeight - 120) // 页面顶部留白约 120px
  }

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(width, height)
  renderer.setClearColor(0x101014, 1)
  container.appendChild(renderer.domElement)

  scene = new THREE.Scene()

  camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100)
  camera.position.set(0, 1.2, 3.5)

  orbit = new OrbitControls(camera, renderer.domElement)
  orbit.enableDamping = true
  orbit.dampingFactor = 0.08
  orbit.target.set(0, 0.8, 0)  // 初始看向球体
  orbit.update()

  scene.add(new THREE.AmbientLight(0xffffff, 0.25))

  // 1) 球体 + 高级材质
  const sphereGeo = new THREE.SphereGeometry(0.6, 64, 64)
  advancedMat = new THREE.ShaderMaterial({
    vertexShader: advancedVertex,
    fragmentShader: advancedFragment,
    uniforms: {
      uTime: { value: 0 },
      uLightPos: { value: new THREE.Vector3(controls.lightX, controls.lightY, controls.lightZ) },
      uLightIntensity: { value: controls.lightIntensity },
      uColorA: { value: toVec3(controls.colorA) },
      uColorB: { value: toVec3(controls.colorB) },
    }
  })
  sphere = new THREE.Mesh(sphereGeo, advancedMat)
  sphere.position.set(0, 0.8, 0)
  scene.add(sphere)

  // 2) 地面光斑
  const floorGeo = new THREE.PlaneGeometry(6, 6, 1, 1)
  floorMat = new THREE.ShaderMaterial({
    vertexShader: floorVertex,
    fragmentShader: floorFragment,
    uniforms: {
      uLightPos: { value: new THREE.Vector3(controls.lightX, controls.lightY, controls.lightZ) },
      uLightIntensity: { value: controls.lightIntensity },
    },
    side: THREE.DoubleSide
  })
  floor = new THREE.Mesh(floorGeo, floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.position.y = 0.0
  scene.add(floor)

  // 3) 粒子系统
  particleMat = new THREE.ShaderMaterial({
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: toVec3(controls.particleColor) },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  })
  points = new THREE.Points(buildParticleGeometry(controls.particleCount), particleMat)
  scene.add(points)

  clock = new THREE.Clock()
  animate()

  window.addEventListener('resize', onResize)
}

function animate () {
  const elapsed = clock.getElapsedTime()

  // 光源位置：自动/手动
  let lightPos
  if (controls.lightMove) {
    lightPos = new THREE.Vector3(
      Math.sin(elapsed * 0.8) * 1.6,
      1.2 + Math.sin(elapsed * 0.6) * 0.2,
      Math.cos(elapsed * 0.7) * 1.2
    )
  } else {
    lightPos = new THREE.Vector3(controls.lightX, controls.lightY, controls.lightZ)
  }

  if (advancedMat) {
    advancedMat.uniforms.uTime.value = elapsed
    advancedMat.uniforms.uLightPos.value.copy(lightPos)
  }
  if (floorMat) {
    floorMat.uniforms.uLightPos.value.copy(lightPos)
  }
  if (particleMat) {
    particleMat.uniforms.uTime.value = elapsed
  }

  orbit.update()
  renderer.render(scene, camera)
  animationId = requestAnimationFrame(animate)
}

function onResize () {
  const container = canvasContainer.value
  let width = container?.clientWidth || Math.max(1, window.innerWidth - 280)
  let height = container?.clientHeight || Math.max(1, window.innerHeight - 120)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

// —— 绑定控制项到 uniforms —— //
watch(() => controls.colorA, (hex) => {
  if (advancedMat) advancedMat.uniforms.uColorA.value = toVec3(hex)
})
watch(() => controls.colorB, (hex) => {
  if (advancedMat) advancedMat.uniforms.uColorB.value = toVec3(hex)
})
watch(() => controls.particleColor, (hex) => {
  if (particleMat) particleMat.uniforms.uColor.value = toVec3(hex)
})
watch(() => controls.lightIntensity, (val) => {
  if (advancedMat) advancedMat.uniforms.uLightIntensity.value = val
  if (floorMat) floorMat.uniforms.uLightIntensity.value = val
})
watch(() => controls.particleCount, (val) => {
  if (!points) return
  const newGeo = buildParticleGeometry(val)
  points.geometry.dispose()
  points.geometry = newGeo
})

onMounted(() => {
  initThree()
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  orbit?.dispose()

  // 清理资源
  sphere?.geometry?.dispose()
  floor?.geometry?.dispose()
  points?.geometry?.dispose()
  advancedMat?.dispose()
  floorMat?.dispose()
  particleMat?.dispose()

  renderer?.dispose()
  // 移除 canvas
  const container = canvasContainer.value
  const canvas = renderer?.domElement
  if (container && canvas && container.contains(canvas)) {
    container.removeChild(canvas)
  }
})
</script>

<style scoped>
.shader-demo {
  height: calc(100vh - 120px);
  background: #0f1116;
}

.layout {
  height: 100%;
  display: flex;
}

.panel {
  width: 280px;
  padding: 12px 14px;
  background: #0c0e13;
  border-right: 1px solid #1b1f2a;
  color: #cdd6f4;
  overflow-y: auto;
}

.panel h3 {
  margin: 0 0 12px;
  font-size: 16px;
  color: #e6edf5;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
}

.row label {
  width: 88px;
  font-size: 13px;
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

.canvas-wrap {
  flex: 1;
}
</style>