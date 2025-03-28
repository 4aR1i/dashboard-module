<template>
  <div class="grid_item" :style="gridItemStyles">
    <div class="grid_item_content">
      <slot></slot>
      <slot name="action"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { TWidget } from "@/types";

type Props = {
  widget: TWidget;
  cellWidth: number;
  cellHeight: number;
};

const { widget, cellWidth, cellHeight } = defineProps<Props>();

const gridItemStyles = computed(() => ({
  top: `${cellHeight * widget.y}%`,
  left: `${cellWidth * widget.x}%`,
  width: `${cellWidth * widget.width}%`,
  height: `${cellHeight * widget.height}%`,
}));
</script>

<style lang="scss" scoped>
.grid_item {
  position: absolute;
  z-index: 1;

  &[draggable="true"] {
    cursor: pointer;
  }

  &_content {
    position: absolute;
    inset: 0.3rem;
    border-radius: 1.15rem;
    overflow: hidden;
  }
}
</style>
