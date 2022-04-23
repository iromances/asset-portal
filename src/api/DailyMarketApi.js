import request from '@/utils/request'

export function fetchList(query) {
  return request({
    url: 'http://localhost:8888/asset/trade/daily/market/index',
    method: 'get',
    params: query
  })
}

