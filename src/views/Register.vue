<template>
    <div class="register-form">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            v-model="user.username"
            type="text"
            required
          />
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="user.email"
            type="email"
          />
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="user.password"
            type="password"
            required
          />
        </div>
        <div class="form-group">
          <button type="submit">Register</button>
        </div>
      </form>
      <div v-if="message" class="message">{{ message }}</div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import AuthService from '@/services/auth.service'
  
  const router = useRouter()
  const user = ref({
    username: '',
    email: '',
    password: ''
  })
  const message = ref('')
  
  const handleRegister = () => {
    message.value = ''
  
    AuthService.register(user.value).then(
      () => {
        message.value = 'Registration successful!'
        setTimeout(() => {
          router.push('/login')
        }, 2000)
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
  .register-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  /* Same styles as Login.vue */
  </style>