<template>
  <div class="widget-content widget-system-info">
    <ul class="info-list">
      <li><span class="info-label">버전</span><span class="info-value">1.0.0</span></li>
      <li><span class="info-label">사용자</span><span class="info-value">{{ authStore.user?.username }}</span></li>
      <li><span class="info-label">권한</span><span class="info-value"><span class="badge badge-admin">{{ authStore.user?.role }}</span></span></li>
      <li><span class="info-label">로그인</span><span class="info-value">정상</span></li>
      <li><span class="info-label">접속일</span><span class="info-value">{{ today }}</span></li>
    </ul>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const today = new Date().toLocaleDateString('ko-KR')
</script>
