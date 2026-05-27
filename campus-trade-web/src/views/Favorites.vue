<template>
  <div class="favorites">
    <h2>我的收藏</h2>
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="favorites.length === 0" class="empty">
      <p>暂无收藏商品</p>
      <router-link to="/products" class="go-shopping">去逛逛</router-link>
    </div>
    <div v-else class="product-list">
      <div v-for="product in favorites" :key="product.id" class="product-item">
        <router-link :to="`/product/${product.id}`">
          <img :src="getFirstImage(product.images)" alt="product.title" class="product-image">
        </router-link>
        <div class="product-info">
          <h3>{{ product.title }}</h3>
          <p class="price">{{ product.price }} 元</p>
          <p class="description">{{ product.description }}</p>
          <div class="product-actions">
            <router-link :to="`/product/${product.id}`" class="view-button">查看详情</router-link>
            <button @click="handleUnfavorite(product)" class="unfavorite-button">取消收藏</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getMyFavorites, removeFavorite } from '../api/favorite'

export default {
  name: 'Favorites',
  data() {
    return {
      favorites: [],
      loading: false
    }
  },
  mounted() {
    this.fetchFavorites()
  },
  methods: {
    async fetchFavorites() {
      this.loading = true
      try {
        const res = await getMyFavorites()
        if (res.code === 200) {
          this.favorites = res.data || []
        }
      } catch (error) {
        console.error('获取收藏列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    getFirstImage(images) {
      if (!images) return 'https://via.placeholder.com/300x200'
      let imageList = []
      try {
        imageList = JSON.parse(images)
        if (!Array.isArray(imageList)) {
          throw new Error('不是数组')
        }
      } catch (e) {
        imageList = images.split(',')
      }
      return imageList[0] || 'https://via.placeholder.com/300x200'
    },
    async handleUnfavorite(product) {
      if (!confirm('确认取消收藏该商品？')) return
      try {
        await removeFavorite(product.id)
        this.fetchFavorites()
      } catch (error) {
        console.error('取消收藏失败:', error)
        alert('操作失败，请重试')
      }
    }
  }
}
</script>

<style scoped>
.favorites {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.favorites h2 {
  margin-bottom: 20px;
  color: #333;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #999;
}

.empty {
  text-align: center;
  padding: 80px 20px;
  background: #f5f5f5;
  border-radius: 8px;
}

.empty p {
  color: #999;
  font-size: 16px;
  margin-bottom: 20px;
}

.go-shopping {
  color: #42b983;
  text-decoration: none;
  font-size: 16px;
}

.go-shopping:hover {
  text-decoration: underline;
}

.product-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-item {
  display: flex;
  gap: 20px;
  padding: 20px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.product-item:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.product-image {
  width: 200px;
  height: 150px;
  object-fit: cover;
  border-radius: 8px;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-info h3 {
  margin: 0 0 10px 0;
  font-size: 18px;
  color: #333;
}

.product-info .price {
  color: #ff4d4f;
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 10px 0;
}

.product-info .description {
  color: #666;
  font-size: 14px;
  margin: 0 0 15px 0;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-actions {
  display: flex;
  gap: 10px;
}

.view-button {
  padding: 8px 20px;
  background: #42b983;
  color: #fff;
  text-decoration: none;
  border-radius: 4px;
  font-size: 14px;
}

.unfavorite-button {
  padding: 8px 20px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.unfavorite-button:hover {
  color: #ff4d4f;
  border-color: #ff4d4f;
}
</style>
