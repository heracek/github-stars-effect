<script setup lang="ts">
import { computed } from 'vue';
import { handleBackground } from '../layoutHelper';

const props = defineProps({
  background: {
    default: './theme/bgs/top-right.png',
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
    <div class="my-auto w-100">
      <slot></slot>
    </div>
    <template v-if="props.image">
      <img class="img-right" :src="`/${props.image}`" />
    </template>
  </div>
</template>

<style>
.img-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 27rem;
  height: 30rem;
  border-bottom-left-radius: 1.5rem;
  object-fit: cover;
}
</style>
