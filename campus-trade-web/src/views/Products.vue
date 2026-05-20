<template>
  <div class="products">
    <h2>商品列表</h2>
    <div class="filter">
      <input type="text" v-model="searchQuery" placeholder="搜索商品">
      <button @click="searchProducts">搜索</button>
    </div>
    <div class="product-list">
      <div v-for="product in products" :key="product.id" class="product-item">
        <img :src="getFirstImage(product.images)" alt="product.title" class="product-image">
        <h3>{{ product.title }}</h3>
        <p>{{ product.price }} 元</p>
        <p>{{ product.description }}</p>
        <router-link :to="`/product/${product.id}`">查看详情</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { getProducts } from '../api/product'

export default {
  name: 'Products',
  data() {
    return {
      products: [],
      searchQuery: ''
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      try {
        const response = await getProducts()
        this.products = response.data.records || response.data || []
      } catch (error) {
        console.error('获取商品列表失败:', error)
      }
    },
    async searchProducts() {
      try {
        const response = await getProducts({ keyword: this.searchQuery })
        this.products = response.data.records || response.data || []
      } catch (error) {
        console.error('搜索商品失败:', error)
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
    }
  }
}
</script>

<style>
.products {
  max-width: 1200px;
  margin: 0 auto;
}

.filter {
  margin-bottom: 20px;
}

.filter input {
  padding: 8px;
  width: 300px;
  border: 1px solid #ddd;
  border-radius: 3px;
}

.filter button {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.product-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.product-item h3 {
  margin: 10px 0;
}

.product-item p {
  margin: 5px 0;
  color: #666;
}

.product-item a {
  display: inline-block;
  margin-top: 10px;
  text-decoration: none;
  color: #42b983;
}
</style>
