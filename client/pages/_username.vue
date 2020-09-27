<template>
  <div class="min-h-screen">
    <div class="mb-12">
      <div class="w-full text-2xl font-bold text-center">@{{ username }}</div>
    </div>
    <div>
      <template v-if="loading">
        <div class="flex justify-center w-full">
          <app-loader></app-loader>
        </div>
      </template>
      <template v-else>
        <div class="max-w-screen-md mx-auto">
          <template v-if="threads && threads.length">
            <div v-if="asUser && asUser.length" class="w-full">
              <div class="mb-8 text-lg font-bold text-center">
                Threads you Requested
              </div>
              <div class="flex flex-row flex-wrap">
                <div
                  v-for="(thread, index) in asUser"
                  :key="index"
                  class="w-full px-4 mb-10 md:w-1/2"
                >
                  <thread-card
                    :thread="thread"
                    @open="openThread"
                  ></thread-card>
                </div>
              </div>
            </div>
            <div v-if="asAuthor && asAuthor.length" class="w-full mt-8">
              <div class="mb-8 text-lg font-bold text-center">
                Threads you Wrote
              </div>
              <div class="flex flex-row flex-wrap">
                <div
                  v-for="(thread, index) in asAuthor"
                  :key="index"
                  class="w-full px-4 mb-10 md:w-1/2"
                >
                  <thread-card
                    :thread="thread"
                    @open="openThread"
                  ></thread-card>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center w-full">
              <div
                class="mb-4 text-3xl font-bold text-center text-primary-secondary"
              >
                You have not tagged us or your threads have not been sent to us
              </div>
              <n-link to="/search" class="text-lg text-primary">
                Try our search bar
              </n-link>
            </div>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Username',

  async asyncData({ query, store, params }) {
    const { username } = params

    let threads
    if (username) {
      const searchQuery = username.replace('@', '')
      threads = await store.dispatch('threads/searchThreads', { searchQuery })
    }

    return { username, threads }
  },

  data() {
    return {
      loading: false,
    }
  },

  computed: {
    asAuthor() {
      return this.threads.filter((thread) => thread.doc_type === 'author')
    },

    asUser() {
      return this.threads.filter((thread) => thread.doc_type === 'user')
    },
  },

  methods: {
    openThread(thread) {
      const { id } = thread
      this.$store.dispatch('threads/setThreadInView', { thread })
      this.$store.dispatch('log/threadEvent', {
        action: 'user_opened_thread',
        label: id,
      })
      this.$router.push(`/thread/${id}`)
    },
  },
}
</script>
