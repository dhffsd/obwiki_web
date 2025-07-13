import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import axios from 'axios'

// 配置Axios基础URL - 使用代理路径避免CORS问题
axios.defaults.baseURL = '/api'

// Axios请求拦截器
axios.interceptors.request.use(config => {
  console.log('请求参数：', config)
  return config
})

// Axios响应拦截器
axios.interceptors.response.use(response => {
  console.log('返回结果：', response)
  return response
}, error => {
  console.log('请求错误：', error)
  if (error.response && error.response.status === 404) {
    console.log('后端服务未启动或接口不存在，将使用模拟数据')
  }
  return Promise.reject(error)
})

const app = createApp(App)
app.use(store).use(router).use(Antd).mount('#app')
