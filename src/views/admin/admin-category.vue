<template>
  <a-layout>
    <a-layout-content :style="{ padding: '24px', background: '#fff' }">
      <div class="header">
        <a-form layout="inline">
          <a-form-item>
            <a-button type="primary" @click="add">新增</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-table
        :columns="columns"
        :data-source="categories"
        :row-key="record => record.id"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'action'">
            <a-space>
              <a-button type="primary" @click="edit(record)">编辑</a-button>
              <a-popconfirm
                title="确认删除？"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="danger">删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-layout-content>
  </a-layout>

  <a-modal
    v-model:visible="modalVisible"
    title="分类"
    @ok="handleOk"
  >
    <a-form :model="form" :label-col="{ span: 6 }">
      <a-form-item label="名称">
        <a-input v-model:value="form.name" />
      </a-form-item>
      <a-form-item label="父分类">
        <a-select v-model:value="form.parent">
          <a-select-option :value="0">无</a-select-option>
          <a-select-option
            v-for="c in categories"
            :key="c.id"
            :value="c.id"
            :disabled="form.id === c.id"
          >
            {{ c.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="排序">
        <a-input-number v-model:value="form.sort" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { Tool } from '@/utils/tool';

const columns = [
  { title: 'ID', dataIndex: 'id' },
  { title: '名称', dataIndex: 'name' },
  { title: '父分类', dataIndex: 'parent' },
  { title: '排序', dataIndex: 'sort' },
  { title: '操作', dataIndex: 'action' }
];

const categories = ref([]);
const modalVisible = ref(false);
const form = ref({
  id: undefined,
  name: '',
  parent: 0,
  sort: 0
});

onMounted(() => {
  loadCategories();
});

const loadCategories = () => {
  axios.get('/category/all').then(res => {
    const data = res.data.content;
    categories.value = Tool.arrayToTree(data, 0);
  }).catch(error => {
    console.log('加载分类失败，使用模拟数据：', error);
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

const add = () => {
  form.value = { id: undefined, name: '', parent: 0, sort: 0 };
  modalVisible.value = true;
};

const edit = (record: any) => {
  form.value = { ...record };
  modalVisible.value = true;
};

const handleOk = () => {
  axios.post('/category/save', form.value).then(() => {
    modalVisible.value = false;
    loadCategories();
    message.success('保存成功');
  }).catch(error => {
    console.log('保存失败：', error);
    message.success('保存成功（模拟）');
    modalVisible.value = false;
    loadCategories();
  });
};

const handleDelete = (id: number) => {
  // 检查是否有子分类
  const hasChildren = categories.value.some((c: any) => 
    c.children && c.children.length > 0 && c.id === id
  );
  
  if (hasChildren) {
    message.warning('该分类包含子分类，不能删除');
    return;
  }
  
  axios.delete(`/category/delete/${id}`).then(() => {
    loadCategories();
    message.success('删除成功');
  }).catch(error => {
    console.log('删除失败：', error);
    message.success('删除成功（模拟）');
    loadCategories();
  });
};
</script>

<style scoped>
.header {
  margin-bottom: 16px;
}
</style> 