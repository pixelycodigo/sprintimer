const nodemailer = require('nodemailer');

// Configurar transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Enviar email de bienvenida con credenciales
 */
const enviarEmailBienvenida = async (destinatario, nombre, credenciales, esTemporal = false) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"SprinTask" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: '🔐 Tu cuenta de SprinTask está lista',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .credentials { background: white; border: 2px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #667eea; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Bienvenido a SprinTask</h1>
              <p>Tu cuenta ha sido creada exitosamente</p>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              
              <p>Has sido registrado en <strong>SprinTask</strong>, la plataforma para gestionar proyectos freelance.</p>
              
              <div class="credentials">
                <h3 style="margin-top: 0;">🔑 Tus Credenciales de Acceso</h3>
                <div class="credential-item">
                  <span class="credential-label">Email:</span> ${credenciales.email}
                </div>
                <div class="credential-item">
                  <span class="credential-label">Contraseña:</span> ${credenciales.password}
                </div>
              </div>
              
              ${esTemporal ? `
                <div class="warning">
                  <strong>⚠️ IMPORTANTE:</strong> Deberás cambiar tu contraseña al primer inicio de sesión por seguridad.
                </div>
              ` : `
                <div class="info">
                  <strong>💡 Consejo:</strong> Puedes cambiar tu contraseña en cualquier momento desde tu perfil.
                </div>
              `}
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar Sesión</a>
              </div>
              
              <div class="footer">
                <p>Si tienes alguna pregunta, contacta a tu administrador.</p>
                <p><strong>SprinTask</strong> - Gestión de proyectos freelance simplificada</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de bienvenida enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
    return false;
  }
};

/**
 * Enviar email de verificación de email
 */
const enviarEmailVerificacion = async (destinatario, nombre, token) => {
  const transporter = createTransporter();
  
  const verificationUrl = `${process.env.FRONTEND_URL}/verificar-email?token=${token}`;
  
  const mailOptions = {
    from: `"SprinTask" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: '📧 Verifica tu email - SprinTask',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 Verifica tu Email</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              
              <p>¡Gracias por registrarte en <strong>SprinTask</strong>!</p>
              
              <p>Para comenzar a gestionar tus proyectos y equipo, necesitamos verificar tu email.</p>
              
              <div class="info">
                <strong>ℹ️ Información:</strong> Este enlace expira en 24 horas.
              </div>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verificar Email</a>
              </div>
              
              <p style="margin-top: 30px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              
              <div class="footer">
                <p><strong>SprinTask</strong> - Gestión de proyectos freelance simplificada</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de verificación enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de verificación:', error);
    return false;
  }
};

/**
 * Enviar email de recuperación de contraseña
 */
const enviarEmailRecuperacion = async (destinatario, nombre, token) => {
  const transporter = createTransporter();
  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  
  const mailOptions = {
    from: `"SprinTask" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: '🔒 Recuperar Contraseña - SprinTask',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Recuperar Contraseña</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              
              <p>Hemos recibido una solicitud para restablecer tu contraseña de SprinTask.</p>
              
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expira en 1 hora.
              </div>
              
              <div style="text-align: center;">
                <a href="${resetUrl}" class="button">Restablecer Contraseña</a>
              </div>
              
              <p style="margin-top: 30px;">Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña permanecerá sin cambios.</p>
              
              <div class="footer">
                <p><strong>SprinTask</strong> - Gestión de proyectos freelance simplificada</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de recuperación enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    return false;
  }
};

/**
 * Enviar email de cuenta reactivada
 */
const enviarEmailReactivacion = async (destinatario, nombre, recuperadoPor) => {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: `"SprinTask" <${process.env.EMAIL_USER}>`,
    to: destinatario,
    subject: '✅ Tu cuenta de SprinTask ha sido reactivada',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .info { background: #d1ecf1; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Cuenta Reactivada</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${nombre}</strong>,</p>
              
              <p>¡Buenas noticias! Tu cuenta de <strong>SprinTask</strong> ha sido reactivada por <strong>${recuperadoPor}</strong>.</p>
              
              <div class="info">
                <strong>💡 ¿Qué puedes hacer ahora?</strong>
                <ul style="margin: 10px 0;">
                  <li>Iniciar sesión con tu contraseña anterior</li>
                  <li>Ver tus proyectos asignados</li>
                  <li>Registrar tareas y horas</li>
                </ul>
              </div>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Iniciar Sesión</a>
              </div>
              
              <div class="footer">
                <p><strong>SprinTask</strong> - Gestión de proyectos freelance simplificada</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
  };
  
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email de reactivación enviado a ${destinatario}`);
    return true;
  } catch (error) {
    console.error('Error al enviar email de reactivación:', error);
    return false;
  }
};

module.exports = {
  enviarEmailBienvenida,
  enviarEmailVerificacion,
  enviarEmailRecuperacion,
  enviarEmailReactivacion,
};
