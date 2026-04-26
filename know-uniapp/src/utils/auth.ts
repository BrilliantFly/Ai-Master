import { TOKEN_KEY, TOKEN_NAME } from '@/enums/constantEnums'
import cache from './cache'

export function getToken() {
    return cache.get(TOKEN_KEY)
}

export function getTokenName() {
    return cache.get(TOKEN_NAME)
}
