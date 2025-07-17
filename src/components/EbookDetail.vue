<template>
  <a-modal :visible="visible" :title="ebookName" width="900px" @cancel="$emit('close')" :footer="null">
    <div class="ebook-detail-modal">
      <div class="left-panel">
        <a-tree
          :tree-data="docTree"
          :field-names="{ title: 'name', key: 'id', children: 'children' }"
          :defaultExpandAll="true"
          @select="handleSelect"
        />
      </div>
      <div class="right-panel">
        <div v-if="content" v-html="content" class="doc-content"></div>
        <div v-else class="doc-content-empty">请选择左侧文档目录</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Tool } from '@/utils/tool';

const props = defineProps<{ ebookId: number | string, visible: boolean }>();
const emit = defineEmits(['close']);

const docTree = ref<any[]>([]);
const content = ref('');
const selectedDocId = ref<string | number | null>(null);
const ebookName = ref('');

onMounted(() => {
  if (props.visible && props.ebookId) {
    loadDocs();
  }
});

watch(() => props.visible, (val) => {
  if (val && props.ebookId) {
    loadDocs();
  }
});

watch(() => props.ebookId, (val) => {
  if (props.visible && val) {
    loadDocs();
  }
});

async function loadDocs() {
  // 获取电子书名称
  const ebookRes = await axios.get(`/ebook/find/${props.ebookId}`);
  ebookName.value = ebookRes.data.content?.name || '';
  // 获取目录树
  const res = await axios.get('/doc/all', { params: { ebookId: props.ebookId } });
  console.log('doc/all 返回：', res.data); // 加这一行
  const docs = res.data.content || [];
  docTree.value = Tool.arrayToTree(docs, 0);
  if (docTree.value.length) {
    // 默认选中第一个文档
    const firstDoc = findFirstLeaf(docTree.value);
    if (firstDoc) {
      selectedDocId.value = firstDoc.id;
      loadContent(firstDoc.id);
    }
  }
}

function handleSelect(keys: (string | number)[]) {
  if (keys && keys.length) {
    selectedDocId.value = keys[0];
    loadContent(keys[0]);
  }
}

async function loadContent(docId: string | number) {
  const res = await axios.get(`/content/findContent/${docId}`);
  content.value = res.data.content || '';
}

function findFirstLeaf(tree: any[]): any {
  for (const node of tree) {
    if (!node.children || node.children.length === 0) {
      return node;
    } else {
      const leaf = findFirstLeaf(node.children);
      if (leaf) return leaf;
    }
  }
  return null;
}
</script>

<style scoped>
.ebook-detail-modal {
  display: flex;
  min-height: 500px;
}
.left-panel {
  width: 260px;
  border-right: 1px solid #f0f0f0;
  padding: 16px 8px 16px 0;
  background: #fafbfc;
  overflow-y: auto;
}
.right-panel {
  flex: 1;
  padding: 16px 24px;
  overflow-y: auto;
}
.doc-content {
  min-height: 400px;
  font-size: 16px;
  line-height: 1.8;
  color: #222;
}
.doc-content-empty {
  color: #aaa;
  text-align: center;
  padding: 100px 0;
}
</style> 