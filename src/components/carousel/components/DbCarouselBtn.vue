<template>
  <div :class="`carousel_btn carousel_btn--${direction}`" @click="clickFn">
    <div class="carousel_btn_icon">
      <db-svg-icon :icon="`carousel_${direction}`" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { DbSvgIcon } from "@/components/ui";

type Props = {
  prev?: boolean;
  next?: boolean;
};

type Emits = {
  click: [];
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const clickFn = () => emit("click");

const direction = computed(() => (props.prev ? "prev" : props.next ? "next" : "default"));
</script>

<style lang="scss" scoped>
.carousel_btn {
  position: absolute;
  width: 3.5rem;
  height: calc(100% - 5.4rem);
  top: 2.7rem;
  display: flex;
  justify-content: center;
  align-items: center;

  &_icon {
    display: none;
    height: 9rem;
    width: 50%;

    & svg {
      width: 100%;
      height: 100%;
    }
  }

  &--prev {
    left: 0;
    border-radius: 0 1.15rem 1.15rem 0;
  }
  &--next {
    right: 0;
    border-radius: 1.15rem 0 0 1.15rem;
  }

  &:hover {
    background-color: var(--nav_btn_color);
    cursor: pointer;

    & .carousel_btn_icon {
      display: block;
    }
  }
}

:deep(svg path) {
  stroke: var(--body_bg);
}
</style>
