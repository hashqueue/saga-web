<template>
  <standard-table
    :data-source="dataList"
    :columns="columns"
    :table-size="'small'"
    :row-key="'id'"
    :scroll="{ x: '100%' }"
    :loading="tableLoading"
    :pagination="paginationData"
    @on-page-change="onPageChange"
  >
    <template #tableFilter>
      <a-form
        ref="filterFormRef"
        :model="filterForm"
        :wrapper-col="{ span: 18 }"
        @finish="handleFilterFinish"
      >
        <a-row>
          <a-col :span="6">
            <a-form-item
              name="name"
              :label="`${workItemTypesEnum[workItemType].value}名&nbsp&nbsp`"
            >
              <a-input
                v-model:value="filterForm.name"
                :placeholder="`请输入${workItemTypesEnum[workItemType].value}名`"
              />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="owner" label="负&nbsp&nbsp责&nbsp&nbsp人">
              <a-input v-model:value="filterForm.owner" placeholder="请输入负责人(英文用户名)" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="desc" label="描&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp述">
              <a-input v-model:value="filterForm.desc" placeholder="请输入描述" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="created_by" label="创建人">
              <a-input v-model:value="filterForm.created_by" placeholder="请输入创建人" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-if="workItemType === 3">
          <a-col :span="6">
            <a-form-item name="bug_type" label="缺陷类型">
              <a-select
                v-model:value="filterForm.bug_type"
                placeholder="请选择缺陷类型"
                :options="bugTypeOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="process_result" label="处理结果">
              <a-select
                v-model:value="filterForm.process_result"
                placeholder="请选择处理结果"
                :options="processResultOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="severity" label="严重程度">
              <a-select
                v-model:value="filterForm.severity"
                placeholder="请选择严重程度"
                :options="severityOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="6">
            <a-form-item name="work_item_status" label="状&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp态">
              <a-select
                v-model:value="filterForm.work_item_status"
                placeholder="请选择工作项状态"
                :options="workItemStatusOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="priority" label="优&nbsp&nbsp先&nbsp&nbsp级">
              <a-select
                v-model:value="filterForm.priority"
                placeholder="请选择优先级"
                :options="priorityOptions"
                :allow-clear="true"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item>
          <a-button type="primary" html-type="submit">查询</a-button>
          <a-button style="margin-left: 10px" @click="resetFilterForm">重置</a-button>
        </a-form-item>
      </a-form>
      <a-divider />
      <a-button
        type="primary"
        @click="createWorkItem"
        v-permission="btnPermissions.workItem.create"
        >{{ `新增${workItemTypesEnum[workItemType].value}` }}</a-button
      >
    </template>
    <template #action="{ column, record }">
      <template v-if="column.key === 'action'">
        <span>
          <a @click="updateWorkItem(record)" v-permission="btnPermissions.workItem.update">修改</a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="`确定删除该${workItemTypesEnum[workItemType].value}吗？`"
            ok-text="确定"
            cancel-text="取消"
            @confirm="deleteWorkItem(record.id)"
          >
            <a v-permission="btnPermissions.workItem.delete">删除</a>
          </a-popconfirm>
        </span>
      </template>
      <template v-else-if="column.key === 'id'">#{{ record.id }}</template>
      <template v-else-if="column.key === 'owner'"
        >{{ record.owner }} {{ record.owner_name }}</template
      >
      <template v-else-if="column.key === 'work_item_status'">
        <a-tag color="geekblue">{{ workItemStatusEnum[record.work_item_status].value }}</a-tag>
      </template>
      <template v-else-if="column.key === 'priority'">
        <a-tag :color="priorityEnum[record.priority].color">{{
          priorityEnum[record.priority].value
        }}</a-tag>
      </template>
      <template v-else-if="column.key === 'name'">
        <a-tooltip>
          <template #title>{{ record.name }}</template>
          {{ record.name.length > 8 ? record.name.slice(0, 8) + '...' : record.name }}
        </a-tooltip>
      </template>
    </template>
  </standard-table>
  <work-item-create-form
    v-if="sprintInfo"
    :modal-open="createFormModalOpen"
    :all-user-list="allUserDataList"
    :title="title"
    :sprint-info="sprintInfo"
    @close-modal="closeCreateFormModal"
    @get-latest-data-list="getWorkItemListData"
  />
  <work-item-update-form
    v-if="sprintInfo"
    :modal-open="updateFormModalOpen"
    :all-user-list="allUserDataList"
    :title="title"
    :sprint-info="sprintInfo"
    :workItem-id="workItemId"
    @close-modal="closeUpdateFormModal"
    @get-latest-data-list="getWorkItemListData"
  />
