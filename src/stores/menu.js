// src/stores/menu.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useMenuStore = defineStore('menu', () => {
  const menuList = ref([])
  const isLoaded = ref(false)

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menus/my')
      menuList.value = response.data
      isLoaded.value = true
    } catch (error) {
      console.error('메뉴 조회 실패:', error)
      menuList.value = []
    }
  }

  const clearMenus = () => {
    menuList.value = []
    isLoaded.value = false
  }

  return {
    menuList,
    isLoaded,
    fetchMenus,
    clearMenus,
  }
})
