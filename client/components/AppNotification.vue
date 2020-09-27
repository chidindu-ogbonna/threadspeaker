<template>
  <client-only>
    <notifications :duration="5000" position="top right">
      <template slot="body" slot-scope="props">
        <!-- props.item.type ? success|warn|error|info -->
        <div
          class="p-3 my-2 border-l-4 rounded-full shadow-md"
          :class="[
            props.item.type === 'error' ? 'bg-red-500' : 'bg-primary-text',
          ]"
        >
          <div class="flex justify-between">
            <div
              :class="[props.item.text ? 'items-start' : 'items-center']"
              class="flex justify-start"
            >
              <div class="mr-2">
                <info-icon
                  class="w-6 h-6"
                  :class="[
                    props.item.type === 'error'
                      ? 'text-white'
                      : 'text-gray-600',
                  ]"
                ></info-icon>
              </div>
              <div class="text-gray-100">
                <div v-if="props.item.title" class="text-sm">
                  {{ props.item.title }}
                </div>
                <div v-if="props.item.text" class="text-xs">
                  {{ props.item.text }}
                </div>
              </div>
            </div>
            <a class="pr-2 cursor-pointer" @click="props.close">
              <x-icon class="w-4 h-4 text-gray-200"></x-icon>
            </a>
          </div>
        </div>
      </template>
    </notifications>
  </client-only>
</template>

<script>
import InfoIcon from '@/assets/svg/info-circle.svg?inline'
import XIcon from '@/assets/svg/x.svg?inline'

export default {
  components: { XIcon, InfoIcon },
}
</script>
