<template>
  <div class="login-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
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
        <label for="password">Password</label>
        <input
          id="password"
          v-model="user.password"
          type="password"
          required
        />
      </div>
      <div class="form-group">
        <button type="submit">Login</button>
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
password: ''
})
const message = ref('')

// JWT Decoding function
const decodeJWT = (token) => {
try {
  if (!token) return null;
  
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
} catch (error) {
  console.error('Error decoding JWT:', error);
  return null;
}
};

// Function to save user data to localStorage
const saveUserData = (token) => {
const payload = decodeJWT(token);

if (payload) {
  localStorage.setItem('access_token', token);
  localStorage.setItem('user', JSON.stringify({
    id: payload.user_id || payload.sub,
    username: payload.username,
    email: payload.email,
    groups: payload.groups || [],
    is_superuser : payload.is_superuser
  }));
}
};

const handleLogin = async () => {
message.value = ''

try {
  const response = await AuthService.login(user.value)
  if (response.access) {
    // Save the token and user data to localStorage
    saveUserData(response.access);
    
    // Redirect to profile or dashboard based on user groups
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData.groups && userData.groups.includes('admins')) {
      router.push('/files');
    } else  if (userData.groups && userData.groups.includes('specialists')) {
      router.push('/files');
    }
    else   {
      router.push('/files');
    }
  }
} catch (error) {
  message.value = (error.response && error.response.data) ||
    error.message ||
    error.toString();
}
}
</script>
  <style scoped>
  .login-form {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
  }
  
  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  button {
    background-color: #42b983;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #369f6b;
  }
  
  .message {
    margin-top: 15px;
    color: #ff4444;
  }
  </style>