<!-- src/views/admin/MenuRegisterView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>메뉴 등록</h2>
      <router-link to="/admin/menus" class="btn btn-secondary">목록으로</router-link>
    </div>

    <div class="card form-card">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="menuCode">메뉴 코드 <span class="required">*</span></label>
          <input
            id="menuCode"
            v-model="form.menuCode"
            type="text"
            class="form-input"
            placeholder="예: USR03"
            required
          />
        </div>

        <div class="form-group">
          <label for="menuName">메뉴명 <span class="required">*</span></label>
          <input
            id="menuName"
            v-model="form.menuName"
            type="text"
            class="form-input"
            placeholder="메뉴명을 입력하세요"
            required
          />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="depth">뎁스 <span class="required">*</span></label>
            <select id="depth" v-model="form.depth" class="form-input">
              <option :value="0">0 (최상위)</option>
              <option :value="1">1 (하위)</option>
            </select>
          </div>

          <div class="form-group">
            <label for="orderNo">정렬 순서 <span class="required">*</span></label>
            <input
              id="orderNo"
              v-model="form.orderNo"
              type="text"
              class="form-input"
              placeholder="예: 001"
              required
            />
          </div>
        </div>

        <div v-if="form.depth === 1" class="form-group">
          <label for="parentOrderNo">상위 메뉴 순서 <span class="required">*</span></label>
          <input
            id="parentOrderNo"
            v-model="form.parentOrderNo"
            type="text"
            class="form-input"
            placeholder="예: 010"
          />
        </div>

        <div class="form-group">
          <label for="url">URL</label>
          <input
            id="url"
            v-model="form.url"
            type="text"
            class="form-input"
            placeholder="예: /admin/users"
          />
        </div>

        <div class="form-group">
          <label for="icon">아이콘</label>
          <input
            id="icon"
            v-model="form.icon"
            type="text"
            class="form-input"
            placeholder="예: mdi-account-group"
          />
        </div>

        <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
        <div v-if="successMsg" class="success-msg">{{ successMsg }}</div>

        <div class="form-actions">
          <router-link to="/admin/menus" class="btn btn-secondary">취소</router-link>
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
  menuCode: '',
  menuName: '',
  depth: 0,
  orderNo: '',
  parentOrderNo: '',
  url: '',
  icon: '',
  isVisible: true,
})

const submitting = ref(false)
const errorMsg = ref('')
const successMsg = ref('')

const handleSubmit = async () => {
  submitting.value = true
  errorMsg.value = ''
  successMsg.value = ''

  try {
    await api.post('/menus', form.value)
    successMsg.value = '메뉴가 성공적으로 등록되었습니다.'
    setTimeout(() => router.push('/admin/menus'), 1000)
  } catch (e) {
    errorMsg.value = e.response?.data?.message || '등록에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}
</script>
