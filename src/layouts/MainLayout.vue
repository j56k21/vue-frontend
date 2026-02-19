<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>Admin</h2>
      </div>

      <nav class="sidebar-nav">
        <router-link to="/" class="nav-item">
          <span class="icon">🏠</span>
          <span>홈</span>
        </router-link>
        <router-link to="/users" class="nav-item">
          <span class="icon">👥</span>
          <span>회원 관리</span>
        </router-link>
        <router-link to="/menu" class="nav-item">
          <span class="icon">📋</span>
          <span>메뉴 관리</span>
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

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border-right: 3px solid #3498db;
}

.nav-item .icon {
  font-size: 1.25rem;
}

.sidebar-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.role-badge {
  background-color: rgba(52, 152, 219, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.logout-button {
  width: 100%;
  padding: 0.625rem;
  background-color: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.logout-button:hover {
  background-color: rgba(231, 76, 60, 1);
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  background: white;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.topbar h1 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin: 0;
}

.content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}
</style>
