<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: '#f3f3f3',
  },
  withLogo: { default: true },
  logoPosition: { default: 'right' },
});

const style = computed(() =>
  handleBackground(
    props.background,
    props.backgroundSize,
    props.withLogo,
    props.logoPosition,
  ),
);
</script>

<template>
  <div class="slidev-layout text-left" :style="style">
    <div class="above-columns">
      <slot name="top"></slot>
    </div>
    <div class="grid-cols-2 d-grid">
      <div>
        <slot name="left"></slot>
      </div>
      <div>
        <slot name="right"></slot>
      </div>
    </div>
    <slot name="bottom"></slot>
  </div>
</template>

<style>
.above-columns h1:last-child {
  margin-bottom: 0rem;
}

.above-columns:has(+ .d-grid) {
  margin-bottom: 1rem;
}
</style>
