<template>
  <TresGroup ref="airplaneRef">
    <!-- 飞机机身主体 - 启用投射阴影 -->
    <TresMesh :position="[0, 0, 0]" :cast-shadow="true">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.2, 4]" />
      <TresMeshStandardMaterial 
        color="#E74C3C" 
        :roughness="0.3" 
        :metalness="0.7"
      />
    </TresMesh>
    
    <!-- 飞机机头（锥形） - 启用投射阴影 -->
    <TresMesh :position="[0, 0, 0.7]" :cast-shadow="true">
      <TresConeGeometry :args="[0.08, 0.3, 12]" />
      <TresMeshStandardMaterial 
        color="#C0392B" 
        :roughness="0.2" 
        :metalness="0.8"
      />
    </TresMesh>
    
    <!-- 主机翼 - 启用投射阴影 -->
    <TresMesh :position="[0, -0.02, 0.1]" :cast-shadow="true">
      <TresBoxGeometry :args="[2.0, 0.08, 0.4]" />
      <TresMeshStandardMaterial 
        color="#34495E" 
        :roughness="0.4" 
        :metalness="0.6"
      />
    </TresMesh>
    
    <!-- 机翼翼尖 - 启用投射阴影 -->
    <TresMesh :position="[0.9, -0.02, 0.25]" :rotation="[0, 0, 0.3]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.3, 0.06, 0.15]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    <TresMesh :position="[-0.9, -0.02, 0.25]" :rotation="[0, 0, -0.3]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.3, 0.06, 0.15]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 水平尾翼 - 启用投射阴影 -->
    <TresMesh :position="[0, 0.02, -0.5]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.8, 0.06, 0.25]" />
      <TresMeshStandardMaterial color="#34495E" />
    </TresMesh>
    
    <!-- 垂直尾翼 - 启用投射阴影 -->
    <TresMesh :position="[0, 0.15, -0.45]" :cast-shadow="true">
      <TresBoxGeometry :args="[0.06, 0.3, 0.2]" />
      <TresMeshStandardMaterial color="#34495E" />
    </TresMesh>
    
    <!-- 螺旋桨轴 -->
    <TresMesh :position="[0, 0, 0.9]">
      <TresCylinderGeometry :args="[0.02, 0.02, 0.1, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 螺旋桨叶片 -->
    <TresGroup ref="propellerRef" :position="[0, 0, 0.95]">
      <TresMesh :position="[0.25, 0, 0]" :rotation="[0, 0, 0.1]">
        <TresBoxGeometry :args="[0.5, 0.02, 0.08]" />
        <TresMeshStandardMaterial color="#1A252F" />
      </TresMesh>
      <TresMesh :position="[-0.25, 0, 0]" :rotation="[0, 0, -0.1]">
        <TresBoxGeometry :args="[0.5, 0.02, 0.08]" />
        <TresMeshStandardMaterial color="#1A252F" />
      </TresMesh>
      <TresMesh :position="[0, 0.25, 0]" :rotation="[0, 0, 1.67]">
        <TresBoxGeometry :args="[0.5, 0.02, 0.08]" />
        <TresMeshStandardMaterial color="#1A252F" />
      </TresMesh>
    </TresGroup>
    
    <!-- 起落架 -->
    <!-- 主起落架 -->
    <TresMesh :position="[0.4, -0.15, 0]">
      <TresCylinderGeometry :args="[0.015, 0.015, 0.2, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    <TresMesh :position="[-0.4, -0.15, 0]">
      <TresCylinderGeometry :args="[0.015, 0.015, 0.2, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 前起落架 -->
    <TresMesh :position="[0, -0.12, 0.4]">
      <TresCylinderGeometry :args="[0.012, 0.012, 0.15, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 轮子 -->
    <TresMesh :position="[0.4, -0.25, 0]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.04, 0.04, 0.02, 12]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    <TresMesh :position="[-0.4, -0.25, 0]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.04, 0.04, 0.02, 12]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    <TresMesh :position="[0, -0.2, 0.4]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.03, 0.03, 0.015, 12]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    
    <!-- 驾驶舱窗户 -->
    <TresMesh :position="[0, 0.08, 0.3]">
      <TresBoxGeometry :args="[0.15, 0.08, 0.3]" />
      <TresMeshStandardMaterial 
        color="#3498DB" 
        :opacity="0.7" 
        :transparent="true"
        :roughness="0.1"
        :metalness="0.1"
      />
    </TresMesh>
    
    <!-- 机身条纹装饰 -->
    <TresMesh :position="[0, 0.05, 0]">
      <TresBoxGeometry :args="[0.02, 0.02, 1.0]" />
      <TresMeshStandardMaterial color="#F39C12" />
    </TresMesh>
    <TresMesh :position="[0, -0.05, 0]">
      <TresBoxGeometry :args="[0.02, 0.02, 1.0]" />
      <TresMeshStandardMaterial color="#F39C12" />
    </TresMesh>
    
    <!-- 发动机进气口 -->
    <TresMesh :position="[0, -0.08, 0.2]">
      <TresCylinderGeometry :args="[0.06, 0.04, 0.1, 12]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
  </TresGroup>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRenderLoop } from '@tresjs/core'

const airplaneRef = ref()
const propellerRef = ref()
const { onLoop } = useRenderLoop()

// 螺旋桨旋转动画
onLoop(({ delta }) => {
  if (propellerRef.value) {
    propellerRef.value.rotation.z += delta * 15 // 快速旋转
  }
})

onMounted(() => {
  console.log('飞机组件加载完成！')
})
</script>

<style scoped>
/* 飞机组件样式 */
</style>