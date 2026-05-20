import request from './request'

export const getProducts = (params) => {
  return request({
    url: '/product/list',
    method: 'get',
    params
  })
}

export const getProductById = (id) => {
  return request({
    url: `/product/detail/${id}`,
    method: 'get'
  })
}

export const publishProduct = (data) => {
  return request({
    url: '/product/publish',
    method: 'post',
    data
  })
}

export const updateProduct = (id, data) => {
  return request({
    url: `/product/update/${id}`,
    method: 'put',
    data
  })
}

export const offlineProduct = (id) => {
  return request({
    url: `/product/offline/${id}`,
    method: 'post'
  })
}

export const getMyProducts = (params) => {
  return request({
    url: '/product/my',
    method: 'get',
    params
  })
}
