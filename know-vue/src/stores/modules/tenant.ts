import { defineStore } from 'pinia'
import { stores } from '../index'
import { getTenantList, type Tenant } from '@/api/tenant'
import { TENANT_KEY } from '@/enums/cacheEnum'
import { setAuthCache, getAuthCache } from '@/utils/auth'

interface TenantState {
  currentTenant: Nullable<Tenant>
  tenantList: Tenant[]
}

export const useTenantStore = defineStore('app-tenant', {
  state: (): TenantState => ({
    currentTenant: null,
    tenantList: []
  }),
  getters: {
    getCurrentTenant(): Tenant {
      return this.currentTenant || getAuthCache<Tenant>(TENANT_KEY) || {}
    },
    getTenantList(): Tenant[] {
      return this.tenantList
    }
  },
  actions: {
    setCurrentTenant(tenant: Tenant | null) {
      this.currentTenant = tenant
      setAuthCache(TENANT_KEY, tenant)
    },
    setTenantList(list: Tenant[]) {
      this.tenantList = list
    },
    async loadTenantList() {
      const list = await getTenantList()
      this.setTenantList(list)
      return list
    },
    async switchTenant(tenant: Tenant) {
      this.setCurrentTenant(tenant)
    },
    resetState() {
      this.currentTenant = null
      this.tenantList = []
    }
  }
})

export function useTenantStoreWithOut() {
  return useTenantStore(stores)
}
