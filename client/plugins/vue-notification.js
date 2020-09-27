import Vue from 'vue'
import Notification from 'vue-notification'

export default (context, inject) => {
  Vue.use(Notification)
  inject('notify', Vue.notify)
}
