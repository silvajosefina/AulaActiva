import axios from 'axios';
import { getSession } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export interface RegistroAsistenciaDto {
  legajoAlumno: number;
  estado: 'PRESENTE' | 'AUSENTE' | 'TARDANZA' | 'JUSTIFICADA' | 'SUSPENDIDA';
}

const getAuthHeaders = () => {
  // getSession busca automáticamente tanto en localStorage como en sessionStorage
  const token = getSession(); 
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
};

export const obtenerAlumnosPorCurso = async (idCurso: number) => {
  const response = await axios.get(`${API_URL}/cursos/${idCurso}/alumnos`, getAuthHeaders());
  return response.data.alumnos;
};

export const obtenerAsistenciasPorFecha = async (idCurso: number, fecha: string) => {
  const response = await axios.get(
    `${API_URL}/cursos/${idCurso}/asistencias?fecha=${fecha}`,
    getAuthHeaders()
  );
  return response.data.asistencias;
};

export const guardarAsistenciaCurso = async (
  idCurso: number,
  fecha: string,
  registros: RegistroAsistenciaDto[]
) => {
  const response = await axios.post(
    `${API_URL}/cursos/${idCurso}/asistencias`,
    { fecha, registros },
    getAuthHeaders()
  );
  return response.data;
};