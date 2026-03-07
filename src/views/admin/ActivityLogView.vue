<!-- src/views/admin/ActivityLogView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>사용자 행위 이력</h2>
    </div>

    <!-- 검색 필터 -->
    <div class="card filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label>사용자 ID</label>
          <input v-model="filter.userId" type="text" class="form-input" placeholder="사용자 ID" />
        </div>
        <div class="filter-group">
          <label>행위 유형</label>
          <select v-model="filter.actionType" class="form-input">
            <option value="">전체</option>
            <option value="LOGIN">로그인</option>
            <option value="LOGOUT">로그아웃</option>
            <option value="VIEW">메뉴 조회</option>
            <option value="CREATE">추가</option>
            <option value="UPDATE">수정</option>
            <option value="DELETE">삭제</option>
          </select>
        </div>
        <div class="filter-group">
          <label>시작일</label>
          <input v-model="filter.fromDate" type="date" class="form-input" />
        </div>
        <div class="filter-group">
          <label>종료일</label>
          <input v-model="filter.toDate" type="date" class="form-input" />
        </div>
        <div class="filter-group filter-btn-group">
          <button class="btn btn-primary" @click="fetchLogs">조회</button>
          <button class="btn btn-secondary" @click="resetFilter">초기화</button>
        </div>
      </div>
    </div>

    <!-- 결과 테이블 -->
    <div class="card">
      <div v-if="loading" class="loading-state">불러오는 중...</div>
      <div v-else-if="logs.length === 0" class="empty-state">이력이 없습니다.</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>사용자</th>
            <th>행위</th>
            <th>대상</th>
            <th>설명</th>
            <th>IP</th>
            <th>일시</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in logs" :key="log.logId">
            <td>{{ log.logId }}</td>
            <td>{{ log.username }}</td>
            <td>
              <span class="badge" :class="actionBadgeClass(log.actionType)">{{ actionLabel(log.actionType) }}</span>
            </td>
            <td>{{ log.targetResource ?? '-' }}</td>
            <td class="log-desc">{{ log.description ?? '-' }}</td>
            <td>{{ log.ipAddress ?? '-' }}</td>
            <td>{{ formatDateTime(log.createdAt) }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="page === 0" @click="changePage(page - 1)">이전</button>
        <span class="page-info">{{ page + 1 }} / {{ totalPages }}</span>
        <button class="page-btn" :disabled="page >= totalPages - 1" @click="changePage(page + 1)">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const logs = ref([])
const loading = ref(false)
const page = ref(0)
const totalPages = ref(0)
const PAGE_SIZE = 20

const today = new Date().toISOString().slice(0, 10)

const filter = ref({
  userId: '',
  actionType: '',
  fromDate: today,
  toDate: today,
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: PAGE_SIZE,
      fromDate: filter.value.fromDate,
      toDate: filter.value.toDate,
    }
    if (filter.value.userId) params.userId = filter.value.userId
    if (filter.value.actionType) params.actionType = filter.value.actionType

    const res = await api.get('/activity-logs', { params })
    logs.value = res.data.content ?? res.data
    totalPages.value = res.data.totalPages ?? 1
  } catch (e) {
    console.error(e)
    logs.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (p) => {
  page.value = p
  fetchLogs()
}

const resetFilter = () => {
  filter.value = { userId: '', actionType: '', fromDate: today, toDate: today }
  page.value = 0
  fetchLogs()
}

const actionLabel = (type) => {
  const map = { LOGIN: '로그인', LOGOUT: '로그아웃', VIEW: '조회', CREATE: '추가', UPDATE: '수정', DELETE: '삭제' }
  return map[type] ?? type
}

const actionBadgeClass = (type) => {
  const map = {
    LOGIN: 'badge-active',
    LOGOUT: 'badge-inactive',
    VIEW: 'badge-visible',
    CREATE: 'badge-active',
    UPDATE: 'badge-user',
    DELETE: 'badge-admin',
  }
  return map[type] ?? ''
}

const formatDateTime = (d) => {
  if (!d) return '-'
  return new Date(d).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

onMounted(fetchLogs)
</script>
