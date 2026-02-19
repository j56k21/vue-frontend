// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api/axios'
import { useRouter } from 'vue-router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const router = useRouter()

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      })

      token.value = response.data.token
      user.value = {
        username: response.data.username,
        role: response.data.role,
      }

      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(user.value))

      return true
    } catch (error) {
      console.error('로그인 실패:', error)
      throw error
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    token,
    user,
    login,
    logout,
    isAuthenticated,
  }
})
