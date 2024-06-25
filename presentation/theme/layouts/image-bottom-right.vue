<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: './theme/bgs/line-bg.png',
  },
  image: {
    default: '',
  },
  backgroundSize: { default: 'cover' },
  withLogo: { default: false },
  logoPosition: { default: 'left' },
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
    <div class="my-auto w-80">
      <slot></slot>
    </div>
    <template v-if="props.image">
      <img class="img-bottom-right" :src="`/${props.image}`" />
    </template>
  </div>
</template>

<style>
.img-bottom-right {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 31rem;
  height: 27rem;
  border-top-left-radius: 1.5rem;
  object-fit: cover;
}
</style>
