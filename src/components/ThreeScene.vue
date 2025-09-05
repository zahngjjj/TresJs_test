<template>
    <TresCanvas window-size preset="realistic">
        <!-- 这里是您的场景 -->
       <TresPerspectiveCamera :position="[1, 2, 5]"
        :fov="45"
        :aspect="1"
        :near="0.1"
        :far="1000"/>
  <TresGroup ref="groupRef" :position="[1,0,0]">
     <TresMesh ref="boxRef" @click="onCubeClick">
          <TresBoxGeometry :args="[1, 1, 1]" />
          <TresMeshStandardMaterial 
            v-if="texture"
            :map="texture" 
          />
          <TresMeshStandardMaterial 
            v-else
            color="orange"
          />
        </TresMesh>
        <!-- 地面 -->
        <TresMesh :position="[0, -2, 0]" :rotation="[-Math.PI / 2, 0, 0]">
          <TresPlaneGeometry :args="[10, 10]" />
          <TresMeshStandardMaterial color="#f0f0f0" />
        </TresMesh>

    </TresGroup>
        <TexturedBall :position="[0, -2, 0]"/>
        <TresAmbientLight :intensity="1" />
           <!-- 轨道控制器 -->
      <OrbitControls />
    </TresCanvas>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue'
import { TresCanvas, useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import TexturedBall from './TexturedBall.vue';

const texture = ref(null)
const boxRef = shallowRef(null)
const { onLoop } = useRenderLoop()

// 立方体点击事件
const onCubeClick = () => {
  console.log('立方体被点击了！')
  console.log('当前纹理:', texture.value)
  console.log('纹理是否加载:', !!texture.value)
}

onLoop(({ delta, elapsed }) => {
  if (boxRef.value) {
    boxRef.value.rotation.y += delta
    boxRef.value.rotation.x = elapsed * 0.2
  }
})

onMounted(async () => {
  try {
    // 使用 Three.js 原生加载器
    const THREE = await import('three')
    const loader = new THREE.TextureLoader()
    
    console.log('开始加载纹理...')
    
    // 使用现有的 floor_02.png 图片
    const loadedTexture = await new Promise((resolve, reject) => {
      loader.load(
        '/image/floor_02.png',  // public 目录中的现有文件
        (texture) => {
          console.log('纹理加载成功！')
          console.log('纹理尺寸:', texture.image.width, 'x', texture.image.height)
          console.log('纹理对象:', texture)
          resolve(texture)
        },
        (progress) => {
          console.log('加载进度:', progress)
        },
        (error) => {
          console.error('纹理加载失败:', error)
          reject(error)
        }
      )
    })
    
    texture.value = loadedTexture
    console.log('纹理设置完成，texture.value:', texture.value)
    
  } catch (error) {
    console.error('纹理加载过程出错:', error)
  }
})
</script>

<style scoped>
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
}
#canvas {
  height: 100%;
  width: 100%;
}
</style>