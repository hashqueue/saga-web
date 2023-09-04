<template>
  <a-row :span="24">
    <a-col :span="4">
      <a-card title="迭代列表" size="small" :loading="sprintListLoading">
        <template #extra><a @click="createSprint">新增迭代</a></template>
        <template v-for="(item, index) in sprintListData" :key="index">
          <a-card
            :hoverable="true"
            style="margin-bottom: 10px"
            size="small"
            @click="viewSprintDetail(item.id)"
          >
            <template #title>
              <a-tooltip>
                <template #title>{{ item.name }}</template>
                <span :class="{ 'active-sprint-title': sprintDetailId === item.id }">
                  {{ item.name.length > 8 ? item.name.slice(0, 8) + '...' : item.name }}
                </span>
              </a-tooltip>
            </template>
            <template #extra>
              <a-tag :color="statusEnum[item.sprint_status].color">{{
                statusEnum[item.sprint_status].value
              }}</a-tag>
            </template>
          </a-card>
        </template>
        <a-empty v-if="!sprintListData.length" />
        <a-divider />
        <a-pagination
          :total="sprintPaginationData.total"
          :current="sprintPaginationData.current"
          :page-size="sprintPaginationData.pageSize"
          :page-size-options="sprintPaginationData.pageSizeOptions"
          :show-size-changer="sprintPaginationData.showSizeChanger"
          :show-total="sprintPaginationData.showTotal"
          @change="onSprintPageChange"
          size="small"
        />
      </a-card>
      <sprint-form
        :title="sprintTitle"
        :all-user-list="allProjectUserList"
        :modal-open="sprintModalOpen"
        :project-name="projectTitle"
        :project-id="projectId"
        :sprint-id="sprintDetailId"
        @close-modal="closeSprintModal"
        @get-latest-data-list="getSprintListData"
      />
    </a-col>
    <a-col :span="20">
      <a-card
        style="margin-left: 3px"
        title="迭代详情"
        :tab-list="tabList"
        :active-tab-key="tabKey"
        @tabChange="onTabChange"
        size="small"
      >
        <template #customTab="item">
          <span v-if="item.key === 'overview'">
            <pie-chart-outlined />
            {{ item.tab }}
          </span>
          <span v-else-if="item.key === 'requirement'">
            <file-text-outlined />
            {{ item.tab }}
          </span>
          <span v-else-if="item.key === 'task'">
            <unordered-list-outlined />
            {{ item.tab }}
          </span>
          <span v-else-if="item.key === 'bug'">
            <bug-outlined />
            {{ item.tab }}
          </span>
        </template>
        <template #tabBarExtraContent>
          <a-dropdown :disabled="!sprintDetailId">
            <a @click.prevent>
              更多操作
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu @click="clickSprintAction">
                <a-menu-item :key="'editSprint'">修改迭代</a-menu-item>
                <a-menu-item :key="'deleteSprint'">删除迭代</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-if="sprintDetailId">
          <RouterView />
        </template>
        <template v-else>
          <a-empty />
        </template>
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Modal } from 'ant-design-vue'
import {
  PieChartOutlined,
  BugOutlined,
  FileTextOutlined,
  UnorderedListOutlined,
  DownOutlined
} from '@ant-design/icons-vue'
import { getProjectDetail, getProjectMembers } from '@/apis/pm/project'
import { getSprintList, deleteSprintDetail } from '@/apis/pm/sprint'
import SprintForm from '@/views/pm/sprint/SprintForm.vue'
import { statusEnum } from '@/utils/enum'

const route = useRoute()
const router = useRouter()

// project
const projectId = Number(route.params.projectId)
const projectTitle = ref('')
getProjectDetail(projectId).then((res) => {
  projectTitle.value = res.name
})

// sprint
const sprintDetailId = ref(null)
const sprintTitle = ref('新增迭代')
const sprintModalOpen = ref(false)
const allProjectUserList = ref([])
const sprintPaginationData = ref({})
const sprintQueryParams = ref({ page: 1, page_size: 20, project_id: projectId })
const sprintListData = ref([])
const sprintListLoading = ref(false)
const onSprintPageChange = (page, pageSize) => {
  if (page === 0) {
    // TODO 可能是antDesign Vue组件库的bug
    page = 1
  }
  sprintQueryParams.value.page = page
  sprintQueryParams.value.page_size = pageSize
  sprintListLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    sprintListData.value = results
    sprintPaginationData.value.total = count
    sprintPaginationData.value.current = page
    sprintPaginationData.value.pageSize = page_size
    sprintPaginationData.value.showTotal = () => `共 ${count} 条`
    sprintListLoading.value = false
  })
}
const getSprintListData = () => {
  sprintListLoading.value = true
  getSprintList(sprintQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    sprintListData.value = results
    sprintPaginationData.value = {
      total: count,
      current: page,
      pageSize: page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${count} 条`
    }
    sprintListLoading.value = false
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
const viewSprintDetail = (sprintId) => {
  tabKey.value = 'overview'
  sprintDetailId.value = sprintId
  router.push({ name: ':sprintId/overview', params: { sprintId: sprintId } })
}
const clickSprintAction = ({ item, key, keyPath }) => {
  if (key === 'editSprint') {
    sprintTitle.value = '修改迭代'
    sprintModalOpen.value = true
  } else if (key === 'deleteSprint') {
    Modal.warning({
      title: '提示',
      content: '确定删除该迭代吗？',
      okText: '确定',
      cancelText: '取消',
      maskClosable: true,
      closable: true,
      onOk: () => {
        deleteSprintDetail(sprintDetailId.value).then(() => {
          router.push({ name: `projects/:projectId/sprints`, params: { projectId: projectId } })
          getSprintListData()
          sprintDetailId.value = null
          tabKey.value = 'overview'
        })
      }
    })
  }
}

// workItem tabs
const tabKey = ref('overview')
const tabList = [
  {
    key: 'overview',
    tab: '概览'
  },
  {
    key: 'requirement',
    tab: '需求'
  },
  {
    key: 'task',
    tab: '任务'
  },
  {
    key: 'bug',
    tab: '缺陷'
  }
]
const onTabChange = (key) => {
  if (sprintDetailId.value) {
    if (key === 'overview') {
      router.push({ name: ':sprintId/overview', params: { sprintId: sprintDetailId.value } })
    } else if (key === 'requirement') {
      router.push({ name: ':sprintId/requirements', params: { sprintId: sprintDetailId.value } })
    } else if (key === 'task') {
      router.push({ name: ':sprintId/tasks', params: { sprintId: sprintDetailId.value } })
    } else if (key === 'bug') {
      router.push({ name: ':sprintId/bugs', params: { sprintId: sprintDetailId.value } })
    }
  }
  tabKey.value = key
}
</script>

<style scoped>
.active-sprint-title {
  color: #1677ff;
}
</style>
