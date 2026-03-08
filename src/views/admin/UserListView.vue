<!-- src/views/admin/UserListView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>유저 관리</h2>
      <button class="btn btn-primary" @click="openCreateModal">+ 유저 등록</button>
    </div>

    <!-- 목록 -->
    <div class="card">
      <div class="table-toolbar">
        <input v-model="searchQuery" type="text" placeholder="이름 / 이메일 / 사용자명 검색..." class="search-input" />
      </div>

      <div v-if="loading" class="loading-state">불러오는 중...</div>
      <div v-else-if="filteredUsers.length === 0" class="empty-state">데이터가 없습니다.</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>사용자명</th>
            <th>이름</th>
            <th>이메일</th>
            <th>권한</th>
            <th>상태</th>
            <th>생성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in filteredUsers" :key="user.userId">
            <td>{{ user.userId }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.fullName }}</td>
            <td>{{ user.email }}</td>
            <td>
              <span v-for="r in user.roles" :key="r" class="badge" :class="r === 'ADMIN' ? 'badge-admin' : 'badge-user'">{{ r }}</span>
            </td>
            <td>
              <span class="badge" :class="user.isEnabled ? 'badge-active' : 'badge-inactive'">
                {{ user.isEnabled ? '활성' : '비활성' }}
              </span>
            </td>
            <td>{{ formatDate(user.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-icon btn-edit" @click="openEditModal(user)">수정</button>
                <button class="btn-icon btn-delete" @click="confirmDelete(user)">삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 등록 / 수정 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '유저 수정' : '유저 등록' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>사용자명 <span class="required">*</span></label>
            <input v-model="form.username" type="text" class="form-input" :disabled="isEdit" placeholder="사용자명" />
          </div>
          <div class="form-group">
            <label>비밀번호{{ isEdit ? ' (변경 시만 입력)' : '' }} <span v-if="!isEdit" class="required">*</span></label>
            <input v-model="form.password" type="password" class="form-input" placeholder="비밀번호" />
          </div>
          <div class="form-group">
            <label>이름 <span class="required">*</span></label>
            <input v-model="form.fullName" type="text" class="form-input" placeholder="이름" />
          </div>
          <div class="form-group">
            <label>이메일 <span class="required">*</span></label>
            <input v-model="form.email" type="email" class="form-input" placeholder="이메일" />
          </div>
          <div class="form-group" v-if="isEdit">
            <label>권한</label>
            <select v-model="form.roleName" class="form-input">
              <option v-for="role in roleOptions" :key="role.roleId" :value="role.roleName">
                {{ role.roleName }}
              </option>
            </select>
          </div>
          <div class="form-group" v-if="isEdit">
            <label>상태</label>
            <select v-model="form.isEnabled" class="form-input">
              <option v-if="userStatusOptions.length === 0" :value="true">활성</option>
              <option v-if="userStatusOptions.length === 0" :value="false">비활성</option>
              <option v-for="item in userStatusOptions" :key="item.codeValue"
                :value="item.codeValue === 'ACTIVE'">{{ item.codeName }}</option>
            </select>
          </div>

          <div v-if="modalError" class="error-msg">{{ modalError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">취소</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitForm">
            {{ submitting ? '처리 중...' : (isEdit ? '수정' : '등록') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>유저 삭제</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteTarget?.username }}</strong> 유저를 삭제하시겠습니까?</p>
          <p class="text-warning">이 작업은 되돌릴 수 없습니다.</p>
          <div v-if="deleteError" class="error-msg">{{ deleteError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDeleteModal = false">취소</button>
          <button class="btn btn-danger" :disabled="submitting" @click="doDelete">
            {{ submitting ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '@/api/axios'
import { useCommonCodeStore } from '@/stores/commonCode'

const commonCodeStore = useCommonCodeStore()
const userStatusOptions = ref([])

const users = ref([])
const roleOptions = ref([])
const loading = ref(true)
const searchQuery = ref('')

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const modalError = ref('')
const deleteError = ref('')
const deleteTarget = ref(null)

const emptyForm = () => ({ username: '', password: '', fullName: '', email: '', roleName: 'USER', isEnabled: true })
const form = ref(emptyForm())

const filteredUsers = computed(() => {
  const q = searchQuery.value.toLowerCase()
  if (!q) return users.value
  return users.value.filter(u =>
    u.username?.toLowerCase().includes(q) ||
    u.fullName?.toLowerCase().includes(q) ||
    u.email?.toLowerCase().includes(q)
  )
})

const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR') : '-'

const fetchUsers = async () => {
  loading.value = true
  try {
    const res = await api.get('/users')
    users.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const res = await api.get('/roles')
    roleOptions.value = res.data
  } catch (e) {
    console.error(e)
  }
}

const openCreateModal = () => {
  isEdit.value = false
  form.value = emptyForm()
  modalError.value = ''
  showModal.value = true
}

const openEditModal = (user) => {
  isEdit.value = true
  form.value = {
    username: user.username,
    password: '',
    fullName: user.fullName,
    email: user.email,
    roleName: user.roles?.[0] ?? 'USER',
    isEnabled: user.isEnabled,
    userId: user.userId,
  }
  modalError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true
  modalError.value = ''
  try {
    if (isEdit.value) {
      await api.put(`/users/${form.value.userId}`, {
        fullName: form.value.fullName,
        email: form.value.email,
        password: form.value.password || undefined,
        isEnabled: form.value.isEnabled,
        roleName: form.value.roleName,
      })
    } else {
      await api.post('/users', {
        username: form.value.username,
        password: form.value.password,
        fullName: form.value.fullName,
        email: form.value.email,
      })
    }
    closeModal()
    await fetchUsers()
  } catch (e) {
    modalError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (user) => {
  deleteTarget.value = user
  deleteError.value = ''
  showDeleteModal.value = true
}

const doDelete = async () => {
  submitting.value = true
  deleteError.value = ''
  try {
    await api.delete(`/users/${deleteTarget.value.userId}`)
    showDeleteModal.value = false
    await fetchUsers()
  } catch (e) {
    deleteError.value = e.response?.data?.message || '삭제에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
  commonCodeStore.fetchGroup('USER_STATUS').then(() => {
    userStatusOptions.value = commonCodeStore.getItems('USER_STATUS')
  })
})
</script>
