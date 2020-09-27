<template>
  <footer class="px-4 py-8 md:px-16">
    <div class="flex flex-col items-center justify-center">
      <div class="flex items-center mb-2">
        Copyright
        <div class="ml-2">&#169; {{ currentYear }}</div>
      </div>
      <!-- &bull; -->
      <div class="flex items-center">
        <span class="ml-4 mr-2"> Built by </span>
        <!-- <discovery-icon class="w-5 h-5 text-teal-500"></discovery-icon> -->
        <a
          :href="`https://twitter.com/intent/user?screen_name=chidinduogbonna`"
          target="_blank"
          rel="noopener"
          class="text-primary"
        >
          @chidinduogbonna
        </a>
      </div>
    </div>
  </footer>
</template>

<script>
/* eslint-disable */
import DiscoveryIcon from '@/assets/svg/discovery.svg?inline'

export default {
  components: {
    DiscoveryIcon,
  },

  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
  },
}
</script>
