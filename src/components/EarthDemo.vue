<template>
  <TresCanvas window-size preset="realistic" :shadows="true">
    <!-- 相机设置 -->
    <TresPerspectiveCamera 
      :position="[0, 0, 8]" 
      :fov="45" 
      :near="0.1" 
      :far="1000" 
    />
    
    <!-- 地球组 -->
    <TresGroup ref="earthGroup">
      <!-- 地球主体 - 启用接收阴影 -->
      <TresMesh ref="earthRef" :receive-shadow="true">
        <TresSphereGeometry :args="[2, 64, 64]" />
        <TresMeshStandardMaterial 
          :color="'#4A90E2'"
          :roughness="0.8"
          :metalness="0.1"
        />
      </TresMesh>
      
      <!-- 大陆/森林 - 启用接收阴影 -->
      <TresMesh 
        v-for="(continent, index) in continents" 
        :key="index"
        :position="continent.position"
        :rotation="continent.rotation"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="continent.size" />
        <TresMeshStandardMaterial 
          :color="continent.color"
          :roughness="0.9"
        />
      </TresMesh>
      
      <!-- 小岛屿 - 启用接收阴影 -->
      <TresMesh 
        v-for="(island, index) in islands" 
        :key="index"
        :position="island.position"
        :receive-shadow="true"
      >
        <TresBoxGeometry :args="island.size" />
        <TresMeshStandardMaterial 
          :color="island.color"
          :roughness="0.8"
        />
      </TresMesh>
    </TresGroup>
    
    <!-- 使用新的飞机组件 -->
    <TresGroup ref="airplaneGroup" :position="airplanePosition">
      <Airplane />
    </TresGroup>
    
    <!-- 使用新的云朵组件 -->
    <TresGroup 
      v-for="(cloud, index) in clouds" 
      :key="index"
      :position="cloud.position"
      :receive-shadow="false"
      :cast-shadow="false"
    >
      <Cloud 
        :scale="cloud.scale" 
        :animation-speed="cloud.animationSpeed || 0.5"
      />
    </TresGroup>
    
    <!-- 光照 - 配置阴影 -->
    <TresAmbientLight :intensity="0.3" />
    <TresDirectionalLight 
    :position="[5, 5, 5]" 
    :intensity="1" 
    :cast-shadow="true"
    :shadow-mapSize-width="1024"
    :shadow-mapSize-height="1024"
    :shadow-camera-near="1"
    :shadow-camera-far="20"
    :shadow-camera-left="-8"
    :shadow-camera-right="8"
    :shadow-camera-top="8"
    :shadow-camera-bottom="-8"
    />
    
    <!-- 轨道控制器 -->
    <OrbitControls 
      :enable-damping="true" 
      :damping-factor="0.05"
      :min-distance="4"
      :max-distance="15"
    />
  </TresCanvas>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import * as THREE from 'three'
import Airplane from './Airplane.vue'
import Cloud from './Cloud.vue'

const earthRef = ref()
const earthGroup = ref()
const airplaneGroup = ref()
const airplanePosition = ref([3, 0, 0])
const { onLoop } = useRenderLoop()

// 大陆数据
const continents = ref([
  {
    position: [0.8, 0.5, 1.5],
    rotation: [0.2, 0.3, 0.1],
    size: [0.8, 0.3, 0.6],
    color: '#27AE60'
  },
  {
    position: [-1.2, 0.2, 1.2],
    rotation: [-0.1, 0.5, 0.2],
    size: [1.0, 0.2, 0.8],
    color: '#2ECC71'
  },
  {
    position: [0.3, -1.0, 1.3],
    rotation: [0.3, -0.2, 0.4],
    size: [0.6, 0.25, 0.5],
    color: '#F39C12'
  },
  {
    position: [-0.5, 0.8, -1.4],
    rotation: [0.1, 0.8, -0.1],
    size: [0.9, 0.2, 0.7],
    color: '#27AE60'
  },
  {
    position: [1.1, -0.6, -1.1],
    rotation: [-0.2, 0.4, 0.3],
    size: [0.7, 0.3, 0.6],
    color: '#E67E22'
  }
])

// 小岛屿数据
const islands = ref([
  { position: [1.8, 0.3, 0.5], size: [0.2, 0.1, 0.15], color: '#27AE60' },
  { position: [-1.7, -0.4, 0.8], size: [0.15, 0.08, 0.12], color: '#2ECC71' },
  { position: [0.9, 1.6, -0.3], size: [0.18, 0.09, 0.14], color: '#F39C12' },
  { position: [-0.8, -1.5, -0.6], size: [0.16, 0.07, 0.13], color: '#27AE60' },
  { position: [1.4, 0.9, 1.2], size: [0.12, 0.06, 0.1], color: '#E67E22' }
])

// 更新的云朵数据 - 增加动画速度参数
const clouds = ref([
  { 
    position: [2.8, 1.2, 0.5], 
    scale: [1.2, 0.8, 1.0],
    animationSpeed: 0.3
  },
  { 
    position: [-2.5, 0.8, -1.2], 
    scale: [0.9, 0.6, 0.8],
    animationSpeed: 0.5
  },
  { 
    position: [1.5, -2.2, 1.8], 
    scale: [1.4, 0.9, 1.2],
    animationSpeed: 0.4
  },
  { 
    position: [-1.8, 2.0, 0.8], 
    scale: [1.0, 0.7, 0.9],
    animationSpeed: 0.6
  },
  { 
    position: [0.5, 1.8, -2.3], 
    scale: [1.3, 1.0, 1.1],
    animationSpeed: 0.35
  },
  { 
    position: [-2.8, -1.5, 0.3], 
    scale: [0.8, 0.5, 0.7],
    animationSpeed: 0.45
  }
])

// 飞机轨道参数
let airplaneAngle = 0
const airplaneRadius = 3.5
const airplaneSpeed = 0.8

// 动画循环
onLoop(({ delta }) => {
  // 地球自转
  if (earthGroup.value) {
    earthGroup.value.rotation.y += delta * 0.2
  }
  
  // 飞机绕地球飞行
  airplaneAngle += delta * airplaneSpeed
  const x = Math.cos(airplaneAngle) * airplaneRadius
  const z = Math.sin(airplaneAngle) * airplaneRadius
  const y = Math.sin(airplaneAngle * 2) * 0.5
  
  airplanePosition.value = [x, y, z]
  
  // 飞机朝向飞行方向
  if (airplaneGroup.value) {
    airplaneGroup.value.lookAt(
      Math.cos(airplaneAngle + 0.1) * airplaneRadius,
      Math.sin((airplaneAngle + 0.1) * 2) * 0.5,
      Math.sin(airplaneAngle + 0.1) * airplaneRadius
    )
  }
})

onMounted(() => {
  console.log('地球Demo加载完成！')
})
</script>

<style scoped>
/* 确保画布占满容器 */
</style>