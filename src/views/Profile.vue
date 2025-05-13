<template>
    <div class="profile">
      <h2>Profile</h2>
      <button @click="handleLogout">Logout</button>
      <button @click="getProtectedData">Get Protected Data</button>
      <div v-if="protectedData">
        <h3>Protected Data:</h3>
        <pre>{{ protectedData }}</pre>
      </div>
      <div v-if="message" class="message">{{ message }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AuthService from '@/services/auth.service'
  
  const router = useRouter()
  const protectedData = ref(null)
  const message = ref('')
  
  const handleLogout = () => {
    AuthService.logout()
    router.push('/login')
  }
  
  const getProtectedData = () => {
    message.value = ''
    AuthService.getProtectedData().then(
      response => {
        protectedData.value = response.data
      },
      error => {
        message.value = (error.response && error.response.data) ||
          error.message ||
          error.toString()
      }
    )
  }
  </script>
  
  <style scoped>
  .profile {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  button {
    margin-right: 10px;
    padding: 8px 16px;
    background: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background: #369f6b;
  }
  
  .message {
    color: #ff4444;
    margin-top: 15px;
  }
  </style>