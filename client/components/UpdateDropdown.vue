<template>
  <!-- eslint-disable vue/no-v-html -->
  <div id="updates">
    <div class="py-1 text-sm font-bold text-center border-b border-gray-400">
      Updates
    </div>
    <div v-for="(update, i) in updates" :key="i" class="py-2 text-sm">
      <span
        class="px-2 mr-2 text-xs text-white capitalize rounded-full"
        :class="[update.status === 'new' ? 'bg-primary' : 'bg-red-500']"
      >
        {{ update.status }}
      </span>
      <span class="text-primary-secondary" v-html="update.message"></span>
    </div>
  </div>
</template>

<script>
import { updates } from '@/updates'

export default {
  data() {
    return {
      updates,
    }
  },
}
</script>
