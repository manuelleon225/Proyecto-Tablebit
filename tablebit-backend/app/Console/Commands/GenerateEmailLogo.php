<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateEmailLogo extends Command
{
    protected $signature = 'branding:generate-logo';
    protected $description = 'Copia el logo real (SVG) para correos electrónicos';

    public function handle(): int
    {
        $source = base_path('public/logo-email.svg');
        $dir = Storage::disk('public')->path('branding');
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        $dest = $dir . '/logo-email.svg';

        if (file_exists($source)) {
            copy($source, $dest);
            $this->info("Logo SVG copiado a storage/app/public/branding/");
            $this->info("URL pública: " . Storage::disk('public')->url('branding/logo-email.svg'));
        } else {
            $this->error("Archivo fuente no encontrado: {$source}");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
