<template>
    <div class="hello-api">
      <h1>Django + Vue 3 Demo</h1>
      
      <div class="get-example">
        <h2>GET Example</h2>
        <button @click="fetchHello">Get Hello</button>
        <p v-if="getResponse">{{ getResponse.message }}</p>
      </div>
      
      <div class="post-example">
        <h2>POST Example</h2>
        <input v-model="name" placeholder="Enter your name" />
        <button @click="postHello">Post Hello</button>
        <p v-if="postResponse">{{ postResponse.message }}</p>
      </div>
    </div>
  </template>
  
  <script>
  import api from '@/services/api';
  
  export default {
    name: 'HelloAPI',
    data() {
      return {
        getResponse: null,
        postResponse: null,
        name: ''
      }
    },
    methods: {
      async fetchHello() {
        try {
          const response = await api.getHello();
          this.getResponse = response.data;
        } catch (error) {
          console.error('Error fetching hello:', error);
        }
      },
      async postHello() {
        try {
          const response = await api.postHello(this.name);
          this.postResponse = response.data;
          this.name = ''; // Clear input after submission
        } catch (error) {
          console.error('Error posting hello:', error);
        }
      }
    }
  }
  </script>
  
  <style scoped>
  .hello-api {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .get-example, .post-example {
    margin: 30px 0;
    padding: 20px;
    border: 1px solid #eee;
    border-radius: 8px;
  }
  
  button {
    margin: 10px 0;
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
  
  input {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  </style>