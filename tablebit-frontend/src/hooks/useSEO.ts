import { useEffect } from 'react';

interface UseSEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}

const DEFAULT_TITLE = 'TableBit - Reserva tu mesa ideal';
const DEFAULT_DESCRIPTION = 'Descubre restaurantes, lee reseñas y reserva tu mesa ideal en TableBit.';

export function useSEO({
  title,
  description,
  canonical,
  ogImage,
}: UseSEOProps = {}) {
  useEffect(() => {
    const finalTitle = title || DEFAULT_TITLE;
    const finalDescription = description || DEFAULT_DESCRIPTION;

    document.title = finalTitle;

    let metaDescription = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    if (metaDescription) {
      metaDescription.content = finalDescription;
    }

    let ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    if (ogTitle) {
      ogTitle.content = finalTitle;
    }

    let ogDescription = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    if (ogDescription) {
      ogDescription.content = finalDescription;
    }

    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (linkCanonical) {
        linkCanonical.href = canonical;
      }
    }

    if (ogImage) {
      let ogImageMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
      if (ogImageMeta) {
        ogImageMeta.content = ogImage;
      }

      let twitterImage = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement;
      if (twitterImage) {
        twitterImage.content = ogImage;
      }
    }
  }, [title, description, canonical, ogImage]);
}
