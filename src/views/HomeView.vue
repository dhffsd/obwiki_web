<template>
  <div class="home-bg">
    <!-- 欢迎区和分类电子书列表 -->
    <a-layout style="padding: 24px 0; background: transparent; margin-bottom: 40px;">
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          mode="inline"
          :selectedKeys="[currentCategoryIds ? String(currentCategoryIds[0]) : 'welcome']"
        >
          <a-menu-item key="welcome" @click="handleMenuClick('welcome')">
            <template #icon><home-outlined /></template>
            欢迎
          </a-menu-item>
          <CategoryMenu
            v-for="category in categories"
            :key="category.id"
            :category="category"
            @select="handleMenuClick"
          />
        </a-menu>
      </a-layout-sider>
      <a-layout-content :style="{ padding: '0 24px', minHeight: '280px' }">
        <div v-if="currentView === 'welcome'" class="welcome">
          <h1>欢迎使用海洋生物知识库系统</h1>
          <p>请从左侧菜单选择分类，浏览相关电子书</p>
        </div>
        <EbookList v-else :category-ids="currentCategoryIds" />
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { HomeOutlined } from '@ant-design/icons-vue';
import EbookList from '@/components/EbookList.vue';
import CategoryMenu from '@/components/CategoryMenu.vue';
import axios from 'axios';
import { Tool } from '@/utils/tool';
import { message } from 'ant-design-vue';

const categoriesRaw = ref<any[]>([]); // 平铺原始数据
const categories = ref<any[]>([]); // 树结构
const currentView = ref('welcome');
const currentCategoryIds = ref<number[] | null>(null);

onMounted(() => {
  loadCategories();
});

const loadCategories = () => {
  axios.get('/category/all').then(res => {
    categoriesRaw.value = res.data.content;
    categories.value = Tool.arrayToTree(res.data.content, 0);
  }).catch(error => {
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
    categoriesRaw.value = mockData;
    categories.value = Tool.arrayToTree(mockData, 0);
  });
};

const handleMenuClick = (key: string | { key: string }) => {
  const realKey = typeof key === 'string' ? key : key.key;
  if (realKey === 'welcome') {
    currentView.value = 'welcome';
    currentCategoryIds.value = null;
  } else {
    currentView.value = 'ebooks';
    // 递归查所有子分类 id
    currentCategoryIds.value = Tool.getAllCategoryIds(categoriesRaw.value, parseInt(realKey));
  }
};
</script>

<style scoped>
.home-bg {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0f7fa 0%, #b2ebf2 100%);
  padding: 32px 16px 48px 16px;
}
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
