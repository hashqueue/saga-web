<template>
  <a-row :span="24">
    <a-col :span="6">
      <a-card title="迭代列表">
        <template #extra><a @click="createSprint">新建迭代</a></template>
        <a-list
          item-layout="vertical"
          size="small"
          :pagination="sprintPaginationData"
          :data-source="sprintListData"
          :loading="sprintLoading"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <template #extra>
                <a-tag :color="statusEnum[item.sprint_status].color" style="margin-top: 5px">{{
                  statusEnum[item.sprint_status].value
                }}</a-tag>
              </template>
              <a-list-item-meta>
                <template #title>
                  <a-button type="link">{{ item.name }}</a-button>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
      <sprint-form
        :title="sprintTitle"
        :all-user-list="allProjectUserList"
        :modal-open="sprintModalOpen"
        :project-name="projectTitle"
        :project-id="projectId"
        :sprint-id="sprintId"
        @close-modal="closeSprintModal"
        @get-latest-data-list="getSprintListData"
      />
    </a-col>
  </a-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { getProjectDetail, getProjectMembers } from '@/apis/pm/project'
import { getSprintList } from '@/apis/pm/sprint'
import SprintForm from '@/views/pm/sprint/SprintForm.vue'
import { statusEnum } from '@/utils/enum'

const route = useRoute()

// project
const projectId = parseInt(route.params.projectId)
const projectTitle = ref('')
getProjectDetail(projectId).then((res) => {
  projectTitle.value = res.name
})

// sprint
const sprintId = ref(null)
const sprintTitle = ref('新增迭代')
const sprintModalOpen = ref(false)
const allProjectUserList = ref([])
const sprintPaginationData = ref({})
const sprintQueryParams = ref({ page: 1, page_size: 10, project_id: projectId })
const sprintListData = ref([])
const sprintLoading = ref(false)
const onSprintPageChange = (page, pageSize) => {
  if (page === 0) {
    // TODO 可能是antDesign Vue组件库的bug
    page = 1
  }
  sprintQueryParams.value.page = page
  sprintQueryParams.value.page_size = pageSize
  sprintLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    sprintListData.value = results
    sprintPaginationData.value.total = count
    sprintPaginationData.value.current = page
    sprintPaginationData.value.pageSize = page_size
    sprintPaginationData.value.showTotal = () => `共 ${count} 条`
    sprintLoading.value = false
  })
}
const getSprintListData = () => {
  sprintLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    sprintListData.value = results
    sprintPaginationData.value = {
      total: count,
      current: page,
      pageSize: page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${count} 条`,
      onChange: onSprintPageChange
    }
    sprintLoading.value = false
  })
}
getSprintListData()
getProjectMembers(projectId).then((res) => {
  allProjectUserList.value = res.results
})
const createSprint = () => {
  sprintTitle.value = '新增迭代'
  sprintModalOpen.value = true
}
const closeSprintModal = () => {
  sprintTitle.value = '新增迭代'
  sprintModalOpen.value = false
}
</script>

<style scoped></style>
