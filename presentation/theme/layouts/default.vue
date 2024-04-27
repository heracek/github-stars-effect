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
  <div
    class="slidev-layout slidev-layout-grid text-left default-slide"
    :style="style"
  >
    <div>
      <slot></slot>
    </div>
  </div>
</template>

<style></style>
