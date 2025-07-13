<template>
  <a-layout-footer style="text-align: center">
    海洋生物知识库系统 ©2023
  </a-layout-footer>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch } from 'vue';
import store from '@/store';
import { notification } from 'ant-design-vue';

let websocket: WebSocket | null = null;

const connectWebSocket = (token: string) => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
  if (!token) return;
  websocket = new WebSocket(`ws://localhost:8880/ws/${token}`);

  websocket.onopen = () => {
    console.log('WebSocket连接已建立');
  };

  websocket.onmessage = (event) => {
    console.log('收到消息:', event.data);
    notification.open({
      message: '系统通知',
      description: event.data,
      duration: 4
    });
  };

  websocket.onclose = () => {
    console.log('WebSocket连接已关闭');
  };
};

onMounted(() => {
  connectWebSocket(store.state.user.token);
});

onUnmounted(() => {
  if (websocket) {
    websocket.close();
    websocket = null;
  }
});

// 监听token变化，自动重连
watch(
  () => store.state.user.token,
  (newToken, oldToken) => {
    if (newToken !== oldToken) {
      connectWebSocket(newToken);
    }
  }
);
</script> 