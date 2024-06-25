<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: './theme/bgs/intro.png',
  },
  backgroundSize: { default: 'cover' },
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
  <div class="slidev-layout cover text-left" :style="style">
    <div class="my-auto w-100">
      <slot name="date"></slot>
      <div class="pb-14">
        <slot name="title"></slot>
      </div>
      <div class="leading-line">
        <slot name="description"></slot>
      </div>
    </div>
  </div>
</template>

<style></style>
