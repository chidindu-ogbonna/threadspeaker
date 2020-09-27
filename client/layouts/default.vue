<template>
  <div>
    <app-navbar></app-navbar>
    <div
      class="min-h-screen px-4 py-8 mx-auto my-16 md:px-16 lg:px-4 text-primary-text"
      :class="[$route.name === 'index' ? 'max-w-screen-md' : 'max-w-screen-lg']"
    >
      <Nuxt keep-alive :keep-alive-props="{ exclude: ['Thread', 'Search'] }" />
    </div>
    <app-footer></app-footer>
    <app-notification></app-notification>
  </div>
</template>

<style></style>
