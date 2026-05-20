<template>
  <div class="friends-page">
    <div class="friends-container">
      <!-- 左侧导航 -->
      <div class="friends-sidebar">
        <div class="sidebar-header">
          <h3>好友管理</h3>
        </div>
        <div class="sidebar-menu">
          <div 
            v-for="tab in tabs" 
            :key="tab.key"
            :class="['menu-item', { active: currentTab === tab.key }]"
            @click="currentTab = tab.key"
          >
            <span class="menu-icon">{{ tab.icon }}</span>
            <span class="menu-label">{{ tab.label }}</span>
            <span v-if="tab.badge > 0" class="menu-badge">{{ tab.badge }}</span>
          </div>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="friends-content">
        <!-- 搜索用户 -->
        <div class="search-section">
          <div class="search-box">
            <input 
              v-model="searchKeyword" 
              type="text" 
              placeholder="搜索用户（用户名/昵称/学号）"
              @keyup.enter="handleSearch"
            >
            <button @click="handleSearch" :disabled="!searchKeyword.trim()">搜索</button>
          </div>
        </div>

        <!-- 搜索结果 -->
        <div v-if="currentTab === 'search' && searchResults.length > 0" class="search-results">
          <h4>搜索结果</h4>
          <div class="user-list">
            <div v-for="user in searchResults" :key="user.userId" class="user-item">
              <div class="user-avatar">
                <img :src="user.avatar || 'https://picsum.photos/seed/user' + user.userId + '/100/100'" alt="">
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ user.nickname || user.username }}
                  <span class="user-id">ID: {{ user.userId }}</span>
                </div>
                <div class="user-detail">
                  <span v-if="user.department">{{ user.department }}</span>
                  <span class="username">@{{ user.username }}</span>
                </div>
              </div>
              <div class="user-action">
                <button 
                  v-if="user.isFriend" 
                  class="btn-chat"
                  @click="chatWith(user)"
                >
                  发消息
                </button>
                <button 
                  v-else 
                  class="btn-add"
                  @click="showAddDialog(user)"
                >
                  加好友
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 好友列表 -->
        <div v-if="currentTab === 'friends'" class="friend-list-section">
          <h4>我的好友 ({{ friends.length }})</h4>
          <div v-if="friends.length === 0" class="empty-tip">暂无好友，去搜索添加吧</div>
          <div v-else class="user-list">
            <div v-for="friend in friends" :key="friend.friendId" class="user-item">
              <div class="user-avatar">
                <img :src="friend.friendAvatar || 'https://picsum.photos/seed/user' + friend.friendId + '/100/100'" alt="">
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ friend.friendNickname }}
                  <span class="user-id">ID: {{ friend.friendId }}</span>
                </div>
                <div class="user-detail">
                  <span class="username">@{{ friend.friendUsername }}</span>
                </div>
              </div>
              <div class="user-action">
                <button class="btn-chat" @click="chatWith(friend)">发消息</button>
                <button class="btn-remove" @click="handleRemoveFriend(friend)">删除</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 收到的好友申请 -->
        <div v-if="currentTab === 'pending'" class="request-section">
          <h4>收到的申请 ({{ pendingRequests.length }})</h4>
          <div v-if="pendingRequests.length === 0" class="empty-tip">暂无好友申请</div>
          <div v-else class="user-list">
            <div v-for="req in pendingRequests" :key="req.requestId" class="user-item request-item">
              <div class="user-avatar">
                <img :src="req.avatar || 'https://picsum.photos/seed/user' + req.userId + '/100/100'" alt="">
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ req.nickname }}
                  <span class="user-id">ID: {{ req.userId }}</span>
                </div>
                <div class="user-detail">
                  <span class="username">@{{ req.username }}</span>
                  <span v-if="req.message" class="req-message">申请消息: {{ req.message }}</span>
                </div>
              </div>
              <div class="user-action">
                <button class="btn-accept" @click="handleAccept(req)">接受</button>
                <button class="btn-reject" @click="handleReject(req)">拒绝</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 已发送的申请 -->
        <div v-if="currentTab === 'sent'" class="request-section">
          <h4>已发送的申请 ({{ sentRequests.length }})</h4>
          <div v-if="sentRequests.length === 0" class="empty-tip">暂无已发送的申请</div>
          <div v-else class="user-list">
            <div v-for="req in sentRequests" :key="req.requestId" class="user-item">
              <div class="user-avatar">
                <img :src="req.friendAvatar || 'https://picsum.photos/seed/user' + req.friendId + '/100/100'" alt="">
              </div>
              <div class="user-info">
                <div class="user-name">
                  {{ req.friendNickname }}
                  <span class="user-id">ID: {{ req.friendId }}</span>
                </div>
                <div class="user-detail">
                  <span class="username">@{{ req.friendUsername }}</span>
                  <span v-if="req.message" class="req-message">申请消息: {{ req.message }}</span>
                </div>
              </div>
              <div class="user-action">
                <span class="status-pending">等待确认</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加好友弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
      <div class="modal-content">
        <h3>添加好友</h3>
        <div class="modal-user-info">
          <img :src="addTarget.avatar || 'https://picsum.photos/seed/user' + addTarget.userId + '/100/100'" alt="">
          <div>
            <div class="modal-name">{{ addTarget.nickname || addTarget.username }} <span class="user-id">ID: {{ addTarget.userId }}</span></div>
            <div class="modal-username">@{{ addTarget.username }}</div>
          </div>
        </div>
        <div class="modal-form">
          <label>申请消息（选填）</label>
          <textarea v-model="addMessage" placeholder="写一句话介绍自己吧" rows="3"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="showAddModal = false">取消</button>
          <button class="btn-confirm" @click="handleSendRequest" :disabled="adding">发送申请</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendList,
  getPendingRequests,
  getSentRequests,
  searchUsers,
  getPendingCount
} from '../api/friend.js'

