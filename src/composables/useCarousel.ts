import { ref } from 'vue';

export const useCarousel = () => {
  const currentSlideIndex = ref<number>(0);

  function setSlide(index: number) {
    currentSlideIndex.value = index;
  }
  function prevSlide() {
    currentSlideIndex.value--;
  }
  function nextSlide() {
    currentSlideIndex.value++;
  }

  return {
    currentSlideIndex,

    setSlide,
    prevSlide,
    nextSlide,
  };
};
