<template>
  <div class="page-container">
    <div class="page-header">
      <h2 class="page-title">권한별 메뉴 설정</h2>
      <p class="page-subtitle">역할별로 어떤 메뉴에 접근 가능한지 확인하고 설정합니다.</p>
    </div>

    <!-- 역할 선택 -->
    <div class="filter-card">
      <div class="filter-row">
        <div class="filter-group">
          <label class="filter-label">역할 선택</label>
          <select v-model="selectedRoleId" class="form-control" @change="loadMenuAccess" style="width:200px;">
            <option value="">-- 역할 선택 --</option>
            <option v-for="role in roles" :key="role.roleId" :value="role.roleId">
              {{ role.roleName }} ({{ role.roleDesc || '-' }})
            </option>
          </select>
        </div>
        <div class="filter-actions" v-if="selectedRoleId">
          <button class="btn btn-secondary" @click="resetChanges">초기화</button>
          <button class="btn btn-primary" @click="saveChanges" :disabled="saving">
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 안내 메시지 -->
    <div v-if="!selectedRoleId" class="empty-state">
      <p>역할을 선택하면 메뉴 접근 현황을 확인할 수 있습니다.</p>
    </div>

    <!-- 메뉴 접근 현황 테이블 -->
    <div v-else-if="loading" class="loading-state">
      <p>로딩 중...</p>
    </div>

    <div v-else class="menu-access-container">
      <!-- 변경사항 알림 -->
      <div v-if="hasChanges" class="change-notice">
        <span>변경사항이 있습니다. 저장 버튼을 눌러 적용하세요.</span>
      </div>

      <!-- 전체 선택/해제 -->
      <div class="bulk-actions">
        <button class="btn btn-sm btn-outline" @click="selectAll">전체 허용</button>
        <button class="btn btn-sm btn-outline" @click="deselectAll">전체 해제</button>
      </div>

      <div class="menu-role-table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:50px;">접근</th>
              <th style="width:100px;">메뉴코드</th>
              <th>메뉴명</th>
              <th style="width:80px;">뎁스</th>
              <th>URL</th>
              <th>현재 허용 역할</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="menu in topMenus" :key="menu.menuCode">
              <!-- 상위 메뉴 (depth=0) -->
              <tr :class="['menu-row', 'depth-0', { 'access-on': accessMap[menu.menuCode] }]">
                <td class="text-center">
                  <label class="toggle-switch">
                    <input
                      type="checkbox"
                      v-model="accessMap[menu.menuCode]"
                      @change="onAccessChange(menu)"
                    />
                    <span class="toggle-slider"></span>
                  </label>
                </td>
                <td class="menu-code-cell">{{ menu.menuCode }}</td>
                <td class="menu-name-cell depth-0-name">
                  <span class="depth-icon">▶</span> {{ menu.menuName }}
                </td>
                <td class="text-center">
                  <span class="depth-badge depth-badge-0">L1</span>
                </td>
                <td class="url-cell">{{ menu.url || '-' }}</td>
                <td class="roles-cell">
                  <span
                    v-for="rn in menu.roleNames"
                    :key="rn"
                    class="role-tag"
                    :class="{ 'role-tag-admin': rn === 'ADMIN', 'role-tag-user': rn === 'USER' }"
                  >{{ rn }}</span>
                  <span v-if="!menu.roleNames || menu.roleNames.length === 0" class="no-role">없음</span>
                </td>
              </tr>

              <!-- 하위 메뉴 (depth=1) - 같은 부모 -->
              <template v-for="child in getChildMenus(menu)" :key="child.menuCode">
                <tr :class="['menu-row', 'depth-1', { 'access-on': accessMap[child.menuCode] }]">
                  <td class="text-center">
                    <label class="toggle-switch">
                      <input
                        type="checkbox"
                        v-model="accessMap[child.menuCode]"
                        @change="onAccessChange(child)"
                      />
                      <span class="toggle-slider"></span>
                    </label>
                  </td>
                  <td class="menu-code-cell">{{ child.menuCode }}</td>
                  <td class="menu-name-cell depth-1-name">
                    <span class="depth-indent">└</span> {{ child.menuName }}
                  </td>
                  <td class="text-center">
                    <span class="depth-badge depth-badge-1">L2</span>
                  </td>
                  <td class="url-cell">{{ child.url || '-' }}</td>
                  <td class="roles-cell">
                    <span
                      v-for="rn in child.roleNames"
                      :key="rn"
                      class="role-tag"
                      :class="{ 'role-tag-admin': rn === 'ADMIN', 'role-tag-user': rn === 'USER' }"
                    >{{ rn }}</span>
                    <span v-if="!child.roleNames || child.roleNames.length === 0" class="no-role">없음</span>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 저장 완료 토스트 -->
    <div v-if="toast.show" :class="['toast-message', toast.type]">
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import api from '@/api/axios'

// 역할 목록
const roles = ref([])
const selectedRoleId = ref('')

// 메뉴 목록 (flat, 서버에서 받은 그대로)
const menuList = ref([])
const loading = ref(false)
const saving = ref(false)

// 접근 권한 맵 { menuCode: boolean }
const accessMap = reactive({})
// 원본 접근 권한 맵 (초기화용)
const originalAccessMap = ref({})

// 변경 여부 체크
const hasChanges = computed(() => {
  for (const code in accessMap) {
    if (accessMap[code] !== originalAccessMap.value[code]) return true
  }
  return false
})

