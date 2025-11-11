import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import SvgDomPage from '../pages/SvgDomPage.vue'
import SvgLargePage from '../pages/SvgLargePage.vue'
import DxfCanvasPage from '../pages/DxfCanvasPage.vue'
import Dxf3DPage from '../pages/Dxf3DPage.vue'

const routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/svg-dom', name: 'svg-dom', component: SvgDomPage },
  { path: '/svg-large', name: 'svg-large', component: SvgLargePage },
  { path: '/dxf-canvas', name: 'dxf-canvas', component: DxfCanvasPage },
  { path: '/dxf-3d', name: 'dxf-3d', component: Dxf3DPage },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})