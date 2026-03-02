import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      // No more localStorage.removeItem('quiz_token');
      // window.location.href = '/login'; // Let the store/guard handle redirect to avoid loop
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ user: { id: string; email: string; name: string; avatarSeed?: string } }>('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post<{ user: { id: string; email: string; name: string; avatarSeed?: string } }>('/auth/register', { name, email, password }),
  me: () => api.get<{ user: { id: string; email: string; name: string; avatarSeed?: string } }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
  profile: () => api.get<{
    user: { id: string; email: string; name: string; avatarSeed?: string; createdAt: string };
    quizzes: any[];
    participations: any[];
  }>('/auth/profile'),
  updateProfile: (data: { name?: string; avatarSeed?: string }) =>
    api.put<{ user: { id: string; email: string; name: string; avatarSeed?: string } }>('/auth/profile', data),
};


// Quiz API
export const quizApi = {
  list: () => api.get<{ quizzes: import('../types/quiz').Quiz[] }>('/quizzes'),
  get: (id: string) => api.get<{ quiz: import('../types/quiz').Quiz }>(`/quizzes/${id}`),
  create: (data: { title: string; description?: string; questions: Omit<import('../types/quiz').Question, 'id'>[] }) =>
    api.post<{ quiz: import('../types/quiz').Quiz }>('/quizzes', data),
  update: (id: string, data: Partial<import('../types/quiz').Quiz>) =>
    api.put<{ quiz: import('../types/quiz').Quiz }>(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
  addQuestion: (quizId: string, data: { text: string; options: string[]; correctIndex: number }) =>
    api.post(`/quizzes/${quizId}/question`, data),
  updateQuestion: (quizId: string, questionId: string, data: { text: string; options: string[]; correctIndex: number }) =>
    api.put(`/quizzes/${quizId}/question/${questionId}`, data),
  deleteQuestion: (quizId: string, questionId: string) =>
    api.delete(`/quizzes/${quizId}/question/${questionId}`),
};

// Session API
export const sessionApi = {
  list: (quizId: string) => api.get<{ sessions: import('../types/quiz').Session[] }>(`/sessions/quiz/${quizId}`),
  create: (quizId: string) => api.post<{ session: import('../types/quiz').Session }>(`/sessions/${quizId}`),
  get: (sessionId: string) => api.get<{ session: import('../types/quiz').Session }>(`/sessions/${sessionId}`),
  getByCode: (code: string) => api.get<{ session: import('../types/quiz').Session }>(`/sessions/code/${code}`),
  start: (sessionId: string) => api.post(`/sessions/${sessionId}/start`),
  end: (sessionId: string) => api.post(`/sessions/${sessionId}/end`),
  leaderboard: (sessionId: string, page = 0, limit = 20) =>
    api.get<(string | number)[]>(`/sessions/${sessionId}/leaderboard?page=${page}&limit=${limit}`),
};
