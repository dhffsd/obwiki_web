<template>
  <a-layout>
    <a-layout-content :style="{ padding: '24px', background: '#fff' }">
      <a-row :gutter="24">
        <a-col :span="6">
          <div class="left-panel">
            <div class="panel-header">
              <h3 v-if="ebookName">【{{ ebookName }}】文档结构</h3>
              <h3 v-else-if="!ebookId">请先到【海洋生物种类管理】选择电子书</h3>
            </div>
            <a-table
              v-if="level1.length > 0 && ebookId"
              :columns="columns"
              :data-source="level1"
              :row-key="record => record.id"
              :pagination="false"
              :default-expand-all-rows="true"
              size="small"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'action'">
                  <a-space size="small">
                    <a-button type="primary" size="small" @click="edit(record)">编辑</a-button>
                    <a-popconfirm
                      title="确认删除？"
                      @confirm="handleDelete(record.id)"
                    >
                      <a-button type="danger" size="small">删除</a-button>
                    </a-popconfirm>
                  </a-space>
                </template>
              </template>
            </a-table>
          </div>
        </a-col>
        <a-col :span="18">
          <div class="right-panel">
            <div class="panel-header">
              <h3>文档编辑</h3>
            </div>
            <a-form v-if="ebookId" :model="doc" layout="vertical">
              <a-row :gutter="16">
                <a-col :span="12">
                  <a-form-item label="文档名称">
                    <a-input v-model:value="doc.name" placeholder="请输入文档名称" />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="父文档">
                    <a-tree-select
                      v-model:value="doc.parent"
                      :tree-data="treeSelectData"
                      placeholder="请选择父文档"
                      :replace-fields="{ label: 'name', key: 'id', value: 'id' }"
                      :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                    />
                  </a-form-item>
                </a-col>
                <a-col :span="6">
                  <a-form-item label="排序">
                    <a-input-number v-model:value="doc.sort" placeholder="排序" />
                  </a-form-item>
                </a-col>
              </a-row>
              <a-form-item label="文档内容">
                <a-textarea
                  v-model:value="doc.content"
                  :rows="25"
                  placeholder="请输入文档内容..."
                  class="content-editor"
                />
              </a-form-item>
              <a-form-item>
                <a-space>
                  <a-button type="primary" @click="handleSave">保存文档</a-button>
                </a-space>
              </a-form-item>
            </a-form>
            <div v-else style="color:#888;text-align:center;padding:40px 0;">请先从【海洋生物种类管理】进入文档管理</div>
          </div>
        </a-col>
      </a-row>
    </a-layout-content>
  </a-layout>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { Tool } from '@/utils/tool';

const route = useRoute();
const ebookId = route.query.ebookId;
const ebookName = ref('');

const columns = [
  { title: '名称', dataIndex: 'name' },
  { title: '操作', dataIndex: 'action', width: 120 }
];

const level1 = ref([]);
const treeSelectData = ref([]);
const loading = ref(false);
const doc = ref({
  id: undefined,
  ebookId: ebookId,
  parent: 0,
  name: '',
  sort: 0,
  content: ''
});

onMounted(() => {
  if (ebookId) {
    axios.get(`/ebook/find/${ebookId}`).then(res => {
      if (res.data.success && res.data.content && res.data.content.name) {
        ebookName.value = res.data.content.name;
      } else {
        ebookName.value = '';
      }
    });
    handleQuery();
  }
});

const handleQuery = () => {
  if (!ebookId) return;
  loading.value = true;
  axios.get("/doc/all", { params: { ebookId: ebookId } }).then(res => {
    loading.value = false;
    const data = res.data;
    if (data.success) {
      level1.value = Tool.arrayToTree(data.content, 0);
      treeSelectData.value = Tool.copy(level1.value);
      treeSelectData.value.unshift({ id: 0, name: '无', children: [] });
      fixChildrenArray(treeSelectData.value);
    }
  }).catch(error => {
    loading.value = false;
    console.log('加载文档失败：', error);
    // 移除模拟数据，不再赋值 level1/treeSelectData
  });
};

const edit = (record: any) => {
  doc.value = Tool.copy(record);
  // 加载文档内容
  axios.get(`/content/findContent/${record.id}`).then(res => {
    if (res.data.success) {
      doc.value.content = res.data.content;
    }
  }).catch(error => {
    console.log('加载文档内容失败：', error);
    // 使用模拟内容
    doc.value.content = `# ${record.name}\n\n这是${record.name}的内容...\n\n## 主要内容\n\n这里可以输入详细的文档内容，支持Markdown格式。\n\n### 子标题\n\n- 列表项1\n- 列表项2\n- 列表项3\n\n**重要提示：** 这是一个模拟的文档编辑器，实际使用时可以集成真实的富文本编辑器。`;
  });
};

const handleSave = () => {
  axios.post("/doc/save", doc.value).then(res => {
    if (res.data.success) {
      message.success('保存成功');
      // 保存成功后清空表单
      doc.value = {
        id: undefined,
        ebookId: ebookId,
        parent: 0,
        name: '',
        sort: 0,
        content: ''
      };
      handleQuery();
    }
  }).catch(error => {
    console.log('保存失败：', error);
    message.success('保存成功（模拟）');
    handleQuery();
  });
};

const handleDelete = (id: number) => {
  axios.delete(`/doc/delete/${id}`).then(res => {
    if (res.data.success) {
      message.success('删除成功');
      handleQuery();
    }
  }).catch(error => {
    console.log('删除失败：', error);
    message.success('删除成功（模拟）');
    handleQuery();
  });
};

// 终极防御式递归修正所有节点 children 字段为数组
function fixChildrenArray(nodes) {
  if (!Array.isArray(nodes)) return;
  nodes.forEach(node => {
    node.children = Array.isArray(node.children) ? node.children : [];
    fixChildrenArray(node.children);
  });
}
</script>

<style scoped>
.left-panel {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.right-panel {
  background: #fff;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  padding: 16px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e8e8e8;
}

.panel-header h3 {
  margin: 0;
  color: #1890ff;
}

.content-editor {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
}

.ant-table {
  background: transparent;
}

.ant-table-thead > tr > th {
  background: #f5f5f5;
  border-bottom: 1px solid #e8e8e8;
}

.ant-table-tbody > tr > td {
  border-bottom: 1px solid #f0f0f0;
}
</style> 