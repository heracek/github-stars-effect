<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: './theme/bgs/wawy1.png',
  },
  backgroundSize: { default: 'cover' },
  withLogo: { default: true },
  logoPosition: { default: 'right' },
  textPosition: { default: 'center' },
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
  <div class="slidev-layout slidev-layout-grid text-left" :style="style">
    <div
      class="my-auto text-center center-slide"
      :class="{ 'left-slide': props.textPosition === 'left' }"
    >
      <slot></slot>
    </div>
  </div>
</template>

<style>
.center-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;

  ul,
  pre,
  ol,
  .monaco-editor {
    text-align: left;
  }
}

.left-slide {
  align-items: flex-start;
  text-align: left;
}
</style>
