import api from './api';

const transactionService = {
  getAll: async () => {
    const response = await api.get('/transactions');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },
};

export default transactionService;
