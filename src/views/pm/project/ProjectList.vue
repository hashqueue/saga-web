<template>
  <a-card>
    <standard-table
      :data-source="dataList"
      :columns="columns"
      :row-key="'id'"
      :loading="tableLoading"
      :pagination="paginationData"
      @on-page-change="onPageChange"
    >
      <template #tableFilter>
        <a-form
          ref="filterFormRef"
          :model="filterForm"
          :wrapper-col="{ span: 20 }"
          @finish="handleFilterFinish"
        >
          <a-row>
            <a-col :span="8">
              <a-form-item name="name" label="项目名">
                <a-input v-model:value="filterForm.name" placeholder="项目名" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="owner" label="负责人">
                <a-input v-model:value="filterForm.owner" placeholder="请输入负责人(英文用户名)" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="project_status" label="状态">
                <a-select
                  v-model:value="filterForm.project_status"
                  placeholder="请选择状态"
                  :options="statusOptions"
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
        <a-button type="primary" @click="createProject" v-permission="btnPermissions.project.create"
          >新增项目</a-button
        >
      </template>
      <template #action="{ column, record }">
        <template v-if="column.key === 'action'">
          <span>
            <a @click="updateProject(record)" v-permission="btnPermissions.project.update">修改</a>
            <a-divider type="vertical" />
            <a @click="addMembers(record)" v-permission="btnPermissions.project.addMembers"
              >添加项目成员</a
            >
            <a-divider type="vertical" />
            <a @click="viewSprintList(record)">迭代列表</a>
            <a-divider type="vertical" />
            <a-popconfirm
              title="确定删除该项目吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="deleteProject(record.id)"
            >
              <a v-permission="btnPermissions.project.delete">删除</a>
            </a-popconfirm>
          </span>
        </template>
        <template v-else-if="column.key === 'id'">#{{ record.id }}</template>
        <template v-else-if="column.key === 'owner'"
          >{{ record.owner }} {{ record.owner_name }}</template
        >
        <template v-else-if="column.key === 'project_status'">
          <a-tag :color="statusEnum[record.project_status].color">{{
            statusEnum[record.project_status].value
          }}</a-tag>
        </template>
      </template>
    </standard-table>
  </a-card>
  <project-form
    :modal-open="modalOpen"
    :title="title"
    :project-id="projectId"
    @close-modal="closeModal"
    @get-latest-data-list="getProjectListData"
  />
  <a-drawer :open="drawerOpen" :title="drawerTitle" width="50%" @close="closeDrawer">
    <standard-table
      :row-key="'id'"
      :data-source="allUserDataList"
      :row-selection="{ selectedRowKeys: memberSelectedRowKeys, onChange: onSelectChange }"
      :columns="allUserColumns"
      :pagination="{ hideOnSinglePage: true }"
    ></standard-table>
    <a-button style="margin-top: 16px" @click="submitAddMembers" type="primary">提交</a-button>
  </a-drawer>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  deleteProjectDetail,
  getProjectList,
  updateProjectWithPatch,
  getProjectDetail
} from '@/apis/pm/project'
import ProjectForm from './ProjectForm.vue'
import StandardTable from '@/components/StandardTable.vue'
import { getAllUserList } from '@/apis/system/user'
import { btnPermissions, statusEnum, statusOptions } from '@/utils/enum'

const router = useRouter()

const dataList = ref([])
const title = ref('新增项目')
const modalOpen = ref(false)
const tableLoading = ref(false)
const projectId = ref(null)
const paginationData = ref({})
const projectQueryParams = ref({ page: 1, page_size: 10 })
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id'
  },
  {
    title: '项目名',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '状态',
    dataIndex: 'project_status',
    key: 'project_status'
  },
  {
    title: '负责人',
    dataIndex: 'owner',
    key: 'owner'
  },
  {
    title: '迭代数量',
    dataIndex: 'sprint_count',
    key: 'sprint_count'
  },
  {
    title: '创建人',
    dataIndex: 'created_by',
    key: 'created_by'
  },
  {
    title: '修改人',
    dataIndex: 'updated_by',
    key: 'updated_by'
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at'
  },
  {
    title: '修改时间',
    dataIndex: 'updated_at',
    key: 'updated_at'
  },
  {
    title: '操作',
    key: 'action'
  }
]
const getProjectListData = () => {
  tableLoading.value = true
  getProjectList(projectQueryParams.value).then((res) => {
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
getProjectListData()
const viewSprintList = (record) => {
  router.push({ name: `/projects/:projectId/sprints`, params: { projectId: record.id } })
}
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  projectQueryParams.value.page = pagination.current
  projectQueryParams.value.page_size = pagination.pageSize
  tableLoading.value = true
  getProjectList(projectQueryParams.value).then((res) => {
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
const createProject = () => {
  title.value = '新增项目'
  modalOpen.value = true
}
const closeModal = () => {
  title.value = '新增项目'
  modalOpen.value = false
}
const updateProject = (record) => {
  projectId.value = record.id
  title.value = '修改项目'
  modalOpen.value = true
}
const deleteProject = (projectId) => {
  deleteProjectDetail(projectId).then(() => {
    getProjectListData()
  })
}

// 添加项目成员
const allUserDataList = ref([])
const drawerOpen = ref(false)
const drawerTitle = ref('')
const addMembersProjectId = ref(null)
const memberSelectedRowKeys = ref([])
const allUserColumns = [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username'
  },
  {
    title: '昵称',
    dataIndex: 'nick_name',
    key: 'nick_name'
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email'
  },
  {
    title: '职位',
    dataIndex: 'position',
    key: 'position'
  }
]
const addMembers = (record) => {
  getAllUserList().then((res) => {
    allUserDataList.value = res.results
    getProjectDetail(record.id).then((res) => {
      const tmp = []
      for (const member of res.members) {
        tmp.push(member.id)
      }
      memberSelectedRowKeys.value = tmp
      drawerTitle.value = `为项目 ${record.name} 添加成员`
      drawerOpen.value = true
      addMembersProjectId.value = record.id
    })
  })
}
const submitAddMembers = () => {
  updateProjectWithPatch(addMembersProjectId.value, { members: memberSelectedRowKeys.value }).then(
    () => {
      drawerOpen.value = false
    }
  )
}
const onSelectChange = (selectedRowKeys, selectedRows) => {
  memberSelectedRowKeys.value = selectedRowKeys
}
const closeDrawer = () => {
  drawerOpen.value = false
}

// project filter
const filterFormRef = ref()
const filterForm = ref({
  name: '',
  owner: '',
  project_status: null
})
const handleFilterFinish = (values) => {
  projectQueryParams.value = { ...projectQueryParams.value, ...values }
  // console.log('handleFilterFinish', projectQueryParams.value)
  getProjectListData()
}
const resetFilterForm = () => {
  filterFormRef.value.resetFields()
  for (const valueKey in filterForm.value) {
    if (valueKey in projectQueryParams.value) {
      delete projectQueryParams.value[valueKey]
    }
  }
  // console.log('resetFilterForm', projectQueryParams.value)
  getProjectListData()
}
</script>

<style scoped></style>
