import request from './request'

// 获取我的通知列表
export function getMyNotifications(page = 1, size = 20) {
  return request({
    url: '/notification/list',
    method: 'get',
    params: { page, size }
  })
}

// 获取未读通知数量
export function getUnreadCount() {
  return request({
    url: '/notification/unread-count',
    method: 'get'
  })
}

// 标记通知为已读
export function markAsRead(notificationId) {
  return request({
    url: `/notification/read/${notificationId}`,
    method: 'put'
  })
}

// 标记所有通知为已读
export function markAllAsRead() {
  return request({
    url: '/notification/read-all',
    method: 'put'
  })
}
