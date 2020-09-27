<template>
  <!-- eslint-disable vue/no-v-html -->
  <div
    class="relative flex flex-col items-start min-h-screen md:px-8 lg:px-16 lg:flex-row"
  >
    <!-- Player -->
    <div class="sticky z-20 w-full lg:w-1/3" style="top: 50px">
      <player-loader v-if="!audioCanPlay"></player-loader>
      <div class="bg-white rounded-md shadow-md">
        <div class="flex items-start px-2 py-4 mb-4 text-sm">
          <div class="mr-4">
            <img
              class="object-contain w-12 h-12 rounded-full"
              :src="thread.author.profile_image_url_https"
              :alt="thread.author.screen_name"
              @error="setFallbackImageUrl"
            />
          </div>
          <div class="text-sm">
            <div class="ts-truncate ts-truncate-1">
              {{ thread.author.name }}
            </div>
            <div class="text-primary-secondary ts-truncate ts-truncate-1">
              @{{ thread.author.screen_name }}
            </div>
          </div>
        </div>
        <div class="relative flex items-center justify-start mb-4">
          <div :style="`width: ${elapsedTime}%`" class="seeker"></div>
          <div
            class="absolute right-0 z-10 flex items-center justify-between w-full px-4"
          >
            <div class="text-xs">
              {{ $options.filters.formattedAudioTime(audioCurrentTime) }}
            </div>
            <div
              class="absolute left-0 right-0 flex items-center justify-center"
            >
              <button
                v-ripple.click
                class="relative p-2 focus:outline-none"
                @click="rewindAudio"
              >
                <rewind-icon class="w-8 h-8 text-gray-800"></rewind-icon>
              </button>
              <button
                v-ripple.click
                class="relative p-2 focus:outline-none"
                @click="togglePlayingState"
              >
                <template v-if="!audioPlaying">
                  <play-icon class="w-16 h-16 text-gray-800"></play-icon>
                </template>
                <template v-else>
                  <div
                    class="flex items-center justify-center w-16 h-16 bg-gray-800 rounded-full"
                  >
                    <pause-icon class="w-8 h-8 text-gray-100"></pause-icon>
                  </div>
                </template>
              </button>
              <button
                v-ripple.click
                class="relative p-2 focus:outline-none"
                @click="fastforwardAudio"
              >
                <fast-forward-icon
                  class="w-8 h-8 text-gray-800"
                ></fast-forward-icon>
              </button>
            </div>

            <div class="text-xs">
              {{ $options.filters.formattedAudioTime(audioDuration) }}
            </div>
          </div>
        </div>

        <div class="px-2 py-4">
          <div class="flex items-center">
            <a
              v-ripple.mouseover
              class="px-2 text-sm text-primary"
              :href="originalTweetURL"
              target="_blank"
              rel="noopener"
            >
              View on Twitter
            </a>
            <span class="text-gray-300">&bull;</span>
            <!-- <div class="px-2 text-sm">
              {{ $options.filters.formatDate(new Date(threadCreatedAt)) }}
            </div> -->
            <button v-ripple.click class="p-2 focus:outline-none">
              <bookmark-icon class="w-8 h-8 text-gray-500"></bookmark-icon>
            </button>
            <span class="text-gray-300">&bull;</span>
            <button
              v-if="canUseNativeShare"
              v-ripple.click
              class="p-2 focus:outline-none"
              @click="shareWithNative"
            >
              <send-icon class="w-8 h-8 text-primary"></send-icon>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Thread -->
    <div class="w-full py-8 md:px-16 lg:w-2/3 md:py-0">
      <div class="pb-4 sm:px-4">
        <template v-if="thread.oembed && thread.oembed.length">
          <div v-for="(oembed, index) in thread.oembed" :key="index">
            <div class="mb-8" v-html="oembed"></div>
          </div>
        </template>
        <template v-else>
          <div v-for="(thread, index) in thread.thread" :key="index">
            <div class="mb-4" v-html="thread.full_text"></div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { toDateTime } from '@/utils/store'
import PlayIcon from '@/assets/svg/play.svg?inline'
import RewindIcon from '@/assets/svg/rewind.svg?inline'
import FastForwardIcon from '@/assets/svg/fast-forward.svg?inline'
import PauseIcon from '@/assets/svg/pause.svg?inline'
import BookmarkIcon from '@/assets/svg/bookmark.svg?inline'
import SendIcon from '@/assets/svg/send.svg?inline'

