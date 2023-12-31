<template>
  <standard-modal
    :modal-open="modalOpen"
    :closable="false"
    :centered="true"
    :keyboard="false"
    :modal-width="'55%'"
    :modal-title="title"
    :modal-ok-text="'提交'"
    :modal-cancel-text="'取消'"
    :modal-mask-closable="false"
    @on-modal-ok="onOk"
    @on-modal-cancel="onCancel"
  >
    <template #form>
      <a-form ref="createUpdateFormRef" :model="createUpdateForm" :rules="createUpdateRules">
        <a-form-item name="name" label="标题">
          <a-input v-model:value="createUpdateForm.name" placeholder="请输入标题" />
        </a-form-item>
        <a-divider orientation="left">属性</a-divider>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item label="所属项目">
              <a-input :value="sprintInfo.project_name" disabled />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="所属迭代">
              <a-input :value="sprintInfo.name" disabled />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row :gutter="24">
          <a-col :span="12">
            <a-form-item name="owner" label="负责人">
              <a-select
                v-model:value="createUpdateForm.owner"
                placeholder="请选择负责人"
                :show-arrow="true"
                :filter-option="false"
                :options="ownerOptions"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="priority" label="优先级">
              <a-select
                v-model:value="createUpdateForm.priority"
                placeholder="请选择优先级"
                :options="priorityOptions"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-form-item name="deadline" label="截止日期" v-if="createUpdateForm.work_item_type === 2">
          <a-date-picker
            placeholder="请选择截止日期"
            v-model:value="createUpdateForm.deadline"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
          />
        </a-form-item>
        <a-row :gutter="24" v-if="createUpdateForm.work_item_type === 3">
          <a-col :span="12">
            <a-form-item name="bug_type" label="缺陷类型">
              <a-select
                v-model:value="createUpdateForm.bug_type"
                placeholder="请选择缺陷类型"
                :show-arrow="true"
                :filter-option="false"
                :options="bugTypeOptions"
              ></a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item name="severity" label="严重程度">
              <a-select
                v-model:value="createUpdateForm.severity"
                placeholder="请选择严重程度"
                :options="severityOptions"
              ></a-select>
            </a-form-item>
          </a-col>
        </a-row>
        <a-divider orientation="left">描述</a-divider>
        <a-form-item name="desc" label="描述">
          <markdown-editor
            v-model:content-value="createUpdateForm.desc"
            :editor-options="mdEditorOptions"
          />
        </a-form-item>
        <a-divider orientation="left">关注者</a-divider>
        <a-form-item name="followers" label="关注者">
          <a-select
            v-model:value="createUpdateForm.followers"
            mode="multiple"
            style="width: 100%"
            placeholder="请选择关注者"
            :options="followersOptions"
          ></a-select>
        </a-form-item>
      </a-form>
    </template>
  </standard-modal>
</template>

<script setup>
import { computed, ref } from 'vue'
import { createWorkItem } from '@/apis/pm/workItem'
import { updateFileWithPatch } from '@/apis/pm/userFile'
import StandardModal from '@/components/StandardModal.vue'
import MarkdownEditor from '@/components/editor/MarkdownEditor.vue'
import { useUserStore } from '@/stores/user'
import { bugTypeOptions, priorityOptions, severityOptions } from '@/utils/enum'

const props = defineProps({
  sprintInfo: {
    type: Object,
    required: true
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

const userStore = useUserStore()

const userUploadFileIds = ref([])
const mdEditorOptions = ref({
  height: '250px',
  width: '100%',
  upload: {
    url: `${import.meta.env.VITE_BASE_URL}/pm/files/`,
    headers: { Authorization: `Bearer ${userStore.getToken}` },
    fieldName: 'file',
    max: 500 * 1024 * 1024,
    format(files, responseText) {
      const resp = JSON.parse(responseText)
      const result = {
        code: 0,
        msg: resp.message,
        data: {
          errFiles: [],
          succMap: {}
        }
      }
      if (resp.success) {
        const fileNameList = resp.data.file_name.split('/')
        result.data.succMap[fileNameList[fileNameList.length - 1]] = resp.data.file
        userUploadFileIds.value.push(resp.data.id)
      } else {
        result.code = 1
      }
      return JSON.stringify(result)
    }
  }
})
const ownerOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.username, label: `${item.username} ${item.nick_name}` })
  }
  return tmpOwnerArr
})
const followersOptions = computed(() => {
  const tmpOwnerArr = []
  for (const item of props.allUserList) {
    tmpOwnerArr.push({ value: item.id, label: `${item.username} ${item.nick_name}` })
  }
  return tmpOwnerArr
})
const createUpdateForm = ref({
  name: '',
  owner: null,
  work_item_type: props.title === '新增需求' ? 1 : props.title === '新增任务' ? 2 : 3,
  priority: null,
  work_item_status: 1,
  severity: null,
  bug_type: null,
  process_result: null,
  desc: '',
  deadline: null,
  sprint: props.sprintInfo.id,
  followers: []
})
const createUpdateFormRef = ref()
const createUpdateRules = {
  name: [
    { required: true, trigger: 'change', message: '标题不能为空' },
    { max: 128, trigger: 'change', message: '标题不能多于128位' }
  ],
  owner: [{ required: true, trigger: 'change', message: '负责人不能为空' }],
  priority: [{ required: true, trigger: 'change', message: '优先级不能为空' }]
}
const onOk = () => {
  createUpdateFormRef.value
    .validateFields()
    .then((values) => {
      // 设置截止日期
      if (values.deadline) {
        values.deadline = values.deadline.format('YYYY-MM-DD HH:mm')
      }
      values.sprint = createUpdateForm.value.sprint
      values.work_item_type = createUpdateForm.value.work_item_type
      createWorkItem(values).then((res) => {
        emit('getLatestDataList')
        createUpdateFormRef.value.resetFields()
        emit('closeModal')
        // 将上传的文件跟workItem关联起来
        const formData = new FormData()
        formData.append('work_item', res.id)
        for (const userUploadFileId of userUploadFileIds.value) {
          updateFileWithPatch(userUploadFileId, formData)
        }
        userUploadFileIds.value = []
      })
    })
    .catch((info) => {
      console.log('Validate Failed:', info)
    })
}
const onCancel = () => {
  createUpdateFormRef.value.resetFields()
  emit('closeModal')
  userUploadFileIds.value = []
}
</script>

<style scoped></style>
