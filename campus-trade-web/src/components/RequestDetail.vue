<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h3>求购详情</h3>
        <button class="btn-close" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body" v-if="request">
        <div class="detail-header">
          <h2 class="title">{{ request.title }}</h2>
          <span class="status-badge" :class="'status-' + request.status">
            {{ getStatusText(request.status) }}
          </span>
        </div>

        <div class="detail-section">
          <h4>基本信息</h4>
          <div class="info-grid">
            <div class="info-item">
              <label>预算范围</label>
              <span class="value budget">{{ formatBudget(request.budgetMin, request.budgetMax) }}</span>
            </div>
            <div class="info-item">
              <label>成色要求</label>
              <span class="value">{{ request.conditionRequirement ? request.conditionRequirement + '成新以上' : '不限' }}</span>
            </div>
            <div class="info-item">
              <label>分类</label>
              <span class="value">{{ getCategoryName(request.categoryId) }}</span>
            </div>
            <div class="info-item">
              <label>发布时间</label>
              <span class="value">{{ formatTime(request.createdTime) }}</span>
            </div>
            <div class="info-item" v-if="request.pickupLocation">
              <label>期望自提地点</label>
              <span class="value">{{ request.pickupLocation }}</span>
            </div>
            <div class="info-item">
              <label>是否可议价</label>
              <span class="value">{{ request.isNegotiable === 1 ? '可议价' : '不议价' }}</span>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="request.description">
          <h4>需求描述</h4>
          <p class="description">{{ request.description }}</p>
        </div>

        <div class="detail-section" v-if="request.keywords">
          <h4>关键词</h4>
          <div class="keywords">
            <span v-for="keyword in keywordList" :key="keyword" class="keyword-tag">{{ keyword }}</span>
          </div>
        </div>

        <div class="detail-section">
          <h4>买家信息</h4>
          <div class="buyer-info">
            <div class="buyer-avatar" :class="{ clickable: isLoggedIn && request.userId !== currentUserId }" @click="handleAddFriend">
              <img :src="request.buyerAvatar || 'https://picsum.photos/seed/user' + request.userId + '/100/100'" alt="">
              <span v-if="isLoggedIn && request.userId !== currentUserId" class="avatar-add-tip">+好友</span>
            </div>
            <div class="buyer-detail">
              <div class="buyer-name">{{ request.buyerNickname || '匿名用户' }}</div>
              <div class="buyer-meta">
                <span v-if="request.buyerCreditScore">信誉分: {{ request.buyerCreditScore }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="matches.length > 0">
          <h4>匹配的商品 ({{ matches.length }})</h4>
          <div class="match-list">
            <div v-for="product in matches" :key="product.id" class="match-item" @click="viewProduct(product)">
              <img :src="getFirstImage(product.images)" alt="">
              <div class="match-info">
                <div class="match-title">{{ product.title }}</div>
                <div class="match-price">¥{{ product.price }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn-close-modal" @click="$emit('close')">关闭</button>
        <button 
          v-if="isLoggedIn && request && request.userId !== currentUserId" 
          class="btn-contact"
          @click="handleContact"
        >
          联系买家
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getRequestMatches } from '../api/purchase.js'
import { sendFriendRequest } from '../api/friend.js'

export default {
  name: 'RequestDetail',
  props: {
    request: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'contact'],
  setup(props, { emit }) {
    const router = useRouter()
    const matches = ref([])

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

    const keywordList = computed(() => {
      if (!props.request.keywords) return []
      return props.request.keywords.split(',').filter(k => k.trim())
    })

    const fetchMatches = async () => {
      if (!props.request.id) return
      try {
        const res = await getRequestMatches(props.request.id)
        if (res.code === 200) {
          matches.value = res.data || []
        }
      } catch (error) {
        console.error('获取匹配商品失败:', error)
      }
    }

    watch(() => props.request, fetchMatches, { immediate: true })

    const handleContact = () => {
      emit('contact', props.request)
    }

    const handleAddFriend = async () => {
      if (!isLoggedIn.value) {
        alert('请先登录')
        router.push('/login')
        return
      }
      if (props.request.userId === currentUserId.value) return

      const message = prompt('请输入好友申请消息（选填）：')
      if (message === null) return // 用户点了取消

      try {
        const res = await sendFriendRequest(props.request.userId, message)
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

    const viewProduct = (product) => {
      router.push('/product/' + product.id)
      emit('close')
    }

    const formatBudget = (min, max) => {
      if (min && max) return `¥${min} - ¥${max}`
      if (min) return `¥${min}起`
      if (max) return `¥${max}以下`
      return '面议'
    }

    const formatTime = (time) => {
      if (!time) return ''
      return new Date(time).toLocaleString('zh-CN')
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

    const getFirstImage = (images) => {
      if (!images) return 'https://via.placeholder.com/80'
      try {
        const list = JSON.parse(images)
        if (Array.isArray(list) && list.length > 0) return list[0]
      } catch (e) {
        const arr = images.split(',')
        if (arr.length > 0) return arr[0]
      }
      return 'https://via.placeholder.com/80'
    }

    return {
      matches,
      isLoggedIn,
      currentUserId,
      keywordList,
      handleContact,
      handleAddFriend,
      viewProduct,
      formatBudget,
      formatTime,
      getStatusText,
      getCategoryName,
      getFirstImage
    }
  }
}
</script>

<style scoped>
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
  padding: 20px;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  position: sticky;
  top: 0;
  background: #fff;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  position: sticky;
  bottom: 0;
  background: #fff;
}

/* 详情内容 */
.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.title {
  margin: 0;
  font-size: 20px;
  color: #333;
  flex: 1;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 10px;
}

.status-1 { background: #e8f5e9; color: #2e7d32; }
.status-2 { background: #f5f5f5; color: #666; }
.status-3 { background: #e3f2fd; color: #1565c0; }

.detail-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.detail-section:last-of-type {
  border-bottom: none;
}

.detail-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.info-item .value {
  font-size: 14px;
  color: #333;
}

.info-item .budget {
  color: #ff6b6b;
  font-weight: 500;
}

.description {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.keywords {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.keyword-tag {
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 13px;
  color: #666;
}

/* 买家信息 */
.buyer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buyer-avatar {
  width: 50px;
  height: 50px;
  position: relative;
}

.buyer-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.buyer-avatar.clickable {
  cursor: pointer;
}

.buyer-avatar.clickable:hover img {
  opacity: 0.6;
}

.buyer-avatar.clickable:hover .avatar-add-tip {
  opacity: 1;
}

.avatar-add-tip {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background: #42b983;
  color: #fff;
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 8px;
  opacity: 0.8;
  pointer-events: none;
}

.buyer-name {
  font-weight: 500;
  font-size: 15px;
  margin-bottom: 4px;
}

.buyer-meta {
  font-size: 13px;
  color: #999;
  display: flex;
  gap: 15px;
}

/* 匹配商品 */
.match-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.match-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.match-item:hover {
  background: #f9f9f9;
}

.match-item img {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
}

.match-info {
  flex: 1;
}

.match-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.match-price {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: 500;
}

/* 按钮 */
.btn-close-modal {
  padding: 10px 24px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-contact {
  padding: 10px 24px;
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-header {
    flex-direction: column;
  }
  
  .status-badge {
    margin-left: 0;
    margin-top: 8px;
  }
}
</style>
