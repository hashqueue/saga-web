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
            <a @click="viewProjectDetail(record)">详情</a>
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
  <!--    <a-col :span="16">-->
  <!--      <a-card v-if="projectInfo" style="margin-left: 5px">-->
  <!--        <a-descriptions :title="projectInfo.name" size="default">-->
  <!--          <a-descriptions-item label="ID">{{ projectInfo.id }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="负责人"-->
  <!--            >{{ projectInfo.owner }} {{ projectInfo.owner_name }}</a-descriptions-item-->
  <!--          >-->
  <!--          <a-descriptions-item label="状态">-->
  <!--            <a-tag :color="statusEnum[projectInfo.project_status].color">{{-->
  <!--              statusEnum[projectInfo.project_status].value-->
  <!--            }}</a-tag>-->
  <!--          </a-descriptions-item>-->
  <!--          <a-descriptions-item label="迭代数量">{{ projectInfo.sprint_count }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="成员数量">{{-->
  <!--            projectInfo.members.length-->
  <!--          }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="创建人">{{ projectInfo.created_by }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="最后修改人">{{ projectInfo.updated_by }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="创建时间">{{ projectInfo.created_at }}</a-descriptions-item>-->
  <!--          <a-descriptions-item label="修改时间">{{ projectInfo.updated_at }}</a-descriptions-item>-->
  <!--        </a-descriptions>-->
  <!--        <a-divider />-->
  <!--      </a-card>-->
  <!--    </a-col>-->
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
import { btnPermissions, statusEnum } from '@/utils/enum'

const router = useRouter()

const dataList = ref([])
const title = ref('新增项目')
const modalOpen = ref(false)
const tableLoading = ref(false)
const projectId = ref(null)
const paginationData = ref({})
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
  getProjectList().then((res) => {
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
const viewProjectDetail = (record) => {
  getProjectDetail(record.id).then((res) => {})
}
const onPageChange = (pagination, filters, sorter, currentDataSource) => {
  const params = {}
  params.page = pagination.current
  params.page_size = pagination.pageSize
  tableLoading.value = true
  getProjectList(params).then((res) => {
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
</script>

<style scoped></style>
