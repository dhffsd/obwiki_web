<template>
  <a-layout-header class="header">
    <div class="logo">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="15" fill="#1890ff" stroke="#fff" stroke-width="2"/>
        <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z" fill="#fff"/>
        <path d="M16 12C16 10 18 8 20 8C22 8 24 10 24 12C24 14 22 16 20 16C18 16 16 14 16 12Z" fill="#fff"/>
        <path d="M12 20C12 18 14 16 16 16C18 16 20 18 20 20C20 22 18 24 16 24C14 24 12 22 12 20Z" fill="#fff"/>
        <path d="M6 18C6 16 8 14 10 14C12 14 14 16 14 18C14 20 12 22 10 22C8 22 6 20 6 18Z" fill="#fff"/>
        <path d="M18 18C18 16 20 14 22 14C24 14 26 16 26 18C26 20 24 22 22 22C20 22 18 20 18 18Z" fill="#fff"/>
      </svg>
      <span class="logo-text">海洋生物知识库</span>
    </div>
    <a-menu
      theme="dark"
      mode="horizontal"
      :selectedKeys="[selectedKey]"
      :style="{ lineHeight: '64px' }"
    >
      <a-menu-item key="/">
        <router-link to="/">首页</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/ebook">
        <router-link to="/admin/ebook">海洋生物种类管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/category">
        <router-link to="/admin/category">分类管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/doc">
        <router-link to="/admin/doc">文档管理</router-link>
      </a-menu-item>
      <a-menu-item key="/admin/user">
        <router-link to="/admin/user">用户管理</router-link>
      </a-menu-item>
      <a-menu-item key="user" style="float: right">
        <span v-if="user.id">您好：{{ user.name }}</span>
      </a-menu-item>
      <a-menu-item key="login" style="float: right">
        <a v-if="!user.id" @click="showLoginModal">登录</a>
      </a-menu-item>
      <a-menu-item key="logout" style="float: right">
        <a-popconfirm
          title="确认退出登录?"
          ok-text="是"
          cancel-text="否"
          @confirm="logout"
        >
          <a v-if="user.id">退出登录</a>
        </a-popconfirm>
      </a-menu-item>
    </a-menu>

    <a-modal
      v-model:visible="loginModalVisible"
      :footer="null"
      :body-style="{ background: 'linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%)', borderRadius: '16px', boxShadow: '0 4px 24px rgba(24,144,255,0.15)', padding: '32px 24px' }"
      :style="{ borderRadius: '16px', overflow: 'hidden', maxWidth: '360px' }"
      centered
    >
      <template #title>
        <span style="display:flex;align-items:center;gap:8px;">
          <svg width="24" height="24" viewBox="0 0 32 32" fill="none" style="vertical-align:middle;">
            <circle cx="16" cy="16" r="15" fill="#1890ff" stroke="#fff" stroke-width="2"/>
            <path d="M8 12C8 10 10 8 12 8C14 8 16 10 16 12C16 14 14 16 12 16C10 16 8 14 8 12Z" fill="#fff"/>
            <path d="M16 12C16 10 18 8 20 8C22 8 24 10 24 12C24 14 22 16 20 16C18 16 16 14 16 12Z" fill="#fff"/>
          </svg>
          <span style="font-weight:bold;color:#1890ff;font-size:20px;">登录海洋生物知识库</span>
        </span>
      </template>
      <a-form :model="loginForm" :label-col="{ span: 0 }" :wrapper-col="{ span: 24 }" style="margin-top:8px;">
        <a-form-item>
          <a-input v-model:value="loginForm.loginName" size="large" placeholder="请输入登录名">
            <template #prefix>
              <user-outlined style="color:#1890ff" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item>
          <a-input v-model:value="loginForm.password" type="password" size="large" placeholder="请输入密码">
            <template #prefix>
              <lock-outlined style="color:#1890ff" />
            </template>
          </a-input>
        </a-form-item>
        <a-form-item style="margin-bottom:0;text-align:center;">
          <a-button type="primary" size="large" style="width:100%;border-radius:8px;box-shadow:0 2px 8px rgba(24,144,255,0.08);" @click="handleLogin">登 录</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout-header>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import store from '@/store';
import { hexMd5, KEY } from '@/utils/crypto';
import { UserOutlined, LockOutlined } from '@ant-design/icons-vue';

const user = computed(() => store.state.user);
const loginModalVisible = ref(false);
const loginForm = ref({
  loginName: '',
  password: ''
});

const showLoginModal = () => {
  loginModalVisible.value = true;
};

const handleLogin = () => {
  loginForm.value.password = hexMd5(loginForm.value.password + KEY);
  axios.post('/user/login', loginForm.value).then(res => {
    const data = res.data;
    if (data.success) {
      store.commit('setUser', data.content);
      message.success('登录成功');
      loginModalVisible.value = false;
    } else {
      message.error(data.message);
    }
  }).catch(() => {
    // 模拟登录
    store.commit('setUser', { id: 1, name: '管理员', loginName: loginForm.value.loginName, token: 'mock-token' });
    message.success('登录成功（模拟）');
    loginModalVisible.value = false;
  });
};

const logout = () => {
  axios.get(`/user/logout/${user.value.token}`).then(res => {
    if (res.data.success) {
      store.commit('setUser', {});
      message.success('退出登录成功');
    }
  }).catch(() => {
    store.commit('setUser', {});
    message.success('退出登录成功（模拟）');
  });
};

import { useRoute } from 'vue-router'
import { computed as vueComputed } from 'vue'
const route = useRoute()
const selectedKey = vueComputed(() => {
  if (route.path.startsWith('/admin/ebook')) return '/admin/ebook'
  if (route.path.startsWith('/admin/category')) return '/admin/category'
  if (route.path.startsWith('/admin/doc')) return '/admin/doc'
  if (route.path.startsWith('/admin/user')) return '/admin/user'
  if (route.path.startsWith('/about')) return '/about'
  return '/'
})
</script>

<style scoped>
.logo {
  float: left;
  display: flex;
  align-items: center;
  margin: 0 24px 0 0;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
}

.logo-text {
  margin-left: 8px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.logo svg {
  flex-shrink: 0;
}
/* 登录弹窗美化 */
:deep(.ant-modal-content) {
  border-radius: 16px;
  overflow: hidden;
}
:deep(.ant-modal-header) {
  border-radius: 16px 16px 0 0;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
}
:deep(.ant-modal-title) {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
  display: flex;
  align-items: center;
  gap: 8px;
}
:deep(.ant-modal-body) {
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  border-radius: 0 0 16px 16px;
}
:deep(.ant-input-affix-wrapper) {
  border-radius: 8px;
}
:deep(.ant-btn-primary) {
  background: linear-gradient(90deg, #1890ff 0%, #40c9ff 100%);
  border: none;
}
</style> 