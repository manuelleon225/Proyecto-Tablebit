<?php
/**
 * Generates the TableBit email logo PNG using PHP GD.
 * 
 * The logo is a green rounded square with a white "T" letter,
 * matching the app's brand identity (UtensilsCrossed icon is not
 * reproducible with GD, so we use a clean, professional "T" mark).
 * 
 * Run: php artisan branding:generate-logo
 */

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateEmailLogo extends Command
{
    protected $signature = 'branding:generate-logo';
    protected $description = 'Genera el PNG del logo para correos electrónicos';

    public function handle(): int
    {
        $size = 200;
        $radius = 36; // rounded corners
        $padding = 20;

        $img = imagecreatetruecolor($size, $size);
        imagesavealpha($img, true);
        $transparent = imagecolorallocatealpha($img, 0, 0, 0, 127);
        imagefill($img, 0, 0, $transparent);

        // Green background
        $green = imagecolorallocate($img, 34, 197, 94);
        $darkGreen = imagecolorallocate($img, 22, 163, 74);

        // Draw rounded rectangle with gradient-like effect (solid for GD compatibility)
        $this->roundedRect($img, 0, 0, $size - 1, $size - 1, $radius, $green);

        // Draw "T" letter
        $white = imagecolorallocate($img, 255, 255, 255);

        // Use a simple font rendering approach: draw the "T" manually
        // Horizontal bar of T
        $barW = 100;
        $barH = 20;
        $barX = ($size - $barW) / 2;
        $barY = 55;
        imagefilledrectangle($img, $barX, $barY, $barX + $barW, $barY + $barH, $white);

        // Vertical bar of T
        $stemW = 20;
        $stemH = 85;
        $stemX = ($size - $stemW) / 2;
        $stemY = $barY + $barH - 5;
        imagefilledrectangle($img, $stemX, $stemY, $stemX + $stemW, $stemY + $stemH, $white);

        // Save
        $dir = Storage::disk('public')->path('branding');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $path = $dir . DIRECTORY_SEPARATOR . 'logo-email.png';
        imagepng($img, $path, 9);
        imagedestroy($img);

        $this->info("✅ Logo generado: {$path}");
        $this->info("   Tamaño: " . round(filesize($path) / 1024, 1) . " KB");
        $this->info("   URL pública: " . Storage::disk('public')->url('branding/logo-email.png'));

        return Command::SUCCESS;
    }

    private function roundedRect($img, $x1, $y1, $x2, $y2, $r, $color): void
    {
        // Draw the main rectangle with rounded corners using filled arcs
        $r = min($r, ($x2 - $x1) / 2, ($y2 - $y1) / 2);
        
        // Center rectangle
        imagefilledrectangle($img, $x1 + $r, $y1, $x2 - $r, $y2, $color);
        // Left/right rectangles
        imagefilledrectangle($img, $x1, $y1 + $r, $x2, $y2 - $r, $color);
        
        // Four corners (filled arcs)
        imagefilledarc($img, $x1 + $r, $y1 + $r, $r * 2, $r * 2, 180, 270, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y1 + $r, $r * 2, $r * 2, 270, 360, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x1 + $r, $y2 - $r, $r * 2, $r * 2, 90, 180, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y2 - $r, $r * 2, $r * 2, 0, 90, $color, IMG_ARC_PIE);
    }
}
