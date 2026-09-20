import React, { useState } from 'react';
import { getOptimizedImageUrl, generateSrcSet } from '../utils/imageOptimizer.ts';
import { ImageIcon } from 'lucide-react';

export interface OptimizedImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  priority?: boolean; // If true, eager loads with fetchpriority="high" for LCP optimization
  aspectRatio?: string; // e.g., "16/9", "1/1", "4/3"
  fallbackText?: string; // e.g., initial character if logo fails
  quality?: number;
  responsiveWidths?: number[];
  sizes?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  containerClassName = '',
  priority = false,
  aspectRatio,
  fallbackText,
  quality = 80,
  responsiveWidths,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  objectFit = 'cover',
  ...rest
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Generate modern WebP optimized URL
  const webpUrl = getOptimizedImageUrl(src, {
    width,
    height,
    quality,
    format: 'webp',
  });

  // Generate responsive srcSet if widths are specified or if width is large
  const srcSet = src && responsiveWidths && responsiveWidths.length > 0
    ? generateSrcSet(src, responsiveWidths, { quality, format: 'webp' })
    : undefined;

  // Fallback state
  if (error || !src) {
    return (
      <div 
        className={`flex items-center justify-center bg-slate-100 text-slate-400 select-none overflow-hidden ${containerClassName}`}
        style={{ aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined) }}
      >
        {fallbackText ? (
          <span className="font-black text-indigo-600 text-lg uppercase">{fallbackText.charAt(0)}</span>
        ) : (
          <ImageIcon className="w-5 h-5 text-slate-300" />
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio: aspectRatio || (width && height ? `${width}/${height}` : undefined) }}
    >
      {/* Subtle Skeleton Loader / Shimmer while loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse z-0" />
      )}

      <picture>
        {/* Modern WebP Format Source */}
        <source
          type="image/webp"
          srcSet={srcSet || webpUrl}
          sizes={srcSet ? sizes : undefined}
        />

        {/* Standard Img Tag with Core Web Vitals optimization attributes */}
        <img
          src={webpUrl}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-${objectFit} transition-opacity duration-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...rest}
        />
      </picture>
    </div>
  );
};
