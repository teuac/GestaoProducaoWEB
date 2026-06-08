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

// Unidades de Medida
export const getUnidades = () => api.get('/unidades');
export const getUnidadeById = (id) => api.get(`/unidades/${id}`);
export const createUnidade = (unidade) => api.post('/unidades', unidade);
export const updateUnidade = (id, unidade) => api.put(`/unidades/${id}`, unidade);
export const deleteUnidade = (id) => api.delete(`/unidades/${id}`);

// Locais de Serviço
export const getLocaisServico = () => api.get('/locais-servico');
export const getLocalServicoById = (id) => api.get(`/locais-servico/${id}`);
export const createLocalServico = (local) => api.post('/locais-servico', local);
export const updateLocalServico = (id, local) => api.put(`/locais-servico/${id}`, local);
export const deleteLocalServico = (id) => api.delete(`/locais-servico/${id}`);

export default api;