import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import VueMaterial from 'vue-material'
import Toasted from 'vue-toasted';
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'

import 'material-design-icons/iconfont/material-icons.css'
import 'typeface-roboto/index.css'



if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(Toasted, {
  theme: "toasted-primary",
  position: "top-right",
  duration: 2000
})

Vue.use(VueMaterial)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
