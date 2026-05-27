<template>
  <div class="purchase-requests-page">
    <div class="page-header">
      <h2>求购市场</h2>
      <p class="subtitle">买家在这里发布需求，卖家可以提前看到并准备商品</p>
      <button v-if="isLoggedIn" class="btn-publish" @click="showPublishModal = true">
        + 发布求购
      </button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <div class="search-box">
        <input 
          v-model="searchKeyword" 
          type="text" 
          placeholder="搜索求购标题、描述..."
          @keyup.enter="handleSearch"
        >
        <button @click="handleSearch">搜索</button>
      </div>
      <div class="category-filter">
        <select v-model="selectedCategory" @change="handleCategoryChange">
          <option value="">全部分类</option>
          <option :value="5">教材</option>
          <option :value="6">考研资料</option>
          <option :value="7">文具</option>
          <option :value="8">笔记</option>
          <option :value="9">日用品</option>
          <option :value="10">装饰品</option>
          <option :value="11">运动器材</option>
          <option :value="12">手机</option>
          <option :value="13">电脑</option>
          <option :value="14">平板</option>
          <option :value="15">配件</option>
        </select>
      </div>
    </div>

    <!-- 求购列表 -->
    <div class="requests-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="requests.length === 0" class="empty-tip">
        暂无求购信息，{{ isLoggedIn ? '快来发布第一个求购吧！' : '登录后可以发布求购' }}
      </div>
      <div v-else>
        <div 
          v-for="request in requests" 
          :key="request.id" 
          class="request-card"
          @click="viewDetail(request)"
        >
          <div class="request-header">
            <h3 class="title">{{ request.title }}</h3>
            <span class="status-badge" :class="'status-' + request.status">
              {{ getStatusText(request.status) }}
            </span>
          </div>
          
          <div class="request-body">
            <p class="description">{{ request.description || '暂无描述' }}</p>
            <div class="info-row">
              <span class="budget">
                预算: {{ formatBudget(request.budgetMin, request.budgetMax) }}
              </span>
              <span class="condition" v-if="request.conditionRequirement">
                成色要求: {{ request.conditionRequirement }}成新以上
              </span>
            </div>
            <div class="info-row">
              <span class="location" v-if="request.pickupLocation">
                📍 {{ request.pickupLocation }}
              </span>
              <span class="time">{{ formatTime(request.createdTime) }}</span>
            </div>
          </div>

          <div class="request-footer">
            <div class="buyer-info">
              <span 
                class="buyer-avatar-wrapper"
                :class="{ clickable: isLoggedIn && request.userId !== currentUserId }"
                @click.stop="handleAddFriend(request)"
              >
                <img class="buyer-avatar-img" :src="'https://picsum.photos/seed/user' + request.userId + '/100/100'" alt="">
                <span v-if="isLoggedIn && request.userId !== currentUserId" class="avatar-add-tip">+好友</span>
              </span>
              <span class="buyer">{{ request.buyerNickname || '匿名用户' }}</span>
              <span class="credit" v-if="request.buyerCreditScore">
                信誉分: {{ request.buyerCreditScore }}
              </span>
            </div>
            <div class="actions">
              <button 
                v-if="isLoggedIn && request.userId !== currentUserId" 
                class="btn-contact"
                @click.stop="contactBuyer(request)"
              >
                联系买家
              </button>
              <span class="match-count" v-if="request.matchCount > 0">
                {{ request.matchCount }}个匹配商品
              </span>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            :disabled="currentPage === 1" 
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button 
            :disabled="currentPage === totalPages" 
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 发布求购弹窗 -->
    <PublishRequest 
      v-if="showPublishModal" 
      @close="showPublishModal = false"
      @success="handlePublishSuccess"
    />

    <!-- 求购详情弹窗 -->
    <RequestDetail
      v-if="selectedRequest"
      :request="selectedRequest"
      @close="selectedRequest = null"
      @contact="contactBuyer"
    />
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getRequestList } from '../api/purchase.js'
import { sendFriendRequest } from '../api/friend.js'
import PublishRequest from '../components/PublishRequest.vue'
import RequestDetail from '../components/RequestDetail.vue'

