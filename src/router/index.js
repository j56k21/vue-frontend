// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import api from '@/api/axios'

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
          component: () => import('@/views/DashboardView.vue'),
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
        // 공통코드 관리
        {
          path: 'admin/common-codes',
          name: 'commonCodes',
          component: () => import('@/views/admin/CommonCodeView.vue'),
        },
        // 행위 이력 조회
        {
          path: 'admin/activity-logs',
          name: 'activityLogs',
          component: () => import('@/views/admin/ActivityLogView.vue'),
        },
        // 권한별 메뉴 설정
        {
          path: 'admin/menu-roles',
          name: 'menuRoles',
          component: () => import('@/views/admin/MenuRoleView.vue'),
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

// 메뉴 이동 이력 기록 (VIEW 액션)
router.afterEach((to) => {
  const authStore = useAuthStore()
  if (authStore.isAuthenticated() && to.path !== '/login') {
    const username = authStore.user?.username
    if (username) {
      api.post('/activity-logs', {
        username,
        actionType: 'VIEW',
        targetResource: 'PAGE:' + to.path,
        description: '페이지 이동: ' + to.path,
      }).catch(() => {})
    }
  }
})

export default router
