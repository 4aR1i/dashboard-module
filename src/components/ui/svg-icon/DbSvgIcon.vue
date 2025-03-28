<template>
  <component :is="ServiceIcon"></component>
</template>

<script lang="ts" setup>
import { defineAsyncComponent, markRaw, ref, watchEffect } from "vue";

type Props = {
  icon: string;
};

const { icon } = defineProps<Props>();

const ServiceIcon = ref();

watchEffect(() => {
  ServiceIcon.value = markRaw(defineAsyncComponent(() => import(`@/assets/icons/${icon}.svg`)));
});
</script>
