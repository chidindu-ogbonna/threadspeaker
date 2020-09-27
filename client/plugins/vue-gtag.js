import Vue from 'vue'
import VueGtag from 'vue-gtag'

export default (context, inject) => {
  Vue.use(VueGtag, {
    config: { id: process.env.GOOGLE_ANALYTICS },
    params: {
      send_page_view: true,
    },
  })
  context.$gtag = Vue.$gtag
  inject('gtag', Vue.$gtag)
}
