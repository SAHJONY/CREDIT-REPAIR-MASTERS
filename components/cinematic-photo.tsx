import Image, { type StaticImageData } from 'next/image';
import horizonImage from '@/public/cinematic/generated/new850-horizon-v2.png';
import homeImage from '@/public/cinematic/generated/luxury-home-v2.png';
import mobilityImage from '@/public/cinematic/generated/mobility-future-v2.png';

export type CinematicPhotoVariant = 'horizon' | 'home' | 'mobility';

const photos: Record<CinematicPhotoVariant, StaticImageData> = {
  horizon: horizonImage,
  home: homeImage,
  mobility: mobilityImage
};

export function CinematicPhoto({ variant, label, priority = false, compact = false }: {
  variant: CinematicPhotoVariant;
  label: string;
  priority?: boolean;
  compact?: boolean;
}) {
  return (
    <figure className={`cinematicPhoto${compact ? ' cinematicPhoto--compact' : ''}`}>
      <Image src={photos[variant]} alt={label} fill priority={priority} placeholder="blur"
        sizes={compact ? '(max-width: 760px) 92vw, 420px' : '(max-width: 900px) 92vw, 48vw'} />
      <figcaption><span>NEW850</span><strong>{label}</strong></figcaption>
    </figure>
  );
}
