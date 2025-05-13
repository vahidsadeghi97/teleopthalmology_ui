import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000', // Your Django server URL
  withCredentials: false,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

export default {
  getHello() {
    return apiClient.get('/hello/');
  },
  postHello(name) {
    return apiClient.post('/hello/', { name: name });
  }
};