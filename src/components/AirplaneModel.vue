<template>
  <!-- 如果 glTF 模型加载失败，使用简单的几何体飞机 -->
  <TresGroup v-if="!model">
    <!-- 机身 -->
    <TresMesh :position="[0, 0, 0]">
      <TresCylinderGeometry :args="[0.1, 0.15, 1, 8]" />
      <TresMeshStandardMaterial color="#ff4444" />
    </TresMesh>
    
    <!-- 机翼 -->
    <TresMesh :position="[0, 0, 0]" :rotation="[0, 0, Math.PI/2]">
      <TresBoxGeometry :args="[1.5, 0.05, 0.3]" />
      <TresMeshStandardMaterial color="#666666" />
    </TresMesh>
    
    <!-- 尾翼 -->
    <TresMesh :position="[-0.4, 0, 0.1]">
      <TresBoxGeometry :args="[0.3, 0.05, 0.2]" />
      <TresMeshStandardMaterial color="#666666" />
    </TresMesh>
    
    <!-- 垂直尾翼 -->
    <TresMesh :position="[-0.4, 0, 0.2]" :rotation="[Math.PI/2, 0, 0]">
      <TresBoxGeometry :args="[0.2, 0.05, 0.15]" />
      <TresMeshStandardMaterial color="#666666" />
    </TresMesh>
  </TresGroup>
  
  <!-- glTF 模型 - 添加动画 -->
  <TresGroup v-else :scale="[0.009, 0.009, 0.009]" :position="airplanePosition" :rotation="airplaneRotation">
    <primitive :object="model" />
  </TresGroup>
</template>

<script setup>
import { ref, onMounted, shallowRef, onUnmounted } from 'vue'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { useLoader, useRenderLoop } from '@tresjs/core'

// 使用 shallowRef 避免深度响应式包装
const model = shallowRef(null)

// 动画相关变量
const airplanePosition = ref([4, 1, 0])
const airplaneRotation = ref([0, Math.PI, 0])
const animationTime = ref(0)
const radius = 4 // 飞行半径
const speed = 0.5 // 飞行速度

// 动画循环
const { onLoop } = useRenderLoop()

onLoop(({ delta }) => {
  if (model.value) {
    animationTime.value += delta * speed
    
    // 计算圆周运动位置 - 改变x和z的符号来反转方向
    const x = -Math.cos(animationTime.value) * radius  // 添加负号
    const z = -Math.sin(animationTime.value) * radius  // 添加负号
    const y = 1 + Math.sin(animationTime.value * 2) * 0.3
    
    airplanePosition.value = [x, y, z]
    
    // 飞机保持固定朝向，不自转
    airplaneRotation.value = [0, Math.PI, 0]
  }
})

onMounted(async () => {
  try {
    console.log('开始加载飞机模型...')
    const gltf = await useLoader(GLTFLoader, '/models/airplan.glb')
    
    // 克隆场景以避免响应式问题
    model.value = gltf.scene.clone()
    
    console.log('飞机模型加载成功', model.value)
    console.log('模型子对象数量:', model.value.children.length)
  } catch (error) {
    console.error('飞机模型加载失败，使用备用模型:', error)
    console.error('错误详情:', error.message)
    // 保持 model.value 为 null，显示备用几何体飞机
  }
})
</script>