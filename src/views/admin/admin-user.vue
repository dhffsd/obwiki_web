<template>
  <a-layout>
    <a-layout-content :style="{ padding: '24px', background: '#fff' }">
      <div class="header">
        <a-form layout="inline">
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="用户昵称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery">查询</a-button>
          </a-form-item>
          <a-form-item v-if="isAdmin">
            <a-button type="primary" @click="add">新增用户</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-table
        :columns="columns"
        :data-source="users"
        :row-key="record => record.id"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action' && isAdmin">
            <a-popconfirm title="确认删除？" @confirm="handleDelete(record.id)">
              <a>删除</a>
            </a-popconfirm>
            <a-divider type="vertical" />
            <a @click="resetPassword(record)">重置密码</a>
          </template>
        </template>
      </a-table>
      <a-modal v-model:visible="modalVisible" title="新增用户" @ok="handleSave">
        <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
          <a-form-item label="登录名">
            <a-input v-model:value="form.loginName" />
          </a-form-item>
          <a-form-item label="昵称">
            <a-input v-model:value="form.name" />
          </a-form-item>
        </a-form>
      </a-modal>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useStore } from 'vuex';
const store = useStore();
const isAdmin = computed(() => store.getters.isAdmin);

const columns = [
  { title: '登录名', dataIndex: 'loginName', key: 'loginName' },
  { title: '昵称', dataIndex: 'name', key: 'name' },
  { title: '操作', key: 'action' }
];

const users = ref([]);
const loading = ref(false);
const param = ref({ name: '' });
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0
});
const modalVisible = ref(false);
const form = ref({ id: undefined, loginName: '', name: '' });

onMounted(() => {
  handleQuery();
});

const handleQuery = () => {
  loading.value = true;
  axios.get('/user/list', {
    params: {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      name: param.value.name || undefined
    }
  }).then(res => {
    loading.value = false;
    const data = res.data;
    if (data.success) {
      users.value = data.content.list || data.content.records || [];
      pagination.value.total = data.content.total || 0;
    } else {
      message.error(data.message || '查询失败');
    }
  }).catch(error => {
    loading.value = false;
    console.error('查询用户失败:', error);
    message.error('查询用户失败');
  });
};

const handleTableChange = (pag) => {
  pagination.value = pag;
  handleQuery();
};

// 新增、编辑、保存、删除、重置密码等方法可按需补充
const add = () => {
  form.value = { id: undefined, loginName: '', name: '' };
  modalVisible.value = true;
};
const handleSave = () => {
  axios.post('/user/save', form.value).then(res => {
    if (res.data.success) {
      message.success('保存成功');
      modalVisible.value = false;
      handleQuery();
    } else {
      message.error(res.data.message || '保存失败');
    }
  });
};
const handleDelete = (id) => {
  axios.post('/user/delete', { id: id }).then(res => {
    if (res.data.success) {
      message.success('删除成功');
      handleQuery();
    } else {
      message.error(res.data.message || '删除失败');
    }
  }).catch(error => {
    console.error('删除用户失败:', error);
    message.error('删除用户失败');
  });
};
const resetPassword = (record) => {
  axios.post('/user/resetPassword', { id: record.id }).then(res => {
    if (res.data.success) {
      message.success('重置密码成功');
      handleQuery();
    } else {
      message.error(res.data.message || '重置密码失败');
    }
  }).catch(error => {
    console.error('重置密码失败:', error);
    message.error('重置密码失败');
  });
};
</script>

<style scoped>
.header {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}
</style> 