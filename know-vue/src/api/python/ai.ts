import { service, serviceConfig } from '@/utils/axios'

// AI Chat
export function chatAI(params) {
  return service({
    url: '/ai/chat',
    method: 'get',
    params
  })
}

// AI Chat POST
export function chatAIPost(data) {
  return service({
    url: '/ai/chat',
    method: 'post',
    data
  })
}

// AI Generate
export function generateAI(data) {
  return service({
    url: '/ai/generate',
    method: 'post',
    data
  })
}

// List AI Models
export function listAIModels() {
  return service({
    url: '/ai/models',
    method: 'get'
  })
}
