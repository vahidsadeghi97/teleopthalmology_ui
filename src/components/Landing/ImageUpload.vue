<template>
  <section class="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mb-6">
    <h2 class="text-xl font-semibold mb-4 text-center">Upload Retinal Images</h2>
    <div class="border-2 border-dashed border-gray-300 p-6 text-center">
      <p class="text-gray-600 mb-4">Drag and drop images here or click to upload</p>
      <input type="file" class="hidden" id="file-upload" @change="handleFileUpload">
      <label for="file-upload" class="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600 inline-block">Select Files</label>
    </div>
    <div class="text-center mt-4">
      <button class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Submit for Review</button>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ImageUpload',
  methods: {
    handleFileUpload(event) {
      console.log('Files selected:', event.target.files);
    },
  },
};
</script>