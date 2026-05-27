<template>
  <div class="app">
    <nav class="navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <router-link to="/" class="navbar-brand">
            <span class="brand-icon">🏫</span>
            <span class="brand-text">校园二手</span>
          </router-link>
          <div class="nav-links">
            <router-link to="/products" class="nav-link">
              <span class="link-icon">🛍️</span>
              <span>商品</span>
            </router-link>
            <router-link v-if="isLoggedIn" to="/orders" class="nav-link">
              <span class="link-icon">📦</span>
              <span>订单</span>
            </router-link>
            <router-link v-if="isLoggedIn" to="/chat" class="nav-link">
              <span class="link-icon">💬</span>
              <span>消息</span>
            </router-link>
            <router-link v-if="isLoggedIn" to="/friends" class="nav-link">
              <span class="link-icon">👥</span>
              <span>好友</span>
            </router-link>
            <router-link to="/requests" class="nav-link">
              <span class="link-icon">🔍</span>
              <span>求购</span>
            </router-link>
            <router-link v-if="isLoggedIn" to="/my-requests" class="nav-link">
              <span class="link-icon">📝</span>
              <span>我的求购</span>
            </router-link>
          </div>
        </div>
        <div class="navbar-right">
          <template v-if="isLoggedIn">
            <router-link to="/notifications" class="nav-link notification-link">
              <span class="link-icon">🔔</span>
              <span>通知</span>
              <span v-if="unreadCount > 0" class="notification-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </router-link>
            <router-link to="/favorites" class="nav-link">
              <span class="link-icon">❤️</span>
              <span>收藏</span>
            </router-link>
            <router-link to="/profile" class="nav-link user-link">
              <span class="user-avatar">{{ username ? username.charAt(0).toUpperCase() : '?' }}</span>
              <span class="user-name">{{ username }}</span>
            </router-link>
            <button @click="handleLogout" class="logout-btn">退出</button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">登录</router-link>
            <router-link to="/register" class="register-btn">免费注册</router-link>
          </template>
        </div>
      </div>
    </nav>

    <!-- Toast Notification -->
    <transition name="slide">
      <div v-if="showToast" class="toast-notification" :class="toastType">
        <div class="toast-icon">
          <span v-if="toastType === 'order_timeout'">⏰</span>
          <span v-else-if="toastType === 'new_message'">💬</span>
          <span v-else-if="toastType === 'order_status'">📦</span>
          <span v-else>🔔</span>
        </div>
        <div class="toast-content">
          <h4>{{ toastTitle }}</h4>
          <p>{{ toastMessage }}</p>
        </div>
        <button @click="closeToast" class="toast-close">&times;</button>
      </div>
    </transition>

    <router-view></router-view>
  </div>
</template>

<script>
import { logout } from './api/auth'
import { getUnreadCount } from './api/notification'
import { websocketService, requestNotificationPermission } from './services/websocket'

