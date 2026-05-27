import request from './request.js'

// 发布求购
export function publishRequest(data) {
  return request.post('/purchase/publish', data)
}

// 获取求购列表
export function getRequestList(params) {
  return request.get('/purchase/list', { params })
}

// 获取求购详情
export function getRequestDetail(id) {
  return request.get('/purchase/detail/' + id)
}

// 更新求购
export function updateRequest(id, data) {
  return request.put('/purchase/update/' + id, data)
}

// 下架求购
export function offlineRequest(id) {
  return request.post('/purchase/offline/' + id)
}

// 获取我的求购列表
export function getMyRequests(params) {
  return request.get('/purchase/my', { params })
}

// 获取求购匹配的商品
export function getRequestMatches(requestId) {
  return request.get('/purchase/matches/' + requestId)
}

// 删除求购
export function deleteRequest(id) {
  return request.delete('/purchase/' + id)
}
