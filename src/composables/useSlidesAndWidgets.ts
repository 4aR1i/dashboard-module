import { computed, ComputedRef, ref, watchEffect } from "vue";
import { cloneDeep } from "lodash";
import { createGlobalState } from "@vueuse/core";
import { createInjectableHook } from "@/composables";
import { arrayToMap } from "@/utils";
import { TSlide, TWidget } from "@/types";

interface ISlidesAndWidgets {
  slides: ComputedRef<TSlide[]>;
  widgets: ComputedRef<TWidget[]>;
  widgetsBySlide: ComputedRef<Record<number, TWidget[]>>;
  addedWidgets: ComputedRef<string[]>;
  activeSlideIndex: ComputedRef<number>;

  removeWidget: (widgetId: number) => void;
  addWidget: (widget: TWidget) => void;
  updateWidget: (widget: TWidget) => void;
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

    const slides = computed(() => {
      const slides = Object.values(slidesMap.value);
      const leftSlides = slides.filter((s) => s.position === "left");
      const activeSlide = slides.find((s) => s.active)!;
      const rightSlides = slides.filter((s) => s.position === "right").reverse();
      return [...leftSlides, activeSlide, ...rightSlides].filter(Boolean);
    });
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

    // ОТМЕНА РЕДАКТИРОВАНИЯ
    function cancelEditing() {
      widgetsMap.value = cloneDeep(widgetsMapInitial.value);
      createdWidgetsMap.value = {};
      updatedWidgetsMap.value = {};
      removedWidgetsMap.value = {};
    }

    return {
      slides,
      widgets,
      widgetsBySlide,
      addedWidgets,
      activeSlideIndex,

      removeWidget,
      addWidget,
      updateWidget,
      cancelEditing,
    };
  }),
);
