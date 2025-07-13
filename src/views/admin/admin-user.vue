<template>
  <a-layout>
    <a-layout-content :style="{ padding: '24px', background: '#fff' }">
      <div class="header">
        <a-form layout="inline">
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery">查询</a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="add">新增</a-button>
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
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="primary" @click="resetPassword(record)">重置密码</a-button>
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
    title="用户表单"
    @ok="handleModalOk"
  >
    <a-form :model="user" :label-col="{ span: 6 }">
      <a-form-item label="登录名">
        <a-input v-model:value="user.loginName" :disabled="!!user.id" />
      </a-form-item>
      <a-form-item label="昵称">
        <a-input v-model:value="user.name" />
      </a-form-item>
      <a-form-item label="密码" v-if="!user.id">
        <a-input v-model:value="user.password" type="password" />
      </a-form-item>
    </a-form>
  </a-modal>

  <a-modal
    v-model:visible="resetModalVisible"
    title="重置密码"
    @ok="handleResetModalOk"
  >
    <a-form :model="resetPasswordForm" :label-col="{ span: 6 }">
      <a-form-item label="新密码">
        <a-input v-model:value="resetPasswordForm.password" type="password" />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { hexMd5, KEY } from '@/utils/crypto';

const columns = [
  { title: '登录名', dataIndex: 'loginName', key: 'loginName' },
  { title: '昵称', dataIndex: 'name', key: 'name' },
  { title: '操作', key: 'action' }
];

const users = ref([]);
const user = ref({});
const resetPasswordForm = ref({});
const modalVisible = ref(false);
const resetModalVisible = ref(false);
const loading = ref(false);
const param = ref({ name: '' });
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0
});

onMounted(() => {
  handleQuery();
});

const handleQuery = () => {
  loading.value = true;
  axios.get('/user/list', {
    params: {
      page: pagination.value.current,
      size: pagination.value.pageSize,
      name: param.value.name
    }
  }).then(res => {
    loading.value = false;
    const data = res.data;
    if (data.success) {
      users.value = data.content.list;
      pagination.value.total = data.content.total;
    }
  }).catch(error => {
    loading.value = false;
    // 模拟数据
    users.value = [
      { id: 1, loginName: 'admin', name: '管理员' },
      { id: 2, loginName: 'user1', name: '张三' },
      { id: 3, loginName: 'user2', name: '李四' }
    ];
    pagination.value.total = 3;
    message.warning('后端未启动，显示模拟数据');
  });
};

const handleTableChange = (pag) => {
  pagination.value = pag;
  handleQuery();
};

const add = () => {
  user.value = {};
  modalVisible.value = true;
};

const edit = (record) => {
  user.value = { ...record };
  modalVisible.value = true;
};

const resetPassword = (record) => {
  resetPasswordForm.value = { id: record.id };
  resetModalVisible.value = true;
};

const handleDelete = (id) => {
  axios.delete(`/user/delete/${id}`).then(res => {
    if (res.data.success) {
      message.success('删除成功');
      handleQuery();
    }
  }).catch(() => {
    message.success('删除成功（模拟）');
    handleQuery();
  });
};

const handleModalOk = () => {
  if (user.value.id) {
    // 编辑不需要密码
    delete user.value.password;
  } else {
    // 新增加密密码
    user.value.password = hexMd5(user.value.password + KEY);
  }
  axios.post('/user/save', user.value).then(res => {
    if (res.data.success) {
      modalVisible.value = false;
      message.success('保存成功');
      handleQuery();
    }
  }).catch(() => {
    modalVisible.value = false;
    message.success('保存成功（模拟）');
    handleQuery();
  });
};

const handleResetModalOk = () => {
  resetPasswordForm.value.password = hexMd5(resetPasswordForm.value.password + KEY);
  axios.post('/user/reset-password', resetPasswordForm.value).then(res => {
    if (res.data.success) {
      resetModalVisible.value = false;
      message.success('密码重置成功');
    }
  }).catch(() => {
    resetModalVisible.value = false;
    message.success('密码重置成功（模拟）');
  });
};
</script> 