export default {
  name: 'Thread',

  components: {
    PlayIcon,
    PauseIcon,
    FastForwardIcon,
    RewindIcon,
    BookmarkIcon,
    SendIcon,
  },

  filters: {
    formattedAudioTime(time) {
      const minutes = Math.floor(time / 60)
      const seconds = time - minutes * 60
      return `${minutes}:${Math.round(seconds)}`
    },
  },

  async asyncData({ store, params, error }) {
    const { thread: threadId } = params
    try {
      const thread = await store.dispatch('threads/getThread', { threadId })
      let previewImage

      if (thread.preview_image) {
        previewImage = thread.preview_image
      } else {
        // Use default card image
        previewImage =
          'https://res.cloudinary.com/cheapflix/image/upload/v1600531602/threadspeaker/card.png'
      }
      return { thread, previewImage }
    } catch (err) {
      error(err)
    }
  },

  data() {
    return {
      audioURL: '',
      audioElement: null,
      audioCanPlay: true,
      audioPlaying: null,
      audioDuration: 0,
      audioCurrentTime: 0,
      canUseNativeShare: false,
    }
  },

  computed: {
    threadCreatedAt() {
      return toDateTime(this.thread.thread[0].created_at)
    },

    elapsedTime() {
      return (this.audioCurrentTime / this.audioDuration) * 100
    },

    fullURL() {
      if (process.client) {
        return window.location.href
      } else {
        return `https://threadspeaker.app/${this.thread.id}/`
      }
    },

    originalTweetURL() {
      return `https://twitter.com/${this.thread.author.screen_name}/status/${this.thread.thread[0].id_str}`
    },

    pageTitle() {
      return `Thread by ${this.thread.author.name} - @${this.thread.author.screen_name}`
    },

    pageDescription() {
      return this.thread.thread[0].full_text.split('.')[0]
    },
  },

  watch: {
    audioCanPlay(value) {
      if (value) this.$notify({ title: 'Your Audio is Ready' })
    },
  },

  async mounted() {
    if (navigator.share) {
      this.canUseNativeShare = true
    }

    const audioURL = await this.$store
      .dispatch('threads/downloadThreadAudio', {
        thread: this.thread,
      })
      .catch((error) => {
        let errorTitle
        if (error.code === 'storage/object-not-found')
          errorTitle = 'Audio File Not Found'

        if (error.code === 'storage/unauthorized')
          errorTitle = 'Permission Denied'

        if (!errorTitle) errorTitle = 'An Error Occurred'

        this.$notify({ type: 'error', title: errorTitle })
      })

    const audioElement = new Audio(audioURL)
    this.audioElement = audioElement

    audioElement.addEventListener('canplaythrough', this.onAudioCanPlayThrough)
    audioElement.addEventListener('loadeddata', this.onAudioLoaded)
    audioElement.addEventListener('timeupdate', this.onAudioTimeUpdate)
    audioElement.addEventListener('ended', this.onAudioEnded)

    this.$on('hook:beforeDestroy', () => {
      if (this.audioPlaying) this.audioElement.pause()
    })

    this.$on('hook:destroyed', () => {
      audioElement.addEventListener(
        'canplaythrough',
        this.onAudioCanPlayThrough
      )
      audioElement.removeEventListener('loadeddata', this.onAudioLoaded)
      audioElement.removeEventListener('timeupdate', this.onAudioTimeUpdate)
      audioElement.removeEventListener('ended', this.onAudioEnded)
    })
  },

  methods: {
    rewindAudio() {
      this.audioElement.currentTime -= 10
      this.$store.dispatch('log/threadEvent', {
        action: 'user_rewind_audio',
        label: `${this.thread.id} @ ${this.elapsedTime}`,
      })
    },

    fastforwardAudio() {
      this.audioElement.currentTime += 10
      this.$store.dispatch('log/threadEvent', {
        action: 'user_fastforward_audio',
        label: `${this.thread.id} @ ${this.elapsedTime}`,
      })
    },

    togglePlayingState() {
      if (this.audioElement) {
        if (this.audioElement.paused) {
          this.audioElement
            .play()
            .then(() => {
              this.audioPlaying = true
              this.$store.dispatch('log/threadEvent', {
                action: 'user_played_audio',
                label: `${this.thread.id} @ ${this.elapsedTime}`,
              })
            })
            .catch((error) => {
              const context = {
                fatal: true,
                error,
                action: 'user_play_failed',
              }
              this.$store.dispatch('log/error', context)
            })
        } else {
          this.audioElement.pause()
          this.audioPlaying = false
          this.$store.dispatch('log/threadEvent', {
            action: 'user_paused_audio',
            label: `${this.thread.id} @ ${this.elapsedTime}`,
          })
        }
      }
    },

    onAudioCanPlayThrough() {
      this.audioCanPlay = true
    },

    onAudioLoaded() {
      this.audioCanPlay = false
      this.audioDuration = this.audioElement.duration
    },

    onAudioTimeUpdate() {
      this.audioCurrentTime = this.audioElement.currentTime
    },

    onAudioEnded() {
      this.audioPlaying = false
      this.$store.dispatch('log/threadEvent', {
        action: 'user_finished_audio',
        label: this.thread.id,
      })
    },

    shareWithNative() {
      const { id: label } = this.thread
      const context = { action: 'user_clicked_share', label }
      this.$store.dispatch('log/threadEvent', context)

      return navigator
        .share({
          title: `Listen to this twitter thread by ${this.thread.author.screen_name}`,
          url: this.fullURL,
        })
        .then((value) => {
          context.action = 'user_completed_share'
          this.$store.dispatch('log/threadEvent', context)
        })
        .catch((error) => {
          const context = { fatal: false, error, action: 'user_failed_share' }
          this.$store.dispatch('log/error', context)
        })
    },

    setFallbackImageUrl(event) {
      event.target.src = require(`~/assets/svg/fallback.svg`)
    },
  },

  head() {
    return {
      title: this.pageTitle,
      meta: [
        {
          hid: 'twitter:title',
          name: 'twitter:title',
          content: this.pageTitle,
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: this.pageTitle,
        },
        {
          hid: 'description',
          name: 'description',
          content: this.pageDescription,
        },
        {
          hid: 'twitter:description',
          name: 'twitter:description',
          content: this.pageDescription,
        },
        {
          hid: 'og:description',
          property: 'og:description',
          content: this.pageDescription,
        },
        {
          hid: 'twitter:image',
          name: 'twitter:image',
          content: this.previewImage,
        },
        {
          hid: 'og:image',
          property: 'og:image',
          content: this.previewImage,
        },
      ],
      script: [
        {
          src: 'https://platform.twitter.com/widgets.js',
          charset: 'utf-8',
          async: true,
        },
      ],
    }
  },
}
</script>

<style style="scss">
.twitter-tweet {
  margin-left: auto;
  margin-right: auto;
}
</style>
