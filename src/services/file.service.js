import axios from 'axios'

const API_URL = 'http://localhost:8000/api/'

class FileService {
  uploadFile(file, description = '') {
    const formData = new FormData()
    formData.append('file', file)
    if (description) {
      formData.append('description', description)
    }

    return axios.post(API_URL + 'files/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }

  getFiles() {
    return axios.get(API_URL + 'files/', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  getFile(id) {
    return axios.get(API_URL + `files/${id}/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  deleteFile(id) {
    return axios.delete(API_URL + 'files/' + id + '/', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  getAssignedFiles(){
    return axios.get(API_URL + `assigned_files/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  getToken() {
    const access = localStorage.getItem('access_token')
    return access
  }
}

export default new FileService()