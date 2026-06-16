<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Restablecer contraseña - TableBit</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; }
        .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background: #22c55e; background: linear-gradient(135deg, #22c55e, #16a34a); padding: 32px 24px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
        .body { padding: 32px 24px; }
        h1 { font-size: 22px; color: #18181b; margin: 0 0 8px; }
        p { font-size: 15px; color: #52525b; line-height: 1.6; margin: 0 0 16px; }
        .btn { display: inline-block; padding: 12px 28px; background: #22c55e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
        .btn:hover { background: #16a34a; }
        .footer { text-align: center; padding: 24px; color: #a1a1aa; font-size: 12px; }
        .info { background: #f8fafc; border-radius: 12px; padding: 12px 16px; font-size: 13px; color: #71717a; }
        @media only screen and (max-width: 480px) { .container { padding: 12px; } .body { padding: 24px 16px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header" style="background:#22c55e;background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 24px;text-align:center;">
                <div style="font-size:28px;font-weight:bold;color:#ffffff;letter-spacing:-0.5px;">TableBit</div>
            </div>
            <div class="body">
                <h1>Restablece tu contraseña</h1>
                <p>Hola, <strong>{{ $user->name ?? 'usuario' }}</strong>. Recibimos una solicitud para restablecer la contraseña de tu cuenta en TableBit.</p>

                <p style="text-align: center;">
                    <a href="{{ $resetUrl }}" class="btn">Restablecer contraseña</a>
                </p>

                <p>
                    Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.
                </p>

                <p class="info">
                    Este enlace expirará en {{ $expiration ?? 60 }} minutos.
                </p>

                <p style="margin-bottom: 0;">
                    Saludos,<br>
                    El equipo de TableBit
                </p>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} TableBit. Todos los derechos reservados.
        </div>
    </div>
</body>
</html>
