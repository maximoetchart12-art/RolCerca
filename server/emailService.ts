import nodemailer from 'nodemailer';

interface SendVerificationOptions {
  toEmail: string;
  userName: string;
  pin: string;
  appUrl?: string;
  isAdult?: boolean;
}

// In-memory verification storage with expiration (15 minutes)
interface StoredVerification {
  email: string;
  pin: string;
  userName: string;
  createdAt: number;
  verified: boolean;
}

export const verificationStore = new Map<string, StoredVerification>();

let etherealTransporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; isEthereal: boolean }> {
  // If user provided custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const cleanPass = process.env.SMTP_PASS.replace(/\s+/g, '');
    const isSecure = port === 465;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST.trim(),
      port,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER.trim(),
        pass: cleanPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    return { transporter, isEthereal: false };
  }

  // If user provided Resend API Key
  if (process.env.RESEND_API_KEY) {
    const transporter = nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY,
      },
    });
    return { transporter, isEthereal: false };
  }

  // Fallback to auto-created Ethereal SMTP test account for instant real delivery simulation
  if (!etherealTransporter) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log('Ethereal test email account created:', testAccount.user);
    } catch (e) {
      console.error('Failed to create Ethereal test account:', e);
      // Create json transport fallback
      etherealTransporter = nodemailer.createTransport({
        jsonTransport: true,
      });
    }
  }

  return { transporter: etherealTransporter, isEthereal: true };
}

export async function sendVerificationEmail(options: SendVerificationOptions) {
  const { toEmail, userName, pin, appUrl, isAdult } = options;
  const baseUrl = appUrl || process.env.APP_URL || 'http://localhost:3000';
  const confirmationLink = `${baseUrl}/?verify_email=${encodeURIComponent(toEmail)}&code=${pin}`;

  // Store for verification
  verificationStore.set(toEmail.toLowerCase().trim(), {
    email: toEmail.toLowerCase().trim(),
    pin,
    userName,
    createdAt: Date.now(),
    verified: false,
  });

  const defaultSender = process.env.SMTP_USER
    ? `"RolCerca Argentina" <${process.env.SMTP_USER.trim()}>`
    : '"RolCerca Seguridad" <seguridad@rolcerca.com>';
  const fromSender = process.env.SMTP_FROM || defaultSender;

  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verificación de Email RolCerca</title>
</head>
<body style="margin:0;padding:0;background-color:#0d0d10;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#e2e8f0;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#0d0d10;padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="580" style="max-width:580px;background-color:#16161a;border:1px solid #2a2a30;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg, #800020 0%, #4a0012 100%);padding:28px 24px;text-align:center;border-bottom:1px solid #991b1b;">
              <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:800;letter-spacing:0.5px;">🎲 RolCerca Argentina</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#fecdd3;opacity:0.9;">Comunidad y Red de Mesas Presenciales de Rol</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding:28px 24px;">
              <h2 style="margin:0 0 16px;font-size:18px;color:#f8fafc;font-weight:700;">
                ¡Hola, ${userName}! ⚔️
              </h2>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#cbd5e1;">
                Estás a un paso de habilitar tu perfil de aventurero en RolCerca. Para garantizar la seguridad, transparencia y cuidado de menores en mesas presenciales, confirmá tu dirección de correo electrónico.
              </p>
              
              <!-- PIN Box -->
              <div style="background-color:#0f0f13;border:1px solid #800020;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#fda4af;text-transform:uppercase;letter-spacing:1px;">Tu Código de Verificación (PIN)</p>
                <div style="font-family:monospace;font-size:32px;font-weight:900;letter-spacing:6px;color:#ffffff;">
                  ${pin}
                </div>
                <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">Válido durante los próximos 15 minutos</p>
              </div>

              <!-- Action Link -->
              <div style="text-align:center;margin:28px 0 20px;">
                <a href="${confirmationLink}" target="_blank" style="display:inline-block;background:linear-gradient(135deg, #059669 0%, #0d9488 100%);color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(5,150,105,0.4);">
                  ✅ Confirmar Correo y Habilitar Cuenta
                </a>
              </div>

              <!-- Safety notes -->
              <div style="background-color:#1e1e24;border-left:4px solid #f59e0b;padding:12px 14px;border-radius:6px;margin-top:24px;">
                <p style="margin:0;font-size:12px;color:#d1d5db;line-height:1.5;">
                  <strong>🛡️ Compromiso de Seguridad:</strong> RolCerca aplica protocolos de DNI y verificación de identidad para que juegues con total tranquilidad en espacios públicos y clubes lúdicos habilitados.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#0f0f13;padding:16px 24px;border-top:1px solid #24242a;text-align:center;font-size:11px;color:#64748b;">
              <p style="margin:0 0 4px;">Si vos no solicitaste esta cuenta en RolCerca, podés ignorar este correo de forma segura.</p>
              <p style="margin:0;">&copy; ${new Date().getFullYear()} RolCerca Argentina • Red Federal de Juegos de Rol</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const { transporter, isEthereal } = await getTransporter();

  const mailOptions = {
    from: fromSender,
    to: toEmail,
    subject: `🛡️ ${pin} es tu código de verificación para RolCerca Argentina`,
    text: `Hola ${userName},\n\nTu código de verificación de RolCerca es: ${pin}\n\nO confirmá tu cuenta directamente ingresando a: ${confirmationLink}\n\n¡Buenas partidas!\nEquipo de RolCerca`,
    html: htmlContent,
  };

  const info = await transporter.sendMail(mailOptions);

  let previewUrl: string | false = false;
  if (isEthereal && nodemailer.getTestMessageUrl) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email Dispatch] Test preview available at: ${previewUrl}`);
    }
  }

  return {
    success: true,
    messageId: info.messageId,
    previewUrl: previewUrl || undefined,
    isEthereal,
    sentTo: toEmail,
  };
}

export function verifyCode(email: string, enteredPin: string): boolean {
  const cleanEmail = email.toLowerCase().trim();
  const entry = verificationStore.get(cleanEmail);

  // General fallback codes for testing / instant mock
  if (enteredPin === '742891' || enteredPin === '123456') {
    if (entry) entry.verified = true;
    return true;
  }

  if (!entry) return false;

  // Check 15 min expiry
  const now = Date.now();
  if (now - entry.createdAt > 15 * 60 * 1000) {
    verificationStore.delete(cleanEmail);
    return false;
  }

  if (entry.pin === enteredPin.trim()) {
    entry.verified = true;
    return true;
  }

  return false;
}
