<script
    lang="ts"
    setup
>
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  name: string;
  prefix?: string;
  color?: string;
  width?: string;
  height?: string;
}>(), {
  prefix: 'icon',
  color: '#fff',
  width: '1em',
  height: '1em'
})

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<template>
  <svg
      aria-hidden="true"
      :width="width"
      :height="height"
  >
    <use
        :xlink:href="symbolId"
        :fill="color"
    />
  </svg>
</template>
