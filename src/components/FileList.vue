<template>
    <div class="file-list">
      <h2>Your Files</h2>
      <div v-if="isLoading">Loading files...</div>
      <div v-else-if="files.length === 0">No files uploaded yet.</div>
      <ul v-else class="file-items">
        <li v-for="file in files" :key="file.id" class="file-item">
          <div class="file-info">
            <a :href="file.file" target="_blank" class="file-name">
              {{ file.original_filename }}
            </a>
            <span class="file-size">{{ formatFileSize(file.file_size) }}</span>
            <span class="file-date">{{ formatDate(file.upload_date) }}</span>
            <p v-if="file.description" class="file-description">
              {{ file.description }}
            </p>
          </div>
          <button @click="deleteFile(file.id)" class="delete-btn">Delete</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import FileService from '@/services/file.service'
  
  const files = ref([])
  const isLoading = ref(true)
  
  const fetchFiles = async () => {
    isLoading.value = true
    try {
      const response = await FileService.getFiles()
      files.value = response.data
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const deleteFile = async (id) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    
    try {
      await FileService.deleteFile(id)
      files.value = files.value.filter(file => file.id !== id)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }
  
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString()
  }
  
  onMounted(fetchFiles)
  
  defineExpose({
    refresh: fetchFiles
  })
  </script>
  
  <style scoped>
  .file-list {
    max-width: 800px;
    margin: 20px auto;
  }
  
  .file-items {
    list-style: none;
    padding: 0;
  }
  
  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 10px;
  }
  
  .file-info {
    flex-grow: 1;
  }
  
  .file-name {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;
    margin-right: 10px;
  }
  
  .file-name:hover {
    text-decoration: underline;
  }
  
  .file-size, .file-date {
    font-size: 0.9em;
    color: #666;
    margin-right: 10px;
  }
  
  .file-description {
    margin-top: 5px;
    color: #555;
    font-size: 0.9em;
  }
  
  .delete-btn {
    background: #ff4444;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
  }
  
  .delete-btn:hover {
    background: #cc0000;
  }
  </style>