<template>
  <div class="grid" @drop="$emit('drop', $event)">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
type Emits = {
  drop: [e: DragEvent];
};

defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.grid {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