// 토스트
const toast = reactive({ show: false, message: '', type: 'success' })

function showToast(message, type = 'success') {
  toast.message = message
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

// 역할 목록 로드
async function loadRoles() {
  try {
    const res = await api.get('/roles')
    roles.value = res.data
  } catch (e) {
    console.error('역할 로드 실패', e)
  }
}

// 선택한 역할의 메뉴 접근 현황 로드
async function loadMenuAccess() {
  if (!selectedRoleId.value) return
  loading.value = true
  try {
    const res = await api.get(`/menus/by-role/${selectedRoleId.value}`)
    menuList.value = res.data

    // accessMap 초기화
    for (const key in accessMap) delete accessMap[key]
    const orig = {}
    for (const menu of res.data) {
      accessMap[menu.menuCode] = menu.hasAccess
      orig[menu.menuCode] = menu.hasAccess
    }
    originalAccessMap.value = orig
  } catch (e) {
    console.error('메뉴 접근 현황 로드 실패', e)
    showToast('메뉴 접근 현황을 불러오지 못했습니다.', 'error')
  } finally {
    loading.value = false
  }
}

// depth=0 메뉴만 필터 (상위 메뉴)
const topMenus = computed(() => menuList.value.filter(m => m.depth === 0)
  .sort((a, b) => (a.orderNo || '').localeCompare(b.orderNo || '')))

// depth=0 메뉴 기준으로 하위(depth=1) 메뉴 가져오기
function getChildMenus(parentMenu) {
  return menuList.value
    .filter(m => m.depth === 1 && m.parentOrderNo === parentMenu.orderNo)
    .sort((a, b) => (a.orderNo || '').localeCompare(b.orderNo || ''))
}

// 상위 메뉴 변경 시 하위 메뉴도 동기화
function onAccessChange(menu) {
  if (menu.depth === 0) {
    const children = getChildMenus(menu)
    const newVal = accessMap[menu.menuCode]
    for (const child of children) {
      accessMap[child.menuCode] = newVal
    }
  }
}

// 전체 허용
function selectAll() {
  for (const code in accessMap) accessMap[code] = true
}

// 전체 해제
function deselectAll() {
  for (const code in accessMap) accessMap[code] = false
}

// 초기화 (원본으로 복원)
function resetChanges() {
  for (const code in originalAccessMap.value) {
    accessMap[code] = originalAccessMap.value[code]
  }
}

// 저장
async function saveChanges() {
  if (!selectedRoleId.value) return
  saving.value = true
  try {
    await api.put(`/menus/role-access/${selectedRoleId.value}`, { ...accessMap })
    // 원본 갱신
    for (const code in accessMap) {
      originalAccessMap.value[code] = accessMap[code]
    }
    // 메뉴 목록 갱신 (roleNames 반영)
    await loadMenuAccess()
    showToast('저장되었습니다.')
  } catch (e) {
    console.error('저장 실패', e)
    showToast('저장에 실패했습니다.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.page-subtitle {
  color: #7f8c8d;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.filter-row {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state, .loading-state {
  text-align: center;
  color: #7f8c8d;
  padding: 3rem 0;
}

.menu-access-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.change-notice {
  background: #fff3cd;
  border: 1px solid #ffc107;
  color: #856404;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
}

.bulk-actions {
  display: flex;
  gap: 0.5rem;
}

.menu-role-table-wrap {
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.menu-row.depth-0 {
  background-color: #f8f9fa;
}

.menu-row.depth-1 {
  background-color: #ffffff;
}

.menu-row.access-on.depth-0 {
  background-color: #e8f4fd;
}

.menu-row.access-on.depth-1 {
  background-color: #f0f9ff;
}

.menu-code-cell {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6c757d;
}

.menu-name-cell {
  font-size: 0.875rem;
}

.depth-0-name {
  font-weight: 600;
  color: #2c3e50;
}

.depth-1-name {
  color: #495057;
}

.depth-icon {
  color: #3498db;
  font-size: 0.7rem;
  margin-right: 0.25rem;
}

.depth-indent {
  color: #adb5bd;
  margin-right: 0.5rem;
  padding-left: 1rem;
}

.url-cell {
  font-family: monospace;
  font-size: 0.8rem;
  color: #6c757d;
}

.roles-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.role-tag {
  display: inline-block;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
}

.role-tag-admin {
  background: #fde8e8;
  color: #c0392b;
}

.role-tag-user {
  background: #e8f4fd;
  color: #2980b9;
}

.no-role {
  font-size: 0.75rem;
  color: #adb5bd;
}

.depth-badge {
  display: inline-block;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
}

.depth-badge-0 {
  background: #3498db;
  color: white;
}

.depth-badge-1 {
  background: #95a5a6;
  color: white;
}

/* 토글 스위치 */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: #ccc;
  border-radius: 20px;
  transition: 0.3s;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  left: 3px;
  top: 3px;
  background: white;
  border-radius: 50%;
  transition: 0.3s;
}

.toggle-switch input:checked + .toggle-slider {
  background: #3498db;
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(16px);
}

/* 토스트 */
.toast-message {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.toast-message.success {
  background: #27ae60;
  color: white;
}

.toast-message.error {
  background: #e74c3c;
  color: white;
}

.btn-sm {
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
}

.btn-outline {
  background: transparent;
  border: 1px solid #6c757d;
  color: #6c757d;
}

.btn-outline:hover {
  background: #6c757d;
  color: white;
}
</style>