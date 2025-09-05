<template>
  <TresGroup ref="airplaneRef">
    <!-- 主机身 - 更长更宽，模拟波音747 -->
    <TresMesh :position="[0, 0, 0]">
      <TresCylinderGeometry :args="[0.15, 0.18, 3.0, 16]" />
      <TresMeshStandardMaterial 
        color="#FFFFFF" 
        :roughness="0.2" 
        :metalness="0.8"
      />
    </TresMesh>
    
    <!-- 机头部分 -->
    <TresMesh :position="[0, 0, 1.8]">
      <TresSphereGeometry :args="[0.15, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]" />
      <TresMeshStandardMaterial color="#FFFFFF" :roughness="0.2" :metalness="0.8" />
    </TresMesh>
    
    <!-- 机尾部分 -->
    <TresMesh :position="[0, 0, -1.8]">
      <TresConeGeometry :args="[0.15, 0.6, 16]" />
      <TresMeshStandardMaterial color="#FFFFFF" :roughness="0.2" :metalness="0.8" />
    </TresMesh>
    
    <!-- 主机翼 - 更大更真实 -->
    <TresMesh :position="[0, -0.05, 0.2]">
      <TresBoxGeometry :args="[4.5, 0.15, 1.2]" />
      <TresMeshStandardMaterial color="#E8E8E8" :roughness="0.3" :metalness="0.7" />
    </TresMesh>
    
    <!-- 机翼翼尖 -->
    <TresMesh :position="[2.1, -0.05, 0.5]" :rotation="[0, 0, 0.2]">
      <TresBoxGeometry :args="[0.6, 0.12, 0.4]" />
      <TresMeshStandardMaterial color="#D0D0D0" />
    </TresMesh>
    <TresMesh :position="[-2.1, -0.05, 0.5]" :rotation="[0, 0, -0.2]">
      <TresBoxGeometry :args="[0.6, 0.12, 0.4]" />
      <TresMeshStandardMaterial color="#D0D0D0" />
    </TresMesh>
    
    <!-- 发动机舱 - 4个发动机模拟波音747 -->
    <TresMesh :position="[1.2, -0.25, 0.1]">
      <TresCylinderGeometry :args="[0.12, 0.15, 0.8, 16]" />
      <TresMeshStandardMaterial color="#C0C0C0" :roughness="0.1" :metalness="0.9" />
    </TresMesh>
    <TresMesh :position="[-1.2, -0.25, 0.1]">
      <TresCylinderGeometry :args="[0.12, 0.15, 0.8, 16]" />
      <TresMeshStandardMaterial color="#C0C0C0" :roughness="0.1" :metalness="0.9" />
    </TresMesh>
    <TresMesh :position="[0.8, -0.25, 0.1]">
      <TresCylinderGeometry :args="[0.12, 0.15, 0.8, 16]" />
      <TresMeshStandardMaterial color="#C0C0C0" :roughness="0.1" :metalness="0.9" />
    </TresMesh>
    <TresMesh :position="[-0.8, -0.25, 0.1]">
      <TresCylinderGeometry :args="[0.12, 0.15, 0.8, 16]" />
      <TresMeshStandardMaterial color="#C0C0C0" :roughness="0.1" :metalness="0.9" />
    </TresMesh>
    
    <!-- 发动机进气口 -->
    <TresMesh :position="[1.2, -0.25, 0.5]">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.2, 16]" />
      <TresMeshStandardMaterial color="#404040" />
    </TresMesh>
    <TresMesh :position="[-1.2, -0.25, 0.5]">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.2, 16]" />
      <TresMeshStandardMaterial color="#404040" />
    </TresMesh>
    <TresMesh :position="[0.8, -0.25, 0.5]">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.2, 16]" />
      <TresMeshStandardMaterial color="#404040" />
    </TresMesh>
    <TresMesh :position="[-0.8, -0.25, 0.5]">
      <TresCylinderGeometry :args="[0.08, 0.12, 0.2, 16]" />
      <TresMeshStandardMaterial color="#404040" />
    </TresMesh>
    
    <!-- 水平尾翼 -->
    <TresMesh :position="[0, 0.05, -1.4]">
      <TresBoxGeometry :args="[1.8, 0.12, 0.6]" />
      <TresMeshStandardMaterial color="#E8E8E8" :roughness="0.3" :metalness="0.7" />
    </TresMesh>
    
    <!-- 垂直尾翼 -->
    <TresMesh :position="[0, 0.4, -1.3]">
      <TresBoxGeometry :args="[0.12, 0.8, 0.5]" />
      <TresMeshStandardMaterial color="#E8E8E8" :roughness="0.3" :metalness="0.7" />
    </TresMesh>
    
    <!-- 驾驶舱窗户 -->
    <TresMesh :position="[0, 0.12, 1.2]">
      <TresBoxGeometry :args="[0.3, 0.15, 0.6]" />
      <TresMeshStandardMaterial 
        color="#1E3A8A" 
        :opacity="0.6" 
        :transparent="true"
        :roughness="0.1"
        :metalness="0.1"
      />
    </TresMesh>
    
    <!-- 客舱窗户 -->
    <TresGroup>
      <!-- 左侧窗户 -->
      <TresMesh v-for="i in 12" :key="'left-' + i" :position="[0.16, 0.05, 1.0 - i * 0.15]">
        <TresBoxGeometry :args="[0.02, 0.08, 0.06]" />
        <TresMeshStandardMaterial 
          color="#1E3A8A" 
          :opacity="0.7" 
          :transparent="true"
        />
      </TresMesh>
      <!-- 右侧窗户 -->
      <TresMesh v-for="i in 12" :key="'right-' + i" :position="[-0.16, 0.05, 1.0 - i * 0.15]">
        <TresBoxGeometry :args="[0.02, 0.08, 0.06]" />
        <TresMeshStandardMaterial 
          color="#1E3A8A" 
          :opacity="0.7" 
          :transparent="true"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- 起落架 -->
    <!-- 主起落架 -->
    <TresMesh :position="[0.8, -0.35, -0.2]">
      <TresCylinderGeometry :args="[0.02, 0.02, 0.4, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    <TresMesh :position="[-0.8, -0.35, -0.2]">
      <TresCylinderGeometry :args="[0.02, 0.02, 0.4, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 前起落架 -->
    <TresMesh :position="[0, -0.3, 1.0]">
      <TresCylinderGeometry :args="[0.015, 0.015, 0.3, 8]" />
      <TresMeshStandardMaterial color="#2C3E50" />
    </TresMesh>
    
    <!-- 轮子 -->
    <TresMesh :position="[0.8, -0.55, -0.2]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.08, 0.08, 0.04, 16]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    <TresMesh :position="[-0.8, -0.55, -0.2]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.08, 0.08, 0.04, 16]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    <TresMesh :position="[0, -0.45, 1.0]" :rotation="[Math.PI/2, 0, 0]">
      <TresCylinderGeometry :args="[0.06, 0.06, 0.03, 16]" />
      <TresMeshStandardMaterial color="#1A1A1A" />
    </TresMesh>
    
    <!-- 机身装饰条纹 -->
    <TresMesh :position="[0, 0.1, 0]">
      <TresBoxGeometry :args="[0.03, 0.02, 2.8]" />
      <TresMeshStandardMaterial color="#DC2626" />
    </TresMesh>
    <TresMesh :position="[0, -0.1, 0]">
      <TresBoxGeometry :args="[0.03, 0.02, 2.8]" />
      <TresMeshStandardMaterial color="#2563EB" />
    </TresMesh>
    
    <!-- 机门 -->
    <TresMesh :position="[0.16, -0.02, 0.8]">
      <TresBoxGeometry :args="[0.02, 0.25, 0.15]" />
      <TresMeshStandardMaterial color="#B0B0B0" />
    </TresMesh>
    <TresMesh :position="[-0.16, -0.02, 0.8]">
      <TresBoxGeometry :args="[0.02, 0.25, 0.15]" />
      <TresMeshStandardMaterial color="#B0B0B0" />
    </TresMesh>
  </TresGroup>
</template>

<script setup>
import { ref } from 'vue'

const airplaneRef = ref()

// 可以添加动画或其他交互逻辑
defineExpose({
  airplaneRef
})
</script>