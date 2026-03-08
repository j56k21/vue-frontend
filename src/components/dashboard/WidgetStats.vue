<template>
  <div class="widget-content widget-stats">
    <div v-if="loading" class="widget-loading">불러오는 중...</div>
    <div v-else class="stats-grid-inner">
      <div class="stat-item">
        <div class="stat-num">{{ stats.userCount ?? '-' }}</div>
        <div class="stat-label">사용자</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.menuCount ?? '-' }}</div>
        <div class="stat-label">메뉴</div>
      </div>
      <div class="stat-item">
        <div class="stat-num">{{ stats.roleCount ?? '-' }}</div>
        <div class="stat-label">권한</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const stats = ref({})
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/dashboard/stats')
    stats.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})
</script>
