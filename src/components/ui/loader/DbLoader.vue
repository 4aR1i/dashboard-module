<template>
  <div class="loader">
    <div class="loader_spinner">
      <div :size="size" :style="styleRing"></div>
      <div :size="size" :style="styleRing"></div>
      <div :size="size" :style="styleRing"></div>
      <div :size="size" :style="styleRing"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
type Props = {
  color?: string;
  size?: number;
};

const { color = '#067bcb', size = 2 } = defineProps<Props>();

const styleRing = computed(() => ({
  border: `0.2rem solid ${color}`,
  borderColor: `${color} transparent transparent transparent`,
  width: `${size}rem`,
  height: `${size}rem`,
}));
</script>

<style lang="scss" scoped>
.loader {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  &_spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    height: 100%;
    width: 100%;

    & div {
      display: block;
      position: absolute;
      border-radius: 50%;
      animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      &:nth-child(1) {
        animation-delay: -0.45s;
      }
      &:nth-child(2) {
        animation-delay: -0.3s;
      }
      &:nth-child(3) {
        animation-delay: -0.15s;
      }
    }
  }
}

@keyframes spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
