<template>
  <div class="mx-auto">
    <div class="excalidraw" v-html="svg"></div>
  </div>
</template>
<script setup>
// base on: https://github.com/slidevjs/slidev/discussions/967

import { onMounted, ref } from 'vue';
import { exportToSvg } from '@excalidraw/excalidraw';

const props = defineProps(['src', 'fullscreen', 'exportPadding', 'darkMode']);

const svg = ref();

onMounted(async () => {
  if (props.src) {
    let excalidrawResponse = await fetch(props.src);
    const jsonData = await excalidrawResponse.json();

    jsonData.appState.exportWithDarkMode = props.darkMode ?? false;
    jsonData.exportPadding = props.exportPadding ?? 0;

    let svgObj = await exportToSvg(jsonData);
    let html = svgObj.outerHTML;

    if (props.fullscreen) {
      html = html
        .replace(/width="[^"]*"/, 'width=868px')
        .replace(/height="[^"]*"/, 'height=472px');
    } else {
      html = html.replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '');
    }

    svg.value = html;
  }
});
</script>
<style>
.excalidraw svg {
  @apply mx-auto;
}
</style>
