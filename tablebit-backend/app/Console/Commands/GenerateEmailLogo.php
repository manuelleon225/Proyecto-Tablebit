<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class GenerateEmailLogo extends Command
{
    protected $signature = 'branding:generate-logo';
    protected $description = 'Genera el PNG del logo para correos';

    public function handle(): int
    {
        $s = 200;
        $img = imagecreatetruecolor($s, $s);
        imagesavealpha($img, true);
        imagefill($img, 0, 0, imagecolorallocatealpha($img, 0, 0, 0, 127));

        $green = imagecolorallocate($img, 34, 197, 94);
        $white = imagecolorallocate($img, 255, 255, 255);

        // Green rounded square
        $this->roundedRect($img, 0, 0, $s - 1, $s - 1, 32, $green);

        // === THICK DIAGONAL LINES using filled polygons ===
        $w = 12; // line width in pixels

        // Fork: bottom-left to top-right (y = 200 - x)
        $this->thickLine($img, 40, 160, 155, 45, $w, $white);

        // Fork prongs: 3 small lines at the top-right (near 155,45)
        $this->thickLine($img, 150, 50, 158, 42, 5, $white);
        $this->thickLine($img, 156, 56, 164, 48, 5, $white);
        $this->thickLine($img, 162, 62, 170, 54, 5, $white);

        // Knife: top-left to bottom-right (y = x)
        $this->thickLine($img, 40, 40, 155, 155, $w, $white);

        // Knife blade: wider circle at top-left (near 40,40)
        imagefilledellipse($img, 38, 38, 22, 22, $white);
        imagefilledellipse($img, 33, 33, 14, 14, $white);

        // Center crossing
        imagefilledellipse($img, 97, 97, 20, 20, $white);

        // Save
        $dir = Storage::disk('public')->path('branding');
        if (!is_dir($dir)) mkdir($dir, 0755, true);
        imagepng($img, $dir . '/logo-email.png', 9);
        imagedestroy($img);

        $this->info("Logo generado");
        return Command::SUCCESS;
    }

    private function thickLine($img, $x1, $y1, $x2, $y2, $w, $color): void
    {
        // Calculate perpendicular direction
        $dx = $x2 - $x1;
        $dy = $y2 - $y1;
        $len = sqrt($dx * $dx + $dy * $dy);
        if ($len == 0) return;
        $px = -$dy / $len * $w / 2;
        $py = $dx / $len * $w / 2;

        $polygon = [
            (int)($x1 - $px), (int)($y1 - $py),
            (int)($x1 + $px), (int)($y1 + $py),
            (int)($x2 + $px), (int)($y2 + $py),
            (int)($x2 - $px), (int)($y2 - $py),
        ];
        imagefilledpolygon($img, $polygon, 4, $color);
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
