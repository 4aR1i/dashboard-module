<template>
  <div class="dashboard">
    <div v-if="slides.length" class="dashboard_carousel">
      <div ref="carouselRef" class="carousel">
        <DbCarouselHeader
          :is-edit="isEdit"
          :slide="slides[currentSlideIndex]"
          :disabled="isLoading"
          @toggle="toggleEditMode"
          @cancel="cancel"
          @add="add"
          @save="save"
          @set-slide="setSlide"
        />
        <DbCarousel v-model="currentSlideIndex" :carousel-height="gridHeight">
          <DbCarouselSlide
            v-for="(slide, slideIndex) in slides"
            :key="slideIndex"
            :is-edit="isEdit"
            :cell-width="cellWidthPercent"
            :cell-height="cellHeightPercent"
          >
            <div v-if="isLoading" class="carousel_loader">
              <db-loader />
            </div>
            <DbGrid @drop="onDrop" @dragover.prevent @dragenter.prevent>
              <DbGridItem
                v-for="(widget, widgetIndex) in widgetsBySlide[slide.id]"
                :key="widgetIndex"
                :widget="widget"
                :cell-width="cellWidthPercent"
                :cell-height="cellHeightPercent"
                :draggable="isEdit"
                @dragstart="dragStart($event, widget, isEdit)"
                @drag="drag($event, widget)"
                @dragend="dragEnd"
              >
                <div class="widget">
                  <div v-if="isEdit" class="widget_action" @click="removeWidget(widget.id)">
                    <db-svg-icon icon="delete" />
                  </div>
                  <slot :name="widget.component">{{ widget.title }}</slot>
                </div>
              </DbGridItem>
            </DbGrid>
          </DbCarouselSlide>
        </DbCarousel>
        <DbCarouselNav :slides="slides" :active-slide="currentSlideIndex" @click="setSlide" />
        <DbCarouselBtn v-if="currentSlideIndex !== 0" prev @click="prevSlide" />
        <DbCarouselBtn v-if="currentSlideIndex < slides.length - 1" next @click="nextSlide" />
      </div>
    </div>
    <DbBottomPanel
      v-if="isEdit"
      :services="services"
      :added-widgets="addedWidgets"
      @drag="drag"
      @start="dragStart"
      @end="dragEnd"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from "vue";
import { TService, TSlide, TWidget } from "@/types";
import { DbCarousel, DbCarouselSlide, DbCarouselHeader, DbCarouselNav, DbCarouselBtn } from "@/components/carousel";
import { DbGrid, DbGridItem } from "@/components/grid";
import { DbBottomPanel } from "@/components/bottom-panel";
import { DbLoader, DbSvgIcon } from "@/components/ui";
import { useCarousel, useGridDnd, useGridSettings, useSlidesAndWidgets, useTheme } from "@/composables";

type Props = {
  isLoading: boolean;
  slides: TSlide[];
  widgets: TWidget[];
  services: TService[];
};

type Emits = {
  save: [dashboardEdits: any];
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();
useTheme();

const {
  slides,
  widgets,
  widgetsBySlide,
  addedWidgets,
  activeSlideIndex,

  addSlide,
  removeWidget,
  addWidget,
  updateWidget,
  saveDashboard,
  cancelEditing,
} = useSlidesAndWidgets({ slides: props.slides, widgets: props.widgets });
const { currentSlideIndex, setSlide, prevSlide, nextSlide } = useCarousel();

const carouselRef = ref<HTMLElement | null>(null);
const isEdit = ref(false);
const initialSlideIndex = ref(currentSlideIndex.value);

const currentSlide = computed(() => slides.value[currentSlideIndex.value]);
const slidesCount = computed(() => slides.value.length);

const { cellWidthPercent, cellHeightPercent, gridHeight } = useGridSettings(carouselRef);
const { drag, dragStart, dragEnd, onDrop } = useGridDnd(
  widgets,
  currentSlide,
  currentSlideIndex,
  slidesCount,
  carouselRef,
  {
    addWidget,
    updateWidget,
  },
);

function toggleEditMode() {
  if (!isEdit.value) {
    initialSlideIndex.value = currentSlideIndex.value;
  }
  isEdit.value = !isEdit.value;
}

function add() {
  const slideIndex = addSlide();
  setSlide(slideIndex);
}

function save() {
  const dashboardEdits = saveDashboard();
  emits("save", dashboardEdits);
}

function cancel() {
  setSlide(initialSlideIndex.value);
  cancelEditing();
}

watchEffect(() => setSlide(activeSlideIndex.value));
</script>

<style lang="scss" scoped>
.dashboard {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background-color: var(--body_bg);
  color: var(--main_text_color);
  height: auto;
  min-height: 100vh;
  overflow: hidden;

  &_carousel {
    position: relative;
    padding: 0 4rem 0;
    height: auto;
  }
}

.carousel {
  height: auto;
  display: grid;
  grid-template-rows: 2.7rem 1fr 2.7rem;

  &_loader {
    position: absolute;
    inset: 0;
    z-index: 2;
    border-radius: 1.15rem;
    background-color: rgba(255, 255, 255, 0.1);
  }
}
</style>
