import axios from 'axios';

const api = axios.create({
    baseURL: 'https://omniweek-backend.herokuapp.com'
});

export default api;