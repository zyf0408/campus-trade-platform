import request from './request.js'

// 发送好友申请
export function sendFriendRequest(friendId, message) {
  return request({
    url: '/friend/request',
    method: 'post',
    data: { friendId, message }
  })
}

// 接受好友申请
export function acceptFriendRequest(requestId) {
  return request.post('/friend/accept/' + requestId)
}

// 拒绝好友申请
export function rejectFriendRequest(requestId) {
  return request.post('/friend/reject/' + requestId)
}

// 删除好友
export function removeFriend(friendId) {
  return request.post('/friend/remove/' + friendId)
}

// 获取好友列表
export function getFriendList() {
  return request.get('/friend/list')
}

// 获取收到的好友申请
export function getPendingRequests() {
  return request.get('/friend/pending')
}

// 获取已发送的好友申请
export function getSentRequests() {
  return request.get('/friend/sent')
}

// 搜索用户
export function searchUsers(keyword) {
  return request.get('/friend/search', { params: { keyword } })
}

// 获取好友申请未读数
export function getPendingCount() {
  return request.get('/friend/pending-count')
}
