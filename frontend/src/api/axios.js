import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL
})

API.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem('lmsUser'))
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`
    }
  } catch (e) {
    localStorage.removeItem('lmsUser')
  }
  return config
})

API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lmsUser')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default API