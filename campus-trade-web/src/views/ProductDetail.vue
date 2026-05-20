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
        <p class="seller">卖家: {{ product.sellerNickname }}</p>
        <p class="created-at">发布时间: {{ product.createdTime }}</p>
        <p class="pickup" v-if="product.pickupLocation">自提点: {{ product.pickupLocation }}</p>
        <div class="buttons">
          <button @click="handleBuy" class="buy-button">立即购买</button>
          <button @click="handleChat" class="chat-button">联系卖家</button>
        </div>
      </div>
    </div>
    <div v-else class="loading">加载中...</div>
  </div>
</template>

<script>
import { getProductById } from '../api/product'
import { createOrder } from '../api/order'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      currentImageIndex: 0,
      imageList: []
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
      } catch (error) {
        console.error('获取商品详情失败:', error)
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
