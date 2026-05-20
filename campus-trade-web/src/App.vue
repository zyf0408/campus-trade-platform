<template>
  <div class="app container">
    <nav class="navbar">
      <div class="navbar-left">
        <router-link to="/" class="navbar-brand">校园二手交易平台</router-link>
        <router-link to="/products" class="navbar-link">商品</router-link>
        <router-link v-if="isLoggedIn" to="/orders" class="navbar-link">订单</router-link>
        <router-link v-if="isLoggedIn" to="/chat" class="navbar-link">消息</router-link>
        <router-link v-if="isLoggedIn" to="/friends" class="navbar-link">好友</router-link>
        <router-link to="/requests" class="navbar-link">求购市场</router-link>
        <router-link v-if="isLoggedIn" to="/my-requests" class="navbar-link">我的求购</router-link>
        <router-link v-if="isLoggedIn" to="/profile" class="navbar-link">个人中心</router-link>
      </div>
      <div class="navbar-right">
        <template v-if="isLoggedIn">
          <span class="navbar-text">欢迎，{{ username }}</span>
          <button @click="handleLogout" class="btn btn-secondary">退出</button>
        </template>
        <template v-else>
          <router-link to="/login" class="navbar-link">登录</router-link>
          <router-link to="/register" class="btn btn-primary">注册</router-link>
        </template>
      </div>
    </nav>
    <router-view></router-view>
  </div>
</template>

<script>
import { logout } from './api/auth'

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      username: ''
    }
  },
  mounted() {
    this.checkAuth()
  },
  watch: {
    '$route': 'checkAuth'
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      this.isLoggedIn = !!token
      this.username = username || ''
    },
    async handleLogout() {
      try {
        await logout()
      } catch (e) {
        console.log('退出登录请求失败')
      }
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      this.isLoggedIn = false
      this.username = ''
      this.$router.push('/')
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f7fa;
  color: #333;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.app {
  padding: 20px 0;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px 0;
  border-bottom: 1px solid #ddd;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 15px 20px;
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-brand {
  font-size: 20px;
  font-weight: bold;
  color: #42b983;
  text-decoration: none;
  margin-right: 30px;
}

.navbar-link {
  margin: 0 15px;
  text-decoration: none;
  color: #333;
  transition: color 0.3s ease;
}

.navbar-link:hover {
  color: #42b983;
}

.navbar-right {
  display: flex;
  align-items: center;
}

.navbar-text {
  margin-right: 15px;
  color: #666;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #42b983;
  color: white;
}

.btn-primary:hover {
  background-color: #3aa876;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.navbar-right .btn {
  margin-left: 15px;
}
</style>
