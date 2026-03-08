<template>
  <div class="widget-content widget-menu-link">
    <div v-if="menuStore.menuList.length === 0" class="widget-empty">메뉴가 없습니다.</div>
    <div v-else class="menu-link-grid">
      <router-link
        v-for="child in flatMenus"
        :key="child.menuCode"
        :to="child.url"
        class="menu-link-card"
      >
        <div class="menu-link-name">{{ child.menuName }}</div>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMenuStore } from '@/stores/menu'

const menuStore = useMenuStore()

const flatMenus = computed(() => {
  return menuStore.menuList.flatMap((group) => group.children || [])
})
</script>
