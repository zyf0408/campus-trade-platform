<template>
  <div class="chat-page">
    <div class="chat-container">
      <!-- 左侧会话列表 -->
      <div class="conversation-list" v-if="!isMobile || !currentConversation">
        <div class="list-header">
          <h3>消息列表</h3>
          <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
        </div>
        <div class="list-content">
          <div
            v-for="conv in conversations"
            :key="conv.conversationId"
            class="conversation-item"
            :class="{ active: currentConversation?.conversationId === conv.conversationId }"
            @click="selectConversation(conv)"
          >
            <div class="avatar">
              <img :src="conv.otherUserAvatar || 'https://picsum.photos/seed/user/100/100'" alt="头像">
            </div>
            <div class="info">
              <div class="name">{{ conv.otherUserNickname }}</div>
              <div class="last-message">{{ conv.lastMessage }}</div>
            </div>
            <div class="meta">
              <div class="time">{{ formatTime(conv.lastMessageTime) }}</div>
              <div v-if="conv.unreadCount > 0" class="unread">{{ conv.unreadCount }}</div>
            </div>
          </div>
          <div v-if="conversations.length === 0" class="empty-list">
            暂无消息
          </div>
        </div>
      </div>

      <!-- 右侧聊天区域 -->
      <div class="chat-area" v-if="currentConversation">
        <div class="chat-header">
          <button v-if="isMobile" class="back-btn" @click="backToList">←</button>
          <div class="user-info">
            <img :src="currentConversation.targetUserAvatar || 'https://picsum.photos/seed/user/100/100'" alt="头像">
            <span>{{ currentConversation.targetUserNickname }}</span>
          </div>
        </div>

        <div class="messages-container" ref="messagesContainer">
          <div v-if="loading" class="loading">加载中...</div>
          <div v-else-if="messages.length === 0" class="empty-chat">
            开始和对方聊天吧
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-item"
            :class="{ self: msg.senderId === currentUserId }"
          >
            <div class="avatar">
              <img :src="msg.senderAvatar || 'https://picsum.photos/seed/user/100/100'" alt="头像">
            </div>
            <div class="message-content">
              <div class="bubble">{{ msg.content }}</div>
              <div class="time">{{ formatTime(msg.createdTime) }}</div>
            </div>
          </div>
        </div>

        <div class="input-area">
          <textarea
            v-model="inputMessage"
            placeholder="输入消息..."
            @keydown.enter.prevent="sendMessage"
            rows="3"
          ></textarea>
          <button @click="sendMessage" :disabled="!inputMessage.trim() || sending">
            {{ sending ? '发送中...' : '发送' }}
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else-if="!isMobile">
        <div class="empty-content">
          <p>选择一个会话开始聊天</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import {
  getConversationList,
  initConversation,
  getChatMessages,
  sendMessage as sendMessageApi,
  markAsRead,
  getUnreadCount
} from '../api/chat.js'

