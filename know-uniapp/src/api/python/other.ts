import request from '@/utils/request'

// Data Analysis
export function analyzeData(data) {
  return request.post({ url: '/python/other/analyze', data })
}

// Get Stats
export function getStats() {
  return request.get({ url: '/python/other/stats' })
}

// Hello
export function hello() {
  return request.get({ url: '/python/other/hello' })
}
