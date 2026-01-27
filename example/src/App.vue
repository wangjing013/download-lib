<script setup lang="ts">
import { ref } from 'vue'
import  { Download, type STATUS } from '../../src/index'

const isReady = ref<boolean>(false)
const progress = ref<string>('0')
const status = ref<STATUS>()

Download.setMitmPath('http://localhost:5173/mitm.html')
const download = new Download({
  url: "https://oss-cdn.mashibing.com/course_attachment/127/IDEA2019.zip",
  fileName: "IDEA2019.zip",
  onReady() {
    isReady.value = true
  },
  onStatusChange(value, error) {
    status.value = value
  },
  onProgress(value: string) {
    progress.value = value
  },
})

const handleDownload = ()=> {
  download.start()
}

const handleMerge = ()=> {
  download.mergeAndDownload()
}

const handlePause = () => {
  download.pause()
}

const handleResume = ()=> {
 download.resume()
}
</script>

<template>
    {{  isReady }}
    <div>{{ progress }}</div>
    <div>{{ status }}</div>
    <button @click="handleDownload" :disabled="!isReady">开始</button>
    <button @click="handlePause" :disabled="!isReady">暂停</button>
    <button @click="handleResume" :disabled="!isReady">继续</button>
</template>
