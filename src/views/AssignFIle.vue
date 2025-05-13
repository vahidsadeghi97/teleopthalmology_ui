<template>
    <div class="container mx-auto p-6">
        <h1 class="text-2xl font-bold mb-6">Assign User to Files</h1>

        <!-- Error/Success Messages -->
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {{ error }}
        </div>
        <div v-if="success" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {{ success }}
        </div>

        <!-- Form -->
        <div class="bg-white p-6 rounded-lg shadow-md">
            <!-- User Selection -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Select User</label>
                <select v-model="selectedUser" class="w-full p-2 border rounded">
                    <option value="" disabled>Select a user</option>
                    <option v-for="user in users"  :value="user.id">
                        {{ user.username }}
                    </option>
                </select>
            </div>
            <!-- File Selection -->
            <div class="mb-4">
                <label class="block text-gray-700 font-semibold mb-2">Select Files</label>
                <div class="max-h-64 overflow-y-auto border rounded p-2">
                    <div v-for="file in files" :key="file.id" class="flex items-center mb-2">
                        <input
                            type="checkbox"
                            :value="file.id"
                            v-model="selectedFiles"
                            class="mr-2"
                        />
                        <span>{{ file.original_filename }} (Uploaded by {{ file.user.username }})</span>
                    </div>
                </div>
            </div>

            <!-- Submit Button -->
            <button
                @click="assignFiles"
                
                class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                <span v-if="loading">Assigning...</span>
                <span v-else>Assign Files</span>
            </button>
        </div>

        <!-- File List Table -->
        <!-- <div class="mt-6">
            <h2 class="text-xl font-semibold mb-4">Available Files</h2>
            <table class="w-full bg-white shadow-md rounded-lg">
                <thead>
                    <tr class="bg-gray-200 text-gray-700">
                        <th class="p-3 text-left">ID</th>
                        <th class="p-3 text-left">Filename</th>
                        <th class="p-3 text-left">Uploader</th>
                        <th class="p-3 text-left">Upload Date</th>
                        <th class="p-3 text-left">Size (KB)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="file in files" :key="file.id" class="border-t">
                        <td class="p-3">{{ file.id }}</td>
                        <td class="p-3">{{ file.original_filename }}</td>
                        <td class="p-3">{{ file.user.username }}</td>
                        <td class="p-3">{{ formatDate(file.upload_date) }}</td>
                        <td class="p-3">{{ (file.file_size / 1024).toFixed(2) }}</td>
                    </tr>
                </tbody>
            </table>
        </div> -->
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';

// Reactive state
const files = ref([]);
const users = ref([]);
const selectedUser = ref('333'); // Changed from null to empty string
const selectedFiles = ref([]);
const error = ref('');
const success = ref('');
const loading = ref(false);

// Fetch files from API
const fetchFiles = async () => {
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/files/', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        console.log('Files fetched:', response.data);
        files.value = response.data;
    } catch (err) {
        console.error('Fetch files error:', err);
        error.value = 'Failed to fetch files: ' + err.message;
    }
};

// Fetch users from API
const fetchUsers = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        error.value = 'No access token found. Please log in.';
        return;
    }
    try {
        const response = await axios.get('http://127.0.0.1:8000/api/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        console.log('Users fetched:', response.data);
        users.value = response.data;
    } catch (err) {
        console.error('Fetch users error:', err.response?.status, err.message);
        error.value = 'Failed to fetch users: ' + err.message;
    }
    
};

// Assign files to user
const assignFiles = async () => {
    if (!selectedUser.value || selectedFiles.value.length === 0) {
        error.value = 'Please select a user and at least one file.';
        return;
    }

    loading.value = true;
    error.value = '';
    success.value = '';
    console.log('Assigning:', { user: selectedUser.value, files: selectedFiles.value });

    try {
        const response = await axios.post('http://127.0.0.1:8000/api/files_request/', {
            assigned_user: selectedUser.value,
            files: selectedFiles.value
        }, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        });
        success.value = 'Files assigned successfully!';
        selectedUser.value = null;
        selectedFiles.value = [];
    } catch (err) {
        error.value = err.response?.data?.non_field_errors?.[0] || 'Failed to assign files: ' + err.message;
    } finally {
        loading.value = false;
    }
};

// Format date for display
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
};

// Watch selectedUser for debugging
watch(selectedUser, (newValue) => {
    console.log('Selected user:', newValue);
});

// Fetch data on mount
onMounted(() => {
    fetchFiles();
    fetchUsers();
});
</script>

<style scoped>
</style>