<template>
  <div class="orders">
    <h2>我的订单</h2>
    <div class="order-list">
      <div v-for="order in orders" :key="order.id" class="order-item">
        <div class="order-header">
          <span class="order-id">订单号: {{ order.orderNo || order.id }}</span>
          <span class="order-status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-content">
          <div class="order-product">
            <img :src="getFirstImage(order.productImages)" :alt="order.productTitle" class="product-image">
            <div class="product-info">
              <h4>{{ order.productTitle }}</h4>
              <p>{{ order.price }} 元</p>
            </div>
          </div>
          <div class="order-actions">
            <button v-if="order.status === 0" @click="handlePay(order)" class="pay-button">立即付款</button>
            <button v-if="order.status === 0" @click="handleCancel(order)" class="cancel-button">取消订单</button>
            <button v-if="order.status === 1 || order.status === 2" @click="handleContact(order)" class="contact-button">联系商家</button>
            <button v-if="order.status === 1 || order.status === 2" @click="handleComplete(order)" class="complete-button">完成交易</button>
            <button v-if="order.status === 3 && !order.buyerReviewed" @click="handleReview(order)" class="review-button">评价</button>
            <span v-if="order.status === 3 && order.buyerReviewed" class="reviewed-tag">已评价</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 评价弹窗 -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-content">
        <h3>评价本次交易</h3>
        <div class="review-form">
          <div class="review-section">
            <h4>评价商家</h4>
            <div class="rating-type">
              <label>
                <input type="radio" v-model="reviewForm.type" :value="1">
                <span class="rating-option good">好评</span>
              </label>
              <label>
                <input type="radio" v-model="reviewForm.type" :value="2">
                <span class="rating-option neutral">中评</span>
              </label>
              <label>
                <input type="radio" v-model="reviewForm.type" :value="3">
                <span class="rating-option bad">差评</span>
              </label>
            </div>
          </div>
          <div class="review-section">
            <h4>评价内容</h4>
            <textarea v-model="reviewForm.content" placeholder="请对商品和商家进行评价..." rows="4"></textarea>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-cancel" @click="closeReviewModal">取消</button>
          <button class="btn-confirm" @click="submitReviewForm" :disabled="submitting">提交评价</button>
        </div>
      </div>
    </div>

    <!-- 支付弹窗 -->
    <div v-if="showPayModal" class="pay-modal-overlay">
      <div class="pay-modal-content">
        <div class="pay-header">
          <h3>选择支付方式</h3>
          <button class="pay-close" @click="closePayModal">&times;</button>
        </div>
        <div class="pay-body">
          <!-- 支付方式选择 -->
          <div v-if="!selectedPayMethod" class="pay-method-select">
            <div class="pay-method-option wechat" @click="selectPayMethod('wechat')">
              <div class="pay-icon">💚</div>
              <div class="pay-name">微信支付</div>
            </div>
            <div class="pay-method-option alipay" @click="selectPayMethod('alipay')">
              <div class="pay-icon">🔵</div>
              <div class="pay-name">支付宝</div>
            </div>
          </div>
          <!-- 二维码展示 -->
          <div v-else class="qrcode-section">
            <div class="qrcode-container">
              <img :src="qrcodeUrl" alt="支付二维码" class="qrcode">
            </div>
            <p class="pay-amount">¥ {{ payAmount }} 元</p>
            <p class="pay-tip">
              {{ selectedPayMethod === 'wechat' ? '请使用微信扫描二维码支付' : '请使用支付宝扫描二维码支付' }}
            </p>
            <button class="pay-back" @click="selectedPayMethod = ''">返回选择支付方式</button>
          </div>
        </div>
        <div v-if="selectedPayMethod" class="pay-footer">
          <button class="pay-confirm" @click="confirmPayment" :disabled="paying">
            {{ paying ? '支付中...' : '我已支付' }}
          </button>
          <button class="pay-cancel" @click="closePayModal">取消支付</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrders, payOrder, confirmPickup, cancelOrder, submitReview } from '../api/order'
