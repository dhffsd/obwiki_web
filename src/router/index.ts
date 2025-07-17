import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue';
import LoginView from '../views/LoginView.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView
  },
  {
    path: '/about',
    name: 'about',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  },
  {
    path: '/admin/ebook',
    name: 'AdminEbook',
    component: () => import('../views/admin/admin-ebook.vue')
  },
  {
    path: '/admin/category',
    name: 'AdminCategory',
    component: () => import('../views/admin/admin-category.vue')
  },
  {
    path: '/admin/doc',
    name: 'AdminDoc',
    component: () => import('../views/admin/admin-doc.vue')
  },
  {
    path: '/admin/user',
    name: 'AdminUser',
    component: () => import('../views/admin/admin-user.vue')
  },
  {
    path: '/doc',
    name: 'Doc',
    component: () => import('../views/DocView.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 登录拦截
router.beforeEach((to, from, next) => {
  const user = sessionStorage.getItem('USER');
  if (to.path !== '/login' && !user) {
    next('/login');
  } else if (to.path === '/login' && user) {
    next('/');
  } else {
    next();
  }
});

export default router
