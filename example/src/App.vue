<script setup lang="ts">
import { ref } from 'vue'
import Download, { type STATUS} from '../../src/index'
import axios from 'axios'

const isReady = ref<boolean>(false)
const progress = ref(0)
const status = ref<STATUS>()
const download = new Download({
  url: "https://oss-cdn.mashibing.com/course_attachment/127/IDEA2019.zip",
  fileName: "IDEA2019.zip",
})

download.addListener(Download.EVENTS.READY, ()=> {
  isReady.value = true
})

download.addListener(Download.EVENTS.STATUS_UPDATE, (res)=> {
  status.value = res.status
})

download.addListener(Download.EVENTS.PROGRESS_UPDATE, (value)=> {
  progress.value = value
})

const chunkSize = 10 * 1024 * 1024;
const getFileSize = async (index: number) => {
  const start = index * chunkSize;
  const end = start + chunkSize
  await axios.get("https://msb-edu-prod.oss-cn-beijing.aliyuncs.com/course_attachment/1646/tomcat-8.5.rar", {
    responseType: 'arraybuffer',
    headers: {
      Range: `bytes=${start}-${end}`,
    },
  });
}

const run = async (index: number)=> {
  await getFileSize(index)
}

async function aaa() {
  const total = 10;
  const concurrency = 4;
  const pool: Promise<void>[] = []
  let i = 0;

  while (i < total) {
    if (pool.length >= concurrency) {
      await Promise.race(pool);
    }
    const p = run(i).finally(()=> {
      const index = pool.indexOf(p);
      index > -1 && pool.splice(index, 1);
    })
    pool.push(p)
    i++;
  }

  await Promise.all(pool);
}

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
    <button @click="handleMerge" :disabled="!isReady">合并</button>
</template>
