<template>
  <div class="carousel_viewport" :style="carouselStyles">
    <ol ref="trackRef" class="carousel_track" :style="trackStyle">
      <slot></slot>
    </ol>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue";

type Props = {
  carouselHeight: number;
};

const { carouselHeight } = defineProps<Props>();
const model = defineModel<number>();
const trackRef = ref<HTMLElement | null>(null);
const slideWidth = ref(0);

const trackStyle = computed(() => ({
  transform: `translateX(-${model.value! * slideWidth.value}px)`,
}));

const carouselStyles = computed(() => ({
  height: `${carouselHeight}px`,
}));

onMounted(() => {
  if (trackRef.value && trackRef.value.children.length) {
    slideWidth.value = trackRef.value.children[0].clientWidth;
  }
});
</script>

<style lang="scss" scoped>
.carousel {
  &_viewport {
    height: auto;
    overflow: hidden;
  }

  &_track {
    height: 100%;
    display: flex;
    gap: 0.01rem;
    position: relative;
    transition: 0.2s transform ease-out;
  }
}
</style>
