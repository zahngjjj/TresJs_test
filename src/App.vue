<template>
  <div id="app">
    <!-- 切换按钮 -->
    <!-- <div class="controls">
      <button @click="currentDemo = 'earth'" :class="{ active: currentDemo === 'earth' }">
        地球Demo
      </button>
      <button @click="currentDemo = 'scene'" :class="{ active: currentDemo === 'scene' }">
        原场景
      </button>
    </div> -->
    
    <!-- 渲染对应组件 -->
    <!-- <EarthDemo v-if="currentDemo === 'earth'" />
    <ThreeScene v-else /> -->
     <!-- <Test2></Test2> -->
    <Test3></Test3>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ThreeScene from './components/ThreeScene.vue'
import EarthDemo from './components/EarthDemo.vue'
import Test from './test.vue'
import Test2 from './test2.vue'
import Test3 from './test3.vue'
// import Test4 from './test4.vue'

const currentDemo = ref('earth')
</script>

<style>
#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.controls button.active {
  background: #007bff;
  color: white;
}

.controls button:hover {
  background: rgba(255, 255, 255, 1);
}

.controls button.active:hover {
  background: #0056b3;
}
</style>

<style scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  /* color: #2c3e50; */
  margin: 0;
  padding: 20px; 
}

h1 {
  margin-bottom: 20px;
}
</style>