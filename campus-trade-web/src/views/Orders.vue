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
            <button v-if="order.status === 2" @click="handleConfirm(order)" class="confirm-button">确认收货</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getOrders, payOrder, confirmPickup, cancelOrder } from '../api/order'

export default {
  name: 'Orders',
  data() {
    return {
      orders: []
    }
  },
  mounted() {
    this.fetchOrders()
  },
  methods: {
    async fetchOrders() {
      try {
        const response = await getOrders()
        // 后端返回 Result<Page<Order>>，axios拦截器解包后 response = {code, message, data}
        // data 是 Mybatis-Plus Page 对象，包含 records 数组
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
      if (confirm('确认支付该订单？')) {
        try {
          await payOrder(order.id)
          alert('支付成功！')
          this.fetchOrders()
        } catch (error) {
          console.error('支付失败:', error)
          alert('支付失败，请重试')
        }
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
    }
  }
}
</script>

<style>
.orders {
  max-width: 1200px;
  margin: 0 auto;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 20px;
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
</style>
