import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8081/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createResume = async (data: any) => {
    // Hardcoded UserID for now until Auth is ready
    const payload = {
        user_id: 1,
        title: data.fullName + "'s Resume",
        content: JSON.stringify(data),
    };
    const response = await api.post('/resumes/', payload);
    return response.data;
};

export default api;
