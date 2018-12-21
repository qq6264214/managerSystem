import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// import './assets/theme/theme-green/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
// import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
import routes from './routes'
import 'font-awesome/css/font-awesome.min.css'
import './styles/vxgplayer-1.8.31.min.css'
import './styles/index.css'
// add 用flash播放rtmp
import VueVideoPlayer from 'vue-video-player'
import 'video.js/dist/video-js.css'
import 'vue-video-player/src/custom-theme.css'
import 'videojs-flash'
import Axios from 'axios'

Vue.prototype.$axios = Axios
Vue.use(VueVideoPlayer)
Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)

// NProgress.configure({ showSpinner: false });

const router = new VueRouter({
  routes
})

// router.beforeEach((to, from, next) => {
//   NProgress.start();
//   next()
// })

// router.afterEach(transition => {
// NProgress.done();
// });

new Vue({
  // el: '#app',
  // template: '<App/>',
  router,
  store,
  // components: { App }
  render: h => h(App)
}).$mount('#app')
