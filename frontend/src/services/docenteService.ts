import axios from 'axios';
import { getSession } from './auth';

const API_URL = 'http://localhost:4000';

const getAuthHeaders = () => {
  const token = getSession(); 
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export interface PerfilDocente {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  legajo: number;
}

export const getPerfilDocente = async (): Promise<PerfilDocente> => {
  const response = await axios.get(`${API_URL}/docente/perfil`, getAuthHeaders());
  return response.data;
};

export const actualizarPasswordDocente = async (datos: { actual: string; nueva: string }) => {
  const response = await axios.put(`${API_URL}/docente/perfil/password`, datos, getAuthHeaders());
  return response.data;
};