<template>
  <div class="profile">
    <h2>个人中心</h2>
    <div class="tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        :class="['tab-button', { active: currentTab === tab.key }]"
        @click="currentTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </div>
    <div class="profile-content">
      <div v-if="currentTab === 'info'" class="profile-info">
        <h3>个人信息</h3>
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="user">
          <p>用户ID: {{ user.id }}</p>
          <p>用户名: {{ user.username || '-' }}</p>
          <p>昵称: {{ user.nickname || '-' }}</p>
          <p>邮箱: {{ user.email || '-' }}</p>
          <p>手机号: {{ user.phone || '-' }}</p>
          <p>学号: {{ user.studentNo || '-' }}</p>
          <p>信誉分: {{ user.creditScore || 100 }}</p>
          <p>认证状态: {{ getAuthStatusText(user.authStatus) }}</p>
          <button class="logout-button" @click="handleLogout">退出登录</button>
        </div>
        <div v-else>
          <p>暂无用户信息</p>
          <button class="logout-button" @click="handleLogout">退出登录</button>
        </div>
      </div>
      <div v-if="currentTab === 'publish'" class="publish-section">
        <h3>发布商品</h3>
        <form @submit.prevent="handlePublish" class="publish-form">
          <div class="form-group">
            <label>商品标题</label>
            <input v-model="productForm.title" type="text" required>
          </div>
          <div class="form-group">
            <label>商品描述</label>
            <textarea v-model="productForm.description" rows="4" required></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>价格</label>
              <input v-model.number="productForm.price" type="number" step="0.01" required>
            </div>
            <div class="form-group">
              <label>原价</label>
              <input v-model.number="productForm.originalPrice" type="number" step="0.01">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>成色</label>
              <select v-model="productForm.conditionLevel" required>
                <option :value="1">全新</option>
                <option :value="2">九成新</option>
                <option :value="3">八成新</option>
                <option :value="4">七成新</option>
                <option :value="5">六成新及以下</option>
              </select>
            </div>
            <div class="form-group">
              <label>分类</label>
              <select v-model="productForm.categoryId" required>
                <option :value="1">数码电子</option>
                <option :value="2">书籍教材</option>
                <option :value="3">服饰鞋包</option>
                <option :value="4">生活用品</option>
                <option :value="5">运动健身</option>
                <option :value="6">美妆护肤</option>
                <option :value="7">食品零食</option>
                <option :value="8">其他</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label>商品图片</label>
            <textarea v-model="productForm.images" rows="3" placeholder='输入图片链接，多个链接请用逗号分隔
示例：
https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400,https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'></textarea>
            <small class="form-hint">提示：可以使用 Unsplash 等图床的图片链接</small>
          </div>
          <div class="form-group">
            <label>自提地点</label>
            <input v-model="productForm.pickupLocation" type="text">
          </div>
          <div class="form-group">
            <label>是否接受议价</label>
            <select v-model="productForm.isNegotiable">
              <option :value="0">不议价</option>
              <option :value="1">可议价</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-button">发布商品</button>
          </div>
        </form>
      </div>
      <div v-if="currentTab === 'myProducts'" class="my-products">
        <h3>我的商品</h3>
        <div class="product-list">
          <div v-for="product in myProducts" :key="product.id" class="product-card">
            <img :src="getFirstImage(product.images)" alt="product.title">
            <div class="product-info">
              <h4>{{ product.title }}</h4>
              <p class="price">{{ product.price }} 元</p>
              <p class="status">{{ getProductStatusText(product.status) }}</p>
              <div class="product-actions">
                <button v-if="product.status === 1" @click="handleOffline(product)" class="offline-button">下架</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="currentTab === 'salesHistory'" class="sales-history">
        <h3>历史销售记录</h3>
        <div v-if="publicProfileLoading" class="loading">加载中...</div>
        <div v-else-if="publicProfile && publicProfile.salesRecords && publicProfile.salesRecords.length > 0" class="sales-list">
          <div v-for="record in publicProfile.salesRecords" :key="record.orderId" class="sales-card clickable" @click="showReviewForSales(record)">
            <img :src="getFirstImage(record.productImages)" alt="record.productTitle">
            <div class="sales-info">
              <h4>{{ record.productTitle }}</h4>
              <p class="price">{{ record.price }} 元</p>
              <p class="time">{{ formatTime(record.createdTime) }}</p>
              <span v-if="record.hasReview" class="reviewed-badge">已评价</span>
              <span v-else class="review-tip">点击评价</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无销售记录</div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-content">
        <h3>评价本次交易</h3>
        <div class="review-product-info">
          <img :src="getFirstImage(reviewTarget.productImages)" alt="">
          <div>
            <h4>{{ reviewTarget.productTitle }}</h4>
            <p>{{ reviewTarget.price }} 元</p>
          </div>
        </div>
        <div class="review-form">
          <div class="review-section">
            <h4>选择评价</h4>
            <div class="rating-type">
              <label>
                <input type="radio" v-model="reviewForm.type" :value="1">
                <span class="rating-option good">好评</span>
              </label>
              <label>
                <input type="radio" v-model="reviewForm.type" :value="2">
                <span class="rating-option neutral">中评</span>
              </label>
              <label>
                <input type="radio" v-model="reviewForm.type" :value="3">
                <span class="rating-option bad">差评</span>
              </label>
            </div>
          </div>
          <div class="review-section">
            <h4>评价内容</h4>
            <textarea v-model="reviewForm.content" placeholder="请对商品和商家进行评价..." rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeReviewModal">取消</button>
          <button class="btn-confirm" @click="submitReview" :disabled="submitting">提交评价</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentUser, logout, getPublicProfile } from '../api/auth'
