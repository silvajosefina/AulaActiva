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

export interface HorarioDTO {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface CursoDocente {
  idCurso: number;
  materia: {
    idMateria: number;
    nombre: string;
    carrera: string;
  };
  anio: number;
  comision: string;
  periodo: string;
  horarios: HorarioDTO[];
  cantidadAlumnos: number;
  tieneClaseHoy: boolean;
  asistenciaHoyCargada: boolean;
}

export const getPerfilDocente = async (): Promise<PerfilDocente> => {
  const response = await axios.get(`${API_URL}/docente/perfil`, getAuthHeaders());
  return response.data;
};

export const actualizarPasswordDocente = async (datos: { actual: string; nueva: string }) => {
  const response = await axios.put(`${API_URL}/docente/perfil/password`, datos, getAuthHeaders());
  return response.data;
};

// Nueva función para listar los cursos del docente
export const getCursosDocente = async (): Promise<CursoDocente[]> => {
  const response = await axios.get(`${API_URL}/docente/cursos`, getAuthHeaders());
  // Como el backend responde { cursos: [...] }, devolvemos response.data.cursos
  return response.data.cursos;
};