import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const projectsApi = {
    getAll: async () => {
        const response = await api.get('/projects/');
        return response.data;
    },
    getById: async (id: number) => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/projects/', data);
        return response.data;
    },
};

export default api;
