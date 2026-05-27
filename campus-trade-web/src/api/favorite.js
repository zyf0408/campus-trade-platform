import request from './request'

// 添加收藏
export function addFavorite(productId) {
  return request({
    url: `/favorite/${productId}`,
    method: 'post'
  })
}

// 取消收藏
export function removeFavorite(productId) {
  return request({
    url: `/favorite/${productId}`,
    method: 'delete'
  })
}

// 获取我的收藏列表
export function getMyFavorites(page = 1, size = 10) {
  return request({
    url: '/favorite/list',
    method: 'get',
    params: { page, size }
  })
}

// 检查是否已收藏
export function checkIsFavorite(productId) {
  return request({
    url: `/favorite/check/${productId}`,
    method: 'get'
  })
}
