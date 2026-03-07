<!-- src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="sidebar-header">
        <h2>임시 ERP</h2>
      </div>

      <nav class="sidebar-nav">
        <div v-if="menuStore.isLoaded && menuStore.menuList.length === 0" class="nav-empty">
          메뉴가 없습니다.
        </div>

        <div v-for="menu in menuStore.menuList" :key="menu.menuCode" class="nav-group">
          <!-- depth=0: 그룹 헤더 (클릭 시 토글) -->
          <button
            class="nav-group-header"
            :class="{ 'is-open': openGroups[menu.menuCode] }"
            @click="toggleGroup(menu.menuCode)"
          >
            <span class="nav-group-title">{{ menu.menuName }}</span>
            <span class="nav-arrow">{{ openGroups[menu.menuCode] ? '▲' : '▼' }}</span>
          </button>

          <!-- depth=1: 하위 메뉴 목록 -->
          <div v-show="openGroups[menu.menuCode]" class="nav-children">
            <router-link
              v-for="child in menu.children"
              :key="child.menuCode"
              :to="child.url"
              class="nav-item"
              active-class="router-link-active"
            >
              <span class="nav-item-name">{{ child.menuName }}</span>
            </router-link>
          </div>
        </div>
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
import { computed, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useMenuStore } from '@/stores/menu'

const route = useRoute()
const authStore = useAuthStore()
const menuStore = useMenuStore()

// 메뉴 그룹 열림/닫힘 상태
const openGroups = reactive({})

const toggleGroup = (menuCode) => {
  openGroups[menuCode] = !openGroups[menuCode]
}

// 현재 경로에 해당하는 상위 메뉴를 자동으로 열어줌
const openActiveGroup = () => {
  menuStore.menuList.forEach((group) => {
    const hasActive = group.children?.some((child) => child.url === route.path)
    if (hasActive) {
      openGroups[group.menuCode] = true
    }
  })
}

onMounted(async () => {
  if (!menuStore.isLoaded) {
    await menuStore.fetchMenus()
  }
  openActiveGroup()
})

const pageTitle = computed(() => {
  // 현재 경로에 맞는 메뉴명 찾기
  for (const group of menuStore.menuList) {
    for (const child of group.children || []) {
      if (child.url === route.path) return child.menuName
    }
  }
  const staticTitles = {
    '/': '대시보드',
  }
  return staticTitles[route.path] || '임시 ERP'
})

const handleLogout = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    menuStore.clearMenus()
    authStore.logout()
  }
}
</script>
