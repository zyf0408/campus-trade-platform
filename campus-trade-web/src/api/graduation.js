import request from './request'

export const getGraduationActivities = () => {
  return request({
    url: '/graduation-activities',
    method: 'get'
  })
}

export const participateActivity = (activityId, data) => {
  return request({
    url: `/graduation-activities/${activityId}/participate`,
    method: 'post',
    data
  })
}
