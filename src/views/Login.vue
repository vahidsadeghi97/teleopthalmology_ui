<template>
  <div class="login-container">
    <div class="login-form">
      <h2>Welcome Back</h2>
      <p class="subtitle">Please sign in to continue</p>
      
      <form @submit.prevent="handleLogin" class="form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input
              id="username"
              v-model="user.username"
              type="text"
              :class="{ 'error': errors.username }"
              @input="validateField('username')"
              required
              placeholder="Enter your username"
            />
          </div>
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input
              id="password"
              v-model="user.password"
              :type="showPassword ? 'text' : 'password'"
              :class="{ 'error': errors.password }"
              @input="validateField('password')"
              required
              placeholder="Enter your password"
            />
            <i 
              class="fas" 
              :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"
              @click="showPassword = !showPassword"
            ></i>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>Remember me</span>
          </label>
        </div>

        <div class="form-group">
          <button 
            type="submit" 
            :disabled="isLoading || !isFormValid"
            :class="{ 'loading': isLoading }"
          >
            <span v-if="isLoading">
              <i class="fas fa-spinner fa-spin"></i> Signing in...
            </span>
            <span v-else>Sign In</span>
          </button>
        </div>
      </form>

      <div v-if="message" class="alert" :class="messageType">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'

const router = useRouter()
const user = ref({
  username: '',
  password: ''
})
const message = ref('')
const messageType = ref('error')
const isLoading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const errors = ref({
  username: '',
  password: ''
})

const isFormValid = computed(() => {
  return user.value.username && 
         user.value.password && 
         !errors.value.username && 
         !errors.value.password
})

const validateField = (field) => {
  errors.value[field] = ''
  
  switch (field) {
    case 'username':
      if (!user.value.username) {
        errors.value.username = 'Username is required'
      } else if (user.value.username.length < 3) {
        errors.value.username = 'Username must be at least 3 characters'
      }
      break
    case 'password':
      if (!user.value.password) {
        errors.value.password = 'Password is required'
      } else if (user.value.password.length < 6) {
        errors.value.password = 'Password must be at least 6 characters'
      }
      break
  }
}

// JWT Decoding function
const decodeJWT = (token) => {
  try {
    if (!token) return null
    
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Error decoding JWT:', error)
    return null
  }
}

// Function to save user data to localStorage
const saveUserData = (token) => {
  const payload = decodeJWT(token)
  console.log(payload)
  if (payload) {
    if (rememberMe.value) {
      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify({
        id: payload.user_id || payload.sub,
        username: payload.username,
        email: payload.email,
        groups: payload.groups || [],
        is_superuser: payload.is_superuser
      }))
    } else {
      sessionStorage.setItem('access_token', token)
      sessionStorage.setItem('user', JSON.stringify({
        id: payload.user_id || payload.sub,
        username: payload.username,
        email: payload.email,
        groups: payload.groups || [],
        is_superuser: payload.is_superuser
      }))
      localStorage.setItem('access_token', token)
      localStorage.setItem('user', JSON.stringify({
        id: payload.user_id || payload.sub,
        username: payload.username,
        email: payload.email,
        groups: payload.groups || [],
        is_superuser: payload.is_superuser
      }))
    }
  }
}

const handleLogin = async () => {
  if (!isFormValid.value) return
  
  message.value = ''
  isLoading.value = true
  
  try {
    const response = await AuthService.login(user.value)
    if (response.access) {
      messageType.value = 'success'
      message.value = 'Login successful! Redirecting...'
      
      // Save the token and user data
      saveUserData(response.access)
      
      // Redirect to appropriate page based on user groups
      const userData = JSON.parse(rememberMe.value ? localStorage.getItem('user') : sessionStorage.getItem('user'))
      if (userData.groups && userData.groups.includes('admins')) {
        router.push('/files')
      } else if (userData.groups && userData.groups.includes('specialist')) {
        router.push('/assigned')
      } else {
        router.push('/files')
      }
    }
  } catch (error) {
    messageType.value = 'error'
    message.value = (error.response && error.response.data) ||
      error.message ||
      'An error occurred during login. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  padding: 20px;
}

.login-form {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
  text-align: center;
}

.subtitle {
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 12px;
  color: #666;
}

.input-wrapper i:last-child {
  left: auto;
  right: 12px;
  cursor: pointer;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 12px 40px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input[type="text"]:focus,
input[type="password"]:focus {
  border-color: #42b983;
  outline: none;
}

input.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #369f6b;
}

button:disabled {
  background-color: #a8d5c2;
  cursor: not-allowed;
}

button.loading {
  position: relative;
  color: transparent;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  text-align: center;
}

.alert.error {
  background-color: #ffebee;
  color: #ff4444;
  border: 1px solid #ffcdd2;
}

.alert.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #c8e6c9;
}
</style>