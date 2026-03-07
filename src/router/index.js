// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'home',
          component: () => import('@/views/HomeView.vue'),
        },
        // 유저 관리 (단일 화면 CRUD)
        {
          path: 'admin/users',
          name: 'userList',
          component: () => import('@/views/admin/UserListView.vue'),
        },
        // 메뉴 관리 (단일 화면 CRUD)
        {
          path: 'admin/menus',
          name: 'menuList',
          component: () => import('@/views/admin/MenuListView.vue'),
        },
        // 권한 관리 (단일 화면 CRUD)
        {
          path: 'admin/roles',
          name: 'roleList',
          component: () => import('@/views/admin/RoleListView.vue'),
        },
      ],
    },
  ],
})

// 네비게이션 가드: 인증 체크
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !authStore.isAuthenticated()) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated()) {
    next('/')
  } else {
    next()
  }
})

export default router
