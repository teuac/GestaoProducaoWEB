import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Usuários
export const getUsuarios = () => api.get('/usuarios');
export const getUsuarioById = (id) => api.get(`/usuarios/${id}`);
export const createUsuario = (usuario) => api.post('/usuarios', usuario);
export const updateUsuario = (id, usuario) => api.put(`/usuarios/${id}`, usuario);
export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);
export const getMe = () => api.get('/usuarios/me');

// Centros de Custo
export const getCentrosDeCusto = () => api.get('/centros-de-custo');
export const getCentroDeCustoById = (id) => api.get(`/centros-de-custo/${id}`);
export const createCentroDeCusto = (centro) => api.post('/centros-de-custo', centro);
export const updateCentroDeCusto = (id, centro) => api.put(`/centros-de-custo/${id}`, centro);
export const deleteCentroDeCusto = (id) => api.delete(`/centros-de-custo/${id}`);

export default api;