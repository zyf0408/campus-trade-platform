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
    </div>
  </div>
</template>

<script>
import { getCurrentUser, logout } from '../api/auth'
import { publishProduct, getMyProducts, offlineProduct } from '../api/product'

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
        { key: 'myProducts', label: '我的商品' }
      ],
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
    }
  }
}
</script>

<style>
.profile {
  max-width: 1200px;
  margin: 0 auto;
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
}

.publish-section {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 20px;
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
</style>
