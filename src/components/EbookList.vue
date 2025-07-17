<template>
  <div>
    <a-input v-model:value="name" placeholder="搜索电子书" @change="onSearch" style="width:200px;margin-bottom:16px;" />
    <div class="ebook-list">
      <div v-for="item in ebooks" :key="item.id" class="ebook-card">
        <img :src="item.cover" alt="封面加载失败" class="ebook-cover" @click="showDetail(item)" style="cursor:pointer;" />
        <div class="ebook-title" @click="showDetail(item)" style="cursor:pointer;">{{ item.name }}</div>
        <div class="ebook-vote-bar">
          <a-button type="primary" size="small" :disabled="item.liked" @click.stop="handleVote(item)">
            <span v-if="item.liked">已点赞</span>
            <span v-else>点赞</span>
            <span style="margin-left:8px;">{{ item.voteCount || 0 }}</span>
          </a-button>
        </div>
      </div>
    </div>
    <a-pagination
      :current="page"
      :pageSize="size"
      :total="total"
      @change="onPageChange"
      @showSizeChange="onSizeChange"
      style="margin-top:16px;text-align:right;"
    />
    <EbookDetail v-if="detailVisible" :ebookId="selectedEbookId" :visible="detailVisible" @close="detailVisible=false" />
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue';
import axios from 'axios';
import EbookDetail from './EbookDetail.vue';

const props = defineProps<{ categoryIds?: number[] }>();

const ebooks = ref<any[]>([]);
const total = ref(0);
const page = ref(1);
const size = ref(10);
const name = ref('');

const detailVisible = ref(false);
const selectedEbookId = ref<number | string | null>(null);

const showDetail = (item: any) => {
  selectedEbookId.value = item.id;
  detailVisible.value = true;
};

const handleVote = async (item: any) => {
  if (item.liked) return;
  try {
    // 调用后端点赞接口，获取最新点赞数
    const res = await axios.post(`/ebook/vote/${item.id}`);
    if (res.data && res.data.success && typeof res.data.content === 'number') {
      item.voteCount = res.data.content;
    } else {
      item.voteCount = (item.voteCount || 0) + 1;
    }
    item.liked = true;
  } catch (e) {
    // 本地+1兜底
    item.voteCount = (item.voteCount || 0) + 1;
    item.liked = true;
  }
};

const loadEbooks = async () => {
  const params: any = {
    page: page.value,
    size: size.value,
    name: name.value || undefined
  };
  if (props.categoryIds && props.categoryIds.length) {
    params.categoryIds = props.categoryIds.join(',');
  }
  const res = await axios.get('/ebook/list', { params });
  // 初始化每本书的 liked 状态
  ebooks.value = (res.data.content.list || res.data.content.records || []).map((item: any) => ({ ...item, liked: false }));
  total.value = res.data.content.total || 0;
};

const onPageChange = (p: number) => {
  page.value = p;
  loadEbooks();
};
const onSizeChange = (current: number, s: number) => {
  size.value = s;
  page.value = 1;
  loadEbooks();
};
const onSearch = () => {
  page.value = 1;
  loadEbooks();
};

watch(() => props.categoryIds, () => {
  page.value = 1;
  loadEbooks();
});

onMounted(() => {
  loadEbooks();
});
</script>

<style scoped>
.ebook-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}
.ebook-card {
  width: 180px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px #eee;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.ebook-card:hover {
  box-shadow: 0 4px 16px #b2ebf2;
}
.ebook-cover {
  width: 120px;
  height: 160px;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 12px;
  background: #f5f5f5;
}
.ebook-title {
  font-weight: bold;
  font-size: 16px;
  text-align: center;
  color: #1890ff;
}
.ebook-vote-bar {
  margin-top: 8px;
  text-align: center;
}
</style> 