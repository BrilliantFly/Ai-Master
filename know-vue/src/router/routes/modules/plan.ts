import type { AppRoute } from '../../types'
import Layout from '@/layout'

const planRoute: AppRoute = {
  path: '/plan',
  name: 'Plan',
  component: Layout,
  redirect: '/plan/schedule',
  meta: {
    title: '计划管理',
    icon: 'calendar',
    orderNo: 10
  },
  children: [
    {
      path: 'schedule',
      name: 'PlanSchedule',
      component: () => import('@/views/plan/schedule/index.vue'),
      meta: {
        title: '日程管理'
      }
    },
    {
      path: 'habit',
      name: 'PlanHabit',
      component: () => import('@/views/plan/habit/index.vue'),
      meta: {
        title: '习惯打卡'
      }
    },
    {
      path: 'info',
      name: 'PlanInfo',
      component: () => import('@/views/plan/info/index.vue'),
      meta: {
        title: '计划管理'
      }
    },
    {
      path: 'gantt',
      name: 'PlanGantt',
      component: () => import('@/views/plan/gantt/index.vue'),
      meta: {
        title: '甘特图',
        hideMenu: true
      }
    }
  ]
}

export default planRoute
