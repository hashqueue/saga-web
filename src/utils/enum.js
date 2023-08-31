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
  }
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

/*
selectOptions
 */
export const statusOptions = [
  { value: 1, label: '未开始' },
  { value: 2, label: '进行中' },
  { value: 3, label: '已完成' }
]
