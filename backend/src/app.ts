import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.routes'
import docenteRoutes from './routes/docente.routes'
import healthRoutes from './routes/health.routes'
import cursosRoutes from "./routes/cursos.routes.js";

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)
app.use('/auth', authRoutes)
app.use('/docente', docenteRoutes)
app.use("/cursos", cursosRoutes);

export default app
