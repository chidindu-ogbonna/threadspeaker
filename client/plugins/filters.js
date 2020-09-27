import Vue from 'vue'

Vue.filter('formatDate', (date) => {
  const options = { day: '2-digit', month: 'short', year: 'numeric' }
  const formatter = new Intl.DateTimeFormat('en-US', options)
  return formatter.format(date)
})
