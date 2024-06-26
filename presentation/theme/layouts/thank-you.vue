<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: './theme/bgs/thanks.jpeg',
  },
  backgroundSize: { default: 'cover' },
  withLogo: { default: false },
});

const style = computed(() =>
  handleBackground(props.background, props.backgroundSize, props.withLogo),
);
</script>

<template>
  <div class="slidev-layout cover text-left" :style="style">
    <div class="my-auto text-center center-slide pt-80">
      <slot></slot>
    </div>
  </div>
</template>

<style></style>
