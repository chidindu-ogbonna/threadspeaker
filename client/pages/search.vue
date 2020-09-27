<template>
  <div class="min-h-screen">
    <div class="mb-16">
      <div class="max-w-screen-sm mx-auto mb-16 md:px-8 lg:px-16">
        <app-search-form
          placeholder="Enter your Twitter handle e.g naval"
          autofocus
          type="text"
          :value="searchQuery"
          rules="required"
          class="mb-2"
          @submit="handleSearch"
        ></app-search-form>
      </div>
    </div>
    <div>
      <template v-if="loading">
        <div class="flex justify-center w-full">
          <app-loader></app-loader>
        </div>
      </template>
      <template v-else-if="searchQuery">
        <div class="max-w-screen-md mx-auto">
          <template v-if="threads && threads.length">
            <div v-if="asUser && asUser.length" class="w-full">
              <div class="mb-8 text-xl text-center">
                Threads requested by
                <span class="font-bold">{{ searchQuery }}</span>
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
              <div class="mb-8 text-xl text-center">
                Threads written by
                <span class="font-bold">{{ searchQuery }}</span>
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
              <div class="text-3xl font-bold">Not Found</div>
              <div>Try another search</div>
            </div>
          </template>
        </div>
      </template>
      <template>
        <div></div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Search',

  watchQuery(query) {
    return query.q
  },

  async asyncData({ query, store }) {
    const { q, info } = query

    let threads
    if (q) {
      threads = await store.dispatch('threads/searchThreads', {
        searchQuery: q,
      })
    }

    return { threads, searchQuery: q, info }
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

    async handleSearch(e) {
      this.loading = true
      this.searchQuery = e
      const threads = await this.$store.dispatch('threads/searchThreads', {
        searchQuery: e,
      })
      this.loading = false
      this.threads = threads
    },
  },
}
</script>
