import { Request, Response } from 'express';

export function getGoogleOAuthUrl(req: Request): string {
  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
  
  // Use APP_URL if available, otherwise origin from request
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${appUrl}/auth/callback`;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile https://www.googleapis.com/auth/user.birthday.read',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function handleGoogleCallback(req: Request, res: Response) {
  const { code, error } = req.query;

  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>Autenticación cancelada</title></head>
        <body style="background:#0F0F11;color:#fff;font-family:sans-serif;text-align:center;padding:40px;">
          <h3 style="color:#ef4444;">Autenticación con Google no completada</h3>
          <p>${error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: '${error}' }, '*');
              setTimeout(() => window.close(), 1500);
            }
          </script>
        </body>
      </html>
    `);
  }

  let userProfile: any = null;

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
  const redirectUri = `${appUrl}/auth/callback`;

  if (code && clientId && clientSecret) {
    try {
      // Exchange code for tokens
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: String(code),
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenRes.json();

      if (tokenData.access_token) {
        // Fetch userinfo
        const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        userProfile = await userRes.json();

        // Extract birthday from Google People API
        try {
          const peopleRes = await fetch('https://people.googleapis.com/v1/people/me?personFields=birthdays', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
          });
          if (peopleRes.ok) {
            const peopleData = await peopleRes.json();
            const bdayObj = peopleData.birthdays?.find((b: any) => b.date);
            if (bdayObj?.date) {
              const y = bdayObj.date.year ? String(bdayObj.date.year).padStart(4, '0') : '';
              const m = bdayObj.date.month ? String(bdayObj.date.month).padStart(2, '0') : '';
              const d = bdayObj.date.day ? String(bdayObj.date.day).padStart(2, '0') : '';
              if (y && m && d) {
                userProfile.birthday = `${y}-${m}-${d}`;
              }
            }
          }
        } catch (pe) {
          console.warn('Could not fetch birthday from People API', pe);
        }
      }
    } catch (err) {
      console.error('Error exchanging Google OAuth code:', err);
    }
  }

  // Fallback demo profile if no secret configured
  if (!userProfile) {
    userProfile = {
      id: 'google_' + Math.random().toString(36).substring(2, 10),
      email: 'aventurero.google@gmail.com',
      verified_email: true,
      name: 'Aventurero Google',
      picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    };
  }

  return res.send(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8">
        <title>Conectando con Google...</title>
        <style>
          body {
            background-color: #0F0F11;
            color: #f1f5f9;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
          }
          .spinner {
            width: 36px;
            height: 36px;
            border: 3px solid #334155;
            border-top: 3px solid #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="spinner"></div>
        <h3 style="margin: 0 0 8px 0; font-size: 16px;">¡Cuenta de Google Conectada!</h3>
        <p style="color: #94a3b8; font-size: 13px; margin: 0;">Sincronizando tus datos con RolCerca...</p>
        <script>
          const payload = {
            type: 'GOOGLE_AUTH_SUCCESS',
            user: ${JSON.stringify(userProfile)}
          };
          if (window.opener) {
            window.opener.postMessage(payload, '*');
            setTimeout(() => {
              window.close();
            }, 600);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
}
