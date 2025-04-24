import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:3005',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});
