<template>
  <div id="app">
    <!-- 导航菜单 -->
    <div class="navigation">
      <div class="nav-buttons">
        <!-- <button @click="currentDemo = 'earth'" :class="{ active: currentDemo === 'earth' }">
          🌍 地球Demo
        </button>
        <button @click="currentDemo = 'scene'" :class="{ active: currentDemo === 'scene' }">
          🎭 原场景
        </button>
        <button @click="currentDemo = 'test'" :class="{ active: currentDemo === 'test' }">
          🔧 DXF 3D渲染
        </button> -->
        <button @click="currentDemo = 'test2'" :class="{ active: currentDemo === 'test2' }">
          📐 SVG DOM操作
        </button>
        <button @click="currentDemo = 'test3'" :class="{ active: currentDemo === 'test3' }">
          ⚡ 超大SVG优化
        </button>
        <button @click="currentDemo = 'test4'" :class="{ active: currentDemo === 'test4' }">
          🎨 DXF Canvas渲染
        </button>
      </div>
    </div>
    
    <!-- 渲染对应组件 -->
    <div class="demo-container">
      <EarthDemo v-if="currentDemo === 'earth'" />
      <ThreeScene v-else-if="currentDemo === 'scene'" />
      <Test v-else-if="currentDemo === 'test'" />
      <Test2 v-else-if="currentDemo === 'test2'" />
      <Test3 v-else-if="currentDemo === 'test3'" />
      <Test4 v-else-if="currentDemo === 'test4'" />
      <div v-else class="welcome">
        <h1>欢迎使用 TresJS 测试项目</h1>
        <p>请选择上方的功能模块开始体验</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ThreeScene from './components/ThreeScene.vue'
import EarthDemo from './components/EarthDemo.vue'
import Test from './test.vue'
import Test2 from './test2.vue'
import Test3 from './test3.vue'
import Test4 from './test4.vue'

const currentDemo = ref('test2')
</script>

<style>
#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* 导航菜单样式 */
.navigation {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navigation h2 {
  margin: 0 0 20px 0;
  text-align: center;
  font-size: 1.8em;
  font-weight: 600;
}

.nav-buttons {
  display: flex;
  justify-content: center;
  gap: 15px;
  flex-wrap: wrap;
}

.nav-buttons button {
  padding: 12px 20px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-buttons button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.nav-buttons button.active {
  background: rgba(255, 255, 255, 0.9);
  color: #667eea;
  border-color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.nav-buttons button.active:hover {
  background: white;
  transform: translateY(-2px);
}

/* 演示容器 */
.demo-container {
  min-height: calc(100vh - 120px);
  background: #f8f9fa;
}

/* 欢迎页面 */
.welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 120px);
  text-align: center;
  color: #495057;
}

.welcome h1 {
  font-size: 3em;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.welcome p {
  font-size: 1.2em;
  color: #6c757d;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .navigation {
    padding: 15px;
  }
  
  .navigation h2 {
    font-size: 1.5em;
    margin-bottom: 15px;
  }
  
  .nav-buttons {
    gap: 10px;
  }
  
  .nav-buttons button {
    padding: 10px 15px;
    font-size: 13px;
  }
  
  .welcome h1 {
    font-size: 2em;
  }
  
  .welcome p {
    font-size: 1em;
    padding: 0 20px;
  }
}

@media (max-width: 480px) {
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-buttons button {
    width: 200px;
  }
}
</style>
