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
        <a-form-item name="name" label="迭代名">
          <a-input v-model:value="createUpdateForm.name" placeholder="请输入迭代名" />
        </a-form-item>
        <a-form-item label="所属项目">
          <a-input :value="projectName" disabled />
        </a-form-item>
        <a-form-item name="owner" label="迭代负责人">
          <a-select
            v-model:value="createUpdateForm.owner"
            placeholder="请选择迭代负责人"
            :show-arrow="true"
            :filter-option="false"
            :options="ownerOptions"
          ></a-select>
        </a-form-item>
        <a-form-item name="sprint_status" label="迭代状态">
          <a-select
            v-model:value="createUpdateForm.sprint_status"
            placeholder="请选择迭代状态"
            :options="statusOptions"
          ></a-select>
        </a-form-item>
        <a-form-item name="started_at" label="迭代周期">
          <a-range-picker
            v-model:value="createUpdateForm.started_at"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="['开始时间', '完成时间']"
          />
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import { createSprint, updateSprint, getSprintDetail } from '@/apis/pm/sprint'
import StandardModal from '@/components/StandardModal.vue'
import { statusOptions } from '@/utils/enum'

const props = defineProps({
  projectName: {
    type: String,
    required: true
  },
  sprintId: {
    type: [Number, null],
    required: false
  },
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
  },
  allUserList: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(['closeModal', 'getLatestDataList'])

const createUpdateFormRef = ref()
const labelCol = { span: 5 }
const wrapperCol = { span: 20 }
const ownerOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.username, label: `${item.username} ${item.nick_name}` })
  }
  return tmpOwnerArr
})
const createUpdateForm = ref({
  name: '',
  owner: null,
  started_at: [],
  finished_at: '',
  sprint_status: 1,
  project: props.projectId
})
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '迭代名不能为空' },
    { max: 128, trigger: 'change', message: '迭代名不能多于128位' }
  ],
  owner: [{ required: true, trigger: 'change', message: '迭代负责人不能为空' }]
}

watch(
  () => props.modalOpen,
  (newValue, oldValue) => {
    if (props.title === '修改迭代') {
      getSprintDetail(props.sprintId).then((res) => {
        if (res.started_at && res.finished_at) {
          createUpdateForm.value = {
            name: res.name,
            owner: res.owner,
            sprint_status: res.sprint_status,
            project: res.project,
            started_at: [dayjs(res.started_at), dayjs(res.finished_at)],
            finished_at: ''
          }
        } else {
          createUpdateForm.value = {
            name: res.name,
            owner: res.owner,
            sprint_status: res.sprint_status,
            project: res.project,
            started_at: [],
            finished_at: ''
          }
        }
      })
    }
  }
)
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      // 添加projectId
      values.project = props.projectId
      // 设置迭代周期的起止时间
      const dateTimes = values.started_at
      if (values.started_at && values.started_at.length) {
        values.started_at = dateTimes[0].format('YYYY-MM-DD HH:mm')
        values.finished_at = dateTimes[1].format('YYYY-MM-DD HH:mm')
      } else {
        delete values.started_at
      }
      if (props.title === '修改迭代') {
        updateSprint(props.sprintId, values).then(() => {
          // 重新获取一遍迭代信息
          emit('getLatestDataList')
          createUpdateFormRef.value.resetFields()
          emit('closeModal')
        })
      } else {
        createSprint(values).then(() => {
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
</script>

<style scoped></style>
