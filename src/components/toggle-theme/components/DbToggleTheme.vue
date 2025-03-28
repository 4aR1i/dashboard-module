<template>
  <label class="toggle_theme">
    <input v-model="isLight" type="checkbox" @change="toggleTheme" />
    <span class="toggle_theme_slider"></span>
  </label>
</template>

<script lang="ts" setup>
import { computed, inject, ref } from "vue";
import { ThemeKey, ToggleThemeKey } from "@/composables";
import darkIcon from "@/assets/icons/theme_dark.svg?url";
import lightIcon from "@/assets/icons/theme_light.svg?url";

const theme = inject(ThemeKey);
const toggleTheme = inject(ToggleThemeKey);

const isLight = ref(theme?.value === "light");
const iconUrl = computed(() => `url(${theme?.value === "dark" ? darkIcon : lightIcon})`);
</script>

<style lang="scss" scoped>
.toggle_theme {
  position: relative;
  display: inline-block;
  width: 4rem;
  height: 1.85rem;

  & input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  &_slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--widget_main_bg);
    transition: 0.3s;
    border-radius: 1.85rem;
    cursor: pointer;

    &:before {
      position: absolute;
      content: "";
      height: 2.2rem;
      width: 2.2rem;
      left: -0.1rem;
      bottom: -0.175rem;
      background-color: #ffffff;
      background-image: v-bind(iconUrl);
      background-size: 70% 70%;
      background-position: center;
      background-repeat: no-repeat;
      transition: 0.4s;
      border-radius: 50%;
    }
  }
}

input:checked + .toggle_theme_slider {
  background: var(--widget_second_bg);
}

input:checked + .toggle_theme_slider:before {
  transform: translateX(2rem);
}
</style>
