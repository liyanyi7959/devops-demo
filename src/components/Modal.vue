<script setup lang="ts">
import { onMounted, ref, useId } from 'vue'
import Icon from './Icon.vue'

defineProps<{ title: string; wide?: boolean }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLDialogElement>()
const titleId = useId()
onMounted(() => dialog.value?.showModal())
</script>

<template>
  <dialog ref="dialog" class="modal" :class="{ 'modal-wide': wide }" :aria-labelledby="titleId" @close="emit('close')" @click="(event) => { if (event.target === dialog) dialog?.close() }">
    <div class="modal-surface">
      <div class="modal-heading">
        <h2 :id="titleId">{{ title }}</h2>
        <button class="icon-button" type="button" aria-label="关闭对话框" @click="dialog?.close()"><Icon name="x" /></button>
      </div>
      <div class="modal-body"><slot /></div>
      <div v-if="$slots.footer" class="modal-footer"><slot name="footer" /></div>
    </div>
  </dialog>
</template>