export default {
  name: 'Friends',
  setup() {
    const router = useRouter()
    const currentTab = ref('friends')
    const searchKeyword = ref('')
    const searchResults = ref([])
    const friends = ref([])
    const pendingRequests = ref([])
    const sentRequests = ref([])
    const pendingCount = ref(0)

    // 添加好友弹窗
    const showAddModal = ref(false)
    const addTarget = ref({})
    const addMessage = ref('')
    const adding = ref(false)

    const tabs = computed(() => [
      { key: 'friends', label: '好友列表', icon: '👥', badge: 0 },
      { key: 'pending', label: '收到的申请', icon: '📥', badge: pendingCount.value },
      { key: 'sent', label: '已发送', icon: '📤', badge: 0 },
      { key: 'search', label: '搜索用户', icon: '🔍', badge: 0 }
    ])

    const fetchFriends = async () => {
      try {
        const res = await getFriendList()
        if (res.code === 200) {
          friends.value = res.data || []
        }
      } catch (e) {
        console.error('获取好友列表失败:', e)
      }
    }

    const fetchPendingRequests = async () => {
      try {
        const res = await getPendingRequests()
        if (res.code === 200) {
          pendingRequests.value = res.data || []
        }
      } catch (e) {
        console.error('获取好友申请失败:', e)
      }
    }

    const fetchSentRequests = async () => {
      try {
        const res = await getSentRequests()
        if (res.code === 200) {
          sentRequests.value = res.data || []
        }
      } catch (e) {
        console.error('获取已发送申请失败:', e)
      }
    }

    const fetchPendingCount = async () => {
      try {
        const res = await getPendingCount()
        if (res.code === 200) {
          pendingCount.value = res.data || 0
        }
      } catch (e) {
        console.error('获取未读数失败:', e)
      }
    }

    const handleSearch = async () => {
      if (!searchKeyword.value.trim()) return
      currentTab.value = 'search'
      try {
        const res = await searchUsers(searchKeyword.value.trim())
        if (res.code === 200) {
          searchResults.value = res.data || []
        }
      } catch (e) {
        console.error('搜索失败:', e)
      }
    }

    const showAddDialog = (user) => {
      addTarget.value = user
      addMessage.value = ''
      showAddModal.value = true
    }

    const handleSendRequest = async () => {
      adding.value = true
      try {
        const res = await sendFriendRequest(addTarget.value.userId, addMessage.value)
        if (res.code === 200) {
          alert(res.message || '申请已发送')
          showAddModal.value = false
          // 刷新搜索结果
          handleSearch()
          fetchSentRequests()
        } else {
          alert(res.message || '发送失败')
        }
      } catch (e) {
        console.error('发送申请失败:', e)
        alert('发送失败，请重试')
      } finally {
        adding.value = false
      }
    }

    const handleAccept = async (req) => {
      try {
        const res = await acceptFriendRequest(req.requestId)
        if (res.code === 200) {
          alert('已通过好友申请')
          fetchPendingRequests()
          fetchPendingCount()
          fetchFriends()
        } else {
          alert(res.message || '操作失败')
        }
      } catch (e) {
        console.error('操作失败:', e)
      }
    }

    const handleReject = async (req) => {
      if (!confirm('确认拒绝该好友申请？')) return
      try {
        const res = await rejectFriendRequest(req.requestId)
        if (res.code === 200) {
          fetchPendingRequests()
          fetchPendingCount()
        } else {
          alert(res.message || '操作失败')
        }
      } catch (e) {
        console.error('操作失败:', e)
      }
    }

    const handleRemoveFriend = async (friend) => {
      if (!confirm('确认删除好友 ' + friend.friendNickname + '？')) return
      try {
        const res = await removeFriend(friend.friendId)
        if (res.code === 200) {
          alert('已删除好友')
          fetchFriends()
        } else {
          alert(res.message || '操作失败')
        }
      } catch (e) {
        console.error('删除失败:', e)
      }
    }

    const chatWith = (user) => {
      const targetId = user.friendId || user.userId
      router.push({ path: '/chat', query: { sellerId: targetId } })
    }

    onMounted(() => {
      fetchFriends()
      fetchPendingRequests()
      fetchSentRequests()
      fetchPendingCount()
    })

    return {
      currentTab,
      tabs,
      searchKeyword,
      searchResults,
      friends,
      pendingRequests,
      sentRequests,
      pendingCount,
      showAddModal,
      addTarget,
      addMessage,
      adding,
      handleSearch,
      showAddDialog,
      handleSendRequest,
      handleAccept,
      handleReject,
      handleRemoveFriend,
      chatWith
    }
  }
}
</script>

