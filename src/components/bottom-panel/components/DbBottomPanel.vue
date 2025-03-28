<template>
  <nav class="bottom-panel" :class="{ 'bottom-panel--opened': opened }">
    <template v-if="!dragging">
      <div class="bottom-panel_toggler" @click="togglePanel">
        <db-svg-icon icon="bottom_panel_arrow" />
      </div>
      <h5 class="bottom-panel_title">Сервисы</h5>
      <db-loader v-if="isLoading" />
      <div v-else class="bottom-panel_services services">
        <template v-for="service in services" :key="service.id">
          <div
            v-if="!!service.widgets.length"
            class="services_service"
            :class="{ 'services_service--active': activeService?.id === service.id }"
            :title="service.title"
            @click="toggleService(service)"
          >
            <div class="services_icon">
              <db-svg-heroicon :icon="service.icon" />
            </div>
          </div>
        </template>
      </div>
    </template>
    <fieldset v-if="!isLoading" class="bottom-panel_widgets widgets">
      <legend v-if="activeService" class="widgets_title">
        {{ activeService.title }}
      </legend>
      <div class="widgets_list">
        <template v-for="widget in widgets" :key="widget.id">
          <div
            class="widgets_widget bottom-panel_widget"
            :class="{
              'bottom-panel_widget--checked': checkAddedWidget(widget.component),
            }"
            draggable="true"
            @drag="drag($event, widget)"
            @dragstart="start($event, widget, true)"
            @dragend="end"
          >
            <div class="bottom-panel_widget_icon">
              <db-svg-heroicon :icon="widget.params.icon" />
            </div>
            <div class="bottom-panel_widget_title">{{ widget?.title }}</div>
          </div>
        </template>
      </div>
    </fieldset>
  </nav>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { isEqual } from "lodash";
import { DbSvgIcon, DbSvgHeroicon, DbLoader } from "@/components/ui";
import { TMiniWidget, TService } from "@/types";

type Props = {
  addedWidgets: string[];
  services: TService[];
};

type Emits = {
  start: [event: DragEvent, item: TMiniWidget, isEdit: boolean, miniWidget: boolean];
  end: [event: DragEvent];
  drag: [event: DragEvent, item: TMiniWidget];
};

const props = defineProps<Props>();
const emits = defineEmits<Emits>();

const isLoading = ref(false);
const opened = ref(false);
const dragging = ref(false);
const activeService = ref<TService | null>(null);

const services = computed(() =>
  props.services.reduce((acc: Record<string, TService>, service, index) => {
    Object.assign(service, { id: index + 1 });
    Object.assign(acc, { [service.slug]: service });

    return acc;
  }, {}),
);
const widgets = computed((): TMiniWidget[] =>
  activeService.value ? services.value[activeService.value.slug]?.widgets : [],
);

function togglePanel() {
  opened.value = !opened.value;
}

function toggleService(service: TService) {
  activeService.value = isEqual(activeService.value, service) ? null : service;
}

function checkAddedWidget(component: string) {
  return props.addedWidgets.includes(component);
}

function start(event: DragEvent, widget: TMiniWidget, miniWidget: boolean) {
  dragging.value = true;
  emits("start", event, widget, true, miniWidget);
}

function end(event: DragEvent) {
  dragging.value = false;
  emits("end", event);
}

function drag(event: DragEvent, widget: TMiniWidget) {
  emits("drag", event, widget);
}
</script>

<style lang="scss" scoped>
.bottom-panel {
  position: absolute;
  left: 0;
  right: 0;
  background: var(--menu_bg);
  display: flex;
  flex-direction: column;
  row-gap: 1.7rem;
  bottom: 2px;
  padding: 1.7rem 3.5rem;
  translate: 0 100%;
  transition: 0.2s translate ease-in-out;

  &_toggler {
    cursor: pointer;
    z-index: -1;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: -1.7rem;
    width: 5.7rem;
    height: 1.7rem;
    overflow: hidden;
    padding: 1rem 1.85rem 0 1.85rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    svg {
      z-index: 10;
    }
    &::before {
      content: "";
      position: absolute;
      top: 0;
      background: var(--menu_bg);
      width: 5.7rem;
      height: 5.7rem;
      border-radius: 50%;
    }
  }

  &--opened {
    translate: 0 0;

    & .bottom-panel_toggler {
      svg {
        rotate: 180deg;
        transition: rotate 0.3s;
      }
    }
  }

  &_title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--sub_text_color);
    padding: 0 0.5rem;
  }
}

.services {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: 1.15rem;
  row-gap: 1.15rem;

  &_service {
    width: 4.85rem;
    height: 4.85rem;
    border-radius: 1.15rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 0.15rem solid var(--widget_second_bg);
    background: var(--widget_second_bg);
    cursor: pointer;

    &--active {
      border: 1.5px solid var(--menu_selected_border);
      background: var(--menu_selected_bg);
    }
  }

  &_icon {
    width: 55%;
  }
}

.widgets {
  border: 1.5px solid var(--menu_selected_border);
  background: var(--submenu_bg);
  padding: 1.7rem;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  row-gap: 1.7rem;

  &_title {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--sub_text_color);
    padding: 0 0.5rem;
  }

  &_list {
    display: flex;
    column-gap: 1.15rem;
  }
}

.bottom-panel_widget {
  display: flex;
  align-items: center;
  background-color: var(--submenu_item_bg);
  border-radius: 0.6rem;
  padding-right: 1.15rem;
  column-gap: 1.15rem;
  cursor: pointer;

  &--checked {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &_icon {
    background: var(--submenu_item_icon_bg);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.57rem;
    width: 2.857rem;
    height: 2.857rem;
    padding: 0.4rem;
  }

  &_title {
    color: var(--sub_text_color);
    font-size: 1rem;
    font-weight: 700;
  }
}
</style>

<style lang="scss">
.services_service {
  .services_icon {
    & svg path {
      fill: var(--menu_icon_color);
    }
  }
  &--active {
    .services_icon {
      & svg path {
        fill: var(--menu_icon_active_color);
      }
    }
  }
}
.bottom-panel_widget {
  &_icon {
    & svg path {
      fill: var(--menu_icon_color);
    }
  }
}
</style>
