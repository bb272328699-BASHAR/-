/**
 * Image Optimization Utilities for WebP conversion, Responsive srcSet, and Core Web Vitals
 */

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'png' | 'jpg';
  fit?: 'crop' | 'clip' | 'scale' | 'cover';
}

/**
 * Transforms external and CDN image URLs to serve modern WebP format
 * with optimal width, height, and compression.
 */
export function getOptimizedImageUrl(
  rawUrl: string | undefined | null,
  options: ImageOptimizationOptions = {}
): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '';
  }

  const {
    width,
    height,
    quality = 80,
    format = 'webp',
    fit = 'crop'
  } = options;

  const trimmed = rawUrl.trim();

  // 1. Unsplash Images
  if (trimmed.includes('images.unsplash.com')) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set('auto', 'format,compress');
      url.searchParams.set('fm', format);
      url.searchParams.set('q', String(quality));
      if (width) url.searchParams.set('w', String(width));
      if (height) url.searchParams.set('h', String(height));
      if (fit) url.searchParams.set('fit', fit);
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  // 2. Cloudinary Images
  if (trimmed.includes('res.cloudinary.com')) {
    try {
      const transforms: string[] = [`f_${format}`, `q_${quality}`];
      if (width) transforms.push(`w_${width}`);
      if (height) transforms.push(`h_${height}`);
      if (fit) transforms.push(`c_${fit}`);
      
      return trimmed.replace('/upload/', `/upload/${transforms.join(',')}/`);
    } catch {
      return trimmed;
    }
  }

  // 3. Imgix & Generic CDN URLs
  if (trimmed.includes('imgix.net') || trimmed.includes('fastly.net') || trimmed.includes('imagekit.io')) {
    try {
      const url = new URL(trimmed);
      url.searchParams.set('format', format);
      url.searchParams.set('q', String(quality));
      if (width) url.searchParams.set('w', String(width));
      if (height) url.searchParams.set('h', String(height));
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  // 4. GitHub / Avatar URLs
  if (trimmed.includes('avatars.githubusercontent.com')) {
    try {
      const url = new URL(trimmed);
      if (width) url.searchParams.set('s', String(width));
      return url.toString();
    } catch {
      return trimmed;
    }
  }

  // 5. Google User Content Photos
  if (trimmed.includes('googleusercontent.com')) {
    try {
      return trimmed.replace(/=s\d+(-c)?$/, width ? `=s${width}-c` : '=s400');
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

/**
 * Generates a responsive srcset string for high-DPI displays and responsive layouts
 */
export function generateSrcSet(
  rawUrl: string,
  widths: number[] = [320, 480, 640, 800, 1024, 1280],
  options: Omit<ImageOptimizationOptions, 'width'> = {}
): string {
  if (!rawUrl) return '';

  return widths
    .map((w) => {
      const url = getOptimizedImageUrl(rawUrl, { ...options, width: w });
      return `${url} ${w}w`;
    })
    .join(', ');
}

/**
 * Returns low-quality image placeholder (LQIP) URL for smooth progressive blur-up
 */
export function getLqipUrl(rawUrl: string): string {
  return getOptimizedImageUrl(rawUrl, {
    width: 24,
    quality: 20,
    format: 'webp',
  });
}
