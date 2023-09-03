<template>
  <template v-if="sprintInfo">
    <a-descriptions v-if="sprintInfo" :title="sprintInfo.name">
      <a-descriptions-item label="ID">{{ sprintInfo.id }}</a-descriptions-item>
      <a-descriptions-item label="负责人"
        >{{ sprintInfo.owner }} {{ sprintInfo.owner_name }}</a-descriptions-item
      >
      <a-descriptions-item label="状态">
        <a-tag :color="statusEnum[sprintInfo.sprint_status].color">{{
          statusEnum[sprintInfo.sprint_status].value
        }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="所属项目">{{ sprintInfo.project_name }}</a-descriptions-item>
      <a-descriptions-item label="需求数量">{{ sprintInfo.requirement_count }}</a-descriptions-item>
      <a-descriptions-item label="任务数量">{{ sprintInfo.task_count }}</a-descriptions-item>
      <a-descriptions-item label="缺陷数量">{{ sprintInfo.bug_count }}</a-descriptions-item>
      <a-descriptions-item label="开始时间">{{ sprintInfo.started_at }}</a-descriptions-item>
      <a-descriptions-item label="预计完成时间">{{ sprintInfo.finished_at }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ sprintInfo.created_by }}</a-descriptions-item>
      <a-descriptions-item label="最后修改人">{{ sprintInfo.updated_by }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ sprintInfo.created_at }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ sprintInfo.updated_at }}</a-descriptions-item>
    </a-descriptions>
  </template>
  <template v-else>
    <a-empty />
  </template>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getSprintDetail } from '@/apis/pm/sprint'
import { statusEnum } from '@/utils/enum'
import { useSprintStore } from '@/stores/sprint'

const route = useRoute()
const sprintStore = useSprintStore()
const sprintInfo = ref(null)
const getSprintDetailData = () => {
  if (!route.params.sprintId) return
  getSprintDetail(route.params.sprintId).then((res) => {
    sprintInfo.value = res
  })
}
getSprintDetailData()
watch(
  () => route.params.sprintId,
  (newSprintId) => {
    getSprintDetailData(newSprintId)
  }
)
watch(
  () => sprintStore.getNeedUpdateSprintDetail,
  (newNeedUpdateSprintDetail) => {
    if (!newNeedUpdateSprintDetail) return
    getSprintDetailData()
    sprintStore.setNeedUpdateSprintDetail(false)
  },
  { immediate: true } // 在初始化时就立即执行一次
)
</script>

<style scoped></style>
