<template>
  <li class="carousel_slide" :class="{ 'carousel_slide--edit': isEdit }">
    <slot></slot>
  </li>
</template>

<script lang="ts" setup>
import { computed } from 'vue';

type Props = {
  isEdit: boolean;
  cellWidth: number;
  cellHeight: number;
};

const { isEdit, cellWidth, cellHeight } = defineProps<Props>();

const cellWidthStyle = computed(() => cellWidth + '%');
const cellHeightStyle = computed(() => cellHeight + '%');
</script>

<style lang="scss" scoped>
.carousel_slide {
  position: relative;
  height: auto;
  width: 100%;
  flex-shrink: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 1.15rem;
  overflow: hidden;

  &--edit {
    outline: 0.08rem solid var(--grid_lines_color);
    outline-offset: -0.08rem;
    background: repeating-linear-gradient(
        to bottom,
        transparent 0,
        transparent calc(v-bind(cellHeightStyle) - 0.08rem),
        var(--grid_lines_color) calc(v-bind(cellHeightStyle) - 0.08rem),
        var(--grid_lines_color) v-bind(cellHeightStyle)
      ),
      repeating-linear-gradient(
        to right,
        transparent 0,
        transparent calc(v-bind(cellWidthStyle) - 0.08rem),
        var(--grid_lines_color) calc(v-bind(cellWidthStyle) - 0.08rem),
        var(--grid_lines_color) v-bind(cellWidthStyle)
      );
  }
}
</style>
