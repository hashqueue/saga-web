<template>
  <standard-modal
    :modal-open="modalOpen"
    :modal-width="600"
    :modal-title="title"
    :modal-ok-text="'提交'"
    :modal-cancel-text="'取消'"
    @on-modal-ok="onOk"
    @on-modal-cancel="onCancel"
  >
    <template #form>
      <a-form
        ref="createUpdateFormRef"
        :model="createUpdateForm"
        :rules="createUpdateRules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item name="name" label="项目名">
          <a-input v-model:value="createUpdateForm.name" placeholder="请输入项目名" />
        </a-form-item>
        <a-form-item name="owner" label="项目负责人">
          <a-select
            v-model:value="createUpdateForm.owner"
            placeholder="请选择项目负责人"
            :show-arrow="true"
            :filter-option="false"
            :options="ownerOptions"
          ></a-select>
        </a-form-item>
        <a-form-item name="project_status" label="项目状态">
          <a-select
            v-model:value="createUpdateForm.project_status"
            placeholder="请选择项目状态"
            :options="statusOptions"
          ></a-select>
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { createProject, updateProject, getProjectDetail } from '@/apis/pm/project'
import StandardModal from '@/components/StandardModal.vue'
import { statusOptions } from '@/utils/enum'
import { getAllUserList } from '@/apis/system/user'

const props = defineProps({
  projectId: {
    type: [Number, null],
    required: false
  },
  modalOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
const emit = defineEmits(['closeModal', 'getLatestDataList'])

const allUserList = ref([])
const ownerOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of allUserList.value) {
    tmpOwnerArr.push({ value: item.username, label: `${item.username} ${item.nick_name}` })
  }
  return tmpOwnerArr
})
const labelCol = { span: 4 }
const wrapperCol = { span: 20 }

const createUpdateFormRef = ref()
const createUpdateForm = ref({
  name: '',
  owner: null,
  project_status: 1
})
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '项目名不能为空' },
    { max: 128, trigger: 'change', message: '项目名不能多于128位' }
  ],
  owner: [{ required: true, trigger: 'change', message: '项目负责人不能为空' }]
}

const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      if (props.title === '修改项目') {
        updateProject(props.projectId, values).then(() => {
          // 重新获取一遍项目信息
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createProject(values).then(() => {
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      }
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onCancel = () => {
  createUpdateFormRef.value.resetFields()
  emit('closeModal')
}

watch(
  () => props.modalOpen,
  (newValue, oldValue) => {
    if (newValue) {
      // 当modalOpen为true时，获取所有用户列表
      getAllUserList().then((res) => {
        allUserList.value = res.results
      })
    }
    if (props.title === '修改项目') {
      getProjectDetail(props.projectId).then((res) => {
        const { name, project_status, owner } = res
        createUpdateForm.value = {
          name,
          project_status,
          owner
        }
      })
    }
  }
)
</script>

<style scoped></style>
