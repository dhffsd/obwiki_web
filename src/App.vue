<template>
  <a-layout>
    <the-header v-if="route.path !== '/login'"></the-header>
    <router-view/>
    <the-footer v-if="route.path !== '/login'"></the-footer>
  </a-layout>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';
import TheHeader from '@/components/the-header.vue'
import TheFooter from '@/components/the-footer.vue'
const route = useRoute();
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
