import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',           name: 'Home',         component: () => import('../views/Home.vue') },
  { path: '/login',      name: 'Login',        component: () => import('../views/Login.vue') },
  { path: '/register',   name: 'Register',     component: () => import('../views/Register.vue') },
  { path: '/products',   name: 'Products',     component: () => import('../views/Products.vue') },
  { path: '/product/:id', name: 'ProductDetail', component: () => import('../views/ProductDetail.vue') },
  { path: '/orders',     name: 'Orders',       component: () => import('../views/Orders.vue') },
  { path: '/profile',    name: 'Profile',      component: () => import('../views/Profile.vue') },
  { path: '/chat',       name: 'Chat',         component: () => import('../views/Chat.vue') },
  { path: '/friends',    name: 'Friends',       component: () => import('../views/Friends.vue') },
  { path: '/requests',   name: 'PurchaseRequests', component: () => import('../views/PurchaseRequests.vue') },
  { path: '/my-requests', name: 'MyRequests',    component: () => import('../views/MyRequests.vue') },
  { path: '/favorites',  name: 'Favorites',     component: () => import('../views/Favorites.vue') },
  { path: '/user/:id',   name: 'UserProfile',   component: () => import('../views/UserProfile.vue') },
  { path: '/notifications', name: 'Notifications', component: () => import('../views/Notifications.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
