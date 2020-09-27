<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="h-full transition-all duration-500 ease-in-out transform bg-white border-2 border-transparent rounded-md shadow-md hover:border-primary hover:scale-105 hover:-translate-y-1"
  >
    <a class="cursor-pointer" @click="$emit('open', thread)">
      <div class="flex items-start justify-start px-4 py-6">
        <div class="flex justify-start">
          <img
            class="object-contain w-12 h-12 rounded-full"
            :src="thread.author.profile_image_url_https"
            :alt="thread.author.screen_name"
            @error="setFallbackImageUrl"
          />
        </div>
        <div class="pl-2">
          <div class="mr-4 ts-truncate ts-truncate-1">
            {{ thread.author.name }}
          </div>
          <div class="text-primary">@{{ thread.author.screen_name }}</div>
        </div>
      </div>
      <div>
        <div
          class="px-4 mb-4 text-sm ts-truncate ts-truncate-2 text-primary-secondary"
          v-html="thread.thread[0].full_text"
        ></div>
      </div>
    </a>
  </div>
</template>

<script>
export default {
  props: {
    thread: {
      type: Object,
      required: true,
    },
  },

  methods: {
    setFallbackImageUrl(event) {
      event.target.src = require(`~/assets/svg/fallback.svg`)
    },
  },
}
</script>
