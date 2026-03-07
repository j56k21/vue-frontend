<!-- src/views/admin/RoleListView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>권한 관리</h2>
      <button class="btn btn-primary" @click="openCreateModal">+ 권한 등록</button>
    </div>

    <!-- 목록 -->
    <div class="card">
      <div v-if="loading" class="loading-state">불러오는 중...</div>
      <div v-else-if="roles.length === 0" class="empty-state">등록된 권한이 없습니다.</div>
      <table v-else class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>권한명</th>
            <th>설명</th>
            <th>생성일</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in roles" :key="role.roleId">
            <td>{{ role.roleId }}</td>
            <td>
              <span class="badge" :class="role.roleName === 'ADMIN' ? 'badge-admin' : 'badge-user'">
                {{ role.roleName }}
              </span>
            </td>
            <td>{{ role.roleDesc || '-' }}</td>
            <td>{{ formatDate(role.createdAt) }}</td>
            <td>
              <div class="action-btns">
                <button class="btn-icon btn-edit" @click="openEditModal(role)">수정</button>
                <button class="btn-icon btn-delete" @click="confirmDelete(role)">삭제</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 등록 / 수정 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ isEdit ? '권한 수정' : '권한 등록' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>권한명 <span class="required">*</span></label>
            <input
              v-model="form.roleName"
              type="text"
              class="form-input"
              :disabled="isEdit"
              placeholder="예: MANAGER"
            />
            <p v-if="!isEdit" class="form-hint">영문 대문자로 입력하세요.</p>
          </div>
          <div class="form-group">
            <label>설명</label>
            <input v-model="form.roleDesc" type="text" class="form-input" placeholder="권한 설명" />
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
          <h3>권한 삭제</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteTarget?.roleName }}</strong> 권한을 삭제하시겠습니까?</p>
          <p class="text-warning">해당 권한을 사용 중인 사용자가 있으면 삭제할 수 없습니다.</p>
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
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

const roles = ref([])
const loading = ref(true)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const modalError = ref('')
const deleteError = ref('')
const deleteTarget = ref(null)

const emptyForm = () => ({ roleId: null, roleName: '', roleDesc: '' })
const form = ref(emptyForm())

const formatDate = (d) => d ? new Date(d).toLocaleDateString('ko-KR') : '-'

const fetchRoles = async () => {
  loading.value = true
  try {
    const res = await api.get('/roles')
    roles.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const openCreateModal = () => {
  isEdit.value = false
  form.value = emptyForm()
  modalError.value = ''
  showModal.value = true
}

const openEditModal = (role) => {
  isEdit.value = true
  form.value = { roleId: role.roleId, roleName: role.roleName, roleDesc: role.roleDesc ?? '' }
  modalError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true
  modalError.value = ''
  try {
    if (isEdit.value) {
      await api.put(`/roles/${form.value.roleId}`, { roleDesc: form.value.roleDesc })
    } else {
      await api.post('/roles', { roleName: form.value.roleName, roleDesc: form.value.roleDesc })
    }
    closeModal()
    await fetchRoles()
  } catch (e) {
    modalError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (role) => {
  deleteTarget.value = role
  deleteError.value = ''
  showDeleteModal.value = true
}

const doDelete = async () => {
  submitting.value = true
  deleteError.value = ''
  try {
    await api.delete(`/roles/${deleteTarget.value.roleId}`)
    showDeleteModal.value = false
    await fetchRoles()
  } catch (e) {
    deleteError.value = e.response?.data?.message || '삭제에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchRoles)
</script>
