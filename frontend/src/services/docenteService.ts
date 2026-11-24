import axios from 'axios';
import { getSession } from './auth';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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

// Nuevas interfaces para el módulo de Mis Alumnos
export interface AlumnoCursoDTO {
  idCurso: number;
  materia: string;
  comision: string;
  anio: number;
  periodo: string;
}

export interface AlumnoDocente {
  legajoAlumno: number;
  nombre: string;
  apellido: string;
  email: string;
  cursos: AlumnoCursoDTO[];
}

export const getPerfilDocente = async (): Promise<PerfilDocente> => {
  const response = await axios.get(`${API_URL}/docente/perfil`, getAuthHeaders());
  return response.data;
};

export const actualizarPasswordDocente = async (datos: { actual: string; nueva: string }) => {
  const response = await axios.put(`${API_URL}/docente/perfil/password`, datos, getAuthHeaders());
  return response.data;
};

export const getCursosDocente = async (): Promise<CursoDocente[]> => {
  const response = await axios.get(`${API_URL}/docente/cursos`, getAuthHeaders());
  return response.data.cursos;
};

export type EstadoClase = 'pendiente' | 'registrada' | 'programada';

export interface ProximaClase {
  idCurso: number;
  materia: string;
  comision: string;
  fecha: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  cantidadAlumnos: number;
  estadoAsistencia: EstadoClase;
}

export interface InicioDocente {
  resumen: {
    materias: number;
    cursos: number;
    alumnos: number;
    asistenciasPendientes: number;
  };
  proximasClases: ProximaClase[];
}

export const getInicioDocente = async (): Promise<InicioDocente> => {
  const response = await axios.get(`${API_URL}/docente/inicio`, getAuthHeaders());
  return response.data;
};


// Nueva función para listar los alumnos del docente
export const getAlumnosDocente = async (): Promise<AlumnoDocente[]> => {
  const response = await axios.get(`${API_URL}/docente/alumnos`, getAuthHeaders());
  return response.data.alumnos;
};

export interface MateriaDocente {
  idMateria: number;
  nombre: string;
  carrera: string;
  cursos: {
    idCurso: number;
    anio: number;
    comision: string;
    periodo: string;
  }[];
  horasSemanales: number;
}

export const getMateriasDocente = async (): Promise<MateriaDocente[]> => {
  const response = await axios.get(`${API_URL}/docente/materias`, getAuthHeaders());
  return response.data.materias;
};
