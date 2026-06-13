type CropType = "avatar" | "logo" | "cover" | "gallery";

const MAX_DIMS: Record<CropType, { w: number; h: number }> = {
  avatar: { w: 512, h: 512 },
  logo: { w: 512, h: 512 },
  cover: { w: 3840, h: 2160 },
  banner: { w: 3840, h: 1640 },
  gallery: { w: 3840, h: 2160 },
};

export interface CompressionResult {
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  mimeType: string;
}

let _webpSupported: boolean | null = null;

const supportsWebP = (): boolean => {
  if (_webpSupported !== null) return _webpSupported;
  const canvas = document.createElement("canvas");
  _webpSupported = canvas.toBlob
    ? canvas.toDataURL("image/webp").startsWith("data:image/webp")
    : false;
  return _webpSupported;
};

const getAdaptiveQuality = (type: CropType, originalSize: number): number => {
  if (type === "avatar" || type === "logo") return 0.9;
  return 0.95;
};

const fitDimensions = (w: number, h: number, maxW: number, maxH: number) => {
  if (w <= maxW && h <= maxH) return { width: w, height: h };
  const ratio = Math.min(maxW / w, maxH / h);
  return {
    width: Math.round(w * ratio),
    height: Math.round(h * ratio),
  };
};

export const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  type: CropType = "gallery",
  originalSize?: number
): Promise<CompressionResult | null> => {
  const image = await createImage(imageSrc);
  const max = MAX_DIMS[type];
  const { width, height } = fitDimensions(pixelCrop.width, pixelCrop.height, max.w, max.h);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    width, height
  );

  const mimeType = supportsWebP() ? "image/webp" : "image/jpeg";
  const quality = getAdaptiveQuality(type, originalSize || 0);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((b) => resolve(b), mimeType, quality);
  });

  if (!blob) return null;

  const compressedSize = blob.size;
  const origSize = originalSize || compressedSize;
  const savedPercent = origSize > 0 ? Math.round((1 - compressedSize / origSize) * 100) : 0;

  return { blob, originalSize: origSize, compressedSize, savedPercent, mimeType };
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", (err) => reject(err));
    img.src = url;
  });
