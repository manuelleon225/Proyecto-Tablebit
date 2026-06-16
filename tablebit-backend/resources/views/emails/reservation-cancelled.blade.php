<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva cancelada - TableBit</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        .container { max-width: 560px; margin: 0 auto; padding: 24px 16px; }
        .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06); }
        .body { padding: 40px 32px 32px; }
        h1 { font-size: 22px; color: #18181b; margin: 0 0 12px; font-weight: 700; }
        p { font-size: 15px; color: #52525b; line-height: 1.7; margin: 0 0 16px; }
        .detail-box { background: #fef2f2; border-left: 3px solid #ef4444; border-radius: 8px; padding: 16px 20px; margin: 24px 0; }
        .detail-box table { width: 100%; border-collapse: collapse; }
        .detail-box td { padding: 7px 0; font-size: 14px; border-bottom: 1px solid #fecaca; }
        .detail-box tr:last-child td { border-bottom: none; }
        .detail-box td:first-child { color: #71717a; width: 35%; }
        .detail-box td:last-child { color: #18181b; font-weight: 500; }
        .btn { display: inline-block; padding: 14px 32px; background: #22c55e; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; margin: 8px 0 24px; }
        .footer { text-align: center; padding: 32px 24px; color: #7a7a7a; font-size: 12px; line-height: 1.6; border-top: 1px solid #e8e8ec; }
        .footer a { color: #5a5a5a; text-decoration: underline; }
        @media only screen and (max-width: 480px) { .container { padding: 12px 8px; } .body { padding: 32px 20px 24px; } .detail-box { padding: 12px 16px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div style="background:#ef4444;background:linear-gradient(135deg,#ef4444,#dc2626);padding:24px;text-align:center;">
                <div style="display:inline-block;background:#22c55e;width:28px;height:28px;border-radius:6px;vertical-align:middle;text-align:center;line-height:28px;font-size:16px;font-weight:bold;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">T</div>
                <span style="font-size:20px;font-weight:700;color:#ffffff;vertical-align:middle;margin-left:8px;font-family:Arial,Helvetica,sans-serif;">TableBit</span>
            </div>
            <div class="body">
                <h1>Reserva cancelada</h1>
                <p>Hola, <strong>{{ $reserva->cliente->name ?? 'usuario' }}</strong>. Tu reserva ha sido cancelada.</p>

                <div class="detail-box">
                    <table>
                        <tr><td>Restaurante</td><td>{{ $reserva->restaurante->nombre ?? '—' }}</td></tr>
                        <tr><td>Dirección</td><td>{{ $reserva->restaurante->direccion ?? '—' }}</td></tr>
                        <tr><td>Fecha</td><td>{{ \Carbon\Carbon::parse($reserva->fecha)->isoFormat('dddd D [de] MMMM [de] YYYY') }}</td></tr>
                        <tr><td>Hora</td><td>{{ \Carbon\Carbon::parse($reserva->hora)->format('H:i') }} hs</td></tr>
                        <tr><td>Personas</td><td>{{ $reserva->cantidad_personas }}</td></tr>
                        <tr><td>Mesa</td><td>{{ $reserva->mesa ? 'Mesa ' . $reserva->mesa->numero : '—' }}</td></tr>
                        <tr><td>Estado</td><td>Cancelada</td></tr>
                    </table>
                </div>

                <p>Si necesitas ayuda, contacta al restaurante o al equipo de TableBit.</p>

                <p style="margin-bottom:0;">
                    Saludos,<br>
                    El equipo de TableBit
                </p>
            </div>
        </div>
        <div class="footer">
            TableBit &bull; Todos los derechos reservados &copy; {{ date('Y') }}<br>
            <a href="{{ env('FRONTEND_URL', config('app.url')) }}">{{ str_replace(['http://','https://'], '', env('FRONTEND_URL', config('app.url'))) }}</a>
        </div>
    </div>
</body>
</html>
