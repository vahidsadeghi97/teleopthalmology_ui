<template>
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="container mx-auto px-4">
        <h1 class="text-3xl font-bold text-gray-800  text-center p-8">
          My Uploaded Files
        </h1>
  
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
  
        <!-- Error state -->
        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          {{ error }}
        </div>
  
        <!-- File list -->
        <div v-if="files.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="file in files"
            :key="file.file.id"
            class="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300"
          >
            <div class="flex flex-col h-full">
              <h2 class="text-xl font-semibold text-gray-800 truncate">{{ file.file.original_filename }}</h2>
              <p class="text-gray-500 mt-2 flex-1">{{ file.file.description || 'No description' }}</p>
              <p class="text-sm text-gray-400 mt-2">
                Uploaded: {{ formatDate(file.file.upload_date) }} <br />
                Size: {{ formatFileSize(file.file.file_size) }}
              </p>
              <div class="mt-4 flex gap-3">
                <!-- <a
                  :href="file.file"
                  target="_blank"
                  class="flex-1 bg-blue-500 text-white text-center py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Download
                </a> -->
                <router-link :to="`/canvas_editor/${file.file.id}`"  class="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors text-center">Image Editor</router-link>

              </div>
            </div>
          </div>
        </div>
  
        <!-- Empty state -->
        <div
          v-else-if="!loading && !error"
          class="text-center text-gray-500 bg-white p-8 rounded-xl shadow-md"
        >
          <p class="text-lg">No files uploaded yet. Start sharing your files!</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import FileService from '@/services/file.service' // Adjust path to your FileService
import { RouterLink } from 'vue-router'
  
  const files = ref([])
  const loading = ref(true)
  const error = ref(null)
  const deleting = ref(false)
  
  // Fetch files using FileService
  const fetchFiles = async () => {
    try {
      const response = await FileService.getAssignedFiles()
      files.value = response.data
      loading.value = false
    } catch (err) {
      error.value = 'Failed to load files. Please try again.'
      loading.value = false
      console.error(err)
    }
  }
  

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  onMounted(() => {
    fetchFiles()
  })
  </script>
  
  <style scoped>
  /* Additional styles if needed */
  </style>