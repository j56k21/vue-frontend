<!-- src/views/admin/MenuListView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>메뉴 관리</h2>
      <button class="btn btn-primary" @click="openCreateModal">+ 메뉴 등록</button>
    </div>

    <!-- 목록 -->
    <div class="card">
      <div v-if="loading" class="loading-state">불러오는 중...</div>
      <div v-else-if="menuGroups.length === 0" class="empty-state">등록된 메뉴가 없습니다.</div>

      <div v-for="group in menuGroups" :key="group.menuCode" class="menu-group">
        <!-- 상위 메뉴 행 -->
        <div class="menu-parent-row">
          <span class="menu-depth-badge depth-0">L1</span>
          <span class="menu-name">{{ group.menuName }}</span>
          <span class="menu-code">{{ group.menuCode }}</span>
          <span class="menu-order">순서: {{ group.orderNo }}</span>
          <span class="badge badge-visible">{{ group.isVisible ? '표시' : '숨김' }}</span>
          <div class="action-btns ml-auto">
            <button class="btn-icon btn-edit" @click="openEditModal(group)">수정</button>
            <button class="btn-icon btn-delete" @click="confirmDelete(group)">삭제</button>
          </div>
        </div>

        <!-- 하위 메뉴 행 -->
        <div v-for="child in group.children" :key="child.menuCode" class="menu-child-row">
          <span class="menu-depth-badge depth-1">L2</span>
          <span class="menu-name">{{ child.menuName }}</span>
          <span class="menu-code">{{ child.menuCode }}</span>
          <span class="menu-url">{{ child.url }}</span>
          <span class="menu-order">순서: {{ child.orderNo }}</span>
          <span class="badge badge-visible">{{ child.isVisible ? '표시' : '숨김' }}</span>
          <div class="action-btns ml-auto">
            <button class="btn-icon btn-edit" @click="openEditModal(child)">수정</button>
            <button class="btn-icon btn-delete" @click="confirmDelete(child)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 등록 / 수정 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isEdit ? '메뉴 수정' : '메뉴 등록' }}</h3>
          <button class="modal-close" @click="closeModal">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>메뉴 코드 <span class="required">*</span></label>
            <input v-model="form.menuCode" type="text" class="form-input" :disabled="isEdit" placeholder="예: USR03" />
          </div>
          <div class="form-group">
            <label>메뉴명 <span class="required">*</span></label>
            <input v-model="form.menuName" type="text" class="form-input" placeholder="메뉴명" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>뎁스</label>
              <select v-model="form.depth" class="form-input">
                <option v-if="depthOptions.length === 0" :value="0">0 (최상위)</option>
                <option v-if="depthOptions.length === 0" :value="1">1 (하위)</option>
                <option v-for="item in depthOptions" :key="item.codeValue" :value="Number(item.codeValue)">
                  {{ item.codeName }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>정렬 순서 <span class="required">*</span></label>
              <input v-model="form.orderNo" type="text" class="form-input" placeholder="예: 001" />
            </div>
          </div>
          <div class="form-group" v-if="form.depth === 1">
            <label>상위 메뉴 정렬순서</label>
            <input v-model="form.parentOrderNo" type="text" class="form-input" placeholder="예: 010" />
          </div>
          <div class="form-group">
            <label>URL</label>
            <input v-model="form.url" type="text" class="form-input" placeholder="예: /admin/users" />
          </div>
          <div class="form-group">
            <label>아이콘</label>
            <input v-model="form.icon" type="text" class="form-input" placeholder="예: mdi-account-group" />
          </div>
          <div class="form-group">
            <label>표시 여부</label>
            <select v-model="form.isVisible" class="form-input">
              <option :value="true">표시</option>
              <option :value="false">숨김</option>
            </select>
          </div>
          <div class="form-group">
            <label>접근 권한 (복수 선택)</label>
            <div class="checkbox-group">
              <label v-for="role in roleOptions" :key="role.roleId" class="checkbox-label">
                <input type="checkbox" :value="role.roleId" v-model="form.roleIds" />
                {{ role.roleName }}
              </label>
            </div>
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
          <h3>메뉴 삭제</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteTarget?.menuName }}</strong> 메뉴를 삭제하시겠습니까?</p>
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
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import { useCommonCodeStore } from '@/stores/commonCode'

const commonCodeStore = useCommonCodeStore()
const depthOptions = ref([])

const menuGroups = ref([])
const roleOptions = ref([])
const loading = ref(true)

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const modalError = ref('')
const deleteError = ref('')
const deleteTarget = ref(null)

const emptyForm = () => ({
  menuCode: '', menuName: '', depth: 0, orderNo: '', parentOrderNo: '',
  url: '', icon: '', isVisible: true, roleIds: [],
})
const form = ref(emptyForm())

const fetchMenus = async () => {
  loading.value = true
  try {
    const res = await api.get('/menus')
    menuGroups.value = res.data
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

const openEditModal = (menu) => {
  isEdit.value = true
  form.value = {
    menuCode: menu.menuCode,
    menuName: menu.menuName,
    depth: menu.depth,
    orderNo: menu.orderNo,
    parentOrderNo: menu.parentOrderNo ?? '',
    url: menu.url ?? '',
    icon: menu.icon ?? '',
    isVisible: menu.isVisible,
    roleIds: menu.roleIds ? [...menu.roleIds] : [],
  }
  modalError.value = ''
  showModal.value = true
}

const closeModal = () => { showModal.value = false }

const submitForm = async () => {
  submitting.value = true
  modalError.value = ''
  try {
    const payload = { ...form.value }
    if (payload.depth === 0) payload.parentOrderNo = null

    if (isEdit.value) {
      await api.put(`/menus/${form.value.menuCode}`, payload)
    } else {
      await api.post('/menus', payload)
    }
    closeModal()
    await fetchMenus()
  } catch (e) {
    modalError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (menu) => {
  deleteTarget.value = menu
  deleteError.value = ''
  showDeleteModal.value = true
}

const doDelete = async () => {
  submitting.value = true
  deleteError.value = ''
  try {
    await api.delete(`/menus/${deleteTarget.value.menuCode}`)
    showDeleteModal.value = false
    await fetchMenus()
  } catch (e) {
    deleteError.value = e.response?.data?.message || '삭제에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchMenus()
  fetchRoles()
  commonCodeStore.fetchGroup('MENU_DEPTH').then(() => {
    depthOptions.value = commonCodeStore.getItems('MENU_DEPTH')
  })
})
</script>
