import request from './request'

export const createReport = (data) => {
  return request({
    url: '/reports',
    method: 'post',
    data
  })
}

export const getReports = () => {
  return request({
    url: '/reports',
    method: 'get'
  })
}
