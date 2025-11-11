<template>
  <nav class="breadcrumb">
    <router-link class="crumb" to="/">首页</router-link>
    <span class="sep">›</span>
    <router-link
      class="crumb active"
      :to="route.path"
    >
      {{ route.meta?.breadcrumb || route.meta?.title || '当前页' }}
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.crumb {
  color: #495057;
  text-decoration: none;
  font-weight: 500;
}

.crumb:hover {
  text-decoration: underline;
}

.sep {
  color: #adb5bd;
}

.active {
  color: #667eea;
  pointer-events: none;
}
</style>