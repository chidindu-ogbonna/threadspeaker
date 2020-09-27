<template>
  <div class="relative">
    <slot name="trigger"></slot>
    <button
      v-if="hasBackground"
      tabindex="-1"
      class="fixed inset-0 w-full h-full bg-gray-300 bg-opacity-50 cursor-default"
    ></button>
    <div
      v-if="showDropdown"
      class="absolute top-0 right-0 w-64 px-4 py-2 mt-8 bg-white rounded-md shadow-md"
    >
      <slot name="dropdown"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    showDropdown: {
      type: Boolean,
      required: true,
    },

    hasBackground: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
}
</script>
