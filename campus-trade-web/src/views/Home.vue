<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">校园二手交易平台</h1>
        <p class="hero-subtitle">让闲置物品找到新主人，让校园生活更环保</p>
        <div class="hero-buttons">
          <router-link to="/products" class="btn btn-primary">浏览商品</router-link>
          <router-link v-if="!isLoggedIn" to="/register" class="btn btn-outline">免费注册</router-link>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">1000+</span>
            <span class="stat-label">校园用户</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">5000+</span>
            <span class="stat-label">上架商品</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">98%</span>
            <span class="stat-label">成交好评</span>
          </div>
        </div>
      </div>
      <div class="hero-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
        <div class="circle circle-3"></div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-header">
        <h2>为什么选择我们</h2>
        <p>安全、便捷、环保的校园二手交易平台</p>
      </div>
      <div class="feature-grid">
        <div class="feature-card">
          <div class="feature-icon">🎓</div>
          <h3>校园认证</h3>
          <p>严格的校园身份认证，确保交易双方都是真实在校师生</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">💚</div>
          <h3>绿色环保</h3>
          <p>让闲置物品循环利用，减少资源浪费，共建绿色校园</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🔒</div>
          <h3>交易安全</h3>
          <p>完善的信誉评价体系，保障每一笔交易安全可靠</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">📍</div>
          <h3>校内自提</h3>
          <p>线上下单，线下自提，省去快递费用，快速便捷</p>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories">
      <div class="section-header">
        <h2>商品分类</h2>
        <p>丰富的商品类别，满足你的各种需求</p>
      </div>
      <div class="category-grid">
        <router-link to="/products" class="category-card" @click.native="setCategory(1)">
          <div class="category-icon">📱</div>
          <span>数码电子</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(2)">
          <div class="category-icon">📚</div>
          <span>书籍教材</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(3)">
          <div class="category-icon">👔</div>
          <span>服饰鞋包</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(4)">
          <div class="category-icon">🏠</div>
          <span>生活用品</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(5)">
          <div class="category-icon">🏃</div>
          <span>运动健身</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(6)">
          <div class="category-icon">💄</div>
          <span>美妆护肤</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(7)">
          <div class="category-icon">🍪</div>
          <span>食品零食</span>
        </router-link>
        <router-link to="/products" class="category-card" @click.native="setCategory(8)">
          <div class="category-icon">📦</div>
          <span>其他好物</span>
        </router-link>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-content">
        <h2>开始你的二手交易之旅</h2>
        <p>无论是买还是卖，都能在这里找到满意的结果</p>
        <div class="cta-buttons">
          <router-link to="/products" class="btn btn-white">我要买</router-link>
          <router-link v-if="isLoggedIn" to="/profile" class="btn btn-outline-white">我要卖</router-link>
          <router-link v-else to="/login" class="btn btn-outline-white">我要卖</router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Home',
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('token')
    }
  },
  methods: {
    setCategory(categoryId) {
      this.$store && this.$store.commit('setCategory', categoryId)
    }
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
}

/* Hero Section */
.hero {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px 100px;
  text-align: center;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.hero-subtitle {
  font-size: 1.25rem;
  color: rgba(255,255,255,0.9);
  margin-bottom: 40px;
}

.hero-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-bottom: 60px;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 60px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #fff;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.8);
  margin-top: 5px;
}

/* Hero Decorations */
.hero-decoration {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.1);
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -50px;
  animation: float 6s ease-in-out infinite;
}

.circle-2 {
  width: 200px;
  height: 200px;
  bottom: -50px;
  left: 5%;
  animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
  width: 150px;
  height: 150px;
  top: 20%;
  left: 10%;
  animation: float 5s ease-in-out infinite 1s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

/* Buttons */
.btn {
  display: inline-block;
  padding: 12px 30px;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.btn-outline {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.btn-outline:hover {
  background: rgba(255,255,255,0.1);
}

.btn-white {
  background: #fff;
  color: #667eea;
}

.btn-outline-white {
  background: transparent;
  color: #fff;
  border: 2px solid #fff;
}

.btn-outline-white:hover {
  background: rgba(255,255,255,0.1);
}

/* Features Section */
.features {
  padding: 80px 20px;
  background: #f8f9fa;
}

.section-header {
  text-align: center;
  margin-bottom: 50px;
}

.section-header h2 {
  font-size: 2rem;
  color: #333;
  margin-bottom: 10px;
}

.section-header p {
  color: #666;
  font-size: 1.1rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.feature-card h3 {
  font-size: 1.25rem;
  color: #333;
  margin-bottom: 10px;
}

.feature-card p {
  color: #666;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Categories Section */
.categories {
  padding: 80px 20px;
  background: #fff;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  max-width: 900px;
  margin: 0 auto;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 25px 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-card:hover span {
  color: #fff;
}

.category-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.category-card span {
  font-size: 0.95rem;
  color: #333;
  font-weight: 500;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 80px 20px;
  text-align: center;
}

.cta-content h2 {
  font-size: 2rem;
  color: #fff;
  margin-bottom: 15px;
}

.cta-content p {
  color: rgba(255,255,255,0.9);
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.cta-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .hero-stats {
    gap: 30px;
  }

  .stat-number {
    font-size: 1.5rem;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }
}
</style>
