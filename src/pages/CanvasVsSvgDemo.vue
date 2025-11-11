<template>
  <div class="canvas-vs-svg">
    <div class="controls">
      <div class="control-row">
        <label>旋转角度</label>
        <input type="range" min="-180" max="180" step="1" v-model.number="angle" />
        <span>{{ angle }}°</span>
      </div>
      <div class="control-row">
        <label>缩放</label>
        <input type="range" min="0.5" max="2" step="0.01" v-model.number="scale" />
        <span>{{ scale.toFixed(2) }}</span>
      </div>
    </div>

    <div class="panes">
      <section class="pane">
        <h3>Canvas 2D</h3>
        <canvas ref="canvas" class="canvas"></canvas>
        <ul class="notes">
          <li>即时模式：每次参数变化都需要手动重绘。</li>
          <li>图形不在 DOM 中；事件在画布级处理。</li>
          <li>需处理 DPR 才能保持清晰。</li>
        </ul>
      </section>

      <section class="pane">
        <h3>SVG</h3>
        <svg class="svg" viewBox="0 0 200 200">
          <polygon
            :points="svgPoints"
            fill="#e02424"
            :transform="`translate(100,100) rotate(${angle}) scale(${scale}) translate(-100,-100)`"
            @mouseenter="svgHover = true"
            @mouseleave="svgHover = false"
            :style="{ filter: svgHover ? 'drop-shadow(0 0 8px rgba(224,36,36,0.6))' : 'none' }"
          />
        </svg>
        <ul class="notes">
          <li>保留模式：图形是 DOM 节点，可直接改属性。</li>
          <li>元素级事件与 CSS 效果天然支持。</li>
          <li>矢量缩放保持清晰，无需关心 DPR。</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const angle = ref(0)
const scale = ref(1)
const svgHover = ref(false)

const canvas = ref(null)

// 三角形顶点（与 SVG 使用同样坐标）
const basePoints = [
  { x: 100, y: 40 },
  { x: 40, y: 160 },
  { x: 160, y: 160 },
]
const svgPoints = computed(() => basePoints.map(p => `${p.x},${p.y}`).join(' '))

function drawCanvas () {
  const el = canvas.value
  if (!el) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssWidth = el.clientWidth || 300
  const cssHeight = el.clientHeight || 300

  el.width = Math.floor(cssWidth * dpr)
  el.height = Math.floor(cssHeight * dpr)

  const ctx = el.getContext('2d')
  if (!ctx) return

  // 将坐标系恢复到 CSS 像素
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, cssWidth, cssHeight)

  ctx.save()
  // 以中心为基准做旋转与缩放，保证表现一致
  ctx.translate(cssWidth / 2, cssHeight / 2)
  ctx.rotate(angle.value * Math.PI / 180)
  ctx.scale(scale.value, scale.value)
  ctx.translate(-cssWidth / 2, -cssHeight / 2)

  ctx.beginPath()
  ctx.moveTo(100, 40)
  ctx.lineTo(40, 160)
  ctx.lineTo(160, 160)
  ctx.closePath()
  ctx.fillStyle = '#e02424'
  ctx.fill()
  ctx.restore()
}

function onResize () {
  drawCanvas()
}

onMounted(() => {
  // 保证画布有可用 CSS 尺寸
  const el = canvas.value
  if (el) {
    el.style.width = '100%'
    el.style.height = '300px'
  }
  drawCanvas()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

// 即时模式：任一参数变化都要重绘
watch([angle, scale], drawCanvas)
</script>

<style scoped>
.canvas-vs-svg {
  padding: 16px;
  background: #0f1116;
  color: #cdd6f4;
  min-height: calc(100vh - 120px);
}

.controls {
  display: flex;
  gap: 20px;
  margin-bottom: 12px;
  align-items: center;
}

.control-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.control-row label {
  width: 80px;
  color: #9aa5b1;
}
.control-row input[type="range"] {
  width: 240px;
}
.control-row span {
  width: 64px;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #aab4c3;
}

.panes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.pane {
  background: #12151c;
  border: 1px solid #1b1f2a;
  border-radius: 10px;
  padding: 12px;
}

.pane h3 {
  margin: 4px 0 12px;
  color: #e6edf5;
}

.canvas, .svg {
  width: 100%;
  height: 300px;
  background: #0f1116;
  border: 1px solid #1b1f2a;
  border-radius: 8px;
}

.notes {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #9aa5b1;
  font-size: 12px;
}
</style>