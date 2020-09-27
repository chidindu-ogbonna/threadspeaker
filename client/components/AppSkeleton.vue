<template>
  <div class="skeleton" :style="skeletonStyle"></div>
</template>

<script>
export default {
  props: {
    height: {
      type: String,
      required: false,
      default: '80',
    },
  },

  computed: {
    skeletonStyle() {
      return {
        height: `${this.height}px`,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.skeleton {
  border-color: #edf2f7 !important;
  background: #edf2f7;
  animation: 0.8s linear infinite alternate animation-fadeInfadeOut;
  @apply rounded-md opacity-75 shadow-none bg-clip-padding cursor-default text-transparent pointer-events-none select-none;
}

@keyframes animation-fadeInfadeOut {
  0% {
    border-color: #edf2f7;
    background: #edf2f7;
  }
  100% {
    border-color: #c8d1de;
    background: #c8d1de;
  }
}
</style>
