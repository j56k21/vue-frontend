<template>
  <div class="widget-content widget-recent-logs">
    <div v-if="loading" class="widget-loading">불러오는 중...</div>
    <div v-else-if="logs.length === 0" class="widget-empty">이력이 없습니다.</div>
    <table v-else class="widget-table">
      <thead>
        <tr>
          <th>사용자</th>
          <th>행위</th>
          <th>일시</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key="log.logId">
          <td>{{ log.username }}</td>
          <td><span class="badge badge-sm">{{ log.actionType }}</span></td>
          <td>{{ formatTime(log.createdAt) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const logs = ref([])
const loading = ref(true)

const today = new Date().toISOString().slice(0, 10)

onMounted(async () => {
  try {
    const res = await api.get('/activity-logs', {
      params: { page: 0, size: 5, fromDate: today, toDate: today },
    })
    logs.value = res.data.content ?? res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const formatTime = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}
</script>
