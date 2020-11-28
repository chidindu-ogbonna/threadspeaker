<template>
  <div class="fade-in-top">
    <div class="flex items-center justify-between w-full mb-8">
      <div class="flex items-center">
        <app-logo class="w-12 h-12 mr-4"></app-logo>
        <span class="text-xl"> @threadspeaker </span>
      </div>

      <n-link
        class="flex items-center justify-center w-10 h-10 transition-all duration-500 ease-in-out transform bg-gray-800 rounded-full hover:scale-105 hover:-translate-y-1"
        to="/"
      >
        <x-icon class="w-6 h-6 text-gray-100"></x-icon>
      </n-link>
    </div>

    <div class="max-w-screen-md px-2 mx-auto text-base md:text-xl">
      <div class="flex items-center mb-4">
        <h1 class="text-4xl font-bold">Hello</h1>
        <img src="~/assets/images/alien.png" class="w-12 h-12 ml-2" />
      </div>

      <a
        href="https://github.com/chidindu-ogbonna/threadspeaker"
        class="inline-flex items-center mb-4 text-base text-gray-600 cursor-pointer hover:text-primary"
      >
        <span class="text-5xl">*</span>

        Source code on Github
        <github-icon class="w-5 h-5 ml-2"></github-icon>
      </a>

      <div class="mb-4">
        My name is ThreadSpeaker. I make twitter threads talk 😈. Created by my
        lord and personal saviour
        <a
          :href="`https://twitter.com/intent/user?screen_name=chidinduogbonna`"
          target="_blank"
          rel="noopener"
          class="inline-block text-primary"
        >
          @chidinduogbonna
        </a>
      </div>

      <div class="mb-8">
        <h2 class="mb-2 text-2xl font-bold">What I Do</h2>
        <p class="mb-2">
          I was built, to remove the hassle of reading
          <twitter-icon
            class="inline-block w-6 h-6 text-primary"
          ></twitter-icon>
          twitter threads from your faves on twitter. I mean, what are airpods
          for 🥱
        </p>
        <p>If books can be listened to, then twitter threads should be too.</p>
      </div>

      <div class="mb-8">
        <h2 class="mb-2 text-2xl font-bold">Summary of How I Function</h2>
        <p class="mb-4">
          Built completely with NodeJs, I'm completely built on Google Cloud
          Platform
        </p>
        <ul class="mb-4">
          <li class="mb-4">
            <b>Hosting - </b>This site you're on is containerized using Docker
            and deployed to Cloud Run
          </li>
          <li class="mb-4">
            <b>Speech Synthesis - </b>Tweets are converted to audio using Cloud
            Text-To-Speech (WaveNet). More on this later 😉
          </li>
          <li class="mb-4">
            <b>Retrieving Twitter Mentions - </b> Using Cloud Scheduler, a Cloud
            Function is scheduled to run every 1 minute, requesting tweets
            directed at me through the Twitter API
          </li>
          <li>
            <b>Replying Tweets - </b> I reply to tweets using Cloud Functions
            but my replies are first added to a queue (Cloud Tasks) and sent at
            a scheduled time. This enables me to handle retries when errors
            occur or rate-limits are reached.
          </li>
        </ul>
        <!-- <p class="mb-2">
          making use of Cloud Functions, Cloud PubSub, Cloud Scheduler, Cloud
          Tasks & Cloud Text-To-Speech
          <a
            href="https://deepmind.com/blog/article/wavenet-generative-model-raw-audio"
            target="_blank"
            rel="noopener"
            class="inline-block underline"
          >
            (WaveNet)
          </a>
        </p> -->
        <p>
          My master will break down how this works sometime later, so follow me
          <a
            :href="`https://twitter.com/intent/user?screen_name=threadspeaker`"
            target="_blank"
            rel="noopener"
            class="inline-block text-primary"
          >
            @threadspeaker
          </a>
          to stay updated 😁
        </p>
      </div>

      <div class="mb-8">
        Hope you enjoy the work I do. My master has made me happy, it's my duty
        to make you happy ❤️
      </div>

      <div class="mb-8">
        Do you have a question? Hit up
        <a
          :href="`https://twitter.com/intent/user?screen_name=chidinduogbonna`"
          target="_blank"
          rel="noopener"
          class="inline-block text-primary"
        >
          @chidinduogbonna
        </a>
      </div>

      <div>
        <p>Cheers,</p>
        <p>
          <a
            :href="`https://twitter.com/intent/user?screen_name=threadspeaker`"
            target="_blank"
            rel="noopener"
            class="inline-block text-primary"
          >
            @threadspeaker
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import XIcon from '@/assets/svg/x.svg?inline'
import TwitterIcon from '@/assets/svg/twitter.svg?inline'
import GithubIcon from '@/assets/svg/github.svg?inline'

export default {
  layout: 'bare',
  name: 'About',

  components: {
    XIcon,
    TwitterIcon,
    GithubIcon,
  },
}
</script>
