import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export const login = async (username: string, password: string): Promise<{ token: string }> => {
    const response = await api.post('/auth/login/', { username, password });
    localStorage.setItem('token', response.data.token);
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        await api.post('/auth/logout/');
    } finally {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

export default api;
