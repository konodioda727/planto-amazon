import Vue from 'vue'
import VueRouter from 'vue-router'
export const eventBus = new Vue()
Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/screen',
    component: () => import('@/views/screenPage')
  },
  {
    path: '/home',
    component: () => import('@/views/homePage')
  },
  // {
  //   path: '/sellerPage',
  //   component: () => import('@/views/sellerPage')
  // },
  // {
  //   path: '/trendPage',
  //   component: () => import('@/views/trendPage')
  // },
  // {
  //   path: '/mapPage',
  //   component: () => import('@/views/mapPage')
  // },
  // {
  //   path: '/rankPage',
  //   component: () => import('@/views/rankPage')
  // },
  // {
  //   path: '/hotPage',
  //   component: () => import('@/views/hotPage')
  // },
  // {
  //   path: '/stockPage',
  //   component: () => import('@/views/stockPage')
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
