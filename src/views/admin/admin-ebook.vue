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
        :row-key="record => String(record.id)"
        :data-source="ebooks"
        :pagination="pagination.value"
        :loading="loading"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'cover'">
            <a-image :src="record.cover" alt="图片加载失败" style="width:140px;height:80px"/>
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
// Ebook 类型 id 字段为 string
type Ebook = {
  id?: string;
  name?: string;
  category1Id?: string;
  category2Id?: string;
  description?: string;
  cover?: string;
  docCount?: number;
  viewCount?: number;
  voteCount?: number;
};

// 分类树类型
type CategoryTree = {
  id: string;
  name: string;
  children?: CategoryTree[];
};

const ebooks = ref<Ebook[]>([]);
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0
});
const loading = ref(false);
const param = reactive({ name: '' });

// 模态框状态
const ebook = ref<Ebook>({});
const modalVisible = ref(false);
const modalLoading = ref(false);

// 分类数据
const categories = ref<CategoryTree[]>([]);
const categoryIds = ref<string[]>([]);

// 深拷贝工具函数
const deepCopy = (obj: any) => {
  return JSON.parse(JSON.stringify(obj));
};

// 递归修正树结构 children 字段为数组，防御 ant-design-vue 报错
function fixTreeChildren(nodes: any[]): CategoryTree[] {
  if (!Array.isArray(nodes)) return [];
  return nodes.map((node: any) => {
    if (!Array.isArray(node.children)) {
      node.children = [];
    } else {
      node.children = fixTreeChildren(node.children);
    }
    return node as CategoryTree;
  });
}

onMounted(() => {
  handleQuery({ page: 1, size: pagination.value.pageSize });
  loadCategories();
});

// 查询方法
const handleQuery = (params: any) => {
  loading.value = true;
  axios.get("/ebook/list", {
    params: {
      page: params.page,
      size: params.size,
      name: param.name
    }
  }).then((resp) => {
    loading.value = false;
    const data = resp.data;
    if (data.success) {
      ebooks.value = data.content.list || data.content.records || [];
      pagination.value.current = params.page;
      pagination.value.total = data.content.total || 0;
    } else {
      // 如果后端未启动，使用模拟数据
      message.warning('后端服务未启动，显示模拟数据');
      ebooks.value = getMockData();
      pagination.value.total = ebooks.value.length;
    }
  }).catch(error => {
    loading.value = false;
    console.log('查询失败，使用模拟数据：', error);
    message.warning('后端服务未启动，显示模拟数据');
    ebooks.value = getMockData();
    pagination.value.total = ebooks.value.length;
  });
};

// 模拟数据
const getMockData = (): Ebook[] => {
  return [
    {
      id: '1',
      name: '海洋鱼类图鉴',
      category1Id: '鱼类',
      category2Id: '热带鱼',
      description: '详细介绍各种海洋鱼类的特征、习性和分布',
      cover: 'https://img.mianfeiwendang.com/pic/4ae03131210633d1935bc1cd/1-810-jpg_6-1080-0-0-1080.jpg',
      docCount: 156,
      viewCount: 2340,
      voteCount: 89
    },
    {
      id: '2',
      name: '珊瑚礁生态系统',
      category1Id: '珊瑚',
      category2Id: '硬珊瑚',
      description: '探索珊瑚礁的美丽世界和生态平衡',
      cover: 'https://img.mianfeiwendang.com/pic/4ae03131210633d1935bc1cd/1-810-jpg_6-1080-0-0-1080.jpg',
      docCount: 89,
      viewCount: 1567,
      voteCount: 45
    },
    {
      id: '3',
      name: '深海生物探秘',
      category1Id: '深海',
      category2Id: '深海鱼',
      description: '揭示深海生物的奥秘和生存环境',
      cover: 'https://img.mianfeiwendang.com/pic/4ae03131210633d1935bc1cd/1-810-jpg_6-1080-0-0-1080.jpg',
      docCount: 234,
      viewCount: 3456,
      voteCount: 123
    }
  ];
};

// 加载分类数据
const loadCategories = () => {
  axios.get("/ebook/list").then((resp) => {
    const data = resp.data;
    if (data.success) {
      // 递归修正 children 字段，防御 ant-design-vue 报错
      categories.value = fixTreeChildren(data.content);
    } else {
      // message.warning('加载分类失败');
    }
  }).catch(error => {
    console.log('加载分类失败：', error);
    // message.warning('加载分类失败');
  });
};

// 表格分页变化
const handleTableChange = (pag: any) => {
  pagination.value.current = pag.current;
  pagination.value.pageSize = pag.pageSize;
  handleQuery({
    page: pag.current,
    size: pag.pageSize
  });
};

// 编辑方法
const edit = (record: Ebook) => {
  modalVisible.value = true;
  ebook.value = deepCopy(record);
  // 保证 id 为字符串
  if (ebook.value.id) ebook.value.id = String(ebook.value.id);
  categoryIds.value = [ebook.value.category1Id || '', ebook.value.category2Id || ''];
};

// 新增方法
const add = () => {
  modalVisible.value = true;
  ebook.value = { name: '', cover: '', description: '', category1Id: '', category2Id: '' };
  categoryIds.value = [];
};

// 保存方法
const handleModalOk = () => {
  modalLoading.value = true;
  ebook.value.category1Id = categoryIds.value[0] || '';
  ebook.value.category2Id = categoryIds.value[1] || '';
  axios.post("/ebook/save", ebook.value).then(resp => {
    const data = resp.data;
    if (data.success) {
      modalLoading.value = false;
      modalVisible.value = false;
      message.success('保存成功');
      handleQuery({
        page: pagination.value.current,
        size: pagination.value.pageSize
      });
    }
  }).catch(error => {
    modalLoading.value = false;
    console.log('保存失败：', error);
    message.error('保存失败');
    modalVisible.value = false;
    handleQuery({
      page: pagination.value.current,
      size: pagination.value.pageSize
    });
  });
};

// 删除方法
const handleDelete = (id: string) => {
  axios.delete(`/ebook/delete/${id}`).then((resp) => {
    if (resp.data.success) {
      message.success('删除成功');
      handleQuery({
        page: pagination.value.current,
        size: pagination.value.pageSize
      });
    }
  }).catch(error => {
    console.log('删除失败：', error);
    message.error('删除失败');
    handleQuery({
      page: pagination.value.current,
      size: pagination.value.pageSize
    });
  });
};

// 跳转到文档管理
const goToDoc = (record: any) => {
  router.push({ path: '/admin/doc', query: { ebookId: String(record.id) } });
};
</script>

<style scoped>
.search-bar {
  margin-bottom: 16px;
}
</style> 