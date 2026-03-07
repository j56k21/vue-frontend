// src/stores/commonCode.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'

export const useCommonCodeStore = defineStore('commonCode', () => {
  // { groupCode: [{ codeValue, codeName, orderNo, isActive }] }
  const codeMap = ref({})

  const fetchGroup = async (groupCode) => {
    if (codeMap.value[groupCode]) return codeMap.value[groupCode]
    try {
      const res = await api.get(`/common-codes/${groupCode}/items`)
      codeMap.value[groupCode] = res.data.filter((c) => c.isActive)
    } catch {
      codeMap.value[groupCode] = []
    }
    return codeMap.value[groupCode]
  }

  const getItems = (groupCode) => codeMap.value[groupCode] ?? []

  const clearCache = () => {
    codeMap.value = {}
  }

  return { codeMap, fetchGroup, getItems, clearCache }
})
