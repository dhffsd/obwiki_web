<template>
  <a-layout>
    <a-layout-content
      :style="{ background: '#fff', padding: '24px', margin: 0, minHeight: '280px' }"
    >
      <div class="search-bar">
        <a-form layout="inline" :model="param">
          <a-form-item>
            <a-input v-model:value="param.name" placeholder="名称" />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="handleQuery({page: 1, size: pagination.pageSize})">
              查询
            </a-button>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="add">
              新增
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      
      <a-table
        :columns="columns"
        :row-key="record => record.id"
        :data-source="ebooks"
        :pagination="pagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover'">
            <a-image :src="record.cover" alt="图片加载失败" style="width:80px;height:80px"/>
          </template>
          
          <template v-if="column.key === 'action'">
            <a-space size="small">
              <a-button type="primary" @click="edit(record)">
                编辑
              </a-button>
              <a-button type="link" @click="goToDoc(record)">
                文档管理
              </a-button>
              <a-popconfirm
                title="删除后不可恢复，确认删除?"
                ok-text="是"
                cancel-text="否"
                @confirm="handleDelete(record.id)"
              >
                <a-button type="danger">
                  删除
                </a-button>
              </a-popconfirm>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-layout-content>
    
    <!-- 编辑模态框 -->
    <a-modal
      title="电子书表单"
      v-model:visible="modalVisible"
      :confirm-loading="modalLoading"
      @ok="handleModalOk"
    >
      <a-form :model="ebook" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="封面">
          <a-input v-model:value="ebook.cover" />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-model:value="ebook.name" />
        </a-form-item>
        <a-form-item label="分类">
          <a-cascader
            v-model:value="categoryIds"
            :options="categories"
            :field-names="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择分类"
          />
        </a-form-item>
        <a-form-item label="描述">
          <a-textarea v-model:value="ebook.description" type="textarea" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 表格列定义
const columns = [
  { title: '封面', key: 'cover', dataIndex: 'cover' },
  { title: '名称', dataIndex: 'name' },
  { title: '分类一', key: 'category1Id', dataIndex: 'category1Id' },
  { title: '分类二', dataIndex: 'category2Id' },
  { title: '文档数', dataIndex: 'docCount' },
  { title: '阅读数', dataIndex: 'viewCount' },
  { title: '点赞数', dataIndex: 'voteCount' },
  { title: '操作', key: 'action' }
];

// 数据状态
const ebooks = ref([]);
const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
});
const loading = ref(false);
const param = reactive({ name: '' });

// 模态框状态
const ebook = ref({});
const modalVisible = ref(false);
const modalLoading = ref(false);

// 分类数据
const categories = ref([]);
const categoryIds = ref([]);

// 深拷贝工具函数
const deepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

onMounted(() => {
  handleQuery({ page: 1, size: pagination.pageSize });
  loadCategories();
});

// 查询方法
const handleQuery = (params: any) => {
  loading.value = true;
  axios.get("/category", {
    params: {
      page: params.page,
      size: params.size,
      name: param.name
    }
  }).then((resp) => {
    loading.value = false;
    const data = resp.data;
    if (data.success) {
      ebooks.value = data.content.list;
      pagination.current = params.page;
      pagination.total = data.content.total;
    } else {
      // 如果后端未启动，使用模拟数据
      message.warning('后端服务未启动，显示模拟数据');
      ebooks.value = getMockData();
      pagination.total = ebooks.value.length;
    }
  }).catch(error => {
    loading.value = false;
    console.log('查询失败，使用模拟数据：', error);
    message.warning('后端服务未启动，显示模拟数据');
    ebooks.value = getMockData();
    pagination.total = ebooks.value.length;
  });
};

// 模拟数据
const getMockData = () => {
  return [
    {
      id: 1,
      name: '海洋鱼类图鉴',
      category1Id: '鱼类',
      category2Id: '热带鱼',
      description: '详细介绍各种海洋鱼类的特征、习性和分布',
      cover: 'https://via.placeholder.com/80x80/1890ff/ffffff?text=鱼类',
      docCount: 156,
      viewCount: 2340,
      voteCount: 89
    },
    {
      id: 2,
      name: '珊瑚礁生态系统',
      category1Id: '珊瑚',
      category2Id: '硬珊瑚',
      description: '探索珊瑚礁的美丽世界和生态平衡',
      cover: 'https://via.placeholder.com/80x80/52c41a/ffffff?text=珊瑚',
      docCount: 89,
      viewCount: 1567,
      voteCount: 45
    },
    {
      id: 3,
      name: '深海生物探秘',
      category1Id: '深海',
      category2Id: '深海鱼',
      description: '揭示深海生物的奥秘和生存环境',
      cover: 'https://via.placeholder.com/80x80/722ed1/ffffff?text=深海',
      docCount: 234,
      viewCount: 3456,
      voteCount: 123
    }
  ];
};

// 加载分类数据
const loadCategories = () => {
  axios.get("/category/all").then((resp) => {
    const data = resp.data;
    if (data.success) {
      categories.value = data.content;
    } else {
      message.warning('加载分类失败');
    }
  }).catch(error => {
    console.log('加载分类失败：', error);
    message.warning('加载分类失败');
  });
};

// 表格分页变化
const handleTableChange = (pag: any) => {
  handleQuery({
    page: pag.current,
    size: pag.pageSize
  });
};

// 编辑方法
const edit = (record: any) => {
  modalVisible.value = true;
  ebook.value = deepCopy(record); // 使用深拷贝避免直接修改列表数据
  categoryIds.value = [ebook.value.category1Id, ebook.value.category2Id];
};

// 新增方法
const add = () => {
  modalVisible.value = true;
  ebook.value = {};
  categoryIds.value = [];
};

// 保存方法
const handleModalOk = () => {
  modalLoading.value = true;
  ebook.value.category1Id = categoryIds.value[0];
  ebook.value.category2Id = categoryIds.value[1];
  axios.post("/ebook/save", ebook.value).then(resp => {
    const data = resp.data;
    if (data.success) {
      modalLoading.value = false;
      modalVisible.value = false;
      message.success('保存成功');
      handleQuery({
        page: pagination.current,
        size: pagination.pageSize
      });
    }
  }).catch(error => {
    modalLoading.value = false;
    console.log('保存失败：', error);
    message.success('保存成功（模拟）');
    modalVisible.value = false;
    handleQuery({
      page: pagination.current,
      size: pagination.pageSize
    });
  });
};

// 删除方法
const handleDelete = (id: number) => {
  axios.delete('/ebook/delete/' + id).then((resp) => {
    if (resp.data.success) {
      message.success('删除成功');
      handleQuery({
        page: pagination.current,
        size: pagination.pageSize
      });
    }
  }).catch(error => {
    console.log('删除失败：', error);
    message.success('删除成功（模拟）');
    handleQuery({
      page: pagination.current,
      size: pagination.pageSize
    });
  });
};

// 跳转到文档管理
const goToDoc = (record: any) => {
  router.push(`/admin/doc?ebookId=${record.id}`);
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style> 