import axios from 'axios'

class AdminApi {
  async get() {
    return await axios.$get('/')
  }
}

export default new AdminApi()
