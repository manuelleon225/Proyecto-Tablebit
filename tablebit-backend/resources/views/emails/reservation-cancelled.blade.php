<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reserva cancelada - TableBit</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; padding: 24px; }
        .card { background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
        .header { background: #ef4444; background: linear-gradient(135deg, #ef4444, #dc2626); padding: 32px 24px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; color: #ffffff; margin: 0; letter-spacing: -0.5px; }
        .body { padding: 32px 24px; }
        h1 { font-size: 22px; color: #18181b; margin: 0 0 8px; }
        p { font-size: 15px; color: #52525b; line-height: 1.6; margin: 0 0 16px; }
        .details { background: #f8fafc; border-radius: 12px; padding: 16px; margin: 16px 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 8px 12px; font-size: 14px; }
        .details td:first-child { color: #71717a; width: 40%; }
        .details td:last-child { color: #18181b; font-weight: 500; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #fef2f2; color: #ef4444; }
        .btn { display: inline-block; padding: 12px 28px; background: #18181b; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; margin: 8px 0 16px; }
        .btn:hover { background: #27272a; }
        .footer { text-align: center; padding: 24px; color: #a1a1aa; font-size: 12px; }
        @media only screen and (max-width: 480px) { .container { padding: 12px; } .body { padding: 24px 16px; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header" style="background:#ef4444;background:linear-gradient(135deg,#ef4444,#dc2626);padding:32px 24px;text-align:center;">
                <img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ij4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZyIgeDE9IjAlIiB5MT0iMCUiIHgyPSIxMDAlIiB5Mj0iMTAwJSI+CiAgICAgIDxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMyMmM1NWUiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNvbG9yPSIjMTZhMzRhIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB4PSIwIiB5PSIwIiB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSI0LjUiIGZpbGw9InVybCgjZykiLz4KICA8ZyBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgogICAgPHBhdGggZD0ibTE2IDItMi4zIDIuM2EzIDMgMCAwIDAgMCA0LjJsMS44IDEuOGEzIDMgMCAwIDAgNC4yIDBMMjIgOCIvPgogICAgPHBhdGggZD0iTTE1IDE1IDMuMyAzLjNhNC4yIDQuMiAwIDAgMCAwIDZsNy4zIDcuM2MuNy43IDIgLjcgMi44IDBMMTUgMTVabTAgMCA3IDciLz4KICAgIDxwYXRoIGQ9Im0yLjEgMjEuOCA2LjQtNi4zIi8+CiAgICA8cGF0aCBkPSJtMTkgNS03IDciLz4KICA8L2c+Cjwvc3ZnPgo=" alt="TableBit" width="28" height="28" style="vertical-align:middle;" />
            </div>
            <div class="body">
                <h1>Reserva cancelada</h1>
                <p>Hola, <strong>{{ $reserva->cliente->name ?? 'usuario' }}</strong>. Tu reserva ha sido cancelada.</p>

                <div style="text-align: center; margin-bottom: 16px;">
                    <span class="badge">Cancelada</span>
                </div>

                <div class="details">
                    <table>
                        <tr>
                            <td>Restaurante</td>
                            <td>{{ $reserva->restaurante->nombre ?? '—' }}</td>
                        </tr>
                        <tr>
                            <td>Dirección</td>
                            <td>{{ $reserva->restaurante->direccion ?? '—' }}</td>
                        </tr>
                        <tr>
                            <td>Fecha</td>
                            <td>{{ \Carbon\Carbon::parse($reserva->fecha)->isoFormat('dddd D [de] MMMM [de] YYYY') }}</td>
                        </tr>
                        <tr>
                            <td>Hora</td>
                            <td>{{ \Carbon\Carbon::parse($reserva->hora)->format('H:i') }} hs</td>
                        </tr>
                        <tr>
                            <td>Personas</td>
                            <td>{{ $reserva->cantidad_personas }}</td>
                        </tr>
                        <tr>
                            <td>Mesa</td>
                            <td>{{ $reserva->mesa ? 'Mesa ' . $reserva->mesa->numero : '—' }}</td>
                        </tr>
                    </table>
                </div>

                <p style="text-align: center;">
                    <a href="{{ env('FRONTEND_URL', config('app.url')) }}/mis-reservas" class="btn">Ver mis reservas</a>
                </p>

                <p>
                    Si necesitas ayuda, no dudes en contactarnos.
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
