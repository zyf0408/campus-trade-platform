import request from './request.js'

// 获取会话列表
export function getConversationList() {
  return request.get('/chat/conversations')
}

// 初始化会话（联系卖家）
export function initConversation(targetUserId, productId) {
  return request.get('/chat/conversation/init', {
    params: { targetUserId, productId }
  })
}

// 获取聊天记录
export function getChatMessages(targetUserId, page = 1, size = 50) {
  // 从JWT中获取当前用户ID
  const token = localStorage.getItem('token')
  let currentUserId = null
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId = payload.userId
    } catch (e) {
      console.error('解析token失败:', e)
    }
  }
  return request.get('/chat/conversation', {
    params: { userId1: currentUserId, userId2: targetUserId, page, size }
  })
}

// 发送消息
export function sendMessage(data) {
  return request.post('/chat/send', data)
}

// 标记消息为已读
export function markAsRead(conversationId) {
  const token = localStorage.getItem('token')
  let currentUserId = null
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      currentUserId = payload.userId
    } catch (e) {
      console.error('解析token失败:', e)
    }
  }
  return request.post('/chat/read', null, {
    params: { conversationId, receiverId: currentUserId }
  })
}

// 获取未读消息数
export function getUnreadCount() {
  return request.get('/chat/unread-count')
}
