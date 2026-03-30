import { service } from '@/utils/axios'

// Data Analysis
export function analyzeData(data) {
  return service({
    url: '/other/analyze',
    method: 'post',
    data
  })
}

// Get Stats
export function getStats() {
  return service({
    url: '/other/stats',
    method: 'get'
  })
}

// Hello
export function hello() {
  return service({
    url: '/other/hello',
    method: 'get'
  })
}
