<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>Admin 시스템</h1>
        <p>관리자 로그인</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">사용자명</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="사용자명을 입력하세요"
            required
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
            :disabled="loading"
          />
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="login-button" :disabled="loading">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div class="login-footer">
        <p>테스트 계정: admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = '' // 에러 메시지 초기화

  try {
    await authStore.login(username.value, password.value)
    router.push('/') // 로그인 성공 → 홈으로 이동
  } catch (error) {
    console.log(error)
    // ✅ 수정: 단순히 문자열 할당
    errorMessage.value = '로그인 실패: 사용자명 또는 비밀번호를 확인하세요.'
  } finally {
    loading.value = false
  }
}
</script>
