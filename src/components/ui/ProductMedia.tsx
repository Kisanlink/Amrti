import { Play } from 'lucide-react';
import { useRef, useState } from 'react';
import type { ProductImage } from '../../context/AppContext';

// Media item interface for unified handling of images and videos
export interface MediaItem {
  url: string;
  type: 'image' | 'video';
  alt_text?: string;
  caption?: string;
  is_primary?: boolean;
  sort_order?: number;
  mime_type?: string;
}

// Helper to get all media items from a product
export const getAllMediaItems = (product: any): MediaItem[] => {
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const activeMedia = product.images.filter((img: any) =>
      img.is_active !== false && img.image_url && img.image_url.trim() !== ''
    );

    const sortedMedia = [...activeMedia].sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    return sortedMedia.map((img: any) => ({
      url: img.image_url,
      type: img.image_type === 'video' ? 'video' : 'image',
      alt_text: img.alt_text,
      caption: img.caption,
      is_primary: img.is_primary,
      sort_order: img.sort_order,
      mime_type: img.mime_type
    }));
  }

  // Fallback to legacy structure
  const fallbackUrls = [
    product?.image_url,
    product?.image_url_1,
    product?.image_url_2,
    product?.image_url_3,
    product?.image_url_4
  ].filter(url => url && url.trim() !== '');

  return fallbackUrls.map(url => ({ url, type: 'image' as const }));
};

// Helper to get the best thumbnail (prefers images over videos)
export const getProductThumbnail = (product: any): { url: string; isVideo: boolean } => {
  if (product?.images && Array.isArray(product.images) && product.images.length > 0) {
    const activeMedia = product.images.filter((img: ProductImage) =>
      img.is_active !== false && img.image_url && img.image_url.trim() !== ''
    );

    // Prefer images over videos for thumbnails
    const images = activeMedia.filter((img: ProductImage) => img.image_type !== 'video');
    if (images.length > 0) {
      const sortedImages = [...images].sort((a: ProductImage, b: ProductImage) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return { url: sortedImages[0].image_url, isVideo: false };
    }

    // If only videos exist, use the first video
    const videos = activeMedia.filter((img: ProductImage) => img.image_type === 'video');
    if (videos.length > 0) {
      const sortedVideos = [...videos].sort((a: ProductImage, b: ProductImage) => {
        if (a.is_primary && !b.is_primary) return -1;
        if (!a.is_primary && b.is_primary) return 1;
        return (a.sort_order || 0) - (b.sort_order || 0);
      });
      return { url: sortedVideos[0].image_url, isVideo: true };
    }
  }

  return { url: product?.image_url || '', isVideo: false };
};

// Props for ProductMedia component
interface ProductMediaProps {
  media: MediaItem;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  onError?: (e: React.SyntheticEvent) => void;
  onLoad?: () => void;
}

// Reusable ProductMedia component for rendering images or videos
export const ProductMedia: React.FC<ProductMediaProps> = ({
  media,
  alt = 'Product media',
  className = '',
  style,
  showControls = true,
  autoPlay = false,
  muted = false,
  loop = false,
  onPlay,
  onPause,
  onEnded,
  onError,
  onLoad
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  if (media.type === 'video') {
    return (
      <video
        ref={videoRef}
        src={media.url}
        className={className}
        style={style}
        controls={showControls}
        autoPlay={autoPlay}
        muted={muted}
        loop={loop}
        playsInline
        preload="metadata"
        onPlay={onPlay}
        onPause={onPause}
        onEnded={onEnded}
        onError={onError}
        onLoadedData={onLoad}
      >
        <source src={media.url} type={media.mime_type || 'video/mp4'} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <img
      src={media.url}
      alt={media.alt_text || alt}
      className={className}
      style={style}
      onError={onError}
      onLoad={onLoad}
    />
  );
};

// Props for ProductThumbnail component
interface ProductThumbnailProps {
  product: any;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  showPlayIcon?: boolean;
  playIconSize?: 'sm' | 'md' | 'lg';
  onError?: (e: React.SyntheticEvent) => void;
  onLoad?: () => void;
}

// Reusable ProductThumbnail component for product cards
export const ProductThumbnail: React.FC<ProductThumbnailProps> = ({
  product,
  alt,
  className = '',
  style,
  showPlayIcon = true,
  playIconSize = 'md',
  onError,
  onLoad
}) => {
  const thumbnail = getProductThumbnail(product);

  const iconSizes = {
    sm: { container: 'w-8 h-8', icon: 'w-4 h-4' },
    md: { container: 'w-12 h-12', icon: 'w-6 h-6' },
    lg: { container: 'w-16 h-16', icon: 'w-8 h-8' }
  };

  if (thumbnail.isVideo) {
    return (
      <div className="relative w-full h-full">
        <video
          src={thumbnail.url}
          className={className}
          style={style}
          muted
          preload="metadata"
          onError={onError}
          onLoadedData={onLoad}
        />
        {showPlayIcon && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className={`${iconSizes[playIconSize].container} bg-white/90 rounded-full flex items-center justify-center shadow-lg`}>
              <Play className={`${iconSizes[playIconSize].icon} text-green-600 ml-0.5`} fill="currentColor" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={thumbnail.url}
      alt={alt || product?.name || 'Product image'}
      className={className}
      style={style}
      onError={onError}
      onLoad={onLoad}
    />
  );
};

export default ProductMedia;
