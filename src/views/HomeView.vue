<template>
  <a-layout style="padding: 24px 0; background: #fff">
    <a-layout-sider width="200" style="background: #fff">
      <a-menu
        mode="inline"
        :default-selected-keys="['welcome']"
        @click="handleMenuClick"
      >
        <a-menu-item key="welcome">
          <template #icon><home-outlined /></template>
          欢迎
        </a-menu-item>
        <template v-for="category in categories" :key="category.id">
          <a-sub-menu>
            <template #title>
              <span><folder-outlined />{{ category.name }}</span>
            </template>
            <a-menu-item v-for="child in category.children" :key="child.id">
              {{ child.name }}
            </a-menu-item>
          </a-sub-menu>
        </template>
      </a-menu>
    </a-layout-sider>
    <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
      <div v-if="currentView === 'welcome'" class="welcome">
        <h1>欢迎使用海洋生物知识库系统</h1>
        <p>请从左侧菜单选择分类，浏览相关电子书</p>
      </div>
      <EbookList v-else :category-id="currentCategoryId" />
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { HomeOutlined, FolderOutlined } from '@ant-design/icons-vue';
import EbookList from '@/components/EbookList.vue';
import axios from 'axios';
import { Tool } from '@/utils/tool';
import { message } from 'ant-design-vue';

const categories = ref<any[]>([]);
const currentView = ref('welcome');
const currentCategoryId = ref<number | null>(null);

onMounted(() => {
  loadCategories();
});

const loadCategories = () => {
  console.log('正在请求分类数据...')
  axios.get('/category/all').then(res => {
    console.log('分类数据请求成功：', res.data)
    categories.value = Tool.arrayToTree(res.data.content, 0);
  }).catch(error => {
    console.log('加载分类失败，使用模拟数据：', error)
    console.log('请求URL：', axios.defaults.baseURL + '/category/all')
    // 使用模拟数据
    const mockData = [
      { id: 1, name: '鱼类', parent: 0, sort: 1 },
      { id: 2, name: '热带鱼', parent: 1, sort: 1 },
      { id: 3, name: '冷水鱼', parent: 1, sort: 2 },
      { id: 4, name: '珊瑚', parent: 0, sort: 2 },
      { id: 5, name: '硬珊瑚', parent: 4, sort: 1 },
      { id: 6, name: '软珊瑚', parent: 4, sort: 2 },
      { id: 7, name: '深海生物', parent: 0, sort: 3 },
      { id: 8, name: '深海鱼', parent: 7, sort: 1 },
      { id: 9, name: '深海无脊椎动物', parent: 7, sort: 2 }
    ];
    categories.value = Tool.arrayToTree(mockData, 0);
  });
};

const handleMenuClick = ({ key }: { key: string }) => {
  if (key === 'welcome') {
    currentView.value = 'welcome';
  } else {
    currentView.value = 'ebooks';
    currentCategoryId.value = parseInt(key);
  }
};
</script>

<style scoped>
.welcome {
  text-align: center;
  padding: 50px;
}

.welcome h1 {
  color: #1890ff;
  margin-bottom: 20px;
}

.welcome p {
  color: #666;
  font-size: 16px;
}
</style>
