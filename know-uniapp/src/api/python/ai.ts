import request from '@/utils/request'

// AI Chat
export function chatAI(params) {
  return request.get({ url: '/python/ai/chat', params })
}

// AI Chat POST
export function chatAIPost(data) {
  return request.post({ url: '/python/ai/chat', data })
}

// AI Generate
export function generateAI(data) {
  return request.post({ url: '/python/ai/generate', data })
}

// List AI Models
export function listAIModels() {
  return request.get({ url: '/python/ai/models' })
}
