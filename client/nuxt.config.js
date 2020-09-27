/* eslint-disable nuxt/no-cjs-in-config */
require('dotenv').config()
const { meta, splashScreens, icons } = require('./nuxt-attrs')

const server = { timing: false }

const isProd = process.env.APP_MODE === 'production'
const isDev = process.env.APP_MODE === 'development'

// Use the default settings for staging (GAE)
if (isProd) {
  // Required for Cloud Run
  server.host = '0.0.0.0'
  server.port = 3000
}
if (isDev) {
  server.host = 'localhost'
  server.port = 3000
}

export default {
  target: 'server',

  head: {
    title: 'ThreadSpeaker - Listen to your favourite twitter threads',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'theme-color', content: '#007aff' },
      ...meta,
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      {
        href: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
        rel: 'stylesheet',
      },
      ...splashScreens,
      ...icons,
    ],
  },

  css: ['@/assets/css/main.scss', '@/assets/css/transitions.scss'],

  loading: {
    color: '#007aff',
    height: '2px',
  },

  plugins: [
    { src: '@/plugins/filters.js' },
    { src: '@/plugins/vee-validate.js' },
    { src: '@/plugins/vue-gtag.js', mode: 'client' },
    { src: '@/plugins/v-ripple.js', mode: 'client' },
    { src: '@/plugins/vue-notification.js', mode: 'client' },
  ],

  components: true,

  buildModules: [
    '@nuxtjs/svg',
    '@nuxtjs/eslint-module',
    '@nuxtjs/tailwindcss',
    '@nuxtjs/dotenv',
  ],

  modules: ['@nuxtjs/pwa'],

  pwa: {
    manifest: {
      name: 'ThreadSpeaker',
      short_name: 'ThreadSpeaker',
      description: 'Listen to your favourite twitter threads',
      start_url: '/?standalone=true',
      display: 'standalone',
      theme_color: '#007aff',
      background_color: '#ffffff',
      useWebmanifestExtension: false,
    },
    icon: {
      // XXX: Remember to burst the pwa cache to update icons
      // rm -rf node_modules/.cache/pwa/icon
      source: '/icon.png',
    },
  },

  build: {
    transpile: ['vee-validate/dist/rules'],
  },

  server,
}
