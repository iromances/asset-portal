import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'http://localhost:8888/asset/trade/history/index',
    method: 'post',
    data: query
  })
}
export function fetchByRecordId(recordId) {
  return request({
    url: 'http://localhost:8888/asset/trade/record/' + recordId + '/details',
    method: 'get'
  })
}

export function submitFile(data) {
  return request({
    url: 'http://localhost:8888/asset/trade/history/resolve',
    method: 'post',
    data: data
  })
}

