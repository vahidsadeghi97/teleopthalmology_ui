<template>
  <div id="app">
    <nav class="flex justify-center">
      <router-link to="/files">Files</router-link> |
      <!-- <router-link to="/profile">Profile</router-link> | -->
      <!-- <router-link to="/file_list">File List</router-link> | -->
      <router-link to="/assign">Assignment</router-link> |
      <router-link to="/assigned">Assigned FIles</router-link> |

      <a v-if="isLoggedIn" href="#" @click.prevent="logout">Logout</a>
      <template v-else>
        <router-link to="/login">Login</router-link> |
        <router-link to="/register">Register</router-link>
      </template>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'

const router = useRouter()

const isLoggedIn = computed(() => {
  return localStorage.getItem('user') !== null
})

const logout = () => {
  AuthService.logout()
  router.push('/login')
}
</script>

<style>
/* Your existing styles */
nav {
  padding: 20px;
  background-color: #f5f5f5;
  margin-bottom: 20px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
  margin: 0 10px;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>