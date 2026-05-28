import { useState, useCallback, useRef, useEffect, memo, useMemo } from "react";
import { getImageUrl, PLACEHOLDER_RESTAURANT } from "@/lib/image";
import { getConnectionType, isSaveDataEnabled, getOptimalMaxWidth, DEFAULT_BLUR } from "@/lib/imagePlaceholder";
import { trackImageLoad } from "@/lib/mediaMetrics";
import { setImageState, getImageState } from "@/lib/imageStateStore";

type RenderState = "idle" | "placeholder" | "lqip" | "full" | "success" | "error";

interface ResponsiveImageProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
  fallback?: string;
  sizes?: string;
  showSkeleton?: boolean;
  blurDataUrl?: string;
  dominantColor?: string;
  aspectRatio?: string;
  objectPosition?: string;
  objectFit?: React.CSSProperties["objectFit"];
  loadingStrategy?: "lazy" | "eager";
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement>) => void;
}

const LQIP_WIDTH = 64;

function getLqipUrl(src: string): string {
  return src.replace(/\/original\//, "/").replace(/\/[^/]+\.\w+$/, (m) => {
    const dir = src.substring(0, src.lastIndexOf("/"));
    const name = m.replace(/\.\w+$/, ".webp");
    return `/${LQIP_WIDTH}${name}`;
  });
}

const ResponsiveImage = memo(({
  src, alt, className = "", priority = false, fallback = PLACEHOLDER_RESTAURANT,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  showSkeleton = true, blurDataUrl, dominantColor, aspectRatio,
  objectPosition, objectFit, loadingStrategy, onLoad: onLoadCb, onError: onErrorCb,
}: ResponsiveImageProps) => {
  const [renderState, setRenderState] = useState<RenderState>("idle");
  const [imgError, setImgError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const lqipRef = useRef<HTMLImageElement>(null);
  const mountedRef = useRef(true);
  const docRef = useRef<Document | null>(null);
  const renderToken = useRef(0);
  const [isInView, setIsInView] = useState(priority);

  const connType = useMemo(() => getConnectionType(), []);
  const saveData = useMemo(() => isSaveDataEnabled(), []);
  const resolvedSrc = useMemo(() => getImageUrl(src), [src]);
  const currentSrc = useMemo(() => !resolvedSrc || imgError ? fallback : resolvedSrc, [resolvedSrc, imgError, fallback]);
  const radiusClass = useMemo(() => (className.match(/\brounded-(full|sm|md|lg|xl|2xl|3xl)\b/g) || []).join(" "), [className]);
  const loader = loadingStrategy || (priority ? "eager" : "lazy");
  const containerStyle = useMemo(() => ({
    width: "100%", height: "100%",
    aspectRatio: aspectRatio || undefined,
    backgroundColor: dominantColor || undefined,
  }), [aspectRatio, dominantColor]);
  const imgStyle = useMemo(() => ({
    objectPosition: objectPosition || undefined,
    objectFit: objectFit || undefined,
  }), [objectPosition, objectFit]);

  const srcSet = useMemo(() => {
    if (imgError || !resolvedSrc) return undefined;
    const base = resolvedSrc.replace(/\/original\//, "/");
    const dir = base.substring(0, base.lastIndexOf("/"));
    const file = base.substring(base.lastIndexOf("/") + 1);
    const name = file.includes(".") ? file.substring(0, file.lastIndexOf(".")) : file;
    return [320, 640, 1280, 1920].map((w) => `${dir}/${w}/${name}.webp ${w}w`).join(", ") + `, ${resolvedSrc} 3840w`;
  }, [resolvedSrc, imgError]);

  const lqipUrl = useMemo(() => resolvedSrc && connType !== "slow-2g" ? getLqipUrl(resolvedSrc) : null, [resolvedSrc, connType]);
  const showPlaceholder = !imgError && resolvedSrc && (renderState === "idle" || renderState === "placeholder");
  const showLqip = !imgError && resolvedSrc && renderState === "lqip";
  const effectiveBlur = blurDataUrl || (showSkeleton ? DEFAULT_BLUR : undefined);

  // Visibility tracking
  useEffect(() => {
    if (priority || typeof IntersectionObserver === "undefined") return;
    const el = containerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setIsInView(true); obs.disconnect(); }}, { rootMargin: "200px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [priority]);

  // State machine: idle → placeholder → lqip → full → success
  useEffect(() => {
    if (!isInView || !resolvedSrc || renderState !== "idle") return;
    const token = ++renderToken.current;
    const url = currentSrc;

    setRenderState("placeholder");

    // LQIP preload
    if (lqipUrl && connType !== "slow-2g") {
      const lqip = new Image();
      lqip.onload = () => { if (mountedRef.current && token === renderToken.current) setRenderState("lqip"); };
      lqip.src = lqipUrl;
    } else {
      if (mountedRef.current && token === renderToken.current) setRenderState("lqip");
    }

    // Full quality (double buffer: decode hidden first)
    const fullImg = new Image();
    fullImg.onload = () => {
      if (!mountedRef.current || token !== renderToken.current) return;
      if (imgRef.current) {
        imgRef.current.src = fullImg.src;
        imgRef.current.srcset = fullImg.srcset;
      }
      setRenderState("success");
      setImageState(url, "ready");
      onLoadCb?.();
      trackImageLoad(url, performance.now(), true);
    };
    fullImg.onerror = () => {
      if (!mountedRef.current || token !== renderToken.current) return;
      setRenderState("error");
      setImgError(true);
      setImageState(url, "error");
      onErrorCb?.(undefined as any);
      trackImageLoad(url, performance.now(), false);
    };
    if (srcSet) fullImg.srcset = srcSet;
    fullImg.sizes = sizes;
    fullImg.src = currentSrc;

    return () => { renderToken.current = -1; };
  }, [isInView, resolvedSrc]);

  useEffect(() => { return () => { mountedRef.current = false; }; }, []);

  const stableContainerClass = `relative overflow-hidden ${radiusClass} ${renderState === "success" ? "" : "min-h-[50px]"}`;

  return (
    <div ref={containerRef} style={containerStyle} className={stableContainerClass}>
      {/* Dominant color / blur placeholder */}
      {showPlaceholder && effectiveBlur && !dominantColor && (
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${radiusClass} opacity-100`}>
          <div className="w-full h-full bg-cover bg-center blur-xl scale-110" style={{ backgroundImage: `url(${effectiveBlur})` }} />
        </div>
      )}

      {/* LQIP layer */}
      {showLqip && lqipUrl && (
        <img ref={lqipRef} src={lqipUrl} alt="" aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 opacity-100 ${radiusClass}`}
          style={{ filter: "blur(12px)", transform: "scale(1.1)", willChange: "opacity" }}
        />
      )}

      {/* Final image (hidden until decoded via double buffer) */}
      <img ref={imgRef} alt={alt}
        className={`${className} transition-opacity duration-300 ${renderState === "success" ? "opacity-100" : "opacity-0"} ${radiusClass}`}
        style={{ ...imgStyle, willChange: "opacity" }}
        loading={saveData ? "lazy" : isInView ? loader : "lazy"}
        fetchpriority={priority && !saveData && connType !== "slow-2g" ? "high" : undefined}
        decoding="async"
      />
    </div>
  );
});

ResponsiveImage.displayName = "ResponsiveImage";
export default ResponsiveImage;
