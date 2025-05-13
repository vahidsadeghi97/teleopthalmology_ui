<template>
    <div class="files-page">
      <h1>File Management</h1>
      <FileUpload @upload-success="refreshFileList" />
      <FileList ref="fileList" />
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import FileUpload from '@/components/FileUpload.vue'
  import FileList from '@/components/FileList.vue'
  
  const fileList = ref(null)
  
  const refreshFileList = () => {
    if (fileList.value) {
      fileList.value.refresh()
    }
  }
  </script>
  
  <style scoped>
  .files-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  </style>