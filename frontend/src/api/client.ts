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

export const uploadResume = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post('http://localhost:8081/api/resumes/upload', formData);
    return response.data;
};

// AI Agent calls directly to FastAPI (which now has CORS enabled)
const aiApi = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getAtsScore = async (resume_text: string, job_description: string) => {
    const response = await aiApi.post('/ats-score', { resume_text, job_description });
    return response.data.result;
};

export const getGapAnalysis = async (resume_text: string, job_description: string) => {
    const response = await aiApi.post('/gap-analysis', { resume_text, job_description });
    return response.data.result;
};

export const getLinkedinOptimizer = async (resume_text: string) => {
    const response = await aiApi.post('/linkedin-optimizer', { resume_text });
    return response.data.result;
};

export const getInterviewPrep = async (resume_text: string, job_description: string) => {
    const response = await aiApi.post('/interview-prep', { resume_text, job_description });
    return response.data.result;
};

export default api;
