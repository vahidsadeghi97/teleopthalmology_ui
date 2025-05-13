import axios from 'axios'

const API_URL = 'http://localhost:8000/api/'

class EditedFileService {
  uploadFile(file, diseaseType = '',) {
    const formData = new FormData()
    formData.append('edited_image', file)
    if (diseaseType) {
      formData.append('disease_type', diseaseType)
    }

    console.log(formData)
    return axios.post(API_URL + 'edited-images/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }

  getFiles() {
    return axios.get(API_URL + 'edited-images/', {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  getFile(id) {
    return axios.get(API_URL + `edited-images/${id}/`, {
      headers: {
        'Authorization': `Bearer ${this.getToken()}`
      }
    })
  }
  deleteFile(id) {
    return axios.delete(API_URL + 'edited-images/' + id + '/', {
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

export default new EditedFileService()