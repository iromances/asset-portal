import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'http://localhost:8888/asset/trade/record/index',
    method: 'get',
    params: query
  })
}

