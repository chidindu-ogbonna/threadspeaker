<template>
  <validation-observer v-slot="{ handleSubmit }">
    <form @submit.prevent="handleSubmit(handleSearch)">
      <div class="w-full text-left">
        <label class="text-primary-secondary" :for="name"> {{ label }} </label>
        <validation-provider v-slot="{ errors }" :name="name" :rules="rules">
          <div
            class="flex items-center bg-white border rounded-md border-primary"
          >
            <input
              v-model="query"
              v-bind="$attrs"
              :value="value"
              :autocomplete="autocomplete"
              :autofocus="autofocus"
              :name="name"
              :type="type"
              class="w-full p-2 rounded-md appearance-none text-primary-text focus:outline-none"
              :placeholder="placeholder"
            />
            <button
              v-ripple.click
              class="mx-1 shadow-lg btn btn__primary focus:outline-none"
              type="submit"
            >
              Search
            </button>
          </div>
          <span class="text-xs text-red-500"> {{ errors[0] }} </span>
        </validation-provider>
      </div>
    </form>
  </validation-observer>
</template>

<script>
export default {
  name: 'AppTextInput',
  props: {
    value: {
      type: [String],
      default: '',
    },
    rules: {
      type: [String, Object],
      default: '',
    },
    name: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'text',
    },
    autocomplete: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '',
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  },

  data() {
    return {
      query: '',
    }
  },

  mounted() {
    this.query = this.value
  },

  methods: {
    handleSearch() {
      this.$emit('submit', this.query)
    },
  },
}
</script>
