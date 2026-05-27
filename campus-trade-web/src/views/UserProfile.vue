<template>
  <div class="user-profile">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="userInfo" class="profile-content">
      <!-- 用户信息卡片 -->
      <div class="user-card">
        <img :src="userInfo.avatar || defaultAvatar" alt="avatar" class="avatar">
        <div class="user-info">
          <h2>{{ userInfo.nickname }}</h2>
          <div class="user-meta">
            <span class="credit-score">
              <span class="label">信誉分:</span>
              <span class="value">{{ userInfo.creditScore || 0 }}</span>
            </span>
            <span class="credit-level" :class="'level-' + userInfo.creditLevel">
              {{ getCreditLevelName(userInfo.creditLevel) }}
            </span>
          </div>
          <p v-if="userInfo.department" class="department">{{ userInfo.department }}</p>
        </div>
      </div>

      <!-- 在售商品 -->
      <div class="section">
        <h3>在售商品</h3>
        <div v-if="products.length > 0" class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-item">
            <router-link :to="`/product/${product.id}`">
              <img :src="getFirstImage(product.images)" alt="product.title" class="product-image">
            </router-link>
            <div class="product-info">
              <h4>{{ product.title }}</h4>
              <p class="price">{{ product.price }} 元</p>
            </div>
          </div>
        </div>
        <div v-else class="empty-tip">暂无在售商品</div>
      </div>

      <!-- 收到的评价 -->
      <div class="section">
        <h3>评价 ({{ reviews.length }})</h3>
        <div v-if="reviews.length > 0" class="review-list">
          <div v-for="(review, index) in reviews" :key="index" class="review-item">
            <div class="review-header">
              <span class="reviewer">{{ review.reviewerNickname || '匿名用户' }}</span>
              <span class="review-type" :class="'type-' + review.type">{{ getReviewTypeText(review.type) }}</span>
            </div>
            <p class="review-content">{{ review.content || '无评价内容' }}</p>
          </div>
        </div>
        <div v-else class="empty-tip">暂无评价</div>
      </div>
    </div>
    <div v-else class="error">用户不存在</div>
  </div>
</template>

<script>
import { getPublicProfile } from '../api/auth'
import { getProducts } from '../api/product'
import { getOrderReviews } from '../api/order'

export default {
  name: 'UserProfile',
  data() {
    return {
      loading: true,
      userInfo: null,
      products: [],
      reviews: [],
      defaultAvatar: 'https://picsum.photos/seed/user/200/200'
    }
  },
  mounted() {
    this.fetchUserProfile()
  },
  watch: {
    '$route.params.id': {
      handler() {
        this.fetchUserProfile()
      }
    }
  },
  methods: {
    async fetchUserProfile() {
      this.loading = true
      const userId = this.$route.params.id
      try {
        // 获取用户公开信息
        const profileRes = await getPublicProfile(userId)
        if (profileRes.code === 200) {
          this.userInfo = profileRes.data
        }

        // 获取用户商品列表
        const productsRes = await getProducts({ userId })
        if (productsRes.code === 200) {
          this.products = productsRes.data.records || productsRes.data || []
        }

        // 获取用户收到的评价
        const reviewsRes = await getOrderReviews(userId)
        if (reviewsRes.code === 200) {
          this.reviews = reviewsRes.data || []
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        this.loading = false
      }
    },
    getFirstImage(images) {
      if (!images) return 'https://via.placeholder.com/200x200'
      let imageList = []
      try {
        imageList = JSON.parse(images)
        if (!Array.isArray(imageList)) {
          throw new Error('不是数组')
        }
      } catch (e) {
        imageList = images.split(',')
      }
      return imageList[0] || 'https://via.placeholder.com/200x200'
    },
    getCreditLevelName(level) {
      const names = {
        'LOW': '信用较差',
        'MEDIUM': '信用一般',
        'GOOD': '信用良好',
        'EXCELLENT': '信用优秀'
      }
      return names[level] || '未评级'
    },
    getReviewTypeText(type) {
      const map = { 1: '好评', 2: '中评', 3: '差评' }
      return map[type] || '评价'
    }
  }
}
</script>

<style scoped>
.user-profile {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 50px;
  color: #999;
}

.user-card {
  display: flex;
  gap: 20px;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-bottom: 30px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h2 {
  margin: 0 0 10px 0;
  color: #333;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.credit-score .label {
  color: #666;
}

.credit-score .value {
  color: #ff4d4f;
  font-weight: bold;
}

.credit-level {
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
}

.level-LOW { background: #ffebee; color: #c62828; }
.level-MEDIUM { background: #fff3e0; color: #e65100; }
.level-GOOD { background: #e8f5e9; color: #2e7d32; }
.level-EXCELLENT { background: #e3f2fd; color: #1565c0; }

.department {
  color: #666;
  margin: 0;
}

.section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 15px;
}

.product-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.product-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.product-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.product-info {
  padding: 10px;
}

.product-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info .price {
  margin: 0;
  color: #ff4d4f;
  font-weight: bold;
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.review-item {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.reviewer {
  font-weight: bold;
  color: #333;
}

.review-type {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.review-type.type-1 { background: #e8f5e9; color: #2e7d32; }
.review-type.type-2 { background: #fff3e0; color: #e65100; }
.review-type.type-3 { background: #ffebee; color: #c62828; }

.review-content {
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.empty-tip {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>
