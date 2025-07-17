<template>
  <a-sub-menu v-if="category.children && category.children.length" :key="category.id">
    <template #title>
      <span><folder-outlined />{{ category.name }}</span>
    </template>
    <CategoryMenu
      v-for="child in category.children"
      :key="child.id"
      :category="child"
      @select="$emit('select', $event)"
    />
  </a-sub-menu>
  <a-menu-item v-else @click="$emit('select', category.id)">
    {{ category.name }}
  </a-menu-item>
</template>

<script setup lang="ts">
import { FolderOutlined } from '@ant-design/icons-vue';
const props = defineProps<{ category: any }>();
</script> 