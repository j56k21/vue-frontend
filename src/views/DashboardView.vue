<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h2>대시보드</h2>
      <div class="dashboard-actions">
        <button v-if="editMode" class="btn btn-primary" @click="openAddModal">+ 위젯 추가</button>
        <button v-if="editMode && widgets.length > 0" class="btn btn-secondary" @click="saveLayout">
          {{ saving ? '저장 중...' : '레이아웃 저장' }}
        </button>
        <button class="btn" :class="editMode ? 'btn-warning' : 'btn-outline'" @click="toggleEditMode">
          {{ editMode ? '편집 종료' : '편집 모드' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading-state">불러오는 중...</div>

    <template v-else>
      <div v-if="widgets.length === 0 && !editMode" class="empty-dashboard">
        <p>위젯이 없습니다. 편집 모드에서 위젯을 추가해보세요.</p>
        <button class="btn btn-primary" @click="toggleEditMode">편집 모드 켜기</button>
      </div>

      <div v-else class="dashboard-grid">
        <DashboardWidget
          v-for="widget in widgets"
          :key="widget.widgetId"
          :widget="widget"
          :editMode="editMode"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
        <div v-if="editMode && widgets.length === 0" class="widget-placeholder">
          위젯 추가 버튼을 눌러 위젯을 추가하세요.
        </div>
      </div>
    </template>

    <!-- 위젯 추가/수정 모달 -->
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ isWidgetEdit ? '위젯 수정' : '위젯 추가' }}</h3>
          <button class="modal-close" @click="showModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>위젯 유형 <span class="required">*</span></label>
            <select v-model="widgetForm.widgetType" class="form-input" :disabled="isWidgetEdit">
              <option value="">선택하세요</option>
              <option value="STATS">통계 수치</option>
              <option value="RECENT_LOGS">최근 행위 이력</option>
              <option value="SYSTEM_INFO">시스템 정보</option>
              <option value="MENU_LINK">메뉴 바로가기</option>
            </select>
          </div>
          <div class="form-group">
            <label>제목 <span class="required">*</span></label>
            <input v-model="widgetForm.title" type="text" class="form-input" placeholder="위젯 제목" />
          </div>
          <div class="widget-grid-section">
            <div class="widget-grid-label">그리드 위치 &amp; 크기 (최대 5×5)</div>
            <div class="form-row">
              <div class="form-group">
                <label>열 위치 (1~5)</label>
                <input v-model.number="widgetForm.posX" type="number" min="1" max="5" class="form-input"
                  @change="widgetForm.posX = clamp(widgetForm.posX, 1, 5)" />
              </div>
              <div class="form-group">
                <label>행 위치 (1~5)</label>
                <input v-model.number="widgetForm.posY" type="number" min="1" max="5" class="form-input"
                  @change="widgetForm.posY = clamp(widgetForm.posY, 1, 5)" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>너비 (1~5)</label>
                <input v-model.number="widgetForm.width" type="number" min="1" max="5" class="form-input"
                  @change="widgetForm.width = clamp(widgetForm.width, 1, 5)" />
              </div>
              <div class="form-group">
                <label>높이 (1~5)</label>
                <input v-model.number="widgetForm.height" type="number" min="1" max="5" class="form-input"
                  @change="widgetForm.height = clamp(widgetForm.height, 1, 5)" />
              </div>
            </div>
            <div class="grid-size-hint">
              {{ widgetForm.posX }}열 {{ widgetForm.posY }}행에서 시작 /
              {{ widgetForm.width }}열 × {{ widgetForm.height }}행 크기
            </div>
          </div>
          <div v-if="modalError" class="error-msg">{{ modalError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">취소</button>
          <button class="btn btn-primary" :disabled="submitting" @click="submitWidget">
            {{ submitting ? '처리 중...' : (isWidgetEdit ? '수정' : '추가') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 삭제 확인 모달 -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h3>위젯 삭제</h3>
          <button class="modal-close" @click="showDeleteModal = false">✕</button>
        </div>
        <div class="modal-body">
          <p><strong>{{ deleteTarget?.title }}</strong> 위젯을 삭제하시겠습니까?</p>
          <p class="text-warning">이 작업은 되돌릴 수 없습니다.</p>
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
import DashboardWidget from '@/components/dashboard/DashboardWidget.vue'

const widgets = ref([])
const loading = ref(true)
const saving = ref(false)
const editMode = ref(false)
const showModal = ref(false)
const showDeleteModal = ref(false)
const isWidgetEdit = ref(false)
const submitting = ref(false)
const modalError = ref('')
const deleteTarget = ref(null)

const clamp = (val, min, max) => {
  const n = Number(val)
  if (isNaN(n)) return min
  return Math.min(Math.max(n, min), max)
}

const emptyForm = () => ({
  widgetId: null,
  widgetType: '',
  title: '',
  posX: 1,
  posY: 1,
  width: 2,
  height: 2,
  orderNo: 0,
})
const widgetForm = ref(emptyForm())

const fetchWidgets = async () => {
  loading.value = true
  try {
    const res = await api.get('/dashboard/widgets')
    widgets.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const toggleEditMode = () => {
  editMode.value = !editMode.value
}

const openAddModal = () => {
  isWidgetEdit.value = false
  widgetForm.value = emptyForm()
  modalError.value = ''
  showModal.value = true
}

const openEditModal = (widget) => {
  isWidgetEdit.value = true
  widgetForm.value = {
    ...widget,
    posX: (widget.posX ?? 0) + 1,
    posY: (widget.posY ?? 0) + 1,
  }
  modalError.value = ''
  showModal.value = true
}

const submitWidget = async () => {
  modalError.value = ''
  if (!widgetForm.value.widgetType) {
    modalError.value = '위젯 유형을 선택해주세요.'
    return
  }
  if (!widgetForm.value.title || !widgetForm.value.title.trim()) {
    modalError.value = '제목을 입력해주세요.'
    return
  }

  const posX = clamp(widgetForm.value.posX, 1, 5) - 1
  const posY = clamp(widgetForm.value.posY, 1, 5) - 1
  const width = clamp(widgetForm.value.width, 1, 5)
  const height = clamp(widgetForm.value.height, 1, 5)

  if (posX + width > 5) {
    modalError.value = '열 위치 + 너비가 5를 초과합니다.'
    return
  }
  if (posY + height > 5) {
    modalError.value = '행 위치 + 높이가 5를 초과합니다.'
    return
  }

  const payload = { ...widgetForm.value, posX, posY, width, height }

  submitting.value = true
  try {
    if (isWidgetEdit.value) {
      await api.put('/dashboard/widgets/' + widgetForm.value.widgetId, payload)
    } else {
      await api.post('/dashboard/widgets', payload)
    }
    showModal.value = false
    await fetchWidgets()
  } catch (e) {
    modalError.value = (e.response && e.response.data && e.response.data.message) || '처리에 실패했습니다.'
  } finally {
    submitting.value = false
  }
}

const confirmDelete = (widget) => {
  deleteTarget.value = widget
  showDeleteModal.value = true
}

const doDelete = async () => {
  submitting.value = true
  try {
    await api.delete('/dashboard/widgets/' + deleteTarget.value.widgetId)
    showDeleteModal.value = false
    await fetchWidgets()
  } catch (e) {
    console.error(e)
  } finally {
    submitting.value = false
  }
}

const saveLayout = async () => {
  saving.value = true
  try {
    await api.put('/dashboard/widgets-bulk', widgets.value)
    editMode.value = false
  } catch (e) {
    console.error(e)
  } finally {
    saving.value = false
  }
}

onMounted(fetchWidgets)
</script>
