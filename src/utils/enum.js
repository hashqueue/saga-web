/*
button permission directive
 */
export const btnPermissions = {
  permission: { create: '新增权限', update: '修改权限', delete: '删除权限' },
  role: { create: '新增角色', update: '修改角色', delete: '删除角色' },
  user: { create: '新增用户', update: '修改用户', delete: '删除用户' },
  userProfile: { updateProfile: '修改个人信息', resetPassword: '重置密码' },
  department: { create: '新增部门', update: '修改部门', delete: '删除部门' },
  project: {
    create: '新增项目',
    update: '修改项目',
    delete: '删除项目',
    addMembers: '添加项目成员'
  },
  sprint: { create: '新增迭代', update: '修改迭代', delete: '删除迭代' },
  workItem: { create: '新增工作项', update: '修改工作项', delete: '删除工作项' }
}

/*
enum
 */
export const permTypeEnum = {
  1: { value: '菜单', color: 'processing' },
  2: { value: '目录', color: 'success' },
  3: { value: '按钮', color: 'error' }
}

export const genderEnum = {
  1: { value: '男', color: 'processing' },
  2: { value: '女', color: 'error' }
}

export const statusEnum = {
  1: { value: '未开始', color: '' },
  2: { value: '进行中', color: 'geekblue' },
  3: { value: '已完成', color: 'green' }
}

export const workItemStatusEnum = {
  1: { value: '未开始', color: '' },
  2: { value: '待处理', color: '' },
  3: { value: '重新打开', color: '' },
  4: { value: '进行中', color: '' },
  5: { value: '实现中', color: '' },
  6: { value: '已完成', color: '' },
  7: { value: '修复中', color: '' },
  8: { value: '已实现', color: '' },
  9: { value: '关闭', color: '' },
  10: { value: '已修复', color: '' },
  11: { value: '已验证', color: '' },
  12: { value: '已拒绝', color: '' }
}
export const workItemTypesEnum = {
  1: { value: '需求', color: '' },
  2: { value: '任务', color: '' },
  3: { value: '缺陷', color: '' }
}
export const priorityEnum = {
  1: { value: '最低', color: 'default' },
  2: { value: '较低', color: 'success' },
  3: { value: '普通', color: 'processing' },
  4: { value: '较高', color: 'warning' },
  5: { value: '最高', color: 'error' }
}

/*
selectOptions
 */
export const statusOptions = [
  { value: 1, label: '未开始' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' }
]

export const processResultOptions = [
  { value: 1, label: '不予处理' },
  { value: 2, label: '延期处理' },
  { value: 3, label: '外部原因' },
  { value: 4, label: '需求变更' },
  { value: 5, label: '转需求' },
  { value: 6, label: '挂起' },
  { value: 7, label: '设计如此' },
  { value: 8, label: '重复缺陷' },
  { value: 9, label: '无法重现' }
]
export const workItemStatusOptions = [
  { value: 1, label: '未开始' },
  { value: 2, label: '待处理' },
  { value: 3, label: '重新打开' },
  { value: 4, label: '进行中' },
  { value: 5, label: '实现中' },
  { value: 6, label: '已完成' },
  { value: 7, label: '修复中' },
  { value: 8, label: '已实现' },
  { value: 9, label: '关闭' },
  { value: 10, label: '已修复' },
  { value: 11, label: '已验证' },
  { value: 12, label: '已拒绝' }
]
export const priorityOptions = [
  { value: 1, label: '最低' },
  { value: 2, label: '较低' },
  { value: 3, label: '普通' },
  { value: 4, label: '较高' },
  { value: 5, label: '最高' }
]
export const bugTypeOptions = [
  { value: 1, label: '功能问题' },
  { value: 2, label: '性能问题' },
  { value: 3, label: '接口问题' },
  { value: 4, label: '安全问题' },
  { value: 5, label: 'UI界面问题' },
  { value: 6, label: '易用性问题' },
  { value: 7, label: '兼容问题' },
  { value: 8, label: '数据问题' },
  { value: 9, label: '逻辑问题' },
  { value: 10, label: '需求问题' }
]
export const severityOptions = [
  { value: 1, label: '保留' },
  { value: 2, label: '建议' },
  { value: 3, label: '提示' },
  { value: 4, label: '一般' },
  { value: 5, label: '严重' },
  { value: 6, label: '致命' }
]

export const taskResultsStatusOptions = [
  { value: 1, label: 'PENDING' },
  { value: 2, label: 'RECEIVED' },
  { value: 3, label: 'STARTED' },
  { value: 4, label: 'SUCCESS' },
  { value: 5, label: 'FAILURE' },
  { value: 6, label: 'REVOKED' },
  { value: 7, label: 'RETRY' },
  { value: 8, label: 'IGNORED' },
  { value: 9, label: 'Queued' }
]