<style scoped>
.friends-page {
  min-height: calc(100vh - 60px);
  background: #f5f5f5;
}

.friends-container {
  display: flex;
  max-width: 1000px;
  margin: 0 auto;
  background: #fff;
  min-height: calc(100vh - 60px);
}

/* 左侧导航 */
.friends-sidebar {
  width: 200px;
  border-right: 1px solid #e0e0e0;
  background: #fafafa;
}

.sidebar-header {
  padding: 20px 15px;
  border-bottom: 1px solid #e0e0e0;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.sidebar-menu {
  padding: 10px 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.menu-item:hover {
  background: #f0f0f0;
}

.menu-item.active {
  background: #e8f5e9;
  color: #42b983;
  font-weight: 500;
}

.menu-icon {
  margin-right: 8px;
  font-size: 16px;
}

.menu-label {
  font-size: 14px;
}

.menu-badge {
  position: absolute;
  right: 15px;
  background: #ff4757;
  color: #fff;
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 12px;
  min-width: 18px;
  text-align: center;
}

/* 右侧内容 */
.friends-content {
  flex: 1;
  padding: 20px;
}

/* 搜索框 */
.search-section {
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  outline: none;
}

.search-box input:focus {
  border-color: #42b983;
}

.search-box button {
  padding: 10px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.search-box button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 列表区域 */
.friend-list-section,
.request-section,
.search-results {
  margin-top: 10px;
}

.friend-list-section h4,
.request-section h4,
.search-results h4 {
  margin-bottom: 15px;
  color: #333;
  font-size: 15px;
}

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #999;
}

.user-list {
  display: flex;
  flex-direction: column;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 12px 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  margin-bottom: 10px;
  transition: box-shadow 0.2s;
}

.user-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.user-avatar {
  width: 48px;
  height: 48px;
  margin-right: 12px;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 4px;
}

.user-id {
  font-size: 12px;
  color: #999;
  font-weight: normal;
  margin-left: 8px;
}

.user-detail {
  font-size: 13px;
  color: #666;
}

.user-detail .username {
  margin-right: 10px;
}

.req-message {
  display: block;
  color: #999;
  font-size: 12px;
  margin-top: 2px;
}

.user-action {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.btn-add,
.btn-chat,
.btn-accept,
.btn-reject,
.btn-remove {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-add {
  background: #42b983;
  color: #fff;
}

.btn-chat {
  background: #1890ff;
  color: #fff;
}

.btn-accept {
  background: #42b983;
  color: #fff;
}

.btn-reject {
  background: #ff4d4f;
  color: #fff;
}

.btn-remove {
  background: #f0f0f0;
  color: #666;
}

.btn-remove:hover {
  background: #ff4d4f;
  color: #fff;
}

.status-pending {
  color: #faad14;
  font-size: 13px;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 400px;
  max-width: 90vw;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.modal-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
}

.modal-user-info img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 12px;
  object-fit: cover;
}

.modal-name {
  font-weight: 500;
  font-size: 15px;
}

.modal-username {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.modal-form {
  margin-bottom: 20px;
}

.modal-form label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
}

.modal-form textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 响应式 */
@media (max-width: 768px) {
  .friends-container {
    flex-direction: column;
  }

  .friends-sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
  }

  .sidebar-menu {
    display: flex;
    overflow-x: auto;
    padding: 0;
  }

  .menu-item {
    padding: 10px 15px;
    white-space: nowrap;
    font-size: 13px;
  }

  .user-action {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
