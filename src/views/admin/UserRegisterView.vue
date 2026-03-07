<!-- src/views/admin/UserRegisterView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>유저 등록</h2>
      <router-link to="/admin/users" class="btn btn-secondary">목록으로</router-link>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username">사용자명 <span class="required">*</span></label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="사용자명을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호 <span class="required">*</span></label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="fullName">이름 <span class="required">*</span></label>
          <input
            id="fullName"
            v-model="form.fullName"
            type="text"
            class="form-input"
            placeholder="이름을 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="email">이메일 <span class="required">*</span></label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-input"
            placeholder="이메일을 입력하세요"
            required
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <div class="form-actions">
          <router-link to="/admin/users" class="btn btn-secondary">취소</router-link>
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
  username: '',
  password: '',
  fullName: '',
  email: '',
})

const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.post('/auth/register', form.value)
    successMsg.value = '유저가 성공적으로 등록되었습니다.'
    setTimeout(() => router.push('/admin/users'), 1000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '등록에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>
