import cors from 'cors'
import express from 'express'
import authRoutes from './routes/auth.routes'
import healthRoutes from './routes/health.routes'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/health', healthRoutes)
app.use('/auth', authRoutes)

export default app
