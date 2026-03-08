<template>
  <div
    class="widget"
    :class="{ 'widget-editable': editMode }"
    :style="gridStyle"
  >
    <div class="widget-header">
      <span class="widget-title">{{ widget.title }}</span>
      <div v-if="editMode" class="widget-controls">
        <button class="widget-btn" @click="$emit('edit', widget)" title="편집">✎</button>
        <button class="widget-btn widget-btn-danger" @click="$emit('delete', widget)" title="삭제">✕</button>
      </div>
    </div>

    <WidgetStats v-if="widget.widgetType === 'STATS'" />
    <WidgetRecentLogs v-else-if="widget.widgetType === 'RECENT_LOGS'" />
    <WidgetSystemInfo v-else-if="widget.widgetType === 'SYSTEM_INFO'" />
    <WidgetMenuLink v-else-if="widget.widgetType === 'MENU_LINK'" />
    <div v-else class="widget-content widget-unknown">알 수 없는 위젯 유형: {{ widget.widgetType }}</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import WidgetStats from './WidgetStats.vue'
import WidgetRecentLogs from './WidgetRecentLogs.vue'
import WidgetSystemInfo from './WidgetSystemInfo.vue'
import WidgetMenuLink from './WidgetMenuLink.vue'

const props = defineProps({
  widget: { type: Object, required: true },
  editMode: { type: Boolean, default: false },
})

defineEmits(['edit', 'delete'])

const gridStyle = computed(() => ({
  gridColumn: `${(props.widget.posX ?? 0) + 1} / span ${props.widget.width ?? 1}`,
  gridRow: `${(props.widget.posY ?? 0) + 1} / span ${props.widget.height ?? 1}`,
}))
</script>
