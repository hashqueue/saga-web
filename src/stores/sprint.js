import { defineStore } from 'pinia'

import { setItem, getItem } from '@/utils/storage'

export const useSprintStore = defineStore('sprint', {
  state: () => ({
    needUpdateSprintDetail: false
  }),
  getters: {
    getNeedUpdateSprintDetail(state) {
      if (!state.needUpdateSprintDetail) {
        const newNeedUpdateSprintDetail = getItem('needUpdateSprintDetail')
        this.needUpdateSprintDetail = newNeedUpdateSprintDetail
        return newNeedUpdateSprintDetail
      }
      return state.needUpdateSprintDetail
    }
  },
  actions: {
    setNeedUpdateSprintDetail(needUpdateSprintDetail) {
      this.needUpdateSprintDetail = needUpdateSprintDetail
      setItem('needUpdateSprintDetail', needUpdateSprintDetail)
    }
  }
})
