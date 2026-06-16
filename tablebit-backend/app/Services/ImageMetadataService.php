<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ImageMetadataService
{
    public function extractMetadata(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);
        if (!file_exists($fullPath)) return [];

        $info = @getimagesize($fullPath);
        if (!$info) return [];

        return [
            'width' => $info[0],
            'height' => $info[1],
            'mime' => $info['mime'],
            'size' => filesize($fullPath),
            'aspect' => $info[0] > 0 ? round($info[0] / $info[1], 4) : null,
        ];
    }

    public function getDominantColor(string $path): ?string
    {
        $fullPath = Storage::disk('public')->path($path);
        if (!file_exists($fullPath)) return null;

        $size = filesize($fullPath);
        // Skip if file is too large for GD memory
        if ($size > 5 * 1024 * 1024) return null;

        $info = @getimagesize($fullPath);
        if (!$info) return null;

        if ($info[2] === IMAGETYPE_JPEG || $info[2] === IMAGETYPE_PNG || $info[2] === IMAGETYPE_WEBP) {
            try {
                $img = @imagecreatefromstring(file_get_contents($fullPath));
                if (!$img) return null;

                $thumb = imagescale($img, 1, 1, IMG_BILINEAR_FIXED);
                imagedestroy($img);

                if (!$thumb) return null;

                $rgb = imagecolorat($thumb, 0, 0);
                imagedestroy($thumb);

                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;

                return sprintf("#%02x%02x%02x", $r, $g, $b);
            } catch (\Throwable $e) {
                return null;
            }
        }

        return null;
    }

    /**
     * Extract 3 dominant colors (primary, secondary, accent) from an image.
     * Returns HSL strings ready for branding config.
     */
    public function extractPalette(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);
        if (!file_exists($fullPath)) {
            return $this->defaultPalette();
        }

        $info = @getimagesize($fullPath);
        if (!$info || !in_array($info[2], [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP])) {
            return $this->defaultPalette();
        }

        try {
            $img = @imagecreatefromstring(file_get_contents($fullPath));
            if (!$img) return $this->defaultPalette();

            $w = imagesx($img);
            $h = imagesy($img);
            $maxDim = 200;
            $scale = min(1, $maxDim / max($w, $h));
            $thumbW = max(1, (int)round($w * $scale));
            $thumbH = max(1, (int)round($h * $scale));
            $thumb = imagescale($img, $thumbW, $thumbH, IMG_BILINEAR_FIXED);
            imagedestroy($img);
            if (!$thumb) return $this->defaultPalette();

            // Sample pixels in a grid
            $buckets = array_fill(0, 12, []);
            for ($y = 0; $y < $thumbH; $y += 2) {
                for ($x = 0; $x < $thumbW; $x += 2) {
                    $rgb = imagecolorat($thumb, $x, $y);
                    $r = ($rgb >> 16) & 0xFF;
                    $g = ($rgb >> 8) & 0xFF;
                    $b = $rgb & 0xFF;

                    // Skip near-white, near-black, near-gray
                    $brightness = ($r + $g + $b) / 3;
                    if ($brightness > 230 || $brightness < 25) continue;
                    $maxC = max($r, $g, $b);
                    $minC = min($r, $g, $b);
                    if (($maxC - $minC) < 10) continue; // near-gray

                    $hsl = $this->rgbToHsl($r, $g, $b);
                    $bucketIdx = (int)($hsl['h'] / 30) % 12;
                    $buckets[$bucketIdx][] = $hsl;
                }
            }
            imagedestroy($thumb);

            // Average each bucket and filter by significance
            $clusters = [];
            $total = 0;
            foreach ($buckets as $bucket) {
                $total += count($bucket);
            }
            if ($total < 10) return $this->defaultPalette();

            $minSamples = max(3, (int)($total * 0.03));
            foreach ($buckets as $bucket) {
                if (count($bucket) < $minSamples) continue;
                $avgH = array_sum(array_column($bucket, 'h')) / count($bucket);
                $avgS = array_sum(array_column($bucket, 's')) / count($bucket);
                $avgL = array_sum(array_column($bucket, 'l')) / count($bucket);
                $clusters[] = [
                    'h' => round($avgH),
                    's' => round($avgS),
                    'l' => round($avgL),
                    'count' => count($bucket),
                ];
            }

            if (empty($clusters)) return $this->defaultPalette();

            // Sort by count descending
            usort($clusters, fn($a, $b) => $b['count'] - $a['count']);

            $primary = $clusters[0];
            // Boost primary saturation
            if ($primary['s'] < 30) $primary['s'] = min($primary['s'] + 25, 85);

            // Secondary: most different from primary
            $secondary = null;
            $maxDist = -1;
            for ($i = 1; $i < count($clusters); $i++) {
                $dist = $this->hueDist($primary['h'], $clusters[$i]['h']);
                if ($dist > $maxDist) {
                    $maxDist = $dist;
                    $secondary = $clusters[$i];
                }
            }
            if (!$secondary) {
                $secondary = ['h' => ($primary['h'] + 180) % 360, 's' => 65, 'l' => 50];
            }

            // Accent: most different from both
            $accent = null;
            $maxDist = -1;
            for ($i = 1; $i < count($clusters); $i++) {
                $d1 = $this->hueDist($primary['h'], $clusters[$i]['h']);
                $d2 = $this->hueDist($secondary['h'], $clusters[$i]['h']);
                $minD = min($d1, $d2);
                if ($minD > $maxDist) {
                    $maxDist = $minD;
                    $accent = $clusters[$i];
                }
            }
            if (!$accent) {
                $accent = ['h' => ($primary['h'] + 90) % 360, 's' => 75, 'l' => 40];
            }

            // Ensure contrast by adjusting lightness
            $primary['l'] = $primary['l'] > 55 ? 42 : ($primary['l'] < 25 ? 40 : $primary['l']);
            $secondary['l'] = $secondary['l'] > 65 ? 50 : ($secondary['l'] < 20 ? 45 : $secondary['l']);
            $accent['l'] = $accent['l'] > 60 ? 42 : ($accent['l'] < 20 ? 38 : $accent['l']);

            return [
                'primary_color' => "hsl({$primary['h']}, {$primary['s']}%, {$primary['l']}%)",
                'secondary_color' => "hsl({$secondary['h']}, {$secondary['s']}%, {$secondary['l']}%)",
                'accent_color' => "hsl({$accent['h']}, {$accent['s']}%, {$accent['l']}%)",
            ];
        } catch (\Throwable $e) {
            return $this->defaultPalette();
        }
    }

    private function defaultPalette(): array
    {
        return [
            'primary_color' => 'hsl(142, 76%, 36%)',
            'secondary_color' => 'hsl(48, 96%, 53%)',
            'accent_color' => 'hsl(199, 89%, 48%)',
        ];
    }

    private function rgbToHsl(int $r, int $g, int $b): array
    {
        $r /= 255; $g /= 255; $b /= 255;
        $max = max($r, $g, $b);
        $min = min($r, $g, $b);
        $l = ($max + $min) / 2;
        $h = 0;
        $s = 0;

        if ($max !== $min) {
            $d = $max - $min;
            $s = $l > 0.5 ? $d / (2 - $max - $min) : $d / ($max + $min);
            switch ($max) {
                case $r: $h = (($g - $b) / $d + ($g < $b ? 6 : 0)) / 6; break;
                case $g: $h = (($b - $r) / $d + 2) / 6; break;
                case $b: $h = (($r - $g) / $d + 4) / 6; break;
            }
        }

        return [
            'h' => round($h * 360),
            's' => round($s * 100),
            'l' => round($l * 100),
        ];
    }

    private function hueDist(int $h1, int $h2): float
    {
        $d = abs($h1 - $h2);
        return min($d, 360 - $d);
    }
}
