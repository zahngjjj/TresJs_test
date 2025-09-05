<template>
  <TresGroup ref="cloudRef" :scale="scale">
    <TresMesh 
      :position="[0, 0, 0]"
      :cast-shadow="false"
      :receive-shadow="false"
    >
      <TresSphereGeometry :args="[0.5, 16, 16]" />
      <TresMeshBasicMaterial 
        color="#FFFFFF" 
        :transparent="false"
        :fog="false"
      />
    </TresMesh>
  </TresGroup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRenderLoop } from '@tresjs/core'

// 接收外部传入的缩放比例
const props = defineProps({
  scale: {
    type: Array,
    default: () => [1, 1, 1]
  },
  animationSpeed: {
    type: Number,
    default: 0.5
  }
})

const cloudRef = ref()
const { onLoop } = useRenderLoop()

// 云朵浮动动画
let time = 0
onLoop(({ delta }) => {
  if (cloudRef.value) {
    time += delta * props.animationSpeed
    
    // 轻微的上下浮动
    cloudRef.value.position.y += Math.sin(time) * 0.002
    
    // 轻微的左右摆动
    cloudRef.value.position.x += Math.cos(time * 0.7) * 0.001
    
    // 轻微的旋转
    cloudRef.value.rotation.y += delta * 0.05
  }
})

onMounted(() => {
  console.log('云朵组件加载完成！')
})
</script>

<style scoped>
/* 云朵组件样式 */
</style>