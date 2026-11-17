import cors from 'cors'
import express from 'express'
import alumnoRoutes from './routes/alumno.routes'
import authRoutes from './routes/auth.routes'
import cursosRoutes from './routes/cursos.routes'
import docenteRoutes from './routes/docente.routes'
import healthRoutes from './routes/health.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)
app.use('/auth', authRoutes)
app.use('/docente', docenteRoutes)
app.use('/cursos', cursosRoutes)
app.use('/alumno', alumnoRoutes)

export default app