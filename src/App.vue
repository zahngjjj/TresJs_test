<template>
  <div id="app">
    <div class="navigation">
      <div class="nav-buttons">
        <button @click="router.push('/svg-dom')" :class="{ active: $route.path === '/svg-dom' }">
          📐 SVG DOM操作
        </button>
        <button @click="router.push('/svg-large')" :class="{ active: $route.path === '/svg-large' }">
          ⚡ 超大SVG优化
        </button>
        <button @click="router.push('/dxf-canvas')" :class="{ active: $route.path === '/dxf-canvas' }">
          🎨 DXF Canvas渲染
        </button>
        <button @click="router.push('/dxf-3d')" :class="{ active: $route.path === '/dxf-3d' }">
          🔧 DXF 3D渲染
        </button>
        <!-- 新增 Shader Demo 入口 -->
        <button @click="router.push('/shader-demo')" :class="{ active: $route.path === '/shader-demo' }">
          ✨ Shader Demo
        </button>
      </div>
    </div>

    <div class="demo-container">
      <!-- 注入面包屑 -->
      <Breadcrumb />
      <!-- 页面内容 -->
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Breadcrumb from '@/components/Breadcrumb.vue'

const router = useRouter()
</script>

<style>
/* 保持现有样式不变 */
#app {
  width: 100vw;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  position: relative;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
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
.demo-container {
  min-height: calc(100vh - 120px);
  background: #f8f9fa;
}
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
/* 响应式样式保留 */
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
import Breadcrumb from './components/Breadcrumb.vue'