import { useRouter } from 'vue-router'

export default {
  name: 'Orders',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      orders: [],
      showReviewModal: false,
      currentOrder: null,
      submitting: false,
      reviewForm: {
        type: 1,
        content: ''
      },
      showPayModal: false,
      payAmount: 0,
      paying: false,
      selectedPayMethod: '', // 'wechat' 或 'alipay'
      qrcodeUrl: ''
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await getOrders()
        const pageData = response.data
        if (pageData && pageData.records) {
          this.orders = pageData.records
        } else if (Array.isArray(pageData)) {
          this.orders = pageData
        } else if (Array.isArray(response)) {
          this.orders = response
        } else {
          this.orders = []
        }
      } catch (error) {
        console.error('获取订单列表失败:', error)
      }
    },
    getFirstImage(images) {
      if (!images) return 'https://via.placeholder.com/80'
      let imageList = []
      try {
        imageList = JSON.parse(images)
        if (!Array.isArray(imageList)) {
          throw new Error('不是数组')
        }
      } catch (e) {
        imageList = images.split(',')
      }
      return imageList[0] || 'https://via.placeholder.com/80'
    },
    getStatusText(status) {
      const statusMap = {
        0: '待付款',
        1: '已付款待自提',
        2: '自提中',
        3: '已完成',
        4: '已取消',
        5: '退款中',
        6: '已退款',
        7: '维权中'
      }
      return statusMap[status] || status
    },
    async handlePay(order) {
      if (!confirm('确认支付该订单？')) return
      this.currentOrder = order
      this.payAmount = order.price
      this.selectedPayMethod = ''
      this.qrcodeUrl = ''
      this.showPayModal = true
    },
    selectPayMethod(method) {
      this.selectedPayMethod = method
      // 根据支付方式显示对应的二维码图片
      if (method === 'wechat') {
        this.qrcodeUrl = '微信支付.jpg'
      } else if (method === 'alipay') {
        this.qrcodeUrl = '支付宝支付.jpg'
      }
    },
    closePayModal() {
      this.showPayModal = false
      this.currentOrder = null
      this.selectedPayMethod = ''
    },
    async confirmPayment() {
      if (!this.currentOrder) return
      
      this.paying = true
      try {
        await payOrder(this.currentOrder.id)
        alert('支付成功！')
        this.closePayModal()
        this.fetchOrders()
      } catch (error) {
        console.error('支付失败:', error)
        alert('支付失败，请重试')
      } finally {
        this.paying = false
      }
    },
    async handleCancel(order) {
      const reason = prompt('请输入取消原因：')
      if (reason) {
        try {
          await cancelOrder(order.id, reason)
          alert('订单已取消')
          this.fetchOrders()
        } catch (error) {
          console.error('取消订单失败:', error)
          alert('取消失败，请重试')
        }
      }
    },
    async handleConfirm(order) {
      if (confirm('确认收货？')) {
        try {
          await confirmPickup(order.id)
          alert('确认收货成功！')
          this.fetchOrders()
        } catch (error) {
          console.error('确认收货失败:', error)
          alert('确认收货失败，请重试')
        }
      }
    },
    handleContact(order) {
      // 跳转到聊天页面，与商家对话
      this.router.push({ path: '/chat', query: { sellerId: order.sellerId } })
    },
    async handleComplete(order) {
      if (confirm('确认完成交易？')) {
        try {
          await confirmPickup(order.id)
          alert('交易完成！')
          this.fetchOrders()
        } catch (error) {
          console.error('完成交易失败:', error)
          alert('完成交易失败，请重试')
        }
      }
    },
    handleReview(order) {
      this.currentOrder = order
      this.reviewForm = {
        type: 1,
        content: ''
      }
      this.showReviewModal = true
    },
    closeReviewModal() {
      this.showReviewModal = false
      this.currentOrder = null
    },
    async submitReviewForm() {
      if (!this.currentOrder) return
      
      this.submitting = true
      try {
        const res = await submitReview({
          orderId: this.currentOrder.id,
          type: this.reviewForm.type,
          content: this.reviewForm.content
        })
        if (res.code === 200) {
          alert('评价成功！')
          this.closeReviewModal()
          this.fetchOrders()
        } else {
          alert(res.message || '评价失败')
        }
      } catch (error) {
        console.error('评价失败:', error)
        alert('评价失败，请重试')
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style>
.orders {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
  background: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.order-id {
  font-weight: bold;
}

.order-status {
  color: #42b983;
}

.order-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-product {
  display: flex;
  align-items: center;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  margin-right: 15px;
}

.product-info h4 {
  margin: 0;
  margin-bottom: 5px;
}

.product-info p {
  margin: 0;
  color: #ff4d4f;
}

.order-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin-left: 10px;
}

.pay-button {
  background-color: #ff4d4f;
  color: white;
}

.cancel-button {
  background-color: #666;
  color: white;
}

.confirm-button {
  background-color: #42b983;
  color: white;
}

.review-button {
  background-color: #1890ff;
  color: white;
}

.reviewed-tag {
  color: #999;
  font-size: 14px;
}

.contact-button {
  background-color: #52c41a;
  color: white;
}

.complete-button {
  background-color: #fa8c16;
  color: white;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  width: 450px;
  max-width: 90vw;
}

.modal-content h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
}

.review-form {
  margin-bottom: 20px;
}

.review-section {
  margin-bottom: 20px;
}

.review-section h4 {
  margin: 0 0 12px 0;
  font-size: 15px;
  color: #333;
}

.rating-type {
  display: flex;
  gap: 20px;
}

.rating-type label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.rating-type input {
  display: none;
}

.rating-option {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 14px;
  border: 1px solid #ddd;
  transition: all 0.2s;
}

.rating-type input:checked + .rating-option.good {
  background: #e8f5e9;
  border-color: #42b983;
  color: #2e7d32;
}

.rating-type input:checked + .rating-option.neutral {
  background: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.rating-type input:checked + .rating-option.bad {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.review-section textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  padding: 8px 20px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm {
  padding: 8px 20px;
  background: #42b983;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 微信支付弹窗样式 */
.pay-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.pay-modal-content {
  background: #fff;
  border-radius: 12px;
  width: 320px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.pay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.pay-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.pay-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #999;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.pay-close:hover {
  color: #666;
}

.pay-body {
  padding: 25px;
  text-align: center;
}

/* 支付方式选择 */
.pay-method-select {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.pay-method-option {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border: 2px solid #eee;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.pay-method-option:hover {
  border-color: #42b983;
  background: #f6ffed;
}

.pay-method-option.wechat:hover {
  border-color: #07c160;
  background: #f0fff4;
}

.pay-method-option.alipay:hover {
  border-color: #1677ff;
  background: #e6f4ff;
}

.pay-icon {
  font-size: 28px;
  margin-right: 15px;
}

.pay-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

/* 二维码区域 */
.qrcode-section {
  text-align: center;
}

.qrcode-container {
  background: #fff;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 8px;
  display: inline-block;
}

.qrcode {
  width: 180px;
  height: 180px;
  display: block;
}

.pay-amount {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin: 20px 0 10px 0;
}

.pay-tip {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.pay-footer {
  padding: 15px 20px;
  background: #fafafa;
  border-top: 1px solid #f0f0f0;
}

.pay-confirm {
  width: 100%;
  padding: 12px;
  background: #07c160;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 10px;
}

.pay-confirm:hover {
  background: #06ad56;
}

.pay-confirm:disabled {
  background: #a5d6a7;
  cursor: not-allowed;
}

.pay-cancel {
  width: 100%;
  padding: 10px;
  background: #fff;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
}

.pay-cancel:hover {
  background: #f5f5f5;
}

.pay-back {
  margin-top: 15px;
  padding: 8px 16px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
}

.pay-back:hover {
  background: #f5f5f5;
  color: #333;
}
</style>
