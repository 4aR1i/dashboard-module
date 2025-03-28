<template>
  <div class="carousel_header">
    <div v-if="isEdit" class="carousel_header_input">
      <input v-model="slideRef.title" type="text" />
    </div>
    <div v-else class="carousel_header_title">{{ slideRef.title }}</div>
    <div v-if="isEdit" class="carousel_header_actions" :class="{ 'carousel_header_actions--disabled': disabled }">
      <!-- <span class="carousel_header_action" @click="openAddConfirmModal('right')"> Добавить </span>
      <span
        v-if="widgetsOnCurrentSlide.length"
        class="carousel_header_action carousel_header_action--delete"
        @click="openClearConfirmModal"
      >
        Очистить
      </span>
      <span v-else class="carousel_header_action carousel_header_action--delete" @click="openRemoveConfirmModal">
        Удалить
      </span>
      <span class="carousel_header_action carousel_header_action--save" @click="save"> Сохранить </span> -->
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
import { inject, toRef } from "vue";
import { DbToggleTheme } from "@/components/toggle-theme";
import { DbSvgIcon } from "@/components/ui";
import { ThemeKey } from "@/composables";
import { TSlide } from "@/types";

type Props = {
  isEdit: boolean;
  slide: TSlide;
  disabled: boolean;
};

type Emits = {
  toggle: [];
  cancel: [];
  setSlide: [slideIndex: number];
};

const { slide } = defineProps<Props>();
const emit = defineEmits<Emits>();
const theme = inject(ThemeKey);
const slideRef = toRef(() => slide);

function cancel() {
  emit("cancel");
  emit("toggle");
}
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
