<!-- src/views/admin/CommonCodeView.vue -->
<template>
  <div class="page-container">
    <div class="page-header">
      <h2>공통 코드 관리</h2>
      <button class="btn btn-primary" @click="openCreateGroupModal">+ 그룹 추가</button>
    </div>

    <div class="common-code-layout">
      <!-- 왼쪽: 코드 그룹 목록 -->
      <div class="card code-group-panel">
        <div class="panel-title">코드 그룹</div>
        <div v-if="loadingGroups" class="loading-state">불러오는 중...</div>
        <div v-else-if="groups.length === 0" class="empty-state">그룹이 없습니다.</div>
        <div
          v-for="group in groups"
          :key="group.groupCode"
          class="code-group-item"
          :class="{ active: selectedGroup?.groupCode === group.groupCode }"
          @click="selectGroup(group)"
        >
          <div>
            <div class="group-name">{{ group.groupName }}</div>
            <div class="group-code-text">{{ group.groupCode }}</div>
          </div>
          <div class="group-actions">
            <button class="btn-icon btn-edit" @click.stop="openEditGroupModal(group)">수정</button>
            <button class="btn-icon btn-delete" @click.stop="confirmDeleteTarget(group, 'group')">삭제</button>
          </div>
        </div>
      </div>

      <!-- 오른쪽: 선택된 그룹의 코드 목록 -->
      <div class="card code-item-panel">
        <div class="panel-title-row">
          <div class="panel-title">
            {{ selectedGroup ? `${selectedGroup.groupName} 코드 목록` : '그룹을 선택하세요' }}
          </div>
          <button v-if="selectedGroup" class="btn btn-primary" @click="openCreateItemModal">+ 코드 추가</button>
        </div>

        <div v-if="!selectedGroup" class="empty-state">왼쪽에서 코드 그룹을 선택하세요.</div>
        <div v-else-if="loadingItems" class="loading-state">불러오는 중...</div>
        <div v-else-if="items.length === 0" class="empty-state">등록된 코드가 없습니다.</div>
        <table v-else class="data-table">
          <thead>
            <tr>
              <th>코드 값</th>
              <th>코드명</th>
              <th>순서</th>
              <th>사용여부</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.codeId">
              <td>{{ item.codeValue }}</td>
              <td>{{ item.codeName }}</td>
              <td>{{ item.orderNo }}</td>
              <td>
                <span class="badge" :class="item.isActive ? 'badge-active' : 'badge-inactive'">
                  {{ item.isActive ? '사용' : '미사용' }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="btn-icon btn-edit" @click="openEditItemModal(item)">수정</button>
                  <button class="btn-icon btn-delete" @click="confirmDeleteTarget(item, 'item')">삭제</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 그룹 등록/수정 모달 -->
    <div v-if="showGroupModal" class="modal-overlay" @click.self="showGroupModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ isGroupEdit ? '그룹 수정' : '그룹 추가' }}</h3>
          <button class="modal-close" @click="showGroupModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>그룹 코드 <span class="required">*</span></label>
            <input v-model="groupForm.groupCode" type="text" class="form-input" :disabled="isGroupEdit" placeholder="예: USER_STATUS" />
          </div>
          <div class="form-group">
            <label>그룹명 <span class="required">*</span></label>
            <input v-model="groupForm.groupName" type="text" class="form-input" placeholder="예: 사용자 상태" />
          </div>
          <div class="form-group">
            <label>설명</label>
            <input v-model="groupForm.description" type="text" class="form-input" placeholder="설명 (선택)" />
          </div>
          <div v-if="groupError" class="error-msg">{{ groupError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showGroupModal = false">취소</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitGroupForm">
            {{ submitting ? '처리 중...' : (isGroupEdit ? '수정' : '추가') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 코드 항목 등록/수정 모달 -->
    <div v-if="showItemModal" class="modal-overlay" @click.self="showItemModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>{{ isItemEdit ? '코드 수정' : '코드 추가' }}</h3>
          <button class="modal-close" @click="showItemModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>코드 값 <span class="required">*</span></label>
            <input v-model="itemForm.codeValue" type="text" class="form-input" :disabled="isItemEdit" placeholder="예: ACTIVE" />
          </div>
          <div class="form-group">
            <label>코드명 <span class="required">*</span></label>
            <input v-model="itemForm.codeName" type="text" class="form-input" placeholder="예: 활성" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>순서</label>
              <input v-model.number="itemForm.orderNo" type="number" class="form-input" placeholder="1" />
            </div>
            <div class="form-group">
              <label>사용여부</label>
              <select v-model="itemForm.isActive" class="form-input">
                <option :value="true">사용</option>
                <option :value="false">미사용</option>
              </select>
            </div>
          </div>
          <div v-if="itemError" class="error-msg">{{ itemError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showItemModal = false">취소</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitItemForm">
            {{ submitting ? '처리 중...' : (isItemEdit ? '수정' : '추가') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>삭제 확인</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteTarget?.groupName || deleteTarget?.codeName }}</strong>을(를) 삭제하시겠습니까?</p>
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

const groups = ref([])
const items = ref([])
const selectedGroup = ref(null)
const loadingGroups = ref(true)
const loadingItems = ref(false)
const submitting = ref(false)

const showGroupModal = ref(false)
const showItemModal = ref(false)
const showDeleteModal = ref(false)
const isGroupEdit = ref(false)
const isItemEdit = ref(false)
const groupError = ref('')
const itemError = ref('')
const deleteError = ref('')
const deleteTarget = ref(null)
const deleteType = ref('')

const groupForm = ref({ groupCode: '', groupName: '', description: '' })
const itemForm = ref({ codeValue: '', codeName: '', orderNo: 1, isActive: true })

const fetchGroups = async () => {
  loadingGroups.value = true
  try {
    const res = await api.get('/common-codes')
    groups.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loadingGroups.value = false
  }
}

const selectGroup = async (group) => {
  selectedGroup.value = group
  loadingItems.value = true
  try {
    const res = await api.get(`/common-codes/${group.groupCode}/items`)
    items.value = res.data
  } catch (e) {
    console.error(e)
    items.value = []
  } finally {
    loadingItems.value = false
  }
}

const openCreateGroupModal = () => {
  isGroupEdit.value = false
  groupForm.value = { groupCode: '', groupName: '', description: '' }
  groupError.value = ''
  showGroupModal.value = true
}

const openEditGroupModal = (group) => {
  isGroupEdit.value = true
  groupForm.value = { groupCode: group.groupCode, groupName: group.groupName, description: group.description ?? '' }
  groupError.value = ''
  showGroupModal.value = true
}

const submitGroupForm = async () => {
  submitting.value = true
  groupError.value = ''
  try {
    if (isGroupEdit.value) {
      await api.put(`/common-codes/${groupForm.value.groupCode}`, groupForm.value)
    } else {
      await api.post('/common-codes', groupForm.value)
    }
    showGroupModal.value = false
    commonCodeStore.clearCache()
    await fetchGroups()
  } catch (e) {
    groupError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const openCreateItemModal = () => {
  isItemEdit.value = false
  itemForm.value = { codeValue: '', codeName: '', orderNo: 1, isActive: true }
  itemError.value = ''
  showItemModal.value = true
}

const openEditItemModal = (item) => {
  isItemEdit.value = true
  itemForm.value = { ...item }
  itemError.value = ''
  showItemModal.value = true
}

const submitItemForm = async () => {
  submitting.value = true
  itemError.value = ''
  try {
    const groupCode = selectedGroup.value.groupCode
    if (isItemEdit.value) {
      await api.put(`/common-codes/${groupCode}/items/${itemForm.value.codeValue}`, itemForm.value)
    } else {
      await api.post(`/common-codes/${groupCode}/items`, itemForm.value)
    }
    showItemModal.value = false
    commonCodeStore.clearCache()
    await selectGroup(selectedGroup.value)
  } catch (e) {
    itemError.value = e.response?.data?.message || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const confirmDeleteTarget = (target, type) => {
  deleteTarget.value = target
  deleteType.value = type
  deleteError.value = ''
  showDeleteModal.value = true
}

const doDelete = async () => {
  submitting.value = true
  deleteError.value = ''
  try {
    if (deleteType.value === 'group') {
      await api.delete(`/common-codes/${deleteTarget.value.groupCode}`)
      if (selectedGroup.value?.groupCode === deleteTarget.value.groupCode) {
        selectedGroup.value = null
        items.value = []
      }
      await fetchGroups()
    } else {
      const groupCode = selectedGroup.value.groupCode
      await api.delete(`/common-codes/${groupCode}/items/${deleteTarget.value.codeValue}`)
      commonCodeStore.clearCache()
      await selectGroup(selectedGroup.value)
    }
    showDeleteModal.value = false
  } catch (e) {
    deleteError.value = e.response?.data?.message || '삭제에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

onMounted(fetchGroups)
</script>
