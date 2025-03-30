<template>
  <div class="carousel_header">
    <div v-if="isEdit" class="carousel_header_input">
      <input v-model="localSlide.title" type="text" />
    </div>
    <div v-else class="carousel_header_title">{{ localSlide.title }}</div>
    <div v-if="isEdit" class="carousel_header_actions" :class="{ 'carousel_header_actions--disabled': disabled }">
      <span class="carousel_header_action" @click="$emit('add')"> Добавить </span>
      <span v-if="widgetsCount" class="carousel_header_action carousel_header_action--delete" @click="$emit('clear')">
        Очистить
      </span>
      <span
        v-else-if="!slide.active"
        class="carousel_header_action carousel_header_action--delete"
        @click="$emit('remove')"
      >
        Удалить
      </span>
      <span class="carousel_header_action carousel_header_action--save" @click="save"> Сохранить </span>
      <span class="carousel_header_action" @click="cancel"> Отменить </span>
    </div>
    <div v-else class="carousel_header_actions">
      <div class="carousel_header_icon" @click="$emit('toggle')">
        <db-svg-icon v-if="theme === 'dark'" icon="dashboard_settings_dark" />
        <db-svg-icon v-else icon="dashboard_settings_light" />
      </div>
      <DbToggleTheme />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { inject, ref, toRef, watch } from "vue";
import { DbToggleTheme } from "@/components/toggle-theme";
import { DbSvgIcon } from "@/components/ui";
import { ThemeKey } from "@/composables";
import { TSlide } from "@/types";

type Props = {
  isEdit: boolean;
  slide: TSlide;
  widgetsCount: number;
  disabled: boolean;
};

type Emits = {
  toggle: [];
  cancel: [];
  clear: [];
  remove: [];
  update: [slide: TSlide];
  add: [];
  save: [];
  setSlide: [slideIndex: number];
};

const { slide } = defineProps<Props>();
const emits = defineEmits<Emits>();
const theme = inject(ThemeKey);
const localSlide = ref(slide);

function save() {
  emits("save");
  emits("toggle");
}

function cancel() {
  emits("cancel");
  emits("toggle");
}

watch(localSlide, (v) => {
  emits("update", v);
});
</script>

<style lang="scss" scoped>
.carousel_header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;

  &_title {
    color: var(--main_text_color);
    font-size: 1.5rem;
    font-weight: 700;
  }

  &_actions {
    display: flex;
    gap: 0.5rem;

    &--disabled {
      pointer-events: none;
    }
  }

  &_action {
    cursor: pointer;

    &--delete {
      color: red;
    }
    &--save {
      color: green;
    }
  }

  &_icon {
    width: 2rem;
    height: 2rem;
    cursor: pointer;
  }
}
</style>
