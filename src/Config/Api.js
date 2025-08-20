import axios from 'axios'
import { notifyError } from '../utilities/Toastify'
import i18n from 'i18next'

const Api = axios.create({
  baseURL: "http://localhost:3000",
  // baseURL: "https://loyalty-system-backend-production.up.railway.app",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

Api.interceptors.request.use(
  (config) => {
    config.headers['lang'] = i18n.language;
    config.headers["page"] = window.location.pathname.split('/').pop();
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

export const handleApiError = (error) => {
  try {
    const status = error?.response?.status
    const responseBody = error?.response?.data
    if (status == 500) {
      return notifyError('Unexpected Error Happen ')
    }
    if (Array.isArray(responseBody)) {
      responseBody.map((e) => notifyError(e.message))
    } else if (Array.isArray(responseBody?.message)) {
      responseBody?.message?.map((e) => notifyError(e))
    } else {
      const errorMes = responseBody?.message || responseBody?.error || responseBody
      console.log('🚀 ~ handleApiError ~ errorMes:', errorMes)
      notifyError(errorMes)
    }
  } catch (error) {
    console.log(error)
  }
}

export default Api
