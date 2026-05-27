<template>
  <div class="product-detail">
    <h2>商品详情</h2>
    <div v-if="product" class="product-info">
      <div class="product-images">
        <img :src="currentImage" alt="product.title" class="product-image">
        <div class="thumbnails" v-if="imageList.length > 1">
          <img 
            v-for="(img, index) in imageList" 
            :key="index"
            :src="img" 
            :class="['thumbnail', { active: currentImageIndex === index }]"
            @click="currentImageIndex = index"
          >
        </div>
      </div>
      <div class="product-details">
        <h3>{{ product.title }}</h3>
        <p class="price">{{ product.price }} 元</p>
        <p class="original-price" v-if="product.originalPrice">原价: {{ product.originalPrice }} 元</p>
        <p class="description">{{ product.description }}</p>
        <p class="seller">
          卖家: <router-link :to="`/user/${product.userId}`" class="seller-link">
            {{ product.sellerNickname }}
          </router-link>
        </p>
        <p class="created-at">发布时间: {{ product.createdTime }}</p>
        <p class="pickup" v-if="product.pickupLocation">自提点: {{ product.pickupLocation }}</p>
        <div class="buttons">
          <button @click="handleBuy" class="buy-button">立即购买</button>
          <button @click="handleChat" class="chat-button">联系卖家</button>
          <button @click="handleFavorite" :class="['favorite-button', { active: isFavorite }]">
            {{ isFavorite ? '❤️ 已收藏' : '🤍 收藏' }}
          </button>
        </div>
      </div>
    </div>
    <div v-else class="loading">加载中...</div>

    <!-- 相似商品推荐 -->
    <div v-if="similarProducts.length > 0" class="similar-products">
      <h3>相似推荐</h3>
      <div class="similar-list">
        <div v-for="item in similarProducts" :key="item.id" class="similar-item">
          <router-link :to="`/product/${item.id}`">
            <img :src="getFirstImage(item.images)" alt="item.title" class="similar-image">
          </router-link>
          <div class="similar-info">
            <router-link :to="`/product/${item.id}`" class="similar-title">
              {{ item.title }}
            </router-link>
            <p class="similar-price">{{ item.price }} 元</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProductById } from '../api/product'
import { createOrder } from '../api/order'
import { addFavorite, removeFavorite, checkIsFavorite } from '../api/favorite'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      currentImageIndex: 0,
      imageList: [],
      isFavorite: false,
      similarProducts: []
    }
  },
  computed: {
    currentImage() {
      return this.imageList[this.currentImageIndex] || 'https://via.placeholder.com/400'
    }
  },
  mounted() {
    this.fetchProductDetail()
  },
  watch: {
    product: {
      handler(newVal) {
        if (newVal && newVal.id) {
          this.checkFavorite()
        }
      },
      immediate: true
    }
  },
  methods: {
    async fetchProductDetail() {
      try {
        const response = await getProductById(this.$route.params.id)
        this.product = response.data
        if (this.product.images) {
          // 尝试解析JSON数组，否则按逗号分隔
          try {
            this.imageList = JSON.parse(this.product.images)
            if (!Array.isArray(this.imageList)) {
              throw new Error('不是数组')
            }
          } catch (e) {
            this.imageList = this.product.images.split(',').filter(img => img.trim())
          }
        }
        if (!this.imageList || this.imageList.length === 0) {
          this.imageList = ['https://via.placeholder.com/400']
        }
        // 获取相似商品推荐
        this.fetchSimilarProducts()
      } catch (error) {
        console.error('获取商品详情失败:', error)
      }
    },
    async fetchSimilarProducts() {
      try {
        // 基于商品分类或关键词搜索相似商品
        const params = {}
        if (this.product.categoryId) {
          params.categoryId = this.product.categoryId
        }
        if (this.product.title) {
          // 提取标题关键词
          const keywords = this.product.title.split(/[\s,，]+/).slice(0, 2)
          params.keyword = keywords.join(' ')
        }
        const res = await getProducts(params)
        if (res.code === 200) {
          let allProducts = res.data.records || res.data || []
          // 过滤掉当前商品
          this.similarProducts = allProducts
            .filter(p => p.id !== this.product.id)
            .slice(0, 4)
        }
      } catch (error) {
        console.error('获取相似商品失败:', error)
      }
    },
    async handleBuy() {
      if (!confirm('确认购买该商品？')) return
      try {
        await createOrder({ 
          productId: this.product.id,
          price: this.product.price
        })
        alert('下单成功！请前往订单页面付款')
        this.$router.push('/orders')
      } catch (error) {
        console.error('下单失败:', error)
        alert('下单失败，请重试')
      }
    },
    handleChat() {
      // 检查是否登录
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        this.$router.push('/login')
        return
      }
      // 跳转到聊天页面，带上卖家ID和商品ID
      // 注意：后端返回的是 userId 字段作为卖家ID
      this.$router.push({
        path: '/chat',
        query: {
          sellerId: this.product.userId,
          productId: this.product.id
        }
      })
    },
    async checkFavorite() {
      const token = localStorage.getItem('token')
      if (!token) return

      try {
        const res = await checkIsFavorite(this.product.id)
        if (res.code === 200) {
          this.isFavorite = res.data
        }
      } catch (error) {
        console.error('检查收藏状态失败:', error)
      }
    },
    async handleFavorite() {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('请先登录')
        this.$router.push('/login')
        return
      }

      try {
        if (this.isFavorite) {
          await removeFavorite(this.product.id)
          this.isFavorite = false
          alert('已取消收藏')
        } else {
          await addFavorite(this.product.id)
          this.isFavorite = true
          alert('收藏成功')
        }
      } catch (error) {
        console.error('收藏操作失败:', error)
        alert('操作失败，请重试')
      }
    }
  }
}
</script>