</template>

<script setup>
import { ref } from 'vue'
import StandardTable from '@/components/StandardTable.vue'
import WorkItemCreateForm from '@/views/pm/workItem/WorkItemCreateForm.vue'
import WorkItemUpdateForm from '@/views/pm/workItem/WorkItemUpdateForm.vue'
import {
  priorityEnum,
  workItemStatusEnum,
  workItemTypesEnum,
  bugTypeOptions,
  processResultOptions,
  workItemStatusOptions,
  priorityOptions,
  severityOptions,
  btnPermissions
} from '@/utils/enum'
import { getSprintDetail } from '@/apis/pm/sprint'
import { getProjectMembers } from '@/apis/pm/project'
import { deleteWorkItemDetail, getWorkItemList } from '@/apis/pm/workItem'

const props = defineProps({
  workItemType: {
    type: Number,
    required: true,
    default: 1
  },
  sprintId: {
    type: Number,
    required: true
  }
})

const workItemId = ref(null)
const sprintInfo = ref(null)
const allUserDataList = ref([])

const dataList = ref([])
const createFormModalOpen = ref(false)
const updateFormModalOpen = ref(false)
const title = ref(`新增${workItemTypesEnum[props.workItemType].value}`)
const workItemQueryParams = ref({
  page: 1,
  page_size: 10,
  sprint_id: props.sprintId,
  work_item_type: props.workItemType
})
const tableLoading = ref(false)
const paginationData = ref({})
const columns = [
  {
    title: `${workItemTypesEnum[props.workItemType].value}名`,
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left'
  },
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 70
  },
  {
    title: '状态',
    dataIndex: 'work_item_status',
    key: 'work_item_status',
    width: 100
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    key: 'priority',
    width: 80
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner',
    width: 150
  },
  {
    title: '创建人',
    dataIndex: 'created_by',
    key: 'created_by',
    width: 150
  },
  {
    title: '最后修改人',
    dataIndex: 'updated_by',
    key: 'updated_by',
    width: 150
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180
  },
  {
    title: '修改时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right'
  }
]
getSprintDetail(props.sprintId).then((res) => {
  sprintInfo.value = res
  getProjectMembers(res.project).then((res) => {
    allUserDataList.value = res.results
  })
})
const getWorkItemListData = () => {
  tableLoading.value = true
  getWorkItemList(workItemQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    dataList.value = results
    paginationData.value = {
      total: count,
      current: page,
      pageSize: page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${count} 条`
    }
    tableLoading.value = false
  })
}
getWorkItemListData()
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  workItemQueryParams.value.page = pagination.current
  workItemQueryParams.value.page_size = pagination.pageSize
  tableLoading.value = true
  getWorkItemList(workItemQueryParams.value).then((res) => {
    const { page, results, page_size, count } = res
    dataList.value = results
    paginationData.value = {
      total: count,
      current: page,
      pageSize: page_size,
      pageSizeOptions: ['10', '20', '30', '40', '50'],
      showSizeChanger: true,
      showTotal: () => `共 ${count} 条`
    }
    tableLoading.value = false
  })
}
const createWorkItem = () => {
  title.value = `新增${workItemTypesEnum[props.workItemType].value}`
  createFormModalOpen.value = true
}
const closeCreateFormModal = () => {
  title.value = `新增${workItemTypesEnum[props.workItemType].value}`
  createFormModalOpen.value = false
}
const closeUpdateFormModal = () => {
  title.value = `修改${workItemTypesEnum[props.workItemType].value}`
  updateFormModalOpen.value = false
}
const updateWorkItem = (record) => {
  workItemId.value = record.id
  title.value = `修改${workItemTypesEnum[props.workItemType].value}`
  updateFormModalOpen.value = true
}
const deleteWorkItem = (scriptId) => {
  deleteWorkItemDetail(scriptId).then(() => {
    getWorkItemListData()
  })
}

// workItem filter form
const filterFormRef = ref()
const filterForm = ref({
  name: '',
  owner: '',
  desc: '',
  created_by: '',
  work_item_status: null,
  priority: null,
  bug_type: null,
  process_result: null,
  severity: null
})
const handleFilterFinish = (values) => {
  workItemQueryParams.value = { ...workItemQueryParams.value, ...values }
  // console.log('filterForm.value', filterForm.value)
  // console.log(workItemQueryParams.value)
  getWorkItemListData()
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in workItemQueryParams.value) {
      delete workItemQueryParams.value[valueKey]
    }
  }
  getWorkItemListData()
}
</script>

<style scoped></style>
