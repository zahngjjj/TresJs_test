<template>
  <TresMesh ref="sphereRef" :scale="1" cast-shadow>
    <TresSphereGeometry :args="[1, 100, 100]" />
    <!-- 纹理加载成功时使用 PBR 材质 -->
    <TresMeshStandardMaterial
      v-if="isTextureLoaded && pbrTexture"
      v-bind="pbrTexture"
      displacement-scale="0.2"
    />
    <!-- 纹理加载失败或未加载时使用默认颜色 -->
    <TresMeshStandardMaterial
      v-else
      color="#dbdbdb"
      roughness="0.8"
      metalness="0.1"
    />
  </TresMesh>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTexture, useRenderLoop } from '@tresjs/core'

const sphereRef = ref(null)
const pbrTexture = ref(null)
const isTextureLoaded = ref(false)
const { onLoop } = useRenderLoop()

// 移除顶层 await，在 onMounted 中异步加载
onMounted(async () => {
  try {
    console.log('开始加载 TexturedBall 纹理...')
    const textures = await useTexture({
      map: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/black-rock/Rock035_2K_Displacement.jpg',
      displacementMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/black-rock/Rock035_2K_Displacement.jpg',
      roughnessMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/black-rock/Rock035_2K_Roughness.jpg',
      normalMap: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/black-rock/Rock035_2K_NormalGL.jpg',
      ambientOcclusion: 'https://raw.githubusercontent.com/Tresjs/assets/main/textures/black-rock/Rock035_2K_AmbientOcclusion.jpg',
    })
    pbrTexture.value = textures
    isTextureLoaded.value = true
    console.log('TexturedBall 纹理加载成功！')
  } catch (error) {
    console.error('TexturedBall 纹理加载失败:', error)
    isTextureLoaded.value = false
  }
})

onLoop(({ delta }) => {
  if (sphereRef.value) {
    sphereRef.value.rotation.y += delta
  }
})
</script>


