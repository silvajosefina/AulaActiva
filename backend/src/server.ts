import app from './app'
import { env } from './config/env'
import cursosRoutes from "./routes/cursos.routes";

app.use("/cursos", cursosRoutes);

app.listen(env.port, () => {
  console.log(`Servidor backend escuchando en http://localhost:${env.port}`)
})
