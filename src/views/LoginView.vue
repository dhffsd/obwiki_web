<template>
  <div class="login-bg">
    <div class="login-title">海洋生物知识库系统登录</div>
    <a-card class="login-card">
      <a-form @submit.prevent="handleLogin">
        <a-form-item>
          <a-input v-model:value="loginName" placeholder="用户名" />
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="password" type="password" placeholder="密码" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" block :loading="loading">登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import store from '@/store';

const loginName = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

const handleLogin = async () => {
  loading.value = true;
  try {
    const res = await axios.post('/user/login', { loginName: loginName.value, password: password.value });
    if (res.data.success) {
      // 存入 sessionStorage
      sessionStorage.setItem('USER', JSON.stringify(res.data.content));
      // 同步到 Vuex
      store.commit('setUser', res.data.content);
      message.success('登录成功');
      router.replace('/');
    } else {
      message.error(res.data.message || '登录失败');
    }
  } catch (e) {
    message.error('登录请求失败');
  }
  loading.value = false;
};
</script>

<style scoped>
.login-bg {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
}
.login-title {
  font-size: 2rem;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 32px;
  letter-spacing: 2px;
  text-shadow: 0 2px 8px rgba(24,144,255,0.08);
  text-align: center;
}
.login-card {
  width: 340px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(24,144,255,0.10);
  background: #fff;
}
</style> 