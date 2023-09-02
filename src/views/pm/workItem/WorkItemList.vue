<template>{{ workItemType }} - {{ sprintId }}</template>

<script setup>
defineProps({
  workItemType: {
    type: Number,
    required: true,
    default: 0
  },
  sprintId: {
    type: Number,
    required: true
  }
})
</script>

<style scoped></style>
