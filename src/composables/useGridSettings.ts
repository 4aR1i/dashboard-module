import { computed, MaybeRef, onUnmounted, ref, toRef, unref, watch } from "vue";

interface GridOptions {
  columns: number;
  rows: number;
}

export const useGridSettings = (carouselEl: MaybeRef<HTMLElement | null>) => {
  // Опции сетки
  const options: GridOptions = {
    columns: 8,
    rows: 4,
  };

  // Состояние для размеров элемента
  const gridParams = ref<DOMRect | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  // Функция для обновления данных элемента
  const updateElementData = () => {
    return requestAnimationFrame(() => {
      const element = unref(carouselEl);
      if (element) {
        gridParams.value = element.getBoundingClientRect();
      }
    });
  };

  // Наблюдение за изменениями элемента
  const observeElement = (element: HTMLElement) => {
    resizeObserver = new ResizeObserver(updateElementData);
    resizeObserver.observe(element);
  };

  // Отслеживание изменений carouselEl
  watch(toRef(carouselEl), (newElement, oldElement) => {
    if (oldElement && resizeObserver) {
      resizeObserver.unobserve(oldElement); // Прекращаем наблюдение за старым элементом
    }
    if (newElement) {
      observeElement(newElement); // Начинаем наблюдение за новым элементом
    }
  });

  // Очистка при размонтировании компонента
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  // Вычисляемые свойства для размеров ячеек
  const cellWidthPx = computed(() => ((gridParams.value?.width ?? 0) * 0.95) / options.columns);
  const cellHeightPx = computed(() => cellWidthPx.value);

  const cellWidthPercent = computed(() => 100 / options.columns);
  const cellHeightPercent = computed(() => 100 / options.rows);

  const gridHeight = computed(() => cellHeightPx.value * options.rows);
  const gridWidth = computed(() => cellWidthPx.value * options.columns);

  // Функция для получения координат ячейки по пикселям
  const getCellFromPixel = (top: number, left: number) => {
    if (!gridParams.value) return null;

    const x = Math.floor((left - gridParams.value.x) / cellWidthPx.value);
    const y = Math.floor((top - gridParams.value.y) / cellHeightPx.value);

    return { x, y };
  };

  return {
    cellWidthPx,
    cellHeightPx,
    cellWidthPercent,
    cellHeightPercent,
    gridHeight,
    gridWidth,
    getCellFromPixel,
  };
};
