export const actions = {
  /**
   * Log a thread related event
   * @param {vuex.context}
   * @param {String} payload
   */
  searchEvent({ dispatch }, payload) {
    const { action, label } = payload
    const context = { category: 'search', action, label }
    dispatch('event', context)
  },

  /**
   * Log a thread related event
   * @param {vuex.context}
   * @param {String} payload
   */
  threadEvent({ dispatch }, payload) {
    const { action, label } = payload
    const context = { category: 'thread', action, label }
    dispatch('event', context)
  },

  event({ commit }, payload) {
    const { action, label, category } = payload
    const context = {}
    if (label) context.event_label = label
    if (category) context.event_category = category

    if (this.$gtag) {
      // ensure this is client side & gtag has been loaded
      this.$gtag.event(action, context)
    }
  },

  /**
   *
   * @param {*} param0
   * @param {*} payload
   * - action
   * - fatal
   * - error
   */
  error({ commit }, payload) {
    const { fatal, action, error } = payload

    const context = { fatal }
    context.description = `${action || error.code || ''} - ${
      error.name || ''
    }  - ${error.message || ''}`

    this.$gtag.exception(context)
  },
}
