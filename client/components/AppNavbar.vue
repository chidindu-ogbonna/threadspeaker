<template>
  <header>
    <nav
      class="fixed top-0 left-0 right-0 z-10 flex items-center justify-between w-full px-4 py-2 md:px-16"
      :class="[$route.name === 'index' ? 'nav-bg' : 'bg-background']"
    >
      <a class="flex items-center cursor-pointer" @click="changeRoute">
        <app-logo v-if="$route.name === 'index'" class="w-12 h-12"></app-logo>
        <arrow-left v-else class="w-8 h-8 text-gray-700"></arrow-left>
      </a>
      <n-link
        v-if="$route.name !== 'index'"
        to="/"
        class="flex items-center justify-center text-left"
      >
        <app-logo class="w-12 h-12"></app-logo>
      </n-link>
      <div class="flex items-center justify-end">
        <div
          class="flex items-center py-1 divide-x divide-gray-400 rounded-md"
          :class="$route.name === 'index' ? 'shadow-md px-2 bg-white' : ''"
        >
          <div v-if="$route.name === 'index'" class="flex items-center px-2">
            <n-link to="/about">
              <info-circle-icon
                class="w-6 h-6 text-gray-700"
              ></info-circle-icon>
            </n-link>
          </div>
          <app-dropdown :show-dropdown="showUpdates">
            <template #trigger>
              <button
                v-ripple.click
                class="block pl-1 focus:outline-none"
                @click="showUpdates = !showUpdates"
              >
                <notification-icon
                  class="w-6 h-6 text-gray-700"
                  :class="[false ? 'pulse text-red-500' : null]"
                ></notification-icon>
              </button>
            </template>
            <template #dropdown>
              <update-dropdown></update-dropdown>
            </template>
          </app-dropdown>
        </div>

        <!-- <button class="shadow-md btn btn__primary">
          <twitter-icon class="w-4 h-4 mr-2 text-white"></twitter-icon>
          Login
        </button> -->
      </div>
    </nav>
  </header>
</template>

<script>
// /* eslint-disable */
// import TwitterIcon from '@/assets/svg/twitter.svg?inline'
import InfoCircleIcon from '@/assets/svg/info-circle.svg?inline'
import NotificationIcon from '@/assets/svg/notification.svg?inline'
import ArrowLeft from '@/assets/svg/chevron-left.svg?inline'

export default {
  components: {
    ArrowLeft,
    // TwitterIcon,
    InfoCircleIcon,
    NotificationIcon,
  },

  data() {
    return {
      showUpdates: false,
    }
  },

  methods: {
    changeRoute() {
      let historyExists

      if (window && window.history) {
        historyExists = window.history.length
      } else {
        historyExists = false
      }

      if (this.$route.name === 'index') {
        this.$router.go(0)
      } else if (historyExists) {
        this.$router.go(-1)
      } else {
        this.$router.push('/')
      }
    },
  },
}
</script>

<style lang="scss">
.nav-bg {
  -webkit-backdrop-filter: saturate(180%) blur(5px);
  backdrop-filter: saturate(180%) blur(5px);
}
</style>
