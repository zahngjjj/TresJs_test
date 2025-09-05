<template>
  <TresCanvas clear-color="#82DBC5" window-size>
    <!-- 相机 -->
    <TresPerspectiveCamera :position="[0, 0, 5]" />
    
    <!-- 光源 -->
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[0, 0, 1]" :intensity="0.8" />
    
    <!-- 旋转的立方体 -->
    <TresMesh ref="cubeRef" @click="onCubeClick">
      <TresBoxGeometry :args="[1, 1, 1]" />
      <TresMeshStandardMaterial :color="cubeColor" />
    </TresMesh>
    
    <!-- 地面 -->
    <TresMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]">
      <TresPlaneGeometry :args="[10, 10]" />
      <TresMeshStandardMaterial color="#f0f0f0" />
    </TresMesh>
    
    <!-- 轨道控制器 -->
    <OrbitControls />
  </TresCanvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TresCanvas } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

const cubeRef = ref()
const cubeColor = ref('#ff6b6b')

// 立方体点击事件
const onCubeClick = () => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
  cubeColor.value = colors[Math.floor(Math.random() * colors.length)]
}

// 动画循环
const animate = () => {
  if (cubeRef.value) {
    cubeRef.value.rotation.x += 0.01
    cubeRef.value.rotation.y += 0.01
  }
  requestAnimationFrame(animate)
}

onMounted(() => {
  animate()
})
</script>

<style scoped>
canvas {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
</style>