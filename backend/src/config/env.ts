import 'dotenv/config'

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: process.env.JWT_SECRET ?? '',
}

if (!env.jwtSecret) {
  throw new Error('Falta la variable de entorno JWT_SECRET')
}