export default {
  name: 'PurchaseRequests',
  components: { PublishRequest, RequestDetail },
  setup() {
    const router = useRouter()
    const requests = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const searchKeyword = ref('')
    const selectedCategory = ref('')
    const showPublishModal = ref(false)
    const selectedRequest = ref(null)

    const isLoggedIn = computed(() => !!localStorage.getItem('token'))
    const currentUserId = computed(() => {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.userId
        } catch (e) {
          return null
        }
      }
      return null
    })

    const fetchRequests = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          size: 10,
          status: 1 // 只显示已上线的
        }
        if (searchKeyword.value) params.keyword = searchKeyword.value
        if (selectedCategory.value) params.categoryId = selectedCategory.value

        const res = await getRequestList(params)
        if (res.code === 200 && res.data) {
          requests.value = res.data.records || []
          totalPages.value = res.data.pages || 1
        }
      } catch (error) {
        console.error('获取求购列表失败:', error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchRequests()
    }

    const handleCategoryChange = () => {
      currentPage.value = 1
      fetchRequests()
    }

    const changePage = (page) => {
      currentPage.value = page
      fetchRequests()
    }

    const viewDetail = (request) => {
      selectedRequest.value = request
    }

    const contactBuyer = (request) => {
      if (!isLoggedIn.value) {
        alert('请先登录')
        router.push('/login')
        return
      }
      router.push({ path: '/chat', query: { sellerId: request.userId } })
    }

    const handleAddFriend = async (request) => {
      if (!isLoggedIn.value) {
        alert('请先登录')
        router.push('/login')
        return
      }
      if (request.userId === currentUserId.value) return

      const message = prompt('请输入好友申请消息（选填）：')
      if (message === null) return

      try {
        const res = await sendFriendRequest(request.userId, message)
        if (res.code === 200) {
          alert(res.message || '好友申请已发送')
        } else {
          alert(res.message || '发送失败')
        }
      } catch (error) {
        console.error('发送好友申请失败:', error)
        alert('发送失败，请重试')
      }
    }

    const handlePublishSuccess = () => {
      showPublishModal.value = false
      fetchRequests()
    }

    const formatBudget = (min, max) => {
      if (min && max) return `¥${min} - ¥${max}`
      if (min) return `¥${min}起`
      if (max) return `¥${max}以下`
      return '面议'
    }

    const formatTime = (time) => {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      if (diff < 24 * 60 * 60 * 1000) return '今天'
      if (diff < 48 * 60 * 60 * 1000) return '昨天'
      return date.toLocaleDateString('zh-CN')
    }

    const getStatusText = (status) => {
      const map = { 0: '待审核', 1: '进行中', 2: '已下架', 3: '已成交', 4: '审核拒绝', 5: '已过期' }
      return map[status] || '未知'
    }

    onMounted(() => {
      fetchRequests()
    })

    return {
      requests,
      loading,
      currentPage,
      totalPages,
      searchKeyword,
      selectedCategory,
      showPublishModal,
      selectedRequest,
      isLoggedIn,
      currentUserId,
      handleSearch,
      handleCategoryChange,
      changePage,
      viewDetail,
      contactBuyer,
      handleAddFriend,
      handlePublishSuccess,
      formatBudget,
      formatTime,
      getStatusText
    }
  }
}
</script>

<style scoped>
.purchase-requests-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 30px;
}

.page-header h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
}

.btn-publish {
  padding: 10px 24px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  display: flex;
  gap: 10px;
  min-width: 250px;
}

.search-box input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-box button {
  padding: 10px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.category-filter select {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  min-width: 120px;
}

/* 列表 */
.requests-list {
  min-height: 300px;
}

.loading, .empty-tip {
  text-align: center;
  padding: 60px;
  color: #999;
}

.request-card {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.request-card:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.request-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.title {
  margin: 0;
  font-size: 17px;
  color: #333;
  flex: 1;
}

.status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.status-1 { background: #e8f5e9; color: #2e7d32; }
.status-2 { background: #f5f5f5; color: #666; }
.status-3 { background: #e3f2fd; color: #1565c0; }
.status-5 { background: #ffebee; color: #c62828; }

.request-body {
  margin-bottom: 15px;
}

.description {
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.info-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #888;
  margin-top: 8px;
}

.budget {
  color: #ff6b6b;
  font-weight: 500;
}

.request-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
}

.buyer-info {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.buyer-avatar-wrapper {
  display: inline-flex;
  position: relative;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
}

.buyer-avatar-wrapper img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.buyer-avatar-wrapper.clickable {
  cursor: pointer;
}

.buyer-avatar-wrapper.clickable:hover img {
  opacity: 0.6;
}

.buyer-avatar-wrapper.clickable:hover .avatar-add-tip {
  opacity: 1;
}

.avatar-add-tip {
  position: absolute;
  bottom: -3px;
  right: -6px;
  background: #42b983;
  color: #fff;
  font-size: 9px;
  padding: 0 3px;
  border-radius: 6px;
  opacity: 0.8;
  pointer-events: none;
  line-height: 14px;
}

.credit {
  color: #42b983;
}

.actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.btn-contact {
  padding: 6px 14px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.match-count {
  font-size: 13px;
  color: #42b983;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 30px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #666;
}

@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
  }
  
  .request-footer {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
}
</style>
