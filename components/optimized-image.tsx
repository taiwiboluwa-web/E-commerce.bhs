type ImageSource = { width: number; avifUrl: string; webpUrl: string };

type OptimizedImageProps = {
  alt: string;
  width: number;
  height: number;
  fallbackSrc: string;
  variants?: ImageSource[];
  sizes?: string;
  className?: string;
  priority?: boolean;
};

/** Responsive image display for derivatives created by storeOptimizedImage(). */
export function OptimizedImage({
  alt,
  width,
  height,
  fallbackSrc,
  variants = [],
  sizes = "(max-width: 768px) 100vw, 50vw",
  className,
  priority = false,
}: OptimizedImageProps) {
  const avifSrcSet = variants.map((item) => `${item.avifUrl} ${item.width}w`).join(", ");
  const webpSrcSet = variants.map((item) => `${item.webpUrl} ${item.width}w`).join(", ");

  return (
    <picture>
      {avifSrcSet && <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />}
      {webpSrcSet && <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className={className}
      />
    </picture>
  );
}
