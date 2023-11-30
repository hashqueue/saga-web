<template>
  <a-row :gutter="24">
    <a-col :span="12">
      <a-card class="data-card" title="Memory Real-Time Data">
        <v-chart class="chart" :option="memoryOption" />
      </a-card>
    </a-col>
    <a-col :span="12">
      <a-card class="data-card" title="Disk Real-Time Data">
        <v-chart class="chart" :option="diskOption" />
      </a-card>
    </a-col>
  </a-row>
  <a-row :gutter="24">
    <a-col :span="12">
      <a-card class="data-card" title="CPU Real-Time Data">
        <v-chart class="chart" :option="cpuOption" />
      </a-card>
    </a-col>
  </a-row>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { use } from 'echarts/core'
import { message } from 'ant-design-vue'
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent } from 'echarts/components'
import { UniversalTransition } from 'echarts/features'
import { LineChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

// import { ref, provide, onMounted, onUnmounted } from 'vue'
// import VChart, { THEME_KEY } from 'vue-echarts'

use([CanvasRenderer, LineChart, TitleComponent, TooltipComponent, LegendComponent, GridComponent, UniversalTransition])
// provide(THEME_KEY, 'dark')
const date = ref([])
// memory
const totalMemory = ref([])
const availableMemory = ref([])
const freeMemory = ref([])
const usedMemory = ref([])
const memoryPercent = ref([])
const memoryOption = ref({
  title: {
    // text: 'Memory Real-Time Data'
    text: ''
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Total Memory(GB)', 'Available Memory(GB)', 'Free Memory(GB)', 'Used Memory(GB)', 'Memory Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Total Memory(GB)',
      type: 'line',
      data: totalMemory.value
    },
    {
      name: 'Available Memory(GB)',
      type: 'line',
      data: availableMemory.value
    },
    {
      name: 'Free Memory(GB)',
      type: 'line',
      data: freeMemory.value
    },
    {
      name: 'Used Memory(GB)',
      type: 'line',
      data: usedMemory.value
    },
    {
      name: 'Memory Percent(%)',
      type: 'line',
      data: memoryPercent.value
    }
  ]
})
// cpu
const cpuCount = ref([])
const cpuPercent = ref([])
const cpuOption = ref({
  title: {
    // text: 'CPU Real-Time Data'
    text: ''
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['CPU Count(核)', 'CPU Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'CPU Count(核)',
      type: 'line',
      data: cpuCount.value
    },
    {
      name: 'CPU Percent(%)',
      type: 'line',
      data: cpuPercent.value
    }
  ]
})
//disk
const totalDisk = ref([])
const usedDisk = ref([])
const freeDisk = ref([])
const diskPercent = ref([])
const diskOption = ref({
  title: {
    // text: 'Disk Real-Time Data'
    text: ''
  },
  tooltip: {
    trigger: 'axis'
  },
  legend: {
    left: 'center',
    data: ['Total Disk(GB)', 'Used Disk(GB)', 'Free Disk(GB)', 'Disk Percent(%)']
  },
  xAxis: {
    type: 'category',
    data: date.value
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'Total Disk(GB)',
      type: 'line',
      data: totalDisk.value
    },
    {
      name: 'Used Disk(GB)',
      type: 'line',
      data: usedDisk.value
    },
    {
      name: 'Free Disk(GB)',
      type: 'line',
      data: freeDisk.value
    },
    {
      name: 'Disk Percent(%)',
      type: 'line',
      data: diskPercent.value
    }
  ]
})

const removeArrFirstElementBeginPushElement = (arr, value) => {
  if (arr.length === 180) {
    arr.shift()
  }
  arr.push(value)
}

// SSE
let eventSource
onMounted(() => {
  eventSource = new EventSource(
      `http://${location.host}${import.meta.env.VITE_BASE_URL}/system/monitor/`
  )
  eventSource.onmessage = (event) => {
    // 当接收到SSE推送过来的数据时触发
    // date
    const serverData = JSON.parse(event.data)
    const dateNow = new Date()
    const now = dateNow.toLocaleTimeString()
    removeArrFirstElementBeginPushElement(date.value, now)
    //cpu
    removeArrFirstElementBeginPushElement(cpuCount.value, serverData.cpu.cpu_count)
    removeArrFirstElementBeginPushElement(cpuPercent.value, serverData.cpu.cpu_percent)
    // memory
    removeArrFirstElementBeginPushElement(totalMemory.value, serverData.memory.total_memory)
    removeArrFirstElementBeginPushElement(availableMemory.value, serverData.memory.available_memory)
    removeArrFirstElementBeginPushElement(freeMemory.value, serverData.memory.free_memory)
    removeArrFirstElementBeginPushElement(usedMemory.value, serverData.memory.used_memory)
    removeArrFirstElementBeginPushElement(memoryPercent.value, serverData.memory.memory_percent)
    // disk
    removeArrFirstElementBeginPushElement(totalDisk.value, serverData.disk.total_disk)
    removeArrFirstElementBeginPushElement(usedDisk.value, serverData.disk.used_disk)
    removeArrFirstElementBeginPushElement(freeDisk.value, serverData.disk.free_disk)
    removeArrFirstElementBeginPushElement(diskPercent.value, serverData.disk.disk_percent)
  }
  eventSource.onopen = (event) => {
    message.success('SSE连接已建立，可以接收数据...')
  }
  eventSource.onerror = (event) => {
    message.error('SSE连接发生通信错误，连接已中断...')
  }
})
onUnmounted(() => {
  // 关闭当前SSE连接
  eventSource.close()
})
</script>

<style scoped>
.chart {
  width: 100%;
  height: 450px;
}
.data-card {
  margin-bottom: 10px;
}
</style>
