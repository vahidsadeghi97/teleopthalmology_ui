import axios from 'axios'

const API_URL = 'http://localhost:8000/auth/'

class AuthService {
  login(user) {
    return axios
      .post(API_URL + 'token/', {
        username: user.username,
        password: user.password
      })
      .then(response => {
        if (response.data.access) {
          localStorage.setItem('user', JSON.stringify(response.data))
        }
        return response.data
      })
  }

  logout() {
    localStorage.removeItem('user')
  }

  register(user) {
    return axios.post(API_URL + 'register/', {
      username: user.username,
      password: user.password,
      email: user.email
    })
  }

  // getProtectedData() {
  //   const user = JSON.parse(localStorage.getItem('user'))
  //   return axios.get(API_URL + 'protected/', {
  //     headers: {
  //       'Authorization': 'Bearer ' + user.access
  //     }
  //   })
  // }
}

export default new AuthService()