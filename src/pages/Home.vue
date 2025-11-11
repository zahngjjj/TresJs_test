<template>
  <div class="home">
    <!-- 欢迎区域 -->
    <section class="hero">
      <h1>欢迎使用 TresJS 测试项目</h1>
      <p class="subtitle">点击下方入口体验 3D 场景、DXF 图纸与 SVG 优化演示</p>
      <div class="actions">
        <router-link class="nav-btn" to="/svg-dom">📐 SVG DOM操作</router-link>
        <router-link class="nav-btn" to="/svg-large">⚡ 超大SVG优化</router-link>
        <router-link class="nav-btn" to="/dxf-canvas">🎨 DXF Canvas渲染</router-link>
        <router-link class="nav-btn" to="/dxf-3d">🔧 DXF 3D渲染</router-link>
        <router-link class="nav-btn" to="/ShaderDemo">🖌️ GLSL  shader demo</router-link>
        <router-link class="nav-btn" to="/toon-shader">🖌️ Toon Shader</router-link>
        <router-link class="nav-btn" to="/canvas-vs-svg">🟧Canvas vs SVG</router-link>
        <router-link class="nav-btn" to="/maptalks-demo">🟧  🗺️ Maptalks 3D</router-link>
      </div>
    </section>

    <!-- 功能介绍 -->
    <section class="features">
      <div class="feature-card">
        <div class="icon">📐</div>
        <h3>SVG DOM操作</h3>
        <p>按颜色与坐标范围分类 SVG 元素，提供图层与元素的显示/隐藏控制。</p>
        <router-link class="link" to="/svg-dom">前往体验 →</router-link>
      </div>

      <div class="feature-card">
        <div class="icon">⚡</div>
        <h3>超大SVG优化</h3>
        <p>分块加载、虚拟化与裁剪（Culling）策略，附带 FPS 监控与加载进度信息。</p>
        <router-link class="link" to="/svg-large">前往体验 →</router-link>
      </div>

      <div class="feature-card">
        <div class="icon">🎨</div>
        <h3>DXF Canvas渲染</h3>
        <p>在 Canvas 上渲染 DXF 的线段、圆与圆弧，支持缩放平移与实体选中详情。</p>
        <router-link class="link" to="/dxf-canvas">前往体验 →</router-link>
      </div>

      <div class="feature-card">
        <div class="icon">🔧</div>
        <h3>DXF 3D渲染</h3>
        <p>将 DXF 实体转为 Three.js 对象，支持分层可见性与相机自动聚焦。</p>
        <router-link class="link" to="/dxf-3d">前往体验 →</router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
// 本页为纯展示/导航页，无需额外逻辑
</script>

<style scoped>
.home {
  width: 100%;
  min-height: calc(100vh - 120px);
  background: #f8f9fa;
}

/* 顶部欢迎区 */
.hero {
  padding: 60px 30px 30px;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 0 0 24px 24px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}

.hero h1 {
  margin: 0 0 10px;
  font-size: 2.6em;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.subtitle {
  margin: 0 auto 20px;
  max-width: 720px;
  opacity: 0.9;
}

.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.nav-btn {
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

/* 功能介绍 */
.features {
  max-width: 1200px;
  margin: 30px auto;
  padding: 0 20px 40px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.feature-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 14px;
  padding: 18px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.icon {
  font-size: 1.6em;
}

.feature-card h3 {
  margin: 0;
  color: #343a40;
  font-size: 1.1em;
}

.feature-card p {
  margin: 0;
  color: #6c757d;
  min-height: 60px;
  line-height: 1.6;
}

.link {
  margin-top: auto;
  display: inline-block;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.link:hover {
  text-decoration: underline;
}

/* 响应式 */
@media (max-width: 1024px) {
  .features {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .features {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 2.1em;
  }

  .subtitle {
    padding: 0 10px;
  }
}
</style>