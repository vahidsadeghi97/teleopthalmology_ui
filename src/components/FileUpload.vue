<template>
    <div class="file-upload">
      <h2>Upload File</h2>
      <form @submit.prevent="handleUpload">
        <div class="form-group">
          <input type="file" ref="fileInput" @change="handleFileChange" />
        </div>
        <div class="form-group">
          <label>Description (optional)</label>
          <textarea v-model="description" rows="3"></textarea>
        </div>
        <button type="submit" :disabled="!file || isUploading">
          {{ isUploading ? 'Uploading...' : 'Upload' }}
        </button>
        <div v-if="message" class="message">{{ message }}</div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import FileService from '@/services/file.service'
  
  const file = ref(null)
  const description = ref('')
  const isUploading = ref(false)
  const message = ref('')
  
  const handleFileChange = (e) => {
    file.value = e.target.files[0]
  }
  
  const handleUpload = async () => {
    if (!file.value) return
    
    isUploading.value = true
    message.value = ''
    
    try {
      await FileService.uploadFile(file.value, description.value)
      message.value = 'File uploaded successfully!'
      file.value = null
      description.value = ''
      if (fileInput.value) {
        fileInput.value.value = ''
      }
      emit('upload-success')
    } catch (error) {
      message.value = error.response?.data?.detail || 'Upload failed'
    } finally {
      isUploading.value = false
    }
  }
  
  const fileInput = ref(null)
  const emit = defineEmits(['upload-success'])
  </script>
  
  <style scoped>
  .file-upload {
    max-width: 500px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  input[type="file"] {
    display: block;
    margin-bottom: 10px;
  }
  
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
  
  .message {
    margin-top: 15px;
    color: #42b983;
  }
  
  .message.error {
    color: #ff4444;
  }
  </style>