import { computed, ComputedRef, ref, watch, watchEffect } from "vue";
import { cloneDeep } from "lodash";
import { createGlobalState } from "@vueuse/core";
import { createInjectableHook } from "@/composables";
import { arrayToMap } from "@/utils";
import { TDashboardEdits, TSlide, TWidget } from "@/types";

interface ISlidesAndWidgets {
  slides: ComputedRef<TSlide[]>;
  widgets: ComputedRef<TWidget[]>;
  widgetsBySlide: ComputedRef<Record<number, TWidget[]>>;
  addedWidgets: ComputedRef<string[]>;
  activeSlideIndex: ComputedRef<number>;

  addSlide: (isActiveSlide?: boolean) => number;
  removeSlide: (slide: TSlide) => void;
  clearSlide: (slideId: number) => void;
  removeWidget: (widgetId: number) => void;
  addWidget: (widget: TWidget) => void;
  updateWidget: (widget: TWidget) => void;
  saveDashboard: () => TDashboardEdits;
  cancelEditing: () => void;
}

type TUseSlidesAndWidgetsProps = {
  slides: TSlide[];
  widgets: TWidget[];
};

type TSlidesMap = Record<number, TSlide>;
type TWidgetsMap = Record<number, TWidget>;

export const [useSlidesAndWidgets, provideSlidesAndWidgets] = createInjectableHook<
  [TUseSlidesAndWidgetsProps],
  ISlidesAndWidgets
>(
  createGlobalState((props: TUseSlidesAndWidgetsProps) => {
    const slidesMap = ref<TSlidesMap>({});
    const slidesMapInitial = ref<TSlidesMap>({});
    const createdSlidesMap = ref<TSlidesMap>({});
    const updatedSlidesMap = ref<TSlidesMap>({});
    const removedSlidesMap = ref<TSlidesMap>({});
    const widgetsMap = ref<TWidgetsMap>({});
    const widgetsMapInitial = ref<TWidgetsMap>({});
    const createdWidgetsMap = ref<TWidgetsMap>({});
    const updatedWidgetsMap = ref<TWidgetsMap>({});
    const removedWidgetsMap = ref<TWidgetsMap>({});

    watchEffect(() => {
      slidesMapInitial.value = arrayToMap(props.slides);
      slidesMap.value = arrayToMap(props.slides);
      widgetsMapInitial.value = arrayToMap(props.widgets);
      widgetsMap.value = arrayToMap(props.widgets);
    });

    const slides = computed(() => Object.values(slidesMap.value));
    const widgets = computed(() => Object.values(widgetsMap.value));
    const widgetsBySlide = computed(() =>
      widgets.value.reduce((acc: Record<number, TWidget[]>, widget: TWidget) => {
        if (!acc[widget.slide.id]) {
          acc[widget.slide.id] = [];
        }
        acc[widget.slide.id].push(widget);
        return acc;
      }, {}),
    );
    const addedWidgets = computed(() => widgets.value.map((widget) => widget.component));
    const activeSlideIndex = computed(() => slides.value.findIndex((slide) => slide.active) ?? 0);

    // УДАЛЕНИЕ ВИДЖЕТА
    function removeWidget(widgetId: number) {
      const widget = widgetsMap.value[widgetId];
      delete widgetsMap.value[widgetId];
      delete createdWidgetsMap.value[widgetId];
      delete updatedWidgetsMap.value[widgetId];

      if (widgetsMapInitial.value[widgetId]) {
        removedWidgetsMap.value[widgetId] = widget;
      }
    }

    // ДОБАВЛЕНИЕ ВИДЖЕТА
    function addWidget(widget: TWidget) {
      const findWidget = Object.values(removedWidgetsMap.value).find((item) => item.component === widget.component);
      const widgetId = findWidget ? findWidget.id : widget.id;
      if (!widgetsMapInitial.value[widgetId]) {
        createdWidgetsMap.value[widgetId] = widget;
      }
      if (removedWidgetsMap.value[widgetId]) {
        delete removedWidgetsMap.value[widgetId];
      }
      if (findWidget && (findWidget?.x !== widget.x || findWidget?.y !== widget.y)) {
        updatedWidgetsMap.value[widgetId] = { ...findWidget, x: widget.x, y: widget.y };
      }
      widgetsMap.value[widgetId] = { ...widget, id: widgetId };
    }

    // ОБНОВЛЕНИЕ ПОЛОЖЕНИЯ ВИДЖЕТА
    function updateWidget(widget: TWidget) {
      const widgetId = widget.id;
      widgetsMap.value[widgetId] = { ...widget };
      if (widgetsMapInitial.value[widgetId]) {
        updatedWidgetsMap.value[widgetId] = widgetsMap.value[widgetId];
      }

      if (createdWidgetsMap.value[widgetId]) {
        createdWidgetsMap.value[widgetId] = { ...widget };
      }
    }

    // ОЧИСТКА СЛАЙДА ОТ ВИДЖЕТОВ
    function clearSlide(slideId: number) {
      widgetsBySlide.value[slideId].forEach((widget) => {
        if (widgetsMapInitial.value[widget.id]) {
          removedWidgetsMap.value[widget.id] = widget;
        }
        if (createdWidgetsMap.value[widget.id]) {
          delete createdWidgetsMap.value[widget.id];
        }
        if (updatedWidgetsMap.value[widget.id]) {
          delete updatedWidgetsMap.value[widget.id];
        }
        delete widgetsMap.value[widget.id];
      });
    }

    // ДОБАВЛЕНИЕ СЛАЙДА
    function addSlide(isActiveSlide: boolean = false) {
      const newSlide = {
        id: new Date().getTime(),
        title: `#${slides.value.length + 1}`,
        active: isActiveSlide,
      } as TSlide;

      if (isActiveSlide) {
        slidesMapInitial.value[newSlide.id] = newSlide;
      }
      slidesMap.value[newSlide.id] = newSlide;
      createdSlidesMap.value[newSlide.id] = newSlide;

      const slideIndex = slides.value.findIndex((item) => item.id === newSlide.id);
      return slideIndex === -1 ? activeSlideIndex.value : slideIndex;
    }

    // УДАЛЕНИЕ СЛАЙДА
    function removeSlide(slide: TSlide) {
      const slideId = slide.id;
      delete slidesMap.value[slideId];
      delete createdSlidesMap.value[slideId];
      delete updatedSlidesMap.value[slideId];

      if (slidesMapInitial.value[slideId]) {
        removedSlidesMap.value[slideId] = slide;
      }
    }

    // СОХРАНЕНИЕ ВСЕХ ИЗМЕНЕНИЙ НА ДАШБОРДЕ
    function saveDashboard() {
      const dashboardEdits = {
        widgets: {
          add: [...Object.values(createdWidgetsMap.value)],
          update: [...Object.values(updatedWidgetsMap.value)],
          remove: [...Object.values(removedWidgetsMap.value)],
        },
        slides: {
          add: [...Object.values(createdSlidesMap.value)],
          update: [...Object.values(updatedSlidesMap.value)],
          remove: [...Object.values(removedSlidesMap.value)],
        },
      };

      createdSlidesMap.value = {};
      updatedSlidesMap.value = {};
      removedSlidesMap.value = {};
      createdWidgetsMap.value = {};
      updatedWidgetsMap.value = {};
      removedWidgetsMap.value = {};

      return dashboardEdits;
    }

    // ОТМЕНА РЕДАКТИРОВАНИЯ
    function cancelEditing() {
      Object.keys(createdSlidesMap.value).forEach((slideId) => {
        if (!createdSlidesMap.value[Number(slideId)].active) {
          delete createdSlidesMap.value[Number(slideId)];
        }
      });

      slidesMap.value = cloneDeep(slidesMapInitial.value);
      updatedSlidesMap.value = {};
      removedSlidesMap.value = {};

      widgetsMap.value = cloneDeep(widgetsMapInitial.value);
      createdWidgetsMap.value = {};
      updatedWidgetsMap.value = {};
      removedWidgetsMap.value = {};
    }

    watch(
      widgets,
      () => {
        console.log("createdWidgetsMap", createdWidgetsMap.value);
        console.log("updatedWidgetsMap", updatedWidgetsMap.value);
        console.log("removedWidgetsMap", removedWidgetsMap.value);
      },
      { deep: true, immediate: true },
    );

    watch(
      slides,
      (v) => {
        console.log("slides", v);
        console.log("slidesMap", slidesMap.value);
        console.log("createdSlidesMap", createdSlidesMap.value);
        console.log("updatedSlidesMap", updatedSlidesMap.value);
        console.log("removedSlidesMap", removedSlidesMap.value);
      },
      { deep: true, immediate: true },
    );

    return {
      slides,
      widgets,
      widgetsBySlide,
      addedWidgets,
      activeSlideIndex,

      addSlide,
      removeSlide,
      clearSlide,
      removeWidget,
      addWidget,
      updateWidget,
      saveDashboard,
      cancelEditing,
    };
  }),
);
