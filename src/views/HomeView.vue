<template>
  <div class="home">
    <div class="welcome-card">
      <h2>환영합니다, {{ authStore.user?.username }}님!</h2>
      <p>임시 ERP에 오신 것을 환영합니다.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">👥</div>
        <div class="stat-content">
          <h3>총 회원 수</h3>
          <p class="stat-value">-</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <h3>메뉴 개수</h3>
          <p class="stat-value">-</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon">🔐</div>
        <div class="stat-content">
          <h3>권한 그룹</h3>
          <p class="stat-value">-</p>
        </div>
      </div>
    </div>

    <div class="info-card">
      <h3>시스템 정보</h3>
      <ul>
        <li><strong>버전:</strong> 1.0.0</li>
        <li><strong>로그인 상태:</strong> 정상</li>
        <li><strong>권한:</strong> {{ authStore.user?.role }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
