<template>
  <div class="products-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>🛍️ 商品市场</h1>
        <p>发现校园里的宝藏好物</p>
      </div>
      <div class="header-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f5f6f8"/></svg>
      </div>
    </div>

    <div class="page-content">
      <!-- Filter Sidebar -->
      <aside class="filter-sidebar">
        <div class="filter-header">
          <h3>筛选</h3>
          <button v-if="hasActiveFilters" @click="resetFilters" class="reset-btn">清空全部</button>
        </div>

        <!-- Category -->
        <div class="filter-section">
          <h4 class="filter-title">📂 商品分类</h4>
          <div class="chip-group">
            <button
              :class="['chip', { active: !selectedCategory }]"
              @click="selectCategory(null)"
            >全部</button>
            <button
              v-for="cat in categories"
              :key="cat.id"
              :class="['chip', { active: selectedCategory === cat.id }]"
              @click="selectCategory(cat.id)"
            >{{ cat.name }}</button>
          </div>
        </div>

        <!-- Price Range -->
        <div class="filter-section">
          <h4 class="filter-title">💰 价格区间</h4>
          <div class="chip-group">
            <button
              v-for="opt in priceOptions"
              :key="opt.value"
              :class="['chip', { active: activePriceRange === opt.value }]"
              @click="selectPriceRange(opt.value)"
            >{{ opt.label }}</button>
          </div>
          <div class="custom-price">
            <span class="custom-label">自定义范围</span>
            <div class="custom-inputs">
              <input
                type="number"
                v-model.number="minPrice"
                placeholder="¥ 最低"
                class="price-input"
                @keyup.enter="applyCustomPrice"
              >
              <span class="dash">—</span>
              <input
                type="number"
                v-model.number="maxPrice"
                placeholder="¥ 最高"
                class="price-input"
                @keyup.enter="applyCustomPrice"
              >
              <button class="go-btn" @click="applyCustomPrice">确定</button>
            </div>
          </div>
        </div>

        <!-- Sort -->
        <div class="filter-section">
          <h4 class="filter-title">📊 排序</h4>
          <div class="chip-group">
            <button
              v-for="opt in sortOptions"
              :key="opt.value"
              :class="['chip', { active: sortBy === opt.value }]"
              @click="selectSort(opt.value)"
            >{{ opt.label }}</button>
          </div>
        </div>
      </aside>

      <!-- Main -->
      <div class="products-main">
        <!-- Toolbar -->
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="搜索商品名称或关键词..."
              @keyup.enter="searchProducts"
            >
            <button v-if="searchQuery" class="clear-btn" @click="clearSearch">✕</button>
          </div>
          <span class="result-count">共 <b>{{ totalCount }}</b> 件</span>
        </div>

        <!-- Active filters -->
        <div v-if="hasActiveFilters" class="active-tags">
          <span v-if="selectedCategory" class="tag tag-category">
            {{ getCategoryName(selectedCategory) }} <i @click="selectCategory(null)">✕</i>
          </span>
          <span v-if="activePriceLabel" class="tag tag-price">
            {{ activePriceLabel }} <i @click="clearPrice">✕</i>
          </span>
          <span v-if="searchQuery" class="tag tag-search">
            "{{ searchQuery }}" <i @click="clearSearch">✕</i>
          </span>
        </div>

        <!-- Content -->
        <div v-if="loading" class="state-box">
          <div class="spinner"></div>
          <p>正在加载...</p>
        </div>
        <div v-else-if="products.length === 0" class="state-box">
          <div class="empty-emoji">{{ selectedCategory ? '📭' : '📦' }}</div>
          <p>{{ selectedCategory ? '该分类暂无商品' : '暂无可售商品' }}</p>
          <button @click="resetFilters" class="btn-outline">查看全部商品</button>
        </div>
        <div v-else class="product-grid">
          <article
            v-for="product in products"
            :key="product.id"
            class="product-card"
            @click="$router.push(`/product/${product.id}`)"
          >
            <div class="card-img-wrap">
              <img :src="getFirstImage(product.images)" :alt="product.title" loading="lazy">
              <span v-if="product.isNegotiable" class="badge">可议价</span>
              <span
                v-if="product.originalPrice && product.price < product.originalPrice"
                class="discount-badge"
              >{{ discountPercent(product) }}折</span>
            </div>
            <div class="card-body">
              <h3 class="card-title">{{ product.title }}</h3>
              <div class="card-price">
                <span class="price">¥{{ product.price }}</span>
                <span v-if="product.originalPrice" class="ori-price">¥{{ product.originalPrice }}</span>
              </div>
              <div class="card-footer">
                <span class="seller" @click.stop="$router.push(`/user/${product.userId}`)">
                  <span class="ava">{{ (product.sellerNickname || '?')[0] }}</span>
                  {{ product.sellerNickname || '匿名' }}
                </span>
                <span class="time">{{ formatTime(product.createdTime) }}</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button class="pg-btn" :disabled="currentPage === 1" @click="changePage(currentPage - 1)">‹ 上一页</button>
          <div class="pg-nums">
            <button
              v-for="p in visiblePages"
              :key="p"
              :class="['pg-num', { on: p === currentPage }]"
              @click="changePage(p)"
            >{{ p }}</button>
          </div>
          <button class="pg-btn" :disabled="currentPage === totalPages" @click="changePage(currentPage + 1)">下一页 ›</button>
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
      activePriceRange: '',
      customPriceActive: false,
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
      priceOptions: [
        { value: '0-50', label: '¥0-50' },
        { value: '50-100', label: '¥50-100' },
        { value: '100-200', label: '¥100-200' },
        { value: '200-500', label: '¥200-500' },
        { value: '500+', label: '¥500+' }
      ],
      sortOptions: [
        { value: 'default', label: '综合推荐' },
        { value: 'time_desc', label: '最新发布' },
        { value: 'price_asc', label: '低价优先' },
        { value: 'price_desc', label: '高价优先' }
      ]
    }
  },
  computed: {
    totalPages() { return Math.ceil(this.totalCount / this.pageSize) || 1 },
    hasActiveFilters() { return !!(this.selectedCategory || this.minPrice || this.maxPrice || this.searchQuery) },
    activePriceLabel() {
      if (this.minPrice && this.maxPrice) return `¥${this.minPrice} - ¥${this.maxPrice}`
      if (this.minPrice) return `¥${this.minPrice} 以上`
      if (this.maxPrice) return `¥${this.maxPrice} 以下`
      return ''
    },
    visiblePages() {
      const pgs = []
      const t = this.totalPages
      const c = this.currentPage
      let s = Math.max(1, c - 2)
      let e = Math.min(t, s + 4)
      if (e - s < 4) s = Math.max(1, e - 4)
      for (let i = s; i <= e; i++) pgs.push(i)
      return pgs
    }
  },
  mounted() { this.fetchProducts() },
  methods: {
    async fetchProducts() {
      this.loading = true
      try {
        const params = { page: this.currentPage, size: this.pageSize }
        if (this.searchQuery) params.keyword = this.searchQuery
        if (this.selectedCategory) params.categoryId = this.selectedCategory
        if (this.minPrice) params.minPrice = this.minPrice
        if (this.maxPrice) params.maxPrice = this.maxPrice
        if (this.sortBy === 'price_asc') { params.sort = 'price'; params.order = 'asc' }
        else if (this.sortBy === 'price_desc') { params.sort = 'price'; params.order = 'desc' }
        else if (this.sortBy === 'time_desc') { params.sort = 'createdTime'; params.order = 'desc' }

        const res = await getProducts(params)
        if (res.code === 200) {
          const d = res.data
          this.products = d.records || d || []
          this.totalCount = d.total || this.products.length
        }
      } catch (e) {
        console.error('加载商品失败:', e)
      } finally {
        this.loading = false
      }
    },
    selectPriceRange(val) {
      if (this.activePriceRange === val) { this.activePriceRange = ''; this.minPrice = ''; this.maxPrice = ''; this.customPriceActive = false; this.applyFilters(); return }
      this.activePriceRange = val
      this.customPriceActive = false
      switch (val) {
        case '0-50': this.minPrice = 0; this.maxPrice = 50; break
        case '50-100': this.minPrice = 50; this.maxPrice = 100; break
        case '100-200': this.minPrice = 100; this.maxPrice = 200; break
        case '200-500': this.minPrice = 200; this.maxPrice = 500; break
        case '500+': this.minPrice = 500; this.maxPrice = ''; break
        default: this.minPrice = ''; this.maxPrice = ''
      }
      this.applyFilters()
    },
    applyCustomPrice() {
      this.activePriceRange = ''
      this.customPriceActive = !!(this.minPrice || this.maxPrice)
      this.applyFilters()
    },
    searchProducts() { this.currentPage = 1; this.fetchProducts() },
    selectCategory(id) { this.selectedCategory = id; this.currentPage = 1; this.fetchProducts() },
    selectSort(v) { this.sortBy = v; this.currentPage = 1; this.fetchProducts() },
    applyFilters() { this.currentPage = 1; this.fetchProducts() },
    resetFilters() {
      this.searchQuery = ''; this.selectedCategory = null
      this.minPrice = ''; this.maxPrice = ''; this.activePriceRange = ''; this.customPriceActive = false
      this.sortBy = 'default'; this.currentPage = 1; this.fetchProducts()
    },
    clearPrice() { this.minPrice = ''; this.maxPrice = ''; this.activePriceRange = ''; this.customPriceActive = false; this.applyFilters() },
    clearSearch() { this.searchQuery = ''; this.applyFilters() },
    changePage(p) { this.currentPage = p; this.fetchProducts(); window.scrollTo({ top: 0, behavior: 'smooth' }) },
    getFirstImage(imgs) {
      if (!imgs) return 'https://via.placeholder.com/400x400/f0f0f0/aaa?text=暂无图片'
      try {
        const arr = JSON.parse(imgs)
        return Array.isArray(arr) ? arr[0] : arr
      } catch { return imgs.split(',')[0] || 'https://via.placeholder.com/400x400/f0f0f0/aaa?text=暂无图片' }
    },
    discountPercent(p) {
      if (!p.originalPrice || p.originalPrice <= 0) return ''
      return Math.round((p.price / p.originalPrice) * 10)
    },
    getCategoryName(id) { const c = this.categories.find(x => x.id === id); return c ? c.name : '' },
    formatTime(t) {
      if (!t) return ''
      const d = new Date(t); const n = new Date(); const diff = n - d
      if (diff < 864e5) return '今天'
      if (diff < 1728e5) return '昨天'
      if (diff < 6048e5) return Math.floor(diff / 864e5) + '天前'
      return d.toLocaleDateString('zh-CN')
    }
  }
}
</script>

