<template>
  <component :is="selectedIcon"></component>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import * as SolidIcons from "@heroicons/vue/24/solid";

type Props = {
  icon: string;
};
type TIconKey = keyof typeof SolidIcons;

const props = defineProps<Props>();

const selectedIcon = computed(() => {
  return SolidIcons[props.icon as TIconKey] || null;
});
</script>
