import { computed, ComputedRef, MaybeRef, Ref, ref } from "vue";
import { useGridSettings } from "@/composables";
import { TMiniWidget, TSlide, TWidget } from "@/types";

export const useGridDnd = (
  widgets: Ref<TWidget[]>,
  slide: ComputedRef<TSlide>,
  slideIndex: Ref<number>,
  slidesCount: ComputedRef<number>,
  carouselEl: MaybeRef<HTMLElement | null>,
  actions: {
    addWidget: (widget: TWidget) => void;
    updateWidget: (widget: TWidget) => void;
  },
) => {
  const draggingWidget = ref<TWidget | TMiniWidget | null>(null);
  const draggingWidgetRef = ref<HTMLElement | null>(null);
  const placeholder = ref<HTMLElement | null>(null);
  const isMiniWidget = ref(false);

  const currentGrid = computed(() => document.querySelectorAll(".grid")[slideIndex.value]);

  let lastCheck = 0;
  const dragDelay = 200;
  const setSlideDelay = 800;
  let slideSwitchTimeout: ReturnType<typeof setTimeout> | null = null;

  const { cellWidthPercent, cellHeightPercent, getCellFromPixel } = useGridSettings(carouselEl);

  function drag(event: DragEvent, widget: TWidget | TMiniWidget) {
    // Задержка вызова drag
    const now = Date.now();
    if (now - lastCheck < dragDelay) {
      return;
    }
    lastCheck = now;

    const cell = getCell(event);

    if (!cell || !draggingWidgetRef.value) return;

    // Переключение слайда при перетаскивании виджета за границы текущего слайда
    const screenWidth = window.innerWidth;
    const mouseX = event.clientX;

    if (mouseX > screenWidth * 0.95 && slideIndex.value < slidesCount.value - 1) {
      if (!slideSwitchTimeout) {
        slideSwitchTimeout = setTimeout(() => {
          switchSlideWithPlaceholder(slideIndex.value + 1, cell, widget.width, widget.height);
        }, setSlideDelay);
      }
    } else if (mouseX < screenWidth * 0.05 && slideIndex.value > 0) {
      if (!slideSwitchTimeout) {
        slideSwitchTimeout = setTimeout(() => {
          switchSlideWithPlaceholder(slideIndex.value - 1, cell, widget.width, widget.height);
        }, setSlideDelay);
      }
    } else {
      if (slideSwitchTimeout) {
        clearTimeout(slideSwitchTimeout);
        slideSwitchTimeout = null;
      }
    }

    if (placeholder.value) {
      placeholder.value.style.left = `${cell.x * cellWidthPercent.value}%`;
      placeholder.value.style.top = `${cell.y * cellHeightPercent.value}%`;
    }

    const isAreaEmpty = !checkOverlap(cell.x, cell.y, widget.width, widget.height);
    if (isAreaEmpty) {
      placeholder.value?.children[0].classList.remove("widget_placeholder_content--red");
    } else {
      placeholder.value?.children[0].classList.add("widget_placeholder_content--red");
    }

    if (!isMiniWidget.value) {
      draggingWidgetRef.value.style.display = "none";
      draggingWidgetRef.value.style.overflow = "hidden";
    }
  }

  function dragStart(event: DragEvent, widget: TWidget | TMiniWidget, isEdit: boolean, miniWidget: boolean = false) {
    if (!isEdit) return;
    draggingWidgetRef.value = event.target as HTMLElement;
    draggingWidget.value = widget;
    isMiniWidget.value = miniWidget;

    const cell = getCell(event);

    if (!cell) return;

    createPlaceholderElement(cell, widget.width, widget.height);
  }

  function dragEnd() {
    placeholder.value?.remove();
    placeholder.value = null;
  }

  function dragOverNoDrop(event: DragEvent) {
    event.dataTransfer!.dropEffect = "none";
  }

  function onDrop(event: DragEvent) {
    const widget = draggingWidget.value;
    const cell = getCell(event);

    if (!widget || !cell || !draggingWidgetRef.value) {
      return;
    }

    if (checkOverlap(cell.x, cell.y, widget.width, widget.height)) {
      if (draggingWidgetRef.value && !isMiniWidget.value) {
        draggingWidgetRef.value.style.display = "block";
        draggingWidgetRef.value = null;
      }
      draggingWidget.value = null;

      return;
    }

    if (isMiniWidget.value) {
      actions.addWidget({
        ...(widget as TMiniWidget),
        id: new Date().getTime(),
        slide: slide.value,
        x: cell.x,
        y: cell.y,
      });
    } else {
      actions.updateWidget({ ...(widget as TWidget), x: cell.x, y: cell.y, slide: slide.value });

      draggingWidgetRef.value.style.display = "block";
    }

    draggingWidget.value = null;
    draggingWidgetRef.value = null;
  }

  // Прверяем пересечение перетаскиваемого виджета с другими видижетами или границами слайда
  function checkOverlap(x: number, y: number, width: number, height: number) {
    if (x < 0 || y < 0 || y + height > 4 || x + width > 8) {
      return true;
    }

    return widgets.value
      .filter((widget) => widget.slide.id === slide.value.id)
      .some((widget) => {
        if (draggingWidget.value && widget.id === (draggingWidget.value as TWidget).id) {
          const { x: startX, y: startY, width: startWidth, height: startHeight } = draggingWidget.value as TWidget;

          const isInsideOriginalArea =
            x + width >= startX && x <= startX + startWidth && y + height >= startY && y <= startY + startHeight;

          if (isInsideOriginalArea) {
            return false;
          }
        }

        return !(
          x + width <= widget.x ||
          x >= widget.x + widget.width ||
          y + height <= widget.y ||
          y >= widget.y + widget.height
        );
      });
  }

  // Вычесляем ячейку по положению мыши
  function getCell(event: DragEvent) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    return getCellFromPixel(mouseY, mouseX);
  }

  function createPlaceholderElement(cell: { x: number; y: number }, widgetWidth: number, widgetHeight: number) {
    placeholder.value = document.createElement("div");
    placeholder.value.classList.add("widget_placeholder");

    const placeholderContent = document.createElement("div");
    placeholderContent.classList.add("widget_placeholder_content");
    placeholder.value.appendChild(placeholderContent);

    placeholder.value.style.width = `${cellWidthPercent.value * widgetWidth}%`;
    placeholder.value.style.height = `${cellHeightPercent.value * widgetHeight}%`;
    placeholder.value.style.left = `${cell.x * cellWidthPercent.value}%`;
    placeholder.value.style.top = `${cell.y * cellHeightPercent.value}%`;

    currentGrid.value.appendChild(placeholder.value);
  }

  function switchSlideWithPlaceholder(
    newIndex: number,
    cell: { x: number; y: number },
    widgetWidth: number,
    widgetHeight: number,
  ) {
    slideIndex.value = newIndex;
    placeholder.value?.remove();
    createPlaceholderElement(cell, widgetWidth, widgetHeight);
    slideSwitchTimeout = null;
  }

  return {
    drag,
    dragStart,
    dragEnd,
    dragOverNoDrop,
    onDrop,
  };
};
