<template>
  <a-list :data-source="ebooks" :grid="{ gutter: 16, column: 3 }">
    <template #renderItem="{ item }">
      <a-list-item>
        <a-card :title="item.name">
          <template #cover>
            <img :src="item.cover" alt="封面" style="width: 100px; height: 100px" />
          </template>
          <a-card-meta :description="item.description" />
          <div class="stats">
            <span class="stat-item"><eye-outlined style="margin-right:4px;" />{{ formatNumber(item.viewCount) }}</span>
            <span class="stat-item"><like-outlined style="margin-right:4px;" />{{ formatNumber(item.voteCount) }}</span>
          </div>
          <div class="actions">
            <a-button type="link" @click="goToDoc(item)">阅读</a-button>
          </div>
        </a-card>
      </a-list-item>
    </template>
  </a-list>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';
import { EyeOutlined, LikeOutlined } from '@ant-design/icons-vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const props = defineProps(['categoryId']);
const ebooks = ref([]);

// 根据分类ID返回对应的电子书
const getMockEbooksByCategory = (categoryId: number) => {
  const allMockEbooks = [
    {
      id: 1,
      name: '热带鱼图鉴',
      description: '详细介绍各种热带鱼的美丽色彩和习性',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTg5MGZmIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW36Ieq54mHPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 2340,
      voteCount: 156
    },
    {
      id: 2,
      name: '冷水鱼生态',
      description: '探索冷水鱼类的生存环境和特点',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNTJjNDFhIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW35Y2g6YeR6Ieq54mHPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 1567,
      voteCount: 89
    },
    {
      id: 3,
      name: '硬珊瑚之美',
      description: '欣赏硬珊瑚的美丽形态和生长过程',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjNzIyZWQxIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW36I2v546v6I2vPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 3456,
      voteCount: 234
    },
    {
      id: 4,
      name: '软珊瑚探秘',
      description: '了解软珊瑚的柔美和生态价值',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmE4YzE2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW35Y2g6YeR546v6I2vPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 2890,
      voteCount: 178
    },
    {
      id: 5,
      name: '深海鱼类',
      description: '探索深海鱼类的神秘世界',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMTNjMmMyIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW35Y2g5rW36Ieq54mHPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 4567,
      voteCount: 345
    },
    {
      id: 6,
      name: '深海无脊椎动物',
      description: '了解深海无脊椎动物的奇特形态',
      cover: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZWIyZjk2Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjEyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+5Y2g5rW35Y2g5rW35LiA5qyh5a2p5a2pPC90ZXh0Pgo8L3N2Zz4K',
      viewCount: 1234,
      voteCount: 67
    }
  ];

  // 根据分类ID返回对应的电子书
  const categoryEbookMap: { [key: number]: any[] } = {
    2: [allMockEbooks[0]], // 热带鱼
    3: [allMockEbooks[1]], // 冷水鱼
    5: [allMockEbooks[2]], // 硬珊瑚
    6: [allMockEbooks[3]], // 软珊瑚
    8: [allMockEbooks[4]], // 深海鱼
    9: [allMockEbooks[5]]  // 深海无脊椎动物
  };

  return categoryEbookMap[categoryId] || [];
};

// 加载电子书数据
const loadEbooks = (categoryId: number) => {
  axios.get('/ebook/list', {
    params: {
      categoryId2: categoryId,
      page: 1,
      size: 100
    }
  }).then(res => {
    ebooks.value = res.data.content.list;
  }).catch(error => {
    console.log('加载电子书失败，使用模拟数据：', error);
    // 根据分类ID返回不同的模拟数据
    const mockData = getMockEbooksByCategory(categoryId);
    ebooks.value = mockData;
  });
};

watch(() => props.categoryId, (newVal) => {
  if (newVal) {
    loadEbooks(newVal);
  }
}, { immediate: true });

// 跳转到文档阅读页面
const goToDoc = (item: any) => {
  router.push(`/doc?ebookId=${item.id}`);
};

// 千分位格式化
const formatNumber = (num: number) => {
  if (typeof num !== 'number') return num;
  return num.toLocaleString();
};
</script>

<style scoped>
.stats {
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
}
.stat-item {
  display: flex;
  align-items: center;
  font-size: 15px;
  color: #666;
  margin-right: 16px;
}

.actions {
  margin-top: 10px;
  text-align: center;
}
</style> 