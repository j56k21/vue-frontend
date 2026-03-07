<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Admin</h2>
      </div>

      <nav class="sidebar-nav">
        <router-link v-for="menu in menuList" :key="menu.menuCode" :to="menu.url" class="nav-item">
          {{ menu.icon }} {{ menu.menuName }}
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <span>{{ authStore.user?.username }}</span>
          <span class="role-badge">{{ authStore.user?.role }}</span>
        </div>
        <button @click="handleLogout" class="logout-button">로그아웃</button>
      </div>
    </aside>

    <div class="main-content">
      <header class="topbar">
        <h1>{{ pageTitle }}</h1>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const pageTitle = computed(() => {
  const titles = {
    '/': '대시보드',
    '/users': '회원 관리',
    '/menu': '메뉴 관리',
  }
  return titles[route.path] || 'Admin'
})

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    authStore.logout()
  }
}
</script>
