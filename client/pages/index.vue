<template>
  <div class="min-h-screen">
    <div class="mb-12">
      <h1
        class="flex flex-col mb-4 text-4xl font-bold tracking-tight text-center s-leading-sm md:text-5xl lg:text-6xl"
      >
        Listen to your Favourite <br />
        Twitter Threads
      </h1>
      <div class="text-lg text-center text-primary-secondary">
        Mention
        <a
          :href="`https://twitter.com/intent/user?screen_name=${screenName}`"
          target="_blank"
          rel="noopener"
          class="text-primary"
        >
          @threadspeaker
        </a>
        to the last tweet of a thread to listen
      </div>
      <div class="mt-2 text-lg text-center text-primary-secondary">
        <a
          :href="`https://twitter.com/intent/user?screen_name=${screenName}`"
          target="_blank"
          rel="noopener"
          class="text-primary"
        >
          Follow us
        </a>
        for the best experience 🤗
      </div>
    </div>

    <div class="max-w-screen-md mx-auto mb-16 md:px-8 lg:px-16">
      <app-search-form
        placeholder="Find threads by Twitter handle e.g naval"
        type="text"
        rules="required"
        class="mb-2"
        @submit="handleSearch"
      ></app-search-form>
    </div>

    <div>
      <div class="mb-4 text-center">
        <h2 class="text-2xl font-bold">Featured Threads</h2>
      </div>
      <div class="flex flex-row flex-wrap max-w-screen-md mx-auto">
        <template v-if="$fetchState.pending">
          <div v-for="i in 9" :key="i" class="w-full px-4 mb-10 md:w-1/2">
            <app-skeleton height="140"></app-skeleton>
          </div>
        </template>

        <template v-else-if="$fetchState.error">
          <div class="w-full">
            <div class="text-center">Error occurred</div>
            <div class="text-center">Please Refresh</div>
          </div>
        </template>

        <template v-else>
          <div
            v-for="(thread, index) in threads"
            :key="index"
            class="w-full px-4 mb-10 md:w-1/2"
          >
            <thread-card :thread="thread" @open="openThread"></thread-card>
          </div>
        </template>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 right-0 p-2">
      <a
        href="https://www.producthunt.com/posts/threadspeaker?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-threadspeaker"
        target="_blank"
        ><img
          src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=264273&theme=light"
          alt="ThreadSpeaker - Listen to your favourite Twitter threads | Product Hunt Embed"
          class="w-48 lg:w-56"
      /></a>
    </div>
  </div>
</template>

<script>
export default {
  components: {},

  async fetch() {
    try {
      const threads = await this.$store.dispatch('threads/getThreads')
      this.threads = threads
    } catch (error) {
      throw new Error(error)
    }
  },

  data() {
    return {
      threads: [],
      searchQuery: '',
    }
  },

  computed: {
    screenName() {
      return process.env.SCREEN_NAME || 'threadspeaker'
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

    handleSearch(e) {
      this.$router.push(`/search?q=${e}`)
    },
  },
}
</script>

<style style="scss"></style>
