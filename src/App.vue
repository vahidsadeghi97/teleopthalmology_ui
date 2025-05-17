<template>
  <div id="app">
    <nav class="main-nav">
      <div class="nav-container">
        <div class="logo">
          <router-link to="/">RETINEX</router-link>
        </div>
        <div class="nav-links">
          <!-- Show these links only when user is logged in -->
          <template v-if="isLoggedIn">
            <!-- Links for admins -->
            <template v-if="userGroups.includes('admins')">
              <router-link to="/files" class="nav-link">Files</router-link>
              <router-link to="/file_list" class="nav-link">File List</router-link>
              <router-link to="/assign" class="nav-link">Assign</router-link>
              <router-link to="/assigned" class="nav-link">Assigned Files</router-link>
            </template>
            <template v-else>
              <template v-if="userGroups.includes('specialist')">
                <router-link to="/assigned" class="nav-link">Assigned Files</router-link>
              </template>
            </template>

            <!-- Links for clients -->
            <template v-if="userGroups.includes('clients')">
              <router-link to="/files" class="nav-link">Files</router-link>
              <router-link to="/file_list" class="nav-link">File List</router-link>
            </template>

            <a href="#" @click.prevent="logout" class="nav-link">Logout</a>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link">Login</router-link>
          </template>
        </div>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import AuthService from '@/services/auth.service'

const router = useRouter()
const authState = ref({
  isLoggedIn: false,
  groups: []
})

// Function to update auth state
const updateAuthState = () => {
  const user = localStorage.getItem('user')
  authState.value.isLoggedIn = !!user
  if (user) {
    try {
      authState.value.groups = JSON.parse(user).groups || []
    } catch (e) {
      authState.value.groups = []
    }
  } else {
    authState.value.groups = []
  }
}

// Watch for storage changes
const handleStorageChange = (e) => {
  if (e.key === 'user' || e.key === 'access_token') {
    updateAuthState()
  }
}

// Computed properties
const isLoggedIn = computed(() => authState.value.isLoggedIn)
const userGroups = computed(() => authState.value.groups)

// Logout function
const logout = async () => {
  await AuthService.logout()
  updateAuthState()
  router.push('/login')
}

// Initialize auth state and add event listeners
onMounted(() => {
  updateAuthState()
  window.addEventListener('storage', handleStorageChange)
})

// Watch for route changes to update auth state
watch(() => router.currentRoute.value, () => {
  updateAuthState()
}, { immediate: true })
</script>

<style>
.main-nav {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo a {
  font-size: 1.5rem;
  font-weight: 700;
  color: #42b983;
  text-decoration: none;
  transition: color 0.3s ease;
}

.logo a:hover {
  color: #2c3e50;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #42b983;
}

.nav-link.router-link-active {
  color: #42b983;
  background-color: #f8f9fa;
}

/* Add padding to the main content to account for fixed header */
#app {
  padding-top: 4rem;
}
</style>