<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1>商品市场</h1>
      <p>发现校园里的宝藏好物</p>
    </div>

    <div class="page-content">
      <!-- Filter Sidebar -->
      <div class="filter-sidebar">
        <div class="filter-header">
          <h3>筛选条件</h3>
          <button @click="resetFilters" class="reset-btn">重置</button>
        </div>

        <div class="filter-section">
          <h4 class="filter-title">
            <span class="filter-icon">📂</span>
            商品分类
          </h4>
          <div class="category-list">
            <div
              :class="['category-item', { active: !selectedCategory }]"
              @click="selectCategory(null)"
            >
              <span>全部商品</span>
            </div>
            <div
              v-for="cat in categories"
              :key="cat.id"
              :class="['category-item', { active: selectedCategory === cat.id }]"
              @click="selectCategory(cat.id)"
            >
              <span class="category-emoji">{{ getCategoryEmoji(cat.id) }}</span>
              <span>{{ cat.name }}</span>
            </div>
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-title">
            <span class="filter-icon">💰</span>
            价格区间
          </h4>
          <div class="price-filter">
            <input
              type="number"
              v-model="minPrice"
              placeholder="最低价"
              @change="applyFilters"
            >
            <span class="price-separator">-</span>
            <input
              type="number"
              v-model="maxPrice"
              placeholder="最高价"
              @change="applyFilters"
            >
          </div>
        </div>

        <div class="filter-section">
          <h4 class="filter-title">
            <span class="filter-icon">📊</span>
            排序方式
          </h4>
          <div class="sort-options">
            <div
              v-for="option in sortOptions"
              :key="option.value"
              :class="['sort-item', { active: sortBy === option.value }]"
              @click="selectSort(option.value)"
            >
              {{ option.label }}
            </div>
          </div>
        </div>
      </div>

      <!-- Products Main -->
      <div class="products-main">
        <div class="products-toolbar">
          <div class="search-box">
            <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索商品名称..."
              @keyup.enter="searchProducts"
            >
            <button @click="searchProducts">
              <span>🔍</span>
            </button>
          </div>
          <div class="toolbar-right">
            <span class="result-count">
              共找到 <strong>{{ totalCount }}</strong> 件商品
            </span>
          </div>
        </div>

        <!-- Active Filters -->
        <div v-if="hasActiveFilters" class="active-filters">
          <span v-if="selectedCategory" class="filter-tag">
            {{ getCategoryName(selectedCategory) }}
            <span @click="selectCategory(null)">×</span>
          </span>
          <span v-if="minPrice || maxPrice" class="filter-tag">
            {{ minPrice || '0' }} - {{ maxPrice || '不限' }} 元
            <span @click="clearPrice">×</span>
          </span>
          <span v-if="searchQuery" class="filter-tag">
            搜索: {{ searchQuery }}
            <span @click="clearSearch">×</span>
          </span>
        </div>

        <div v-if="loading" class="loading">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div v-else-if="products.length === 0" class="empty">
          <div class="empty-icon">📦</div>
          <p>暂无相关商品</p>
          <button @click="resetFilters" class="empty-btn">查看全部商品</button>
        </div>
        <div v-else class="product-grid">
          <div v-for="product in products" :key="product.id" class="product-card">
            <div class="card-image">
              <router-link :to="`/product/${product.id}`">
                <img :src="getFirstImage(product.images)" :alt="product.title">
              </router-link>
              <div class="card-badge" v-if="product.isNegotiable">可议价</div>
            </div>
            <div class="card-content">
              <router-link :to="`/product/${product.id}`" class="card-title">
                {{ product.title }}
              </router-link>
              <div class="card-price">
                <span class="price-current">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="price-original">
                  ¥{{ product.originalPrice }}
                </span>
              </div>
              <div class="card-meta">
                <span class="seller" @click.stop="goToUserProfile(product.userId)">
                  <span class="seller-avatar">{{ getAvatar(product.sellerNickname) }}</span>
                  {{ product.sellerNickname }}
                </span>
                <span class="time">{{ formatTime(product.createdTime) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
          >
            上一页
          </button>
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['page-num', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
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
      loading: false,
      totalCount: 0,
      currentPage: 1,
      pageSize: 20,
      searchQuery: '',
      selectedCategory: null,
      minPrice: '',
      maxPrice: '',
      sortBy: 'default',
      categories: [
        { id: 1, name: '数码电子' },
        { id: 2, name: '书籍教材' },
        { id: 3, name: '服饰鞋包' },
        { id: 4, name: '生活用品' },
        { id: 5, name: '运动健身' },
        { id: 6, name: '美妆护肤' },
        { id: 7, name: '食品零食' },
        { id: 8, name: '其他' }
      ],
      sortOptions: [
        { value: 'default', label: '综合推荐' },
        { value: 'time_desc', label: '最新发布' },
        { value: 'price_asc', label: '价格从低到高' },
        { value: 'price_desc', label: '价格从高到低' }
      ]
    }
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.pageSize)
    },
    hasActiveFilters() {
      return this.selectedCategory || this.minPrice || this.maxPrice || this.searchQuery
    },
    visiblePages() {
      const pages = []
      const total = this.totalPages
      const current = this.currentPage
      let start = Math.max(1, current - 2)
      let end = Math.min(total, start + 4)
      if (end - start < 4) {
        start = Math.max(1, end - 4)
      }
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  mounted() {
    this.fetchProducts()
  },
  methods: {
    async fetchProducts() {
      this.loading = true
      try {
        const params = {
          page: this.currentPage,
          size: this.pageSize
        }

        if (this.searchQuery) {
          params.keyword = this.searchQuery
        }
        if (this.selectedCategory) {
          params.categoryId = this.selectedCategory
        }
        if (this.minPrice) {
          params.minPrice = this.minPrice
        }
        if (this.maxPrice) {
          params.maxPrice = this.maxPrice
        }
        if (this.sortBy === 'price_asc') {
          params.sort = 'price'
          params.order = 'asc'
        } else if (this.sortBy === 'price_desc') {
          params.sort = 'price'
          params.order = 'desc'
        } else if (this.sortBy === 'time_desc') {
          params.sort = 'createdTime'
          params.order = 'desc'
        }

        const response = await getProducts(params)
        if (response.code === 200) {
          const data = response.data
          this.products = data.records || data || []
          this.totalCount = data.total || this.products.length
        }
      } catch (error) {
        console.error('获取商品列表失败:', error)
      } finally {
        this.loading = false
      }
    },
    searchProducts() {
      this.currentPage = 1
      this.fetchProducts()
    },
    selectCategory(categoryId) {
      this.selectedCategory = categoryId
      this.currentPage = 1
      this.fetchProducts()
    },
    selectSort(sortValue) {
      this.sortBy = sortValue
      this.currentPage = 1
      this.fetchProducts()
    },
    applyFilters() {
      this.currentPage = 1
      this.fetchProducts()
    },
    resetFilters() {
      this.searchQuery = ''
      this.selectedCategory = null
      this.minPrice = ''
      this.maxPrice = ''
      this.sortBy = 'default'
      this.currentPage = 1
      this.fetchProducts()
    },
    clearPrice() {
      this.minPrice = ''
      this.maxPrice = ''
      this.applyFilters()
    },
    clearSearch() {
      this.searchQuery = ''
      this.applyFilters()
    },
    changePage(page) {
      this.currentPage = page
      this.fetchProducts()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    getFirstImage(images) {
      if (!images) return 'https://via.placeholder.com/300x300/e9ecef/999?text=No+Image'
      let imageList = []
      try {
        imageList = JSON.parse(images)
        if (!Array.isArray(imageList)) {
          throw new Error('不是数组')
        }
      } catch (e) {
        imageList = images.split(',')
      }
      return imageList[0] || 'https://via.placeholder.com/300x300/e9ecef/999?text=No+Image'
    },
    getCategoryEmoji(id) {
      const emojis = { 1: '📱', 2: '📚', 3: '👔', 4: '🏠', 5: '🏃', 6: '💄', 7: '🍪', 8: '📦' }
      return emojis[id] || '📦'
    },
    getCategoryName(id) {
      const cat = this.categories.find(c => c.id === id)
      return cat ? cat.name : ''
    },
    getAvatar(name) {
      return name ? name.charAt(0).toUpperCase() : '?'
    },
    goToUserProfile(userId) {
      this.$router.push(`/user/${userId}`)
    },
    formatTime(time) {
      if (!time) return ''
      const date = new Date(time)
      const now = new Date()
      const diff = now - date
      if (diff < 86400000) return '今天'
      if (diff < 172800000) return '昨天'
      if (diff < 604800000) return Math.floor(diff / 86400000) + '天前'
      return date.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
.products-page {
  min-height: 100vh;
  background: #f5f6f8;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  text-align: center;
  color: #fff;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 2rem;
  font-weight: 600;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

.page-content {
  display: flex;
  gap: 24px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 20px;
}

/* Filter Sidebar */
.filter-sidebar {
  width: 260px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.filter-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #333;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

.filter-icon {
  font-size: 1.1rem;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f5f6f8;
  color: #333;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.category-emoji {
  font-size: 1.1rem;
}

.price-filter {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-filter input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.2s;
}

.price-filter input:focus {
  border-color: #667eea;
}

.price-separator {
  color: #999;
}

.sort-options {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sort-item {
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  color: #666;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.sort-item:hover {
  background: #f5f6f8;
  color: #333;
}

.sort-item.active {
  background: #e8f5e9;
  color: #42b983;
  font-weight: 500;
}

.reset-btn {
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  color: #666;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

/* Products Main */
.products-main {
  flex: 1;
}

.products-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background: #fff;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.search-box {
  display: flex;
  gap: 0;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid #e9ecef;
}

.search-box input {
  padding: 10px 16px;
  border: none;
  outline: none;
  font-size: 0.9rem;
  width: 240px;
}

.search-box button {
  padding: 10px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.result-count {
  color: #666;
  font-size: 0.9rem;
}

.result-count strong {
  color: #667eea;
}

/* Active Filters */
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 16px;
  font-size: 0.85rem;
}

.filter-tag span {
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

/* Loading & Empty */
.loading, .empty {
  text-align: center;
  padding: 80px 20px;
  background: #fff;
  border-radius: 12px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e9ecef;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
}

.empty-btn {
  margin-top: 16px;
  padding: 10px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0,0,0,0.05);
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.2);
}

.card-image {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .card-image img {
  transform: scale(1.05);
}

.card-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 10px;
  background: rgba(255, 152, 0, 0.9);
  color: #fff;
  font-size: 0.75rem;
  border-radius: 12px;
}

.card-content {
  padding: 16px;
}

.card-title {
  display: block;
  color: #333;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s;
}

.card-title:hover {
  color: #667eea;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.price-current {
  font-size: 1.25rem;
  font-weight: 700;
  color: #ff4d4f;
}

.price-original {
  font-size: 0.85rem;
  color: #999;
  text-decoration: line-through;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #999;
}

.seller {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: color 0.2s;
}

.seller:hover {
  color: #667eea;
}

.seller-avatar {
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 40px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
}

.page-btn {
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.page-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #fff;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.page-num:hover {
  border-color: #667eea;
  color: #667eea;
}

.page-num.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: #fff;
}

/* Responsive */
@media (max-width: 1024px) {
  .page-content {
    flex-direction: column;
  }

  .filter-sidebar {
    width: 100%;
    position: static;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
}

@media (max-width: 640px) {
  .products-toolbar {
    flex-direction: column;
    gap: 12px;
  }

  .search-box {
    width: 100%;
  }

  .search-box input {
    width: 100%;
  }

  .product-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}
</style>