<style scoped>
/* ======= page ======= */
.products-page { min-height: 100vh; background: #f5f6f8; }
.page-header {
  position: relative;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  padding: 48px 20px 60px;
  text-align: center; color: #fff;
}
.header-content h1 { margin: 0 0 6px; font-size: 2rem; font-weight: 700; }
.header-content p { margin: 0; opacity: .85; font-size: 1.05rem; }
.header-wave { position: absolute; bottom: -1px; left: 0; width: 100%; line-height: 0; }
.header-wave svg { width: 100%; height: 40px; }

.page-content {
  display: flex; gap: 24px;
  max-width: 1320px; margin: -20px auto 0;
  padding: 0 20px 60px;
  position: relative; z-index: 1;
}

/* ======= sidebar ======= */
.filter-sidebar {
  width: 240px; flex-shrink: 0;
  background: #fff; border-radius: 16px;
  padding: 20px; height: fit-content;
  position: sticky; top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 4px 16px rgba(0,0,0,.04);
}
.filter-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: 18px; padding-bottom: 14px;
  border-bottom: 1px solid #f0f0f0;
}
.filter-header h3 { margin: 0; font-size: 1rem; color: #1a1a2e; }
.filter-section { margin-bottom: 20px; }
.filter-title { margin: 0 0 10px; font-size: .88rem; color: #555; font-weight: 600; }

/* chips */
.chip-group { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  padding: 6px 14px; border-radius: 20px; border: 1px solid #e5e7eb;
  background: #fff; color: #555; font-size: .82rem; cursor: pointer;
  transition: all .2s; white-space: nowrap;
}
.chip:hover { border-color: #a78bfa; color: #7c3aed; }
.chip.active { background: #ede9fe; border-color: #7c3aed; color: #7c3aed; font-weight: 600; }

/* custom price */
.custom-price { margin-top: 10px; }
.custom-label { font-size: .78rem; color: #999; display: block; margin-bottom: 6px; }
.custom-inputs { display: flex; align-items: center; gap: 6px; }
.price-input {
  flex: 1; min-width: 0;
  padding: 8px 10px; border: 1px solid #e5e7eb;
  border-radius: 10px; font-size: .82rem; outline: none;
  transition: border-color .2s;
}
.price-input:focus { border-color: #7c3aed; }
.dash { color: #ccc; font-weight: 300; }
.go-btn {
  padding: 8px 14px; background: #7c3aed; color: #fff;
  border: none; border-radius: 10px; font-size: .82rem; cursor: pointer;
  transition: background .2s;
}
.go-btn:hover { background: #6d28d9; }

.reset-btn {
  padding: 5px 12px; background: #fee2e2; border: none;
  border-radius: 14px; color: #dc2626; font-size: .78rem; cursor: pointer;
  transition: background .2s;
}
.reset-btn:hover { background: #fecaca; }

/* ======= main ======= */
.products-main { flex: 1; min-width: 0; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
  background: #fff; padding: 14px 20px; border-radius: 14px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.search-box {
  display: flex; align-items: center; flex: 1; max-width: 420px;
  background: #f5f6f8; border-radius: 24px; padding: 0 16px;
  border: 2px solid transparent; transition: border-color .2s, box-shadow .2s;
}
.search-box:focus-within { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,.1); }
.search-icon { font-size: 1rem; margin-right: 6px; opacity: .5; }
.search-box input {
  flex: 1; border: none; outline: none; background: transparent;
  padding: 10px 0; font-size: .9rem;
}
.clear-btn {
  background: #e5e7eb; border: none; border-radius: 50%;
  width: 22px; height: 22px; cursor: pointer; font-size: .75rem;
  display: flex; align-items: center; justify-content: center;
  color: #666;
}
.result-count { color: #888; font-size: .88rem; white-space: nowrap; }
.result-count b { color: #7c3aed; }

/* active tags */
.active-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.tag {
  display: flex; align-items: center; gap: 6px;
  padding: 5px 14px; border-radius: 20px; font-size: .82rem; font-weight: 500;
}
.tag-category { background: #ede9fe; color: #7c3aed; }
.tag-price { background: #fef3c7; color: #b45309; }
.tag-search { background: #dbeafe; color: #1d4ed8; }
.tag i { cursor: pointer; font-style: normal; font-size: .9rem; opacity: .7; }
.tag i:hover { opacity: 1; }

/* state */
.state-box {
  text-align: center; padding: 80px 20px; background: #fff;
  border-radius: 14px; box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5e7eb;
  border-top-color: #7c3aed; border-radius: 50%;
  animation: spin .8s linear infinite; margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.empty-emoji { font-size: 4rem; margin-bottom: 10px; }
.btn-outline {
  margin-top: 14px; padding: 10px 28px; background: #fff;
  border: 2px solid #7c3aed; border-radius: 24px; color: #7c3aed;
  font-size: .9rem; cursor: pointer; transition: all .2s;
}
.btn-outline:hover { background: #7c3aed; color: #fff; }

/* grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(228px, 1fr));
  gap: 18px;
}
.product-card {
  background: #fff; border-radius: 16px; overflow: hidden; cursor: pointer;
  transition: transform .25s, box-shadow .25s;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
}
.product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,.1); }

.card-img-wrap {
  position: relative; aspect-ratio: 1; overflow: hidden; background: #f8f9fa;
}
.card-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform .3s; }
.product-card:hover .card-img-wrap img { transform: scale(1.06); }

.badge {
  position: absolute; top: 10px; left: 10px;
  padding: 3px 10px; background: rgba(249,115,22,.88);
  color: #fff; font-size: .72rem; border-radius: 10px; font-weight: 500;
}
.discount-badge {
  position: absolute; top: 10px; right: 10px;
  padding: 3px 8px; background: rgba(220,38,38,.85);
  color: #fff; font-size: .7rem; border-radius: 10px; font-weight: 600;
}

.card-body { padding: 14px; }
.card-title {
  margin: 0 0 8px; font-size: .93rem; font-weight: 600; color: #1a1a2e;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.card-price { display: flex; align-items: baseline; gap: 8px; margin-bottom: 10px; }
.price { font-size: 1.15rem; font-weight: 700; color: #e11d48; }
.ori-price { font-size: .78rem; color: #aaa; text-decoration: line-through; }

.card-footer { display: flex; justify-content: space-between; align-items: center; }
.seller { display: flex; align-items: center; gap: 6px; font-size: .78rem; color: #888; transition: color .2s; }
.seller:hover { color: #7c3aed; }
.ava {
  width: 22px; height: 22px; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: .68rem; font-weight: 600;
}
.time { font-size: .75rem; color: #bbb; }

/* pagination */
.pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 32px; }
.pg-btn {
  padding: 8px 18px; background: #fff; border: 1px solid #e5e7eb;
  border-radius: 10px; color: #555; cursor: pointer; font-size: .88rem;
  transition: all .2s;
}
.pg-btn:hover:not(:disabled) { border-color: #7c3aed; color: #7c3aed; }
.pg-btn:disabled { color: #ccc; cursor: not-allowed; }
.pg-nums { display: flex; gap: 4px; }
.pg-num {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #e5e7eb; border-radius: 10px; background: #fff;
  color: #555; cursor: pointer; font-size: .85rem; transition: all .2s;
}
.pg-num:hover { border-color: #7c3aed; color: #7c3aed; }
.pg-num.on { background: #7c3aed; border-color: #7c3aed; color: #fff; font-weight: 600; }

/* responsive */
@media (max-width: 900px) {
  .page-content { flex-direction: column; padding: 0 12px 40px; margin-top: -12px; }
  .filter-sidebar { width: 100%; position: static; display: flex; flex-wrap: wrap; gap: 12px; padding: 16px; }
  .filter-section { flex: 1; min-width: 140px; margin-bottom: 0; }
  .filter-header { width: 100%; margin-bottom: 0; padding-bottom: 8px; }
  .custom-price { margin-top: 6px; }
  .product-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .toolbar { flex-direction: column; gap: 10px; }
  .search-box { max-width: 100%; width: 100%; }
}
@media (max-width: 480px) {
  .product-grid { grid-template-columns: 1fr; }
  .chip-group { gap: 4px; }
  .chip { padding: 5px 10px; font-size: .78rem; }
}
</style>
