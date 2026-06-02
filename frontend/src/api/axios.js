import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res,
  async error => {
    const refresh = localStorage.getItem('refresh')
    if (error.response?.status === 401 && refresh && !error.config._retry) {
      error.config._retry = true
      try {
        const { data } = await axios.post('http://localhost:8000/api/token/refresh/', { refresh })
        localStorage.setItem('access', data.access)
        error.config.headers.Authorization = `Bearer ${data.access}`
        return api(error.config)
      } catch {
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
