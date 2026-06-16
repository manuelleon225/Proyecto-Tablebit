<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateEmailLogo extends Command
{
    protected $signature = 'branding:generate-logo {size=200}';
    protected $description = 'Genera el PNG del logo (cubiertos cruzados) para correos';

    public function handle(): int
    {
        $size = (int) $this->argument('size');
        $radius = (int) ($size * 0.18);
        $cx = $size / 2;
        $cy = $size / 2;

        $img = imagecreatetruecolor($size, $size);
        imagesavealpha($img, true);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));

        $green = imagecolorallocate($img, 34, 197, 94);
        $white = imagecolorallocate($img, 255, 255, 255);
        $darkGreen = imagecolorallocate($img, 22, 163, 74);

        // Draw rounded green background
        $this->roundedRect($img, 0, 0, $size - 1, $size - 1, $radius, $green);

        $s = $size / 200; // scale factor

        // Draw crossed utensils at 45 degrees (center at cx, cy)
        // We draw rotated shapes manually using trigonometry

        $angle = -35 * M_PI / 180; // -35 degrees for the X crossing
        $cos = cos($angle);
        $sin = sin($angle);

        // Line width
        $lw = (int) (10 * $s);
        $hw = $lw / 2;

        // Fork (from top-left to bottom-right): a line with prongs at the top
        // Handle: long rectangle rotated
        $handleLen = (int) (100 * $s);
        $prongLen = (int) (16 * $s);
        $prongGap = (int) (6 * $s);

        // Draw fork handle (rotated line)
        // Fork goes from top-right area to bottom-left (reversed)
        $fx1 = $cx + (int)(-$handleLen * 0.3 * $cos);
        $fy1 = $cy + (int)(-$handleLen * 0.3 * $sin);
        $fx2 = $cx + (int)($handleLen * 0.7 * $cos);
        $fy2 = $cy + (int)($handleLen * 0.7 * $sin);

        $this->drawThickLine($img, $fx1, $fy1, $fx2, $fy2, $lw, $white);

        // Fork prongs at the top (perpendicular to the handle)
        $px = $fx2;
        $py = $fy2;
        $perp = $angle + M_PI / 2;
        $pcx = cos($perp);
        $psy = sin($perp);

        // Three prongs
        for ($i = -1; $i <= 1; $i++) {
            $offX = (int)($i * ($prongGap + $lw) * $pcx);
            $offY = (int)($i * ($prongGap + $lw) * $psy);
            $px1 = $px + $offX;
            $py1 = $py + $offY;
            $px2 = $px + $offX + (int)($prongLen * $pcx);
            $py2 = $py + $offY + (int)($prongLen * $psy);
            $this->drawThickLine($img, $px1, $py1, $px2, $py2, (int)($lw * 0.7), $white);
        }

        // Knife (from bottom-left to top-right)
        $kx1 = $cx + (int)($handleLen * 0.4 * $sin);
        $ky1 = $cy + (int)(-$handleLen * 0.4 * $cos);
        $kx2 = $cx + (int)(-$handleLen * 0.65 * $sin);
        $ky2 = $cy + (int)($handleLen * 0.65 * $cos);

        // Rotated handle for knife
        $kAngle = 55 * M_PI / 180;
        $kcos = cos($kAngle);
        $ksin = sin($kAngle);
        $khx1 = $cx + (int)(-$handleLen * 0.35 * $kcos);
        $khy1 = $cy + (int)(-$handleLen * 0.35 * $ksin);
        $khx2 = $cx + (int)($handleLen * 0.65 * $kcos);
        $khy2 = $cy + (int)($handleLen * 0.65 * $ksin);

        $this->drawThickLine($img, $khx1, $khy1, $khx2, $khy2, $lw, $white);

        // Knife blade (wider at the top)
        $bladeLen = (int) (22 * $s);
        $bladeW = (int) (12 * $s);
        $bladeX = $khx2;
        $bladeY = $khy2;
        $bperp = $kAngle + M_PI / 2;
        $bcx = cos($bperp);
        $bsy = sin($bperp);

        // Draw blade as a simple rounded line
        $bladeEndX = $bladeX + (int)($bladeLen * $kcos);
        $bladeEndY = $bladeY + (int)($bladeLen * $ksin);
        $this->drawThickLine($img, $bladeX, $bladeY, $bladeEndX, $bladeEndY, (int)($lw * 1.3), $white);

        // Save PNG
        $dir = Storage::disk('public')->path('branding');
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $path = $dir . DIRECTORY_SEPARATOR . 'logo-email.png';
        imagepng($img, $path, 9);
        imagedestroy($img);

        $this->info("✅ Logo generado: {$path}");
        $this->info("   Tamaño: " . round(filesize($path) / 1024, 1) . " KB");
        $this->info("   URL: " . Storage::disk('public')->url('branding/logo-email.png'));

        return Command::SUCCESS;
    }

    private function drawThickLine($img, $x1, $y1, $x2, $y2, $width, $color): void
    {
        imagesetthickness($img, max(1, $width));
        imageline($img, $x1, $y1, $x2, $y2, $color);

        // Draw additional lines for thickness (GD's imagesetthickness is limited)
        for ($i = 1; $i <= $width / 2; $i++) {
            imageline($img, $x1, $y1 + $i, $x2, $y2 + $i, $color);
            imageline($img, $x1, $y1 - $i, $x2, $y2 - $i, $color);
            imageline($img, $x1 + $i, $y1, $x2 + $i, $y2, $color);
            imageline($img, $x1 - $i, $y1, $x2 - $i, $y2, $color);
        }
    }

    private function roundedRect($img, $x1, $y1, $x2, $y2, $r, $color): void
    {
        $r = min($r, ($x2 - $x1) / 2, ($y2 - $y1) / 2);
        imagefilledrectangle($img, $x1 + $r, $y1, $x2 - $r, $y2, $color);
        imagefilledrectangle($img, $x1, $y1 + $r, $x2, $y2 - $r, $color);
        imagefilledarc($img, $x1 + $r, $y1 + $r, $r * 2, $r * 2, 180, 270, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y1 + $r, $r * 2, $r * 2, 270, 360, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x1 + $r, $y2 - $r, $r * 2, $r * 2, 90, 180, $color, IMG_ARC_PIE);
        imagefilledarc($img, $x2 - $r, $y2 - $r, $r * 2, $r * 2, 0, 90, $color, IMG_ARC_PIE);
    }
}
