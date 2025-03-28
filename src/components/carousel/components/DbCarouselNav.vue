<template>
  <div class="carousel_navigation navigation">
    <div
      v-for="(slide, index) in slides"
      :key="index"
      :title="slide.title"
      class="navigation_item"
      :class="{ active: index === activeSlide }"
      @click="$emit('click', index)"
    ></div>
  </div>
</template>

<script lang="ts" setup>
import { TSlide } from "@/types";

type Props = {
  slides: TSlide[];
  activeSlide: number;
};

type Emits = {
  click: [slideIndex: number];
};

defineProps<Props>();
defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.navigation {
  padding: 1rem;
  display: flex;
  align-items: center;
  column-gap: 1rem;

  &_item {
    background: var(--footer_navigation_bg);
    height: 0.7rem;
    width: 0.7rem;
    border-radius: 50%;

    &:hover {
      cursor: pointer;
    }

    &.active {
      background: var(--footer_navigation_active_bg);
    }
  }
}
</style>
