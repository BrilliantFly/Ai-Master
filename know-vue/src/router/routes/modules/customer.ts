import type { AppRoute } from '../../types'
import Layout from '@/layout'

const CustomerRoute: AppRoute = {
  path: '/customer',
  name: 'Customer',
  component: Layout,
  redirect: '/customer/list',
  meta: {
    title: '客户管理',
    icon: 'user',
    orderNo: 10
  },
  children: [
    {
      path: 'list',
      name: 'CustomerList',
      component: () => import('@/views/customer/index.vue'),
      meta: {
        title: '客户列表'
      }
    }
  ]
}

export default CustomerRoute
