<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenido a TableBit</title>
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
        @media only screen and (max-width: 480px) { .container { padding: 12px; } .body { padding: 24px 16px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header" style="background:#22c55e;background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 24px;text-align:center;">
                <div style="display:inline-block;background:#22c55e;width:28px;height:28px;border-radius:6px;vertical-align:middle;text-align:center;line-height:28px;font-size:16px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">T</div>
            </div>
            <div class="body">
                <h1>¡Bienvenido, {{ $user->name }}!</h1>
                <p>
                    Tu cuenta en TableBit ha sido creada correctamente. Ahora puedes explorar los mejores restaurantes y reservar tu mesa al instante.
                </p>
                <p style="text-align: center;">
                    <a href="{{ env('FRONTEND_URL', config('app.url')) }}" class="btn">Explorar restaurantes</a>
                </p>
                <p>
                    Si tienes alguna pregunta, no dudes en contactarnos.
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