export default {
  name: 'App',
  data() {
    return {
      isLoggedIn: false,
      username: '',
      userId: null,
      unreadCount: 0,
      showToast: false,
      toastTitle: '',
      toastMessage: '',
      toastType: '',
      toastTimer: null,
      wsUnsubscribe: null
    }
  },
  mounted() {
    this.checkAuth()
    this.initWebSocket()
    requestNotificationPermission()
  },
  beforeUnmount() {
    if (this.wsUnsubscribe) {
      this.wsUnsubscribe()
    }
    websocketService.disconnect()
  },
  watch: {
    '$route': 'checkAuth'
  },
  methods: {
    checkAuth() {
      const token = localStorage.getItem('token')
      const username = localStorage.getItem('username')
      const userId = localStorage.getItem('userId')
      this.isLoggedIn = !!token
      this.username = username || ''
      this.userId = userId

      if (this.isLoggedIn) {
        this.fetchUnreadCount()
        this.initWebSocket()
      }
    },
    async fetchUnreadCount() {
      try {
        const res = await getUnreadCount()
        if (res.code === 200) {
          this.unreadCount = res.data.count || 0
        }
      } catch (error) {
        console.error('获取未读通知数失败:', error)
      }
    },
    initWebSocket() {
      if (!this.isLoggedIn || !this.userId) return
      websocketService.connect(this.userId)
      this.wsUnsubscribe = websocketService.onNotification((notification) => {
        this.handleWebSocketNotification(notification)
      })
    },
    handleWebSocketNotification(notification) {
      this.unreadCount++
      this.showToastNotification(notification)
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notification }))
    },
    showToastNotification(notification) {
      this.toastTitle = notification.title || '新消息'
      this.toastMessage = notification.content || ''
      this.toastType = notification.type?.toLowerCase() || 'info'
      this.showToast = true

      if (this.toastTimer) clearTimeout(this.toastTimer)
      this.toastTimer = setTimeout(() => {
        this.closeToast()
      }, 5000)
    },
    closeToast() {
      this.showToast = false
      if (this.toastTimer) {
        clearTimeout(this.toastTimer)
        this.toastTimer = null
      }
    },
    async handleLogout() {
      try {
        await logout()
      } catch (e) {
        console.log('退出登录请求失败')
      }

      websocketService.disconnect()
      if (this.wsUnsubscribe) {
        this.wsUnsubscribe()
        this.wsUnsubscribe = null
      }

      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      localStorage.removeItem('username')
      this.isLoggedIn = false
      this.username = ''
      this.userId = null
      this.unreadCount = 0
      this.$router.push('/')
    }
  }
}
</script>

<style>
/* Reset & Base */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f6f8;
  color: #333;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
}

/* Navbar */
.navbar {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.navbar-left {
  display: flex;
  align-items: center;
  gap: 32px;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
}

.brand-icon {
  font-size: 1.5rem;
}

.brand-text {
  font-size: 1.2rem;
  font-weight: 700;
  color: #fff;
}

.nav-links {
  display: flex;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 8px;
  text-decoration: none;
  color: rgba(255,255,255,0.9);
  font-size: 0.95rem;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  background: rgba(255,255,255,0.15);
  color: #fff;
}

.nav-link.router-link-active {
  background: rgba(255,255,255,0.2);
  color: #fff;
}

.link-icon {
  font-size: 1rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.navbar-right .nav-link {
  color: rgba(255,255,255,0.9);
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  min-width: 18px;
  height: 18px;
  background: #ff4d4f;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.user-link {
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.85rem;
}

.user-name {
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.logout-btn {
  padding: 8px 16px;
  background: rgba(255,255,255,0.15);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: rgba(255,255,255,0.25);
}

.register-btn {
  padding: 8px 20px;
  background: #fff;
  color: #667eea;
  border-radius: 8px;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
}

.register-btn:hover {
  background: #f0f0f0;
  transform: translateY(-1px);
}

/* Toast Notification */
.toast-notification {
  position: fixed;
  top: 80px;
  right: 24px;
  min-width: 320px;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  padding: 16px 20px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  z-index: 9999;
  border-left: 4px solid #667eea;
}

.toast-notification.order_timeout { border-left-color: #ff4d4f; }
.toast-notification.new_message { border-left-color: #1890ff; }
.toast-notification.order_status { border-left-color: #fa8c16; }

.toast-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-content h4 {
  margin: 0 0 4px 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 600;
}

.toast-content p {
  margin: 0;
  font-size: 0.85rem;
  color: #666;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
}

.toast-close:hover {
  color: #666;
}

/* Slide Transition */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
}

@media (max-width: 640px) {
  .navbar-container {
    padding: 0 16px;
  }

  .brand-text {
    display: none;
  }

  .user-name {
    display: none;
  }

  .toast-notification {
    right: 16px;
    left: 16px;
    min-width: auto;
  }
}
</style>
