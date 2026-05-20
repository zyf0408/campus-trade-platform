import request from './request'

export const getOrders = (params) => {
  return request({
    url: '/order/my',
    method: 'get',
    params
  })
}

export const getOrderById = (id) => {
  return request({
    url: `/order/detail/${id}`,
    method: 'get'
  })
}

export const createOrder = (data) => {
  return request({
    url: '/order/create',
    method: 'post',
    data
  })
}

export const payOrder = (id) => {
  return request({
    url: `/order/pay/${id}`,
    method: 'post'
  })
}

export const confirmPickup = (id) => {
  return request({
    url: `/order/confirm-pickup/${id}`,
    method: 'post'
  })
}

export const cancelOrder = (id, reason) => {
  return request({
    url: `/order/cancel/${id}`,
    method: 'post',
    params: { reason }
  })
}
