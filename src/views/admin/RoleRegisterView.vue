<!-- src/views/admin/RoleRegisterView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>권한 등록</h2>
      <router-link to="/admin/roles" class="btn btn-secondary">목록으로</router-link>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="roleName">권한명 <span class="required">*</span></label>
          <input
            id="roleName"
            v-model="form.roleName"
            type="text"
            class="form-input"
            placeholder="예: MANAGER"
            required
          />
          <p class="form-hint">영문 대문자로 입력하세요. 예: ADMIN, USER, MANAGER</p>
        </div>

        <div class="form-group">
          <label for="roleDesc">설명</label>
          <input
            id="roleDesc"
            v-model="form.roleDesc"
            type="text"
            class="form-input"
            placeholder="권한 설명을 입력하세요"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <div class="form-actions">
          <router-link to="/admin/roles" class="btn btn-secondary">취소</router-link>
          <button type="submit" class="btn btn-primary" :disabled="submitting">
            {{ submitting ? '등록 중...' : '등록' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const router = useRouter()

const form = ref({
  roleName: '',
  roleDesc: '',
})

const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.post('/roles', form.value)
    successMsg.value = '권한이 성공적으로 등록되었습니다.'
    setTimeout(() => router.push('/admin/roles'), 1000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '등록에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>
