import nodemailer from 'nodemailer'
import { env } from '../config/env'

export class MailNoConfiguradoError extends Error {}

const mailConfigurado = Boolean(env.mailUsuario && env.mailContrasena)

const transporte = mailConfigurado
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: env.mailUsuario, pass: env.mailContrasena },
    })
  : null

export function verificarMailDisponible(): void {
  if (!transporte && env.nodeEnv === 'production') throw new MailNoConfiguradoError()
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function enviarMailRecuperacion(destino: string, nombre: string, link: string): Promise<void> {
  verificarMailDisponible()
  if (!transporte) {
    console.log(`[AulaActiva] Mail de recuperación no configurado. Link para ${destino}: ${link}`)
    return
  }

  const nombreSeguro = escaparHtml(nombre)

  await transporte.sendMail({
    from: `"AulaActiva" <${env.mailUsuario}>`,
    to: destino,
    subject: 'Restablecé tu contraseña de AulaActiva',
    text: [
      `Hola ${nombre}:`,
      '',
      'Recibimos un pedido para restablecer la contraseña de tu cuenta de AulaActiva.',
      `Para elegir una nueva, entrá a este link (vence en 30 minutos): ${link}`,
      '',
      'Si no lo pediste vos, ignorá este mail: tu contraseña no va a cambiar.',
    ].join('\n'),
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; color: #26211a;">
        <h2 style="color: #a47c4e;">AulaActiva</h2>
        <p>Hola ${nombreSeguro}:</p>
        <p>Recibimos un pedido para restablecer la contraseña de tu cuenta de AulaActiva.</p>
        <p style="margin: 28px 0;">
          <a href="${link}" style="background: #bc9150; color: #ffffff; padding: 12px 22px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            Elegir una nueva contraseña
          </a>
        </p>
        <p style="color: #6f675c; font-size: 13px;">El link vence en 30 minutos y sirve una sola vez.</p>
        <p style="color: #6f675c; font-size: 13px;">Si no lo pediste vos, ignorá este mail: tu contraseña no va a cambiar.</p>
      </div>
    `,
  })
}
