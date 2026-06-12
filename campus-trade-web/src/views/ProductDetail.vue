<template>
  <div class="detail-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button class="back-btn" @click="$router.back()">← 返回</button>
        <h1>商品详情</h1>
      </div>
    </div>

    <div v-if="loading" class="state-box">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="product" class="detail-container">
      <!-- 主区域 -->
      <div class="detail-main">
        <!-- 图片区 -->
        <div class="gallery">
          <div class="main-img">
            <img :src="currentImage" :alt="product.title">
          </div>
          <div v-if="imageList.length > 1" class="thumb-strip">
            <img
              v-for="(img, i) in imageList"
              :key="i"
              :src="img"
              :class="['thumb', { on: currentImageIndex === i }]"
              @click="currentImageIndex = i"
            >
          </div>
        </div>

        <!-- 信息区 -->
        <div class="info-panel">
          <h2 class="title">{{ product.title }}</h2>

          <div class="price-section">
            <span class="current-price">¥{{ product.price }}</span>
            <span v-if="product.originalPrice" class="original-price">原价 ¥{{ product.originalPrice }}</span>
            <span v-if="product.originalPrice && product.price < product.originalPrice" class="save-badge">
              省 ¥{{ (product.originalPrice - product.price).toFixed(0) }}
            </span>
          </div>

          <div class="meta-grid">
            <div class="meta-item">
              <span class="meta-label">卖家</span>
              <router-link :to="`/user/${product.userId}`" class="meta-value seller-link">
                <span class="seller-ava">{{ (product.sellerNickname || '?')[0] }}</span>
                {{ product.sellerNickname || '匿名用户' }}
              </router-link>
            </div>
            <div class="meta-item">
              <span class="meta-label">发布时间</span>
              <span class="meta-value">{{ formatDate(product.createdTime) }}</span>
            </div>
            <div class="meta-item" v-if="product.pickupLocation">
              <span class="meta-label">自提点</span>
              <span class="meta-value">📍 {{ product.pickupLocation }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">浏览量</span>
              <span class="meta-value">👁 {{ product.viewCount || 0 }} 次</span>
            </div>
          </div>

          <div v-if="product.description" class="desc-box">
            <h3>商品描述</h3>
            <p>{{ product.description }}</p>
          </div>

          <div class="action-bar">
            <button class="btn-buy" @click="handleBuy">立即购买</button>
            <button class="btn-chat" @click="handleChat">💬 联系卖家</button>
            <button :class="['btn-fav', { on: isFavorite }]" @click="handleFavorite">
              {{ isFavorite ? '❤️ 已收藏' : '🤍 收藏' }}
            </button>
          </div>
        </div>
      </div>

      <!-- 相似推荐 -->
      <div v-if="similarProducts.length > 0" class="similar-section">
        <h3>✨ 猜你喜欢</h3>
        <div class="similar-grid">
          <div v-for="item in similarProducts" :key="item.id" class="simi-card" @click="$router.push(`/product/${item.id}`)">
            <img :src="getFirstImage(item.images)" :alt="item.title">
            <div class="simi-body">
              <p class="simi-title">{{ item.title }}</p>
              <span class="simi-price">¥{{ item.price }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getProductById, getSimilarProducts } from '../api/product'
import { createOrder } from '../api/order'
import { addToFavorites, removeFromFavorites, checkFavorite } from '../api/favorite'

export default {
  name: 'ProductDetail',
  data() {
    return {
      product: null,
      loading: true,
      imageList: [],
      currentImageIndex: 0,
      similarProducts: [],
      isFavorite: false
    }
  },
  computed: {
    currentImage() { return this.imageList[this.currentImageIndex] || 'https://via.placeholder.com/600x600/f0f0f0/aaa?text=No+Image' }
  },
  async mounted() {
    const id = this.$route.params.id
    await this.fetchProduct(id)
    await this.fetchSimilar(id)
    await this.checkFav(id)
  },
  methods: {
    async fetchProduct(id) {
      try {
        const res = await getProductById(id)
        if (res.code === 200) {
          this.product = res.data
          this.parseImages(res.data.images)
        }
      } catch (e) { console.error('加载商品失败:', e) }
      finally { this.loading = false }
    },
    async fetchSimilar(id) {
      try {
        const res = await getSimilarProducts(id)
        if (res.code === 200) this.similarProducts = (res.data || []).slice(0, 6)
      } catch { /* 忽略 */ }
    },
    async checkFav(id) {
      try {
        const res = await checkFavorite(id)
        if (res.code === 200) this.isFavorite = res.data || false
      } catch { /* 忽略 */ }
    },
    parseImages(images) {
      if (!images) { this.imageList = ['https://via.placeholder.com/600x600/f0f0f0/aaa?text=No+Image']; return }
      try {
        const arr = JSON.parse(images)
        this.imageList = Array.isArray(arr) ? arr : [images]
      } catch { this.imageList = images.split(',') }
      if (this.imageList.length === 0) this.imageList = ['https://via.placeholder.com/600x600/f0f0f0/aaa?text=No+Image']
    },
    async handleBuy() {
      if (!confirm('确认购买「' + this.product.title + '」？')) return
      try {
        const res = await createOrder({ productId: this.product.id, price: Number(this.product.price) })
        if (res.code === 200) { alert('下单成功！'); this.$router.push('/orders') }
        else alert(res.message || '下单失败')
      } catch (e) { console.error(e); alert('下单失败，请重试') }
    },
    handleChat() {
      const sellerId = this.product.userId
      this.$router.push({ path: '/chat', query: { sellerId } })
    },
    async handleFavorite() {
      try {
        const id = this.product.id
        const res = this.isFavorite ? await removeFromFavorites(id) : await addToFavorites(id)
        if (res.code === 200) { this.isFavorite = !this.isFavorite; alert(this.isFavorite ? '已收藏' : '已取消收藏') }
      } catch { alert('操作失败') }
    },
    getFirstImage(imgs) {
      if (!imgs) return 'https://via.placeholder.com/300x300/f0f0f0/aaa?text=No+Image'
      try { const arr = JSON.parse(imgs); return Array.isArray(arr) ? arr[0] : arr }
      catch { return imgs.split(',')[0] }
    },
    formatDate(t) {
      if (!t) return ''
      const d = new Date(t)
      return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }
}
</script>

<style scoped>
/* ======= page ======= */
.detail-page { min-height: 100vh; background: #f5f6f8; padding-bottom: 60px; }
.page-header {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
  padding: 16px 20px; color: #fff;
  display: flex; align-items: center;
}
.header-content { max-width: 1200px; margin: 0 auto; width: 100%; display: flex; align-items: center; gap: 16px; }
.header-content h1 { margin: 0; font-size: 1.2rem; font-weight: 600; }
.back-btn {
  background: rgba(255,255,255,.15); border: none; border-radius: 8px;
  color: #fff; padding: 6px 14px; cursor: pointer; font-size: .9rem;
  transition: background .2s;
}
.back-btn:hover { background: rgba(255,255,255,.25); }

/* state */
.state-box { text-align: center; padding: 100px 20px; }
.spinner {
  width: 36px; height: 36px; border: 3px solid #e5e7eb;
  border-top-color: #7c3aed; border-radius: 50%;
  animation: spin .8s linear infinite; margin: 0 auto 14px;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* container */
.detail-container { max-width: 1200px; margin: 20px auto; padding: 0 20px; }
.detail-main { display: flex; gap: 32px; background: #fff; border-radius: 16px; padding: 28px; box-shadow: 0 1px 4px rgba(0,0,0,.05); }

/* gallery */
.gallery { flex: 0 0 450px; }
.main-img {
  width: 100%; aspect-ratio: 1; border-radius: 12px; overflow: hidden; background: #f8f9fa;
}
.main-img img { width: 100%; height: 100%; object-fit: cover; }
.thumb-strip { display: flex; gap: 8px; margin-top: 10px; }
.thumb {
  width: 64px; height: 64px; border-radius: 8px; object-fit: cover; cursor: pointer;
  border: 2px solid transparent; transition: border-color .2s; opacity: .7;
}
.thumb:hover, .thumb.on { border-color: #7c3aed; opacity: 1; }

/* info */
.info-panel { flex: 1; }
.title { margin: 0 0 16px; font-size: 1.5rem; color: #1a1a2e; font-weight: 700; }

.price-section { display: flex; align-items: baseline; gap: 12px; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #f0f0f0; }
.current-price { font-size: 2rem; font-weight: 800; color: #e11d48; }
.original-price { font-size: 1rem; color: #aaa; text-decoration: line-through; }
.save-badge {
  padding: 3px 10px; background: #fef2f2; color: #dc2626;
  border-radius: 12px; font-size: .82rem; font-weight: 600;
}

.meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
.meta-item { display: flex; flex-direction: column; gap: 2px; }
.meta-label { font-size: .78rem; color: #999; }
.meta-value { font-size: .9rem; color: #333; }
.seller-link { display: flex; align-items: center; gap: 6px; text-decoration: none; color: #7c3aed; font-weight: 500; }
.seller-ava {
  width: 24px; height: 24px; border-radius: 50%;
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: #fff; display: flex; align-items: center; justify-content: center;
  font-size: .7rem; font-weight: 600;
}

.desc-box { margin-bottom: 24px; }
.desc-box h3 { font-size: 1rem; color: #333; margin: 0 0 8px; }
.desc-box p { font-size: .93rem; color: #666; line-height: 1.7; margin: 0; white-space: pre-wrap; }

.action-bar { display: flex; gap: 12px; flex-wrap: wrap; }
.btn-buy {
  padding: 12px 32px; background: linear-gradient(135deg, #e11d48, #f43f5e);
  color: #fff; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600;
  cursor: pointer; transition: all .2s;
}
.btn-buy:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(225,29,72,.3); }
.btn-chat {
  padding: 12px 24px; background: #fff; border: 2px solid #7c3aed;
  color: #7c3aed; border-radius: 12px; font-size: .95rem; cursor: pointer;
  transition: all .2s;
}
.btn-chat:hover { background: #f5f3ff; }
.btn-fav {
  padding: 12px 20px; background: #fff; border: 2px solid #e5e7eb;
  color: #666; border-radius: 12px; font-size: .95rem; cursor: pointer;
  transition: all .2s;
}
.btn-fav.on { border-color: #f43f5e; color: #e11d48; background: #fff1f2; }
.btn-fav:hover { border-color: #f43f5e; }

/* similar */
.similar-section { margin-top: 32px; }
.similar-section h3 { font-size: 1.2rem; color: #1a1a2e; margin: 0 0 16px; }
.similar-grid { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; }
.simi-card {
  flex: 0 0 180px; background: #fff; border-radius: 14px; overflow: hidden;
  cursor: pointer; transition: transform .2s; box-shadow: 0 1px 3px rgba(0,0,0,.05);
}
.simi-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,.1); }
.simi-card img { width: 100%; aspect-ratio: 1; object-fit: cover; }
.simi-body { padding: 10px; }
.simi-title { font-size: .85rem; color: #333; margin: 0 0 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.simi-price { font-size: 1rem; font-weight: 700; color: #e11d48; }

/* responsive */
@media (max-width: 768px) {
  .detail-main { flex-direction: column; padding: 16px; }
  .gallery { flex: none; width: 100%; }
  .meta-grid { grid-template-columns: 1fr; }
  .action-bar { flex-direction: column; }
  .btn-buy, .btn-chat, .btn-fav { width: 100%; }
}
</style>