import { publishProduct, getMyProducts, offlineProduct } from '../api/product'
import { submitReview } from '../api/order'

export default {
  name: 'Profile',
  data() {
    return {
      user: null,
      loading: false,
      error: null,
      currentTab: 'info',
      tabs: [
        { key: 'info', label: '个人信息' },
        { key: 'publish', label: '发布商品' },
        { key: 'myProducts', label: '我的商品' },
        { key: 'salesHistory', label: '销售记录' }
      ],
      publicProfile: null,
      publicProfileLoading: false,
      showReviewModal: false,
      reviewTarget: {},
      submitting: false,
      reviewForm: {
        type: 1,
        content: ''
      },
      productForm: {
        title: '',
        description: '',
        price: null,
        originalPrice: null,
        conditionLevel: 2,
        categoryId: 1,
        images: '',
        pickupLocation: '',
        isNegotiable: 0
      },
      myProducts: []
    }
  },
  mounted() {
    this.fetchUserInfo()
  },
  watch: {
    currentTab(newVal) {
      if (newVal === 'myProducts') {
        this.fetchMyProducts()
      }
      if (newVal === 'salesHistory' || newVal === 'myReviews') {
        this.fetchPublicProfile()
      }
    }
  },
  methods: {
    async fetchUserInfo() {
      this.loading = true
      this.error = null
      try {
        console.log('正在获取用户信息...')
        const response = await getCurrentUser()
        console.log('用户信息响应:', response)
        // axios拦截器解包后 response = {code, message, data}
        // response.data 是 User 对象
        if (response && response.data) {
          this.user = response.data
        } else if (response && response.code === 200) {
          this.user = response.data || {}
        } else {
          this.user = null
          this.error = '获取用户信息失败'
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        this.error = '获取用户信息失败，请稍后重试'
        this.user = null
      } finally {
        this.loading = false
      }
    },
    async fetchMyProducts() {
      try {
        const response = await getMyProducts()
        this.myProducts = response.data.records || response.data || []
      } catch (error) {
        console.error('获取我的商品失败:', error)
      }
    },
    async handlePublish() {
      try {
        await publishProduct(this.productForm)
        alert('商品发布成功！')
        this.resetForm()
        this.currentTab = 'myProducts'
      } catch (error) {
        console.error('发布商品失败:', error)
        alert('发布失败，请重试')
      }
    },
    async handleOffline(product) {
      if (!confirm('确认下架该商品？')) return
      try {
        await offlineProduct(product.id)
        alert('商品已下架')
        this.fetchMyProducts()
      } catch (error) {
        console.error('下架商品失败:', error)
        alert('下架失败，请重试')
      }
    },
    resetForm() {
      this.productForm = {
        title: '',
        description: '',
        price: null,
        originalPrice: null,
        conditionLevel: 2,
        categoryId: 1,
        images: '',
        pickupLocation: '',
        isNegotiable: 0
      }
    },
    async handleLogout() {
      try {
        await logout()
        localStorage.removeItem('token')
        this.$router.push('/login')
      } catch (error) {
        console.error('退出登录失败:', error)
      }
    },
    getFirstImage(images) {
      if (!images) return 'https://via.placeholder.com/150'
      let imageList = []
      try {
        imageList = JSON.parse(images)
        if (!Array.isArray(imageList)) {
          throw new Error('不是数组')
        }
      } catch (e) {
        imageList = images.split(',')
      }
      return imageList[0] || 'https://via.placeholder.com/150'
    },
    getProductStatusText(status) {
      const statusMap = {
        0: '待审核',
        1: '上架中',
        2: '已下架',
        3: '已售出'
      }
      return statusMap[status] || status
    },
    getAuthStatusText(status) {
      const statusMap = {
        0: '未认证',
        1: '认证中',
        2: '已认证',
        3: '认证失败'
      }
      return statusMap[status] || '未知'
    },
    async fetchPublicProfile() {
      if (!this.user || !this.user.id) return
      this.publicProfileLoading = true
      try {
        const res = await getPublicProfile(this.user.id)
        if (res.code === 200) {
          this.publicProfile = res.data
        }
      } catch (error) {
        console.error('获取公开资料失败:', error)
      } finally {
        this.publicProfileLoading = false
      }
    },
    formatTime(time) {
      if (!time) return ''
      return new Date(time).toLocaleDateString('zh-CN')
    },
    getReviewTypeText(type) {
      const map = { 1: '好评', 2: '中评', 3: '差评' }
      return map[type] || '评价'
    },
    showReviewForSales(record) {
      this.reviewTarget = record
      this.reviewForm = {
        type: 1,
        content: ''
      }
      this.showReviewModal = true
    },
    closeReviewModal() {
      this.showReviewModal = false
      this.reviewTarget = {}
    },
    async submitReview() {
      if (!this.reviewTarget || !this.reviewTarget.orderId) return
      
      this.submitting = true
      try {
        const res = await submitReview({
          orderId: this.reviewTarget.orderId,
          type: this.reviewForm.type,
          content: this.reviewForm.content
        })
        if (res.code === 200) {
          alert('评价成功！')
          this.closeReviewModal()
          this.fetchPublicProfile()
        } else {
          alert(res.message || '评价失败')
        }
      } catch (error) {
        console.error('评价失败:', error)
        alert('评价失败，请重试')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style>
.profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  color: #333;
}

.profile h2 {
  color: #333;
}

.profile h3 {
  color: #333;
  margin: 0 0 15px 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.error {
  text-align: center;
  padding: 40px;
  color: #ff4d4f;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #ddd;
}

.tab-button {
  padding: 10px 20px;
  border: none;
  background: none;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
  color: #666;
}

.tab-button.active {
  border-bottom-color: #42b983;
  color: #42b983;
  font-weight: bold;
}

.profile-content {
  min-height: 400px;
}

.profile-info {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  color: #333;
}

.profile-info p {
  color: #333;
  margin: 10px 0;
}

.publish-section {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  color: #333;
}

.publish-section label {
  color: #333;
}

.publish-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-hint {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 3px;
  color: #333;
}

.form-actions {
  margin-top: 20px;
}

.submit-button {
  padding: 10px 30px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

.my-products {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
  color: #333;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 5px;
  overflow: hidden;
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-card .product-info {
  padding: 15px;
}

.product-card h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.product-card .price {
  color: #ff4d4f;
  font-weight: bold;
  margin: 5px 0;
}

.product-card .status {
  color: #666;
  font-size: 14px;
  margin: 5px 0;
}

.product-actions {
  margin-top: 10px;
}

.offline-button {
  padding: 5px 10px;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
}

.logout-button {
  background-color: #ff4d4f;
  color: white;
  margin-top: 15px;
  padding: 8px 16px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
}

/* 销售记录样式 */
.sales-history {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
}

.sales-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.sales-card {
  border: 1px solid #eee;
  border-radius: 5px;
  overflow: hidden;
  background: #fff;
}

.sales-card.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.sales-card.clickable:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.sales-card img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.sales-info {
  padding: 10px;
  position: relative;
}

.sales-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sales-info .price {
  color: #ff4d4f;
  font-weight: bold;
  margin: 5px 0;
}

.sales-info .time {
  color: #666;
  font-size: 12px;
  margin: 5px 0 0 0;
}

.review-tip {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 8px;
  background: #1890ff;
  color: #fff;
  font-size: 11px;
  border-radius: 10px;
}

.review-tip:hover {
  background: #40a9ff;
}

.reviewed-badge {
  display: inline-block;
  margin-top: 8px;
  padding: 3px 8px;
  background: #52c41a;
  color: #fff;
  font-size: 11px;
  border-radius: 10px;
}

/* 评价弹窗样式 */
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
  width: 450px;
  max-width: 90vw;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.review-product-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 8px;
  margin-bottom: 20px;
}

.review-product-info img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.review-product-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.review-product-info p {
  margin: 0;
  color: #ff4d4f;
  font-weight: bold;
}

.review-form {
  margin-bottom: 20px;
}

.review-section {
  margin-bottom: 20px;
}

.review-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.rating-type {
  display: flex;
  gap: 15px;
}

.rating-type label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.rating-type input {
  display: none;
}

.rating-option {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.rating-type input:checked + .rating-option.good {
  background: #e8f5e9;
  border-color: #42b983;
  color: #2e7d32;
}

.rating-type input:checked + .rating-option.neutral {
  background: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.rating-type input:checked + .rating-option.bad {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.review-section textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  color: #333;
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
  color: #333;
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

.empty-tip {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
