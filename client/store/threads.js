import { threadsRef, getThreadStorageRef } from '@/services/firebase'
import { NotFoundError } from '@/utils/errors'
import { buildData } from '@/utils/store'

export const state = () => ({
  threads: [],
  threadInView: null,
})

export const getters = {}

export const mutations = {
  setThreads(state, payload) {
    state.threads = payload
  },

  setThreadInView(state, payload) {
    state.threadInView = payload
  },
}

export const actions = {
  setThreadInView({ commit }, payload) {
    const { thread } = payload
    commit('setThreadInView', thread)
  },

  async getThread({ state, commit }, payload) {
    const { threadId } = payload

    const { threadInView } = state

    if (threadInView && threadInView.id === threadId) {
      return threadInView
    }

    const snap = await threadsRef.doc(threadId).get()
    if (snap.exists) {
      const thread = buildData(snap)
      commit('setThreadInView', thread)
      return thread
    } else {
      throw new NotFoundError('thread not found')
    }
  },

  /**
   * Search for a thread based on a query
   * This returns an object of threads
   * 1. where the query was an author (asAuthor)
   * 2. where the query was a user (asUser)
   *
   * @param {vuexContext} param0
   * @param {Object} payload
   * - {String} searchQuery
   * @returns {Promise<Array>}
   */
  async searchThreads({ dispatch }, payload) {
    const searchQuery = payload.searchQuery
      .replace('@', '')
      .toLowerCase()
      .trim()

    dispatch(
      'log/searchEvent',
      { action: 'user_started_search', label: searchQuery },
      { root: true }
    )

    const authorQuery = threadsRef
      .where('author.screen_name', '==', searchQuery)
      .orderBy('created_at', 'desc')
      .get()
    const userQuery = threadsRef
      .where('users', 'array-contains', searchQuery)
      .orderBy('created_at', 'desc')
      .get()
    const queries = await Promise.all([authorQuery, userQuery])
    const [authorSnap, userSnap] = queries

    dispatch(
      'log/searchEvent',
      {
        action: 'user_completed_search',
        label: `${authorSnap.size + userSnap.size}`,
      },
      { root: true }
    )

    if (authorSnap.empty && userSnap.empty) {
      return []
    }

    const authorResults = authorSnap.docs
      .map(buildData)
      .map((data) => ({ ...data, doc_type: 'author' }))
    const userResults = userSnap.docs
      .map(buildData)
      .map((data) => ({ ...data, doc_type: 'user' }))

    const threads = [...authorResults, ...userResults]
    return threads
  },

  async getThreads({ state, commit }) {
    if (state.threads && state.threads.length) {
      return state.threads
    }

    const query = threadsRef
      .limit(20)
      .where('featured', '==', true)
      .orderBy('created_at', 'desc')

    const snap = await query.get()
    if (snap.empty) {
      commit('setThreads', [])
      return []
    }

    const threads = snap.docs.map(buildData)
    commit('setThreads', threads)
    return threads
  },

  async downloadThreadAudio({ dispatch }, payload) {
    // TODO: Run this code from the commandline
    // gsutil cors set cors.json gs://datahorror.appspot.com
    const { thread } = payload
    const { id } = thread
    const storageRef = getThreadStorageRef(id)

    try {
      const url = await storageRef.getDownloadURL()
      return url
    } catch (error) {
      // error.code = storage/canceled | storage/unknown
      dispatch('log/error', { error }, { root: true })
      throw error
    }
  },
}
