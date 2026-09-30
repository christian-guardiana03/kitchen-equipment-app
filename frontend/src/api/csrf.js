import api from './axios';

export const getCsrfCookie = () => api.get('/sanctum/csrf-cookie');