<template>
  <div class="my-requests-page">
    <div class="page-header">
      <h2>我的求购</h2>
      <button class="btn-publish" @click="showPublishModal = true">
        + 发布新求购
      </button>
    </div>

    <!-- 状态筛选 -->
    <div class="filter-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-btn', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 求购列表 -->
    <div class="requests-list">
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="requests.length === 0" class="empty-tip">
        {{ emptyText }}
      </div>
      <div v-else>
        <div v-for="request in requests" :key="request.id" class="request-card">
          <div class="request-header">
            <h3 class="title">{{ request.title }}</h3>
            <span class="status-badge" :class="'status-' + request.status">
              {{ getStatusText(request.status) }}
            </span>
          </div>
          
          <div class="request-body">
            <p class="description">{{ request.description || '暂无描述' }}</p>
            <div class="info-row">
              <span class="budget">预算: {{ formatBudget(request.budgetMin, request.budgetMax) }}</span>
              <span class="category">{{ getCategoryName(request.categoryId) }}</span>
              <span class="time">{{ formatTime(request.createdTime) }}</span>
            </div>
            <div class="info-row" v-if="request.matchCount > 0">
              <span class="match-count">{{ request.matchCount }}个匹配商品</span>
            </div>
          </div>

          <div class="request-actions">
            <button class="btn-view" @click="viewDetail(request)">查看详情</button>
            <button 
              v-if="request.status === 1" 
              class="btn-offline" 
              @click="handleOffline(request)"
            >
              下架
            </button>
            <button 
              v-if="request.status === 2 || request.status === 5" 
              class="btn-delete" 
              @click="handleDelete(request)"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">
          <button :disabled="currentPage === 1" @click="changePage(currentPage - 1)">上一页</button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页</button>
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
    />
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { getMyRequests, offlineRequest } from '../api/purchase.js'
import PublishRequest from '../components/PublishRequest.vue'
import RequestDetail from '../components/RequestDetail.vue'

export default {
  name: 'MyRequests',
  components: { PublishRequest, RequestDetail },
  setup() {
    const requests = ref([])
    const loading = ref(false)
    const currentPage = ref(1)
    const totalPages = ref(1)
    const currentTab = ref('all')
    const showPublishModal = ref(false)
    const selectedRequest = ref(null)

    const tabs = [
      { key: 'all', label: '全部' },
      { key: 'active', label: '进行中' },
      { key: 'offline', label: '已下架' },
      { key: 'expired', label: '已过期' }
    ]

    const emptyText = computed(() => {
      const map = {
        all: '暂无求购信息',
        active: '暂无进行中的求购',
        offline: '暂无已下架的求购',
        expired: '暂无已过期的求购'
      }
      return map[currentTab.value]
    })

    const fetchRequests = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          size: 10
        }
        
        // 根据tab筛选状态
        if (currentTab.value === 'active') params.status = 1
        else if (currentTab.value === 'offline') params.status = 2
        else if (currentTab.value === 'expired') params.status = 5

        const res = await getMyRequests(params)
        if (res.code === 200 && res.data) {
          requests.value = res.data.records || []
          totalPages.value = res.data.pages || 1
        }
      } catch (error) {
        console.error('获取我的求购失败:', error)
      } finally {
        loading.value = false
      }
    }

    watch(currentTab, () => {
      currentPage.value = 1
      fetchRequests()
    })

    const changePage = (page) => {
      currentPage.value = page
      fetchRequests()
    }

    const viewDetail = (request) => {
      selectedRequest.value = request
    }

    const handleOffline = async (request) => {
      if (!confirm('确认下架该求购？')) return
      try {
        const res = await offlineRequest(request.id)
        if (res.code === 200) {
          alert('已下架')
          fetchRequests()
        } else {
          alert(res.message || '操作失败')
        }
      } catch (error) {
        console.error('下架失败:', error)
        alert('操作失败')
      }
    }

    const handleDelete = async (request) => {
      if (!confirm('确认删除该求购？删除后无法恢复。')) return
      // 这里需要后端提供删除接口，暂时用下架代替
      alert('删除功能开发中')
    }

    const handlePublishSuccess = () => {
      showPublishModal.value = false
      currentTab.value = 'active'
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
      return new Date(time).toLocaleDateString('zh-CN')
    }

    const getStatusText = (status) => {
      const map = { 0: '待审核', 1: '进行中', 2: '已下架', 3: '已成交', 4: '审核拒绝', 5: '已过期' }
      return map[status] || '未知'
    }

    const getCategoryName = (id) => {
      const map = {
        5: '教材', 6: '考研资料', 7: '文具', 8: '笔记',
        9: '日用品', 10: '装饰品', 11: '运动器材',
        12: '手机', 13: '电脑', 14: '平板', 15: '配件'
      }
      return map[id] || '其他'
    }

    // 初始加载
    fetchRequests()

    return {
      requests,
      loading,
      currentPage,
      totalPages,
      currentTab,
      tabs,
      showPublishModal,
      selectedRequest,
      emptyText,
      changePage,
      viewDetail,
      handleOffline,
      handleDelete,
      handlePublishSuccess,
      formatBudget,
      formatTime,
      getStatusText,
      getCategoryName
    }
  }
}
</script>

<style scoped>
.my-requests-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #333;
}

.btn-publish {
  padding: 10px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

/* 筛选标签 */
.filter-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 10px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  border-radius: 4px;
  transition: all 0.2s;
}

.tab-btn:hover {
  background: #f0f0f0;
}

.tab-btn.active {
  background: #42b983;
  color: #fff;
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
.status-5 { background: #ffebee; color: #c62828; }

.request-body {
  margin-bottom: 15px;
}

.description {
  color: #666;
  margin: 0 0 10px 0;
  line-height: 1.5;
}

.info-row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #888;
}

.budget {
  color: #ff6b6b;
  font-weight: 500;
}

.match-count {
  color: #42b983;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.request-actions button {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.btn-view {
  background: #1890ff;
  color: #fff;
}

.btn-offline {
  background: #faad14;
  color: #fff;
}

.btn-delete {
  background: #ff4d4f;
  color: #fff;
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
</style>
