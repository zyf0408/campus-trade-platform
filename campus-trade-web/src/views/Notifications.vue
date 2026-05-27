<template>
  <div class="notifications">
    <div class="notifications-header">
      <h2>消息通知</h2>
      <button v-if="notifications.length > 0" @click="handleMarkAllAsRead" class="mark-all-btn">
        全部标为已读
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="notifications.length === 0" class="empty">
      <p>暂无通知</p>
    </div>
    <div v-else class="notification-list">
      <div
        v-for="item in notifications"
        :key="item.id"
        :class="['notification-item', { unread: !item.isRead }]"
        @click="handleItemClick(item)"
      >
        <div class="notification-icon">
          <span v-if="item.type === 'ORDER_TIMEOUT'">⏰</span>
          <span v-else-if="item.type === 'NEW_MESSAGE'">💬</span>
          <span v-else-if="item.type === 'NEW_ORDER'">📦</span>
          <span v-else>🔔</span>
        </div>
        <div class="notification-content">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
          <span class="notification-time">{{ formatTime(item.createdTime) }}</span>
        </div>
        <span v-if="!item.isRead" class="unread-dot"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyNotifications, markAsRead, markAllAsRead } from '../api/notification'

export default {
  name: 'Notifications',
  data() {
    return {
      notifications: [],
      loading: false
    }
  },
  mounted() {
    this.fetchNotifications()
  },
  methods: {
    async fetchNotifications() {
      this.loading = true
      try {
        const res = await getMyNotifications()
        if (res.code === 200) {
          this.notifications = res.data.records || res.data || []
        }
      } catch (error) {
        console.error('获取通知失败:', error)
      } finally {
        this.loading = false
      }
    },
    async handleItemClick(item) {
      if (!item.isRead) {
        await markAsRead(item.id)
        item.isRead = true
      }

      // 根据通知类型跳转
      if (item.relatedId) {
        if (item.type === 'ORDER_TIMEOUT' || item.type === 'NEW_ORDER') {
          this.$router.push('/orders')
        } else if (item.type === 'NEW_MESSAGE') {
          this.$router.push('/chat')
        }
      }
    },
    async handleMarkAllAsRead() {
      if (!confirm('确认将所有通知标为已读？')) return
      try {
        await markAllAsRead()
        this.notifications.forEach(item => item.isRead = true)
      } catch (error) {
        console.error('标记失败:', error)
      }
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      if (diff < 60000) return '刚刚'
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前'
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'

      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.notifications {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.notifications-header h2 {
  margin: 0;
  color: #333;
}

.mark-all-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
}

.mark-all-btn:hover {
  background: #f5f5f5;
}

.loading, .empty {
  text-align: center;
  padding: 50px;
  color: #999;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.notification-item:hover {
  background: #f9f9f9;
}

.notification-item.unread {
  background: #f0f7ff;
  border-color: #d4e8ff;
}

.notification-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px 0;
  font-size: 15px;
  color: #333;
}

.notification-content p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #999;
}

.unread-dot {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 8px;
  height: 8px;
  background: #ff4d4f;
  border-radius: 50%;
}
</style>
