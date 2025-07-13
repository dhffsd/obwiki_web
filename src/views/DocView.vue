<template>
  <a-layout>
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
        mode="inline"
        :default-selected-keys="[currentDoc]"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="doc in docs" :key="doc.id">
          {{ doc.name }}
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout-content :style="{ padding: '24px' }">
      <div v-html="content"></div>
      <div class="like-bar">
        <a-button
          type="primary"
          :icon="liked ? 'like-filled' : 'like-outlined'"
          :disabled="liked || likeLoading"
          @click="handleVote"
          size="large"
          style="margin-top:32px;"
        >
          点赞 <span style="margin-left:8px;">{{ formatNumber(voteCount) }}</span>
        </a-button>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { LikeOutlined, LikeFilled } from '@ant-design/icons-vue';

const route = useRoute();
const ebookId = route.query.ebookId;
const docs = ref([]);
const content = ref('');
const currentDoc = ref();
const voteCount = ref(0);
const liked = ref(false);
const likeLoading = ref(false);

onMounted(() => {
  loadDocs();
  // 初始化点赞数（可根据实际接口调整）
  voteCount.value = 0;
  liked.value = false;
});

const loadDocs = () => {
  axios.get(`/doc/all/${ebookId}`).then(res => {
    if (res.data.success) {
      docs.value = res.data.content;
      if (docs.value.length > 0) {
        currentDoc.value = docs.value[0].id;
        loadContent(docs.value[0].id);
      }
    }
  }).catch(error => {
    console.log('加载文档列表失败，使用模拟数据：', error);
    // 使用模拟数据
    const mockDocs = [
      { id: 1, name: '第一章 海洋生物概述' },
      { id: 2, name: '1.1 海洋生态系统' },
      { id: 3, name: '1.2 海洋生物分类' },
      { id: 4, name: '第二章 鱼类' },
      { id: 5, name: '2.1 热带鱼' },
      { id: 6, name: '2.2 冷水鱼' }
    ];
    docs.value = mockDocs;
    if (docs.value.length > 0) {
      currentDoc.value = docs.value[0].id;
      loadContent(docs.value[0].id);
    }
  });
};

const loadContent = (id: number) => {
  axios.get(`/content/findContent/${id}`).then(res => {
    if (res.data.success) {
      content.value = res.data.content;
    }
  }).catch(error => {
    console.log('加载文档内容失败，使用模拟内容：', error);
    // 使用模拟内容
    const mockContents: { [key: number]: string } = {
      1: '<h1>第一章 海洋生物概述</h1><p>海洋生物是地球上最丰富的生物资源之一...</p>',
      2: '<h2>1.1 海洋生态系统</h2><p>海洋生态系统是一个复杂的生物群落...</p>',
      3: '<h2>1.2 海洋生物分类</h2><p>海洋生物按照不同的标准可以分为多个类别...</p>',
      4: '<h1>第二章 鱼类</h1><p>鱼类是海洋中最常见的脊椎动物...</p>',
      5: '<h2>2.1 热带鱼</h2><p>热带鱼以其鲜艳的色彩和独特的形态而闻名...</p>',
      6: '<h2>2.2 冷水鱼</h2><p>冷水鱼适应了寒冷的水域环境...</p>'
    };
    content.value = mockContents[id] || '<p>暂无内容</p>';
  });
};

const handleMenuClick = ({ key }: { key: string }) => {
  currentDoc.value = key;
  loadContent(parseInt(key));
};

// 千分位格式化
const formatNumber = (num: number) => {
  if (typeof num !== 'number') return num;
  return num.toLocaleString();
};

const handleVote = async () => {
  if (liked.value) return;
  likeLoading.value = true;
  try {
    // 假设当前文档ID为currentDoc.value
    await axios.post(`/doc/vote/${currentDoc.value}`);
    voteCount.value++;
    liked.value = true;
    message.success('点赞成功');
  } catch (error) {
    message.error('点赞失败');
  } finally {
    likeLoading.value = false;
  }
};
</script>

<style scoped>
.ant-layout-content {
  background: #fff;
}
.like-bar {
  margin-top: 32px;
  text-align: center;
}
</style> 