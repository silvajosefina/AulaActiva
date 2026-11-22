# AulaActiva

AulaActiva es una aplicación web para consultar cursos y horarios y gestionar la asistencia a clases. Tiene paneles separados para docentes y alumnos, con acceso según el rol de la cuenta.

## Funciones

- **Docentes** pueden consultar sus materias, cursos y alumnos, y registrar o actualizar la asistencia de un curso por fecha.
- **Alumnos** pueden consultar sus cursos, horarios y asistencias, y crear, editar o eliminar eventos de su agenda personal. Los eventos pueden vincularse a un curso.
- **Ambos roles** pueden registrarse, iniciar sesión con usuario y contraseña, consultar su perfil, cambiar su contraseña y solicitar un enlace para restablecerla. El servidor determina el rol al iniciar sesión.

## Arquitectura

- **Frontend.** React, TypeScript, Vite, React Router y Ant Design. Axios conecta la aplicación con la API de Express.
- **Backend.** Express y TypeScript exponen la API JSON y aplican las reglas de acceso para docentes y alumnos.
- **Base de datos.** Supabase aloja PostgreSQL. El backend consulta y escribe los datos mediante Prisma Client, y el esquema y las migraciones se mantienen con Prisma. [Cliente de Prisma](backend/src/lib/prisma.ts) · [Esquema de datos](backend/prisma/schema.prisma)
- **Autenticación.** Express registra las cuentas en la tabla `usuarios` y verifica las contraseñas con bcrypt. El backend emite JWT de sesión con `jsonwebtoken` y `JWT_SECRET`. En cada solicitud protegida verifica el token y consulta en la base el rol y el perfil de la cuenta. La recuperación también la gestiona el backend y Nodemailer envía el enlace mediante Gmail. [Servicio de autenticación](backend/src/services/auth.service.ts) · [Middleware de autenticación](backend/src/middlewares/auth.middleware.ts)

```text
AulaActiva/
├── backend/                     API y persistencia
│   ├── prisma/
│   │   ├── schema.prisma        Modelos y conexión al PostgreSQL de Supabase
│   │   ├── migrations/          Historial de migraciones SQL
│   │   └── seed.ts              Cuentas y datos académicos de prueba
│   └── src/
│       ├── app.ts               Configuración de Express y montaje de rutas
│       ├── server.ts            Inicio del servidor HTTP
│       ├── config/              Variables de entorno
│       ├── controllers/         Validación de solicitudes y respuestas HTTP
│       ├── lib/                 Cliente de Prisma
│       ├── middlewares/         Autenticación y control de roles
│       ├── routes/              Rutas de la API
│       └── services/            Lógica de negocio y envío de correo
└── frontend/                    Aplicación web
    ├── public/                  Recursos estáticos
    └── src/
        ├── app/                 Enrutamiento y protección de vistas por rol
        ├── components/          Componentes reutilizables
        ├── constants/           Rutas de navegación
        ├── pages/               Vistas públicas y paneles por rol
        └── services/            Clientes de la API y manejo de sesión
```

El modelo de datos separa las cuentas de sus perfiles de alumno o docente. Cada curso pertenece a una materia y tiene horarios, docentes asignados y alumnos inscritos. Una asistencia registra el estado de una inscripción en una fecha determinada. Cada evento personal pertenece a un alumno y puede asociarse a un curso. [Esquema de Prisma](backend/prisma/schema.prisma)

## Puesta en marcha local

### Requisitos

- Node.js 24 y npm para instalar y ejecutar ambos paquetes.
- Un proyecto de Supabase de desarrollo y credenciales de PostgreSQL para conectar el backend.

### 1. Configurar el entorno

Desde la raíz, copiá las plantillas si todavía no tenés los archivos `.env`. En PowerShell:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

En Bash:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Si ya tenés un `.env`, conservá su configuración y completá las variables necesarias. Las plantillas están en [`backend/.env.example`](backend/.env.example) y [`frontend/.env.example`](frontend/.env.example).

| Archivo | Variable | Uso |
| --- | --- | --- |
| `backend/.env` | `DATABASE_URL` | URL de PostgreSQL que usa Prisma Client. La configuración del proyecto usa el pooler de Supabase en modo transacción (`6543`) con `pgbouncer=true`. |
| `backend/.env` | `DIRECT_URL` | URL de PostgreSQL que usa Prisma para las migraciones. La configuración del proyecto usa el pooler de Supabase en modo sesión (`5432`). |
| `backend/.env` | `JWT_SECRET` | Secreto de la aplicación para firmar y verificar los JWT del backend. Definí un valor aleatorio privado. |
| `backend/.env` | `PORT` | Puerto de la API. Valor predeterminado `4000`. |
| `backend/.env` | `NODE_ENV` | Entorno del backend. Valor predeterminado `development`. |
| `backend/.env` | `FRONTEND_URL` | URL de la aplicación que se usa en los enlaces de recuperación. Valor predeterminado `http://localhost:5173`. |
| `backend/.env` | `MAIL_USUARIO` | Cuenta de Gmail desde la que se envían los correos de recuperación. |
| `backend/.env` | `MAIL_CONTRASENA` | Contraseña de aplicación de la cuenta de Gmail. |
| `frontend/.env` | `VITE_API_URL` | URL base de la API. Valor predeterminado `http://localhost:4000`. |

En el panel de tu proyecto de Supabase, abrí **Connect** y copiá las cadenas **Transaction pooler** y **Session pooler** a `DATABASE_URL` y `DIRECT_URL`, respectivamente. Completá las credenciales en `backend/.env` y agregá `pgbouncer=true` a `DATABASE_URL` si la cadena aún no lo incluye. [Conexión a PostgreSQL en Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres) · [Configuración de Prisma en Supabase](https://supabase.com/docs/guides/database/prisma)

Las variables de correo son necesarias para el envío por Gmail. En desarrollo, si faltan, el backend escribe el enlace de recuperación en la terminal para las cuentas registradas.

### 2. Preparar la base y ejecutar el backend

Desde la raíz, en una terminal:

```sh
cd backend
npm ci
npm run prisma:generate
```

Si tu proyecto de Supabase de desarrollo tiene migraciones pendientes, ejecutá `npx prisma migrate deploy` desde `backend/` para aplicar las migraciones versionadas. Para generar migraciones nuevas a partir de cambios en el esquema, `npm run prisma:migrate` ejecuta `prisma migrate dev` y requiere una base de datos sombra. [Migraciones en Prisma 6](https://www.prisma.io/docs/orm/v6/prisma-migrate/workflows/development-and-production)

Iniciá el servidor desde `backend/`:

```sh
npm run dev
```

La API escucha en `http://localhost:4000` con la configuración predeterminada. Para comprobar que responde, abrí `http://localhost:4000/health` en el navegador. La respuesta esperada es `{"status":"ok"}`.

### 3. Ejecutar el frontend

Desde la raíz, en otra terminal:

```sh
cd frontend
npm ci
npm run dev
```

Abrí `http://localhost:5173`. Si cambiás el puerto de la API, actualizá `VITE_API_URL`. Si Vite usa otro puerto, actualizá `FRONTEND_URL` para que los enlaces de recuperación apunten a la aplicación.

### Datos de prueba

Para cargar los datos de ejemplo en el proyecto de Supabase de desarrollo, ejecutá `npm run prisma:seed` desde `backend/`. El script crea cuentas de prueba y, si la base todavía no tiene materias, carga cursos, horarios, inscripciones y asistencias.

| Rol | Usuario | Contraseña inicial |
| --- | --- | --- |
| Docente | `docente` | `123456` |
| Alumno | `alumno` | `123456` |

El acceso se hace con el nombre de usuario. Para probar el envío real de un correo de recuperación, registrá una cuenta con una dirección que puedas consultar.

## Referencia de la API

Las rutas protegidas reciben el token de inicio de sesión en el encabezado `Authorization: Bearer <token>`. El backend valida el rol y, para la asistencia, que el curso esté asignado al docente.

| Acceso | Método y ruta | Función |
| --- | --- | --- |
| Público | `GET /health` | Comprobar que el servidor responde. |
| Público | `POST /auth/register` | Crear una cuenta. |
| Público | `POST /auth/login` | Iniciar sesión y obtener el token y el perfil. |
| Público | `POST /auth/recuperar-contrasena` | Solicitar un enlace de recuperación. |
| Público | `POST /auth/restablecer-contrasena` | Cambiar la contraseña con el token de recuperación. |
| Docente | `GET /docente/inicio`, `GET /docente/cursos`, `GET /docente/materias`, `GET /docente/alumnos` | Consultar el panel y los datos académicos del docente. |
| Docente | `GET /docente/perfil`, `PUT /docente/perfil/password` | Consultar el perfil y cambiar la contraseña. |
| Docente | `GET /cursos/:id/alumnos` | Listar los alumnos inscritos en el curso. |
| Docente | `GET /cursos/:id/asistencias?fecha=AAAA-MM-DD` | Consultar la asistencia del curso en una fecha. |
| Docente | `POST /cursos/:id/asistencias` | Guardar o actualizar la asistencia del curso. |
| Alumno | `GET /alumno/cursos`, `GET /alumno/asistencias` | Consultar cursos y asistencias propios. |
| Alumno | `GET /alumno/perfil`, `PUT /alumno/perfil/password` | Consultar el perfil y cambiar la contraseña. |
| Alumno | `GET /alumno/agenda-personal`, `POST /alumno/agenda-personal` | Listar o crear eventos personales. |
| Alumno | `PUT /alumno/agenda-personal/:idEvento`, `DELETE /alumno/agenda-personal/:idEvento` | Editar o eliminar un evento propio. |

## Comandos de desarrollo

Ejecutá cada comando desde el directorio del paquete correspondiente.

| Directorio | Comando | Acción |
| --- | --- | --- |
| `backend/` | `npm run dev` | Iniciar la API con recarga mediante Nodemon. |
| `backend/` | `npm run prisma:generate` | Regenerar el cliente Prisma tras cambios en el esquema. |
| `backend/` | `npx prisma migrate deploy` | Aplicar las migraciones versionadas pendientes. |
| `backend/` | `npm run prisma:migrate` | Generar y aplicar migraciones de desarrollo con una base sombra. |
| `backend/` | `npm run prisma:seed` | Cargar datos de prueba. |
| `backend/` | `npm run build` | Compilar TypeScript en `backend/dist/`. |
| `backend/` | `npm start` | Ejecutar la API compilada. |
| `frontend/` | `npm run dev` | Iniciar el servidor de desarrollo de Vite. |
| `frontend/` | `npm run lint` | Revisar el código con ESLint. |
| `frontend/` | `npm run build` | Verificar los tipos y generar `frontend/dist/`. |
| `frontend/` | `npm run preview` | Previsualizar la compilación de Vite en local. |
