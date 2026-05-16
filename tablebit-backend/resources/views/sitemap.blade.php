<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>{{ $url }}</loc>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>{{ $url }}/restaurantes</loc>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>
    @foreach($restaurantes as $rest)
    <url>
        <loc>{{ $url }}/restaurante/{{ $rest->slug }}</loc>
        <lastmod>{{ $rest->updated_at->format('Y-m-d') }}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach
</urlset>