export default {
  name: 'Chat',
  setup() {
    const route = useRoute()
    const conversations = ref([])
    const currentConversation = ref(null)
    const messages = ref([])
    const inputMessage = ref('')
    const loading = ref(false)
    const sending = ref(false)
    const unreadCount = ref(0)
    const messagesContainer = ref(null)
    const stompClient = ref(null)
    const currentUserId = ref(null)
    const isMobile = ref(window.innerWidth <= 768)

    // 从localStorage获取当前用户ID
    const getCurrentUserId = () => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          currentUserId.value = payload.userId
        } catch (e) {
          console.error('解析token失败:', e)
        }
      }
    }

    // 格式化时间
    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date

      // 今天
      if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      }
      // 昨天
      if (diff < 48 * 60 * 60 * 1000 && date.getDate() === now.getDate() - 1) {
        return '昨天'
      }
      // 更早
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }

    // 获取会话列表
    const fetchConversations = async () => {
      try {
        const res = await getConversationList()
        if (res.code === 200 && res.data) {
          conversations.value = res.data
        }
      } catch (error) {
        console.error('获取会话列表失败:', error)
      }
    }

    // 获取未读消息数
    const fetchUnreadCount = async () => {
      try {
        const res = await getUnreadCount()
        if (res.code === 200) {
          unreadCount.value = res.data || 0
        }
      } catch (error) {
        console.error('获取未读消息数失败:', error)
      }
    }

    // 获取聊天记录
    const fetchMessages = async () => {
      if (!currentConversation.value) return
      loading.value = true
      try {
        const res = await getChatMessages(currentConversation.value.targetUserId)
        if (res.code === 200 && res.data) {
          messages.value = res.data.records || []
          await nextTick()
          scrollToBottom()
        }
      } catch (error) {
        console.error('获取聊天记录失败:', error)
      } finally {
        loading.value = false
      }
    }

    // 选择会话
    const selectConversation = async (conv) => {
      currentConversation.value = {
        conversationId: conv.conversationId,
        targetUserId: conv.otherUserId,
        targetUserNickname: conv.otherUserNickname,
        targetUserAvatar: conv.otherUserAvatar
      }
      await fetchMessages()
      // 标记为已读
      if (conv.unreadCount > 0) {
        markAsRead(conv.conversationId)
        conv.unreadCount = 0
        fetchUnreadCount()
      }
    }

    // 发送消息
    const sendMessage = async () => {
      const content = inputMessage.value.trim()
      if (!content || !currentConversation.value) return

      sending.value = true
      try {
        const res = await sendMessageApi({
          receiverId: currentConversation.value.targetUserId,
          content: content,
          msgType: 1
        })
        if (res.code === 200) {
          inputMessage.value = ''
          messages.value.push(res.data)
          await nextTick()
          scrollToBottom()
          // 更新会话列表的最后一条消息
          updateConversationLastMessage(res.data)
        }
      } catch (error) {
        console.error('发送消息失败:', error)
        alert('发送失败，请重试')
      } finally {
        sending.value = false
      }
    }

    // 更新会话列表的最后一条消息
    const updateConversationLastMessage = (msg) => {
      const conv = conversations.value.find(c => c.conversationId === msg.conversationId)
      if (conv) {
        conv.lastMessage = msg.content
        conv.lastMessageTime = msg.createdTime
        // 移到顶部
        conversations.value = [conv, ...conversations.value.filter(c => c.conversationId !== msg.conversationId)]
      }
    }

    // 滚动到底部
    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    // 返回列表（移动端）
    const backToList = () => {
      currentConversation.value = null
    }

    // 连接WebSocket
    const connectWebSocket = () => {
      const token = localStorage.getItem('token')
      if (!token) return

      const client = new Client({
        webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
        connectHeaders: {
          Authorization: 'Bearer ' + token
        },
        debug: function (str) {
          console.log('STOMP: ' + str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      client.onConnect = (frame) => {
        console.log('WebSocket连接成功')
        // 订阅个人消息频道
        client.subscribe('/topic/chat/' + currentUserId.value, (message) => {
          const msg = JSON.parse(message.body)
          // 如果当前正在和这个用户聊天，添加到消息列表
          if (currentConversation.value && 
              (msg.senderId === currentConversation.value.targetUserId || 
               msg.receiverId === currentConversation.value.targetUserId)) {
            messages.value.push(msg)
            nextTick().then(scrollToBottom)
            // 标记为已读
            markAsRead(msg.conversationId)
          } else {
            // 更新未读数
            fetchUnreadCount()
            // 更新会话列表
            fetchConversations()
          }
        })
      }

      client.onStompError = (frame) => {
        console.error('WebSocket错误:', frame.headers['message'])
      }

      client.activate()
      stompClient.value = client
    }

    // 断开WebSocket
    const disconnectWebSocket = () => {
      if (stompClient.value) {
        stompClient.value.deactivate()
        stompClient.value = null
      }
    }

    // 从URL参数初始化会话（从商品详情页点击"联系卖家"）
    const initFromRoute = async () => {
      const { sellerId, productId } = route.query
      if (sellerId) {
        try {
          const res = await initConversation(sellerId, productId)
          if (res.code === 200 && res.data) {
            currentConversation.value = res.data
            await fetchMessages()
            // 添加到会话列表
            await fetchConversations()
          }
        } catch (error) {
          console.error('初始化会话失败:', error)
        }
      }
    }

    // 监听窗口大小变化
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768
    }

    onMounted(() => {
      getCurrentUserId()
      fetchConversations()
      fetchUnreadCount()
      connectWebSocket()
      initFromRoute()
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      disconnectWebSocket()
      window.removeEventListener('resize', handleResize)
    })

    return {
      conversations,
      currentConversation,
      messages,
      inputMessage,
      loading,
      sending,
      unreadCount,
      messagesContainer,
      currentUserId,
      isMobile,
      formatTime,
      selectConversation,
      sendMessage,
      backToList
    }
  }
}
</script>

<style scoped>
.chat-page {
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
}

.chat-container {
  display: flex;
  height: calc(100vh - 60px);
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
}

/* 左侧会话列表 */
.conversation-list {
  width: 300px;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.list-header {
  padding: 15px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.list-header h3 {
  margin: 0;
  font-size: 16px;
}

.unread-badge {
  background: #ff4757;
  color: #fff;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-item {
  display: flex;
  padding: 12px 15px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s;
}

.conversation-item:hover,
.conversation-item.active {
  background: #f0f0f0;
}

.conversation-item .avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
}

.conversation-item .avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.conversation-item .info {
  flex: 1;
  min-width: 0;
}

.conversation-item .name {
  font-weight: 500;
  margin-bottom: 4px;
}

.conversation-item .last-message {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-item .meta {
  text-align: right;
  margin-left: 8px;
}

.conversation-item .time {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.conversation-item .unread {
  background: #ff4757;
  color: #fff;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
  display: inline-block;
}

.empty-list {
  padding: 40px;
  text-align: center;
  color: #999;
}

/* 右侧聊天区域 */
.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 12px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.back-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-right: 10px;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.loading,
.empty-chat {
  text-align: center;
  padding: 40px;
  color: #999;
}

.message-item {
  display: flex;
  margin-bottom: 20px;
}

.message-item.self {
  flex-direction: row-reverse;
}

.message-item .avatar {
  width: 40px;
  height: 40px;
  margin: 0 12px;
}

.message-item .avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.message-content {
  max-width: 60%;
}

.message-item.self .message-content {
  text-align: right;
}

.bubble {
  display: inline-block;
  padding: 10px 14px;
  background: #fff;
  border-radius: 8px;
  word-break: break-word;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.message-item.self .bubble {
  background: #95ec69;
}

.time {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.input-area {
  padding: 15px 20px;
  border-top: 1px solid #e0e0e0;
  background: #fff;
}

.input-area textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  margin-bottom: 10px;
}

.input-area button {
  float: right;
  padding: 8px 24px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.input-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

/* 响应式 */
@media (max-width: 768px) {
  .conversation-list {
    width: 100%;
    border-right: none;
  }

  .chat-area {
    width: 100%;
  }

  .message-content {
    max-width: 75%;
  }
}
</style>
