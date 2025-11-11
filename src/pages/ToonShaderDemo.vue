<template>
  <div class="toon-demo">
    <div class="canvas-container" ref="canvasContainer"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

const canvasContainer = ref(null)

let renderer, scene, camera, orbit, clock, animationId
let mesh, outlineMesh, toonMat, outlineMat

// Toon Shader（GLSL）：分级漫反射 + Rim Light（卡通光照边缘加亮）
const toonVertex = /* glsl */`
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;
  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`

const toonFragment = /* glsl */`
  precision highp float;
  varying vec3 vWorldPos;
  varying vec3 vWorldNormal;

  uniform vec3 uLightPos;
  uniform vec3 uBaseColor;
  uniform float uLevels;       // 漫反射分级数量（量化）
  uniform float uRimStrength;  // 边缘加亮强度
  uniform float uAmbient;      // 环境光基底

  void main() {
    vec3 N = normalize(vWorldNormal);
    vec3 L = normalize(uLightPos - vWorldPos);
    vec3 V = normalize(cameraPosition - vWorldPos);

    // 漫反射并量化（Toon 阶梯）
    float ndotl = max(dot(N, L), 0.0);
    float diff = floor(ndotl * uLevels) / uLevels;

    // Rim Light（视角边缘加亮）
    float rim = pow(1.0 - max(dot(N, V), 0.0), 2.0) * uRimStrength;

    vec3 color = uBaseColor * (uAmbient + (1.0 - uAmbient) * diff) + vec3(rim);
    gl_FragColor = vec4(color, 1.0);
  }
`

// 轮廓描边（GLSL）：沿法线外扩顶点，反面渲染为黑色
const outlineVertex = /* glsl */`
  uniform float uThickness;
  void main() {
    vec3 newPos = position + normal * uThickness;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`

const outlineFragment = /* glsl */`
  precision highp float;
  void main() {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // 纯黑轮廓
  }
`

function init () {
  const container = canvasContainer.value
  if (!container) {
    console.error('canvasContainer 未找到')
    return
  }

  let width = container.clientWidth
  let height = container.clientHeight
  if (!width || !height) {
    // 容器尺寸为 0 时做回退，避免黑屏
    width = Math.max(1, window.innerWidth - 280)
    height = Math.max(1, window.innerHeight - 120)
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
  orbit.target.set(0, 0.0, 0)
  orbit.update()

  // 几何体（复杂曲面更能体现轮廓描边）
  const geo = new THREE.TorusKnotGeometry(0.7, 0.22, 180, 32)

  // Toon 材质
  toonMat = new THREE.ShaderMaterial({
    vertexShader: toonVertex,
    fragmentShader: toonFragment,
    uniforms: {
      uLightPos: { value: new THREE.Vector3(1.0, 1.2, 1.2) },
      uBaseColor: { value: new THREE.Color('#4ecdc4').toArray().slice(0, 3) },
      uLevels: { value: 4.0 },
      uRimStrength: { value: 0.25 },
      uAmbient: { value: 0.25 },
    }
  })
  mesh = new THREE.Mesh(geo, toonMat)
  scene.add(mesh)

  // 轮廓材质（反面渲染，法线外扩）
  outlineMat = new THREE.ShaderMaterial({
    vertexShader: outlineVertex,
    fragmentShader: outlineFragment,
    uniforms: {
      uThickness: { value: 0.03 }
    },
    side: THREE.BackSide,    // 渲染背面来形成外轮廓
    depthTest: true,
    depthWrite: true
  })
  outlineMesh = new THREE.Mesh(geo, outlineMat)
  outlineMesh.renderOrder = 0  // 保持正常渲染顺序
  scene.add(outlineMesh)

  // （可选）少量环境光，避免完全黑
  scene.add(new THREE.AmbientLight(0xffffff, 0.15))

  clock = new THREE.Clock()
  animate()

  window.addEventListener('resize', onResize)
}

function animate () {
  const t = clock.getElapsedTime()

  // 光源围绕物体转动，产生变化
  const lightPos = new THREE.Vector3(
    Math.sin(t * 0.8) * 1.6,
    1.2 + Math.sin(t * 0.6) * 0.2,
    Math.cos(t * 0.7) * 1.6
  )

  if (toonMat) {
    toonMat.uniforms.uLightPos.value.copy(lightPos)
  }

  // 轻微旋转以展示轮廓效果
  mesh.rotation.y += 0.003
  outlineMesh.rotation.y += 0.003

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

onMounted(() => init())

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', onResize)
  orbit?.dispose()

  mesh?.geometry?.dispose()
  outlineMesh?.geometry?.dispose()
  toonMat?.dispose()
  outlineMat?.dispose()
  renderer?.dispose()

  const container = canvasContainer.value
  const canvas = renderer?.domElement
  if (container && canvas && container.contains(canvas)) {
    container.removeChild(canvas)
  }
})
</script>

<style scoped>
.toon-demo {
  height: calc(100vh - 120px); /* 适配你的顶部布局高度 */
  background: #0f1116;
  display: flex;
}

.canvas-container {
  flex: 1;
  width: 100%;
  height: 100%;
}
</style>