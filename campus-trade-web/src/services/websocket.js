import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

class WebSocketService {
  constructor() {
    this.client = null
    this.subscriptions = []
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.listeners = new Map()
  }

  connect(userId) {
    if (this.client?.connected) {
      console.log('WebSocket已连接')
      return
    }

    const token = localStorage.getItem('token')
    
    this.client = new Client({
      webSocketFactory: () => {
        return new SockJS('http://localhost:8080/ws')
      },
      connectHeaders: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      debug: (str) => {
        console.log('STOMP: ', str)
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket连接成功')
        this.reconnectAttempts = 0
        this.subscribeToNotifications(userId)
      },
      onDisconnect: () => {
        console.log('WebSocket断开连接')
      },
      onStompError: (frame) => {
        console.error('STOMP错误: ', frame)
        this.handleReconnect(userId)
      }
    })

    this.client.activate()
  }

  subscribeToNotifications(userId) {
    if (!this.client?.connected) return

    // 订阅用户专属通知频道
    const notificationSub = this.client.subscribe(
      `/topic/user/${userId}/notifications`,
      (message) => {
        try {
          const notification = JSON.parse(message.body)
          this.handleNotification(notification)
        } catch (e) {
          console.error('解析通知失败:', e)
        }
      }
    )
    this.subscriptions.push(notificationSub)

    // 订阅系统广播
    const broadcastSub = this.client.subscribe(
      '/topic/broadcast',
      (message) => {
        try {
          const notification = JSON.parse(message.body)
          this.handleNotification(notification)
        } catch (e) {
          console.error('解析广播失败:', e)
        }
      }
    )
    this.subscriptions.push(broadcastSub)

    console.log('已订阅通知频道')
  }

  handleNotification(notification) {
    // 触发所有监听器
    this.listeners.forEach((callback, type) => {
      if (!type || type === notification.type) {
        callback(notification)
      }
    })

    // 显示浏览器通知
    this.showBrowserNotification(notification)
  }

  showBrowserNotification(notification) {
    if (!('Notification' in window)) return
    if (Notification.permission !== 'granted') return

    const title = notification.title || '新消息'
    const options = {
      body: notification.content,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.type,
      requireInteraction: notification.type === 'ORDER_TIMEOUT'
    }

    const notif = new Notification(title, options)
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
  }

  addListener(callback, type = null) {
    const id = Date.now().toString()
    this.listeners.set(id, { callback, type })
    return () => this.listeners.delete(id)
  }

  onNotification(callback, type = null) {
    return this.addListener(callback, type)
  }

  handleReconnect(userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`WebSocket重连尝试 ${this.reconnectAttempts}/${this.maxReconnectAttempts}`)
      setTimeout(() => {
        this.connect(userId)
      }, this.reconnectDelay)
    } else {
      console.error('WebSocket重连失败，已达到最大重试次数')
    }
  }

  disconnect() {
    this.subscriptions.forEach(sub => sub.unsubscribe())
    this.subscriptions = []
    
    if (this.client) {
      this.client.deactivate()
      this.client = null
    }
    
    this.listeners.clear()
    console.log('WebSocket已断开')
  }

  // 发送消息
  sendMessage(destination, body) {
    if (!this.client?.connected) {
      console.error('WebSocket未连接')
      return false
    }

    this.client.publish({
      destination: `/app/${destination}`,
      body: JSON.stringify(body)
    })
    return true
  }
}

// 请求浏览器通知权限
export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve(false)
  
  if (Notification.permission === 'granted') {
    return Promise.resolve(true)
  }
  
  return Notification.requestPermission().then(permission => {
    return permission === 'granted'
  })
}

export const websocketService = new WebSocketService()
export default websocketService
