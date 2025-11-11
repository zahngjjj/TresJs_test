import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SvgDomPage from '../pages/SvgDomPage.vue'
import SvgLargePage from '../pages/SvgLargePage.vue'
import DxfCanvasPage from '../pages/DxfCanvasPage.vue'
import Dxf3DPage from '../pages/Dxf3DPage.vue'

const routes = [
  { path: '/', name: 'home', component: Home, meta: { title: '首页', breadcrumb: '首页' } },
  { path: '/svg-dom', name: 'svg-dom', component: SvgDomPage, meta: { title: 'SVG DOM操作', breadcrumb: 'SVG DOM操作' } },
  { path: '/svg-large', name: 'svg-large', component: SvgLargePage, meta: { title: '超大SVG优化', breadcrumb: '超大SVG优化' } },
  { path: '/dxf-canvas', name: 'dxf-canvas', component: DxfCanvasPage, meta: { title: 'DXF Canvas渲染', breadcrumb: 'DXF Canvas渲染' } },
  { path: '/dxf-3d', name: 'dxf-3d', component: Dxf3DPage, meta: { title: 'DXF 3D渲染', breadcrumb: 'DXF 3D渲染' } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})
router.afterEach((to) => {
  document.title = to.meta?.title || 'TresJS 测试项目'
})

export default router