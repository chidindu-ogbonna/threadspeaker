import Vue from 'vue'
import Ripple from 'vue-ripple-directive'

Ripple.zIndex = 30
Ripple.color = 'rgba(255, 255, 255, 0.55)'
Vue.directive('ripple', Ripple)
