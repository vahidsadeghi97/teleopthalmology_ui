<template>
  <div class="image_editor">
    <input type="file" accept="image/*" @change="handleImageUpload" ref="fileInput" />
    <Editor
      :canvasWidth="canvasWidth"
      :canvasHeight="canvasHeight"
      ref="editor"
      editorId="canvasId"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {useRoute} from "vue-router"
import Editor from '@/components/Editor/Editor.vue';
import FileService from '@/services/file.service' // Adjust path to your FileService

const route = useRoute()
// State variables
const canvasWidth = ref(800);
const canvasHeight = ref(600);
const editorOptions = ref({
  mode: 'text',
  options: {},
});
const editor = ref(null);
const fileInput = ref(null);
const file = ref({})
// Handle image upload
const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log('Selected file:', file.name, file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      console.log('Data URL:', imageUrl.substring(0, 50) + '...'); // Log first 50 chars
      if (editor.value) {
        console.log('Calling setBackgroundImage with URL');
        editor.value.setBackgroundImage(imageUrl);
      } else {
        console.error('Editor ref is not initialized');
      }
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
    };
    reader.readAsDataURL(file);
  } else {
    console.error('No file selected');
  }
};


onMounted(async () => {
  console.log('File ID:', route.params.id)
  if (editor.value) {
    console.log('Initializing editor with mode:', editorOptions.value.mode);
    editor.value.set(editorOptions.value.mode, editorOptions.value.options);
  } else {
    console.error('Editor ref not available on mount');
  }
  try {
      const response = await FileService.getFile(route.params.id)
      file.value = response.data
      // loading.value = false
      console.log(file.value.file)

      // editor.value.setBackgroundImage(file.value.file);
      editor.value.setBackgroundImage(
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/500px-Image_created_with_a_mobile_phone.png"
    );

    } catch (err) {
      // err.value = 'Failed to load files. Please try again.'
      // loading.value = false
      console.error(err)
    }  
})
</script>

<style>
.image_editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

input[type="file"] {
  padding: 10px;
  cursor: pointer;
}
</style>