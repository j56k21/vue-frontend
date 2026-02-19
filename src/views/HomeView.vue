<template>
  <div class="home">
    <div class="welcome-card">
      <h2>환영합니다, {{ authStore.user?.username }}님!</h2>
      <p>Admin 관리 시스템에 오신 것을 환영합니다.</p>
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

<style scoped>
.home {
  max-width: 1200px;
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 12px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.welcome-card p {
  font-size: 1.1rem;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content h3 {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.info-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.info-card ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.info-card li {
  padding: 0.75rem 0;
  border-bottom: 1px solid #f0f0f0;
  font-size: 1rem;
}

.info-card li:last-child {
  border-bottom: none;
}

.info-card strong {
  color: #666;
  margin-right: 0.5rem;
}
</style>
