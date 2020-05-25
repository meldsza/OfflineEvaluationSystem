import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/dashboard',
      name: 'dashboard',
      component: require('@/components/Dashboard').default
    },
    {
      path: '/',
      name: 'landing-page',
      component: require('@/components/LandingPage').default
    },
    {
      path: '/evaluate-paper/:usn',
      name: 'evaluate-paper',
      component: require('@/components/EvaluatePaper').default
    },
    {
      path: '/setup-paper-format',
      name: 'setup-paper-format',
      component: require('@/components/SetupPaperFormat').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
