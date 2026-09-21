import API from './api';

export const createQuiz = async (quizData) => {
  const response = await API.post('/quiz/create', quizData);
  return response.data;
};

export const listQuizzes = async () => {
  const response = await API.get('/quiz/list');
  return response.data;
};

export const getMyQuizzes = async () => {
  const response = await API.get('/quiz/user/myquizzes');
  return response.data;
};

export const getQuizById = async (id) => {
  const response = await API.get(`/quiz/${id}`);
  return response.data;
};

export const updateQuiz = async ({ id, data }) => {
  const response = await API.put(`/quiz/${id}`, data);
  return response.data;
};

export const deleteQuiz = async (id) => {
  const response = await API.delete(`/quiz/${id}`);
  return response.data;
};

export const generateAIQuiz = async (promptData) => {
  const response = await API.post('/quiz/generate-ai', promptData);
  return response.data;
};