<style>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.product-info {
  display: flex;
  gap: 30px;
}

.product-images {
  flex-shrink: 0;
}

.product-image {
  width: 400px;
  height: 400px;
  object-fit: cover;
  border-radius: 5px;
}

.thumbnails {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  cursor: pointer;
  border: 2px solid transparent;
}

.thumbnail.active {
  border-color: #42b983;
}

.product-details {
  flex: 1;
}

.price {
  font-size: 24px;
  color: #ff4d4f;
  margin: 10px 0;
}

.original-price {
  color: #999;
  text-decoration: line-through;
  margin: 5px 0;
}

.description {
  margin: 20px 0;
  line-height: 1.5;
}

.seller,
.created-at,
.pickup {
  color: #666;
  margin: 10px 0;
}

.seller-link {
  color: #42b983;
  text-decoration: none;
}

.seller-link:hover {
  text-decoration: underline;
}

.buttons {
  margin-top: 20px;
}

.buy-button,
.chat-button {
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 10px;
}

.buy-button {
  background-color: #ff4d4f;
  color: white;
}

.chat-button {
  background-color: #42b983;
  color: white;
}

.favorite-button {
  background-color: #fff;
  color: #666;
  border: 1px solid #ddd;
}

.favorite-button.active {
  color: #ff4d4f;
  border-color: #ff4d4f;
}

/* 相似商品推荐 */
.similar-products {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid #eee;
}

.similar-products h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 18px;
}

.similar-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.similar-item {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.similar-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.similar-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.similar-info {
  padding: 10px;
}

.similar-title {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.similar-title:hover {
  color: #42b983;
}

.similar-price {
  color: #ff4d4f;
  font-weight: bold;
  margin: 5px 0 0 0;
  font-size: 14px;
}
</style>
.loading {
  text-align: center;
  margin: 50px 0;
}
</style>

<style>
.product-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.product-info {
  display: flex;
  gap: 30px;
}

.product-image {
  width: 400px;
  height: 400px;
  object-fit: cover;
  border-radius: 5px;
}

.product-details {
  flex: 1;
}

.price {
  font-size: 24px;
  color: #ff4d4f;
  margin: 10px 0;
}

.description {
  margin: 20px 0;
  line-height: 1.5;
}

.seller,
.created-at {
  color: #666;
  margin: 10px 0;
}

.buy-button,
.chat-button {
  padding: 10px 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-right: 10px;
}

.buy-button {
  background-color: #ff4d4f;
  color: white;
}

.chat-button {
  background-color: #42b983;
  color: white;
}

.loading {
  text-align: center;
  margin: 50px 0;
}
</style>
