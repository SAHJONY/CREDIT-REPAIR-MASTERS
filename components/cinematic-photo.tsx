import Image, { type StaticImageData } from 'next/image';
import horizonImage from '@/public/cinematic/generated/human-home-readiness-v1.png';
import homeImage from '@/public/cinematic/generated/human-home-readiness-v1.png';
import mobilityImage from '@/public/cinematic/generated/human-auto-readiness-v1.png';
import businessImage from '@/public/cinematic/generated/human-business-readiness-v1.png';

export type CinematicPhotoVariant = 'horizon' | 'home' | 'mobility' | 'business';

const photos: Record<CinematicPhotoVariant, StaticImageData> = {
  horizon: horizonImage,
  home: homeImage,
  mobility: mobilityImage,
  business: businessImage
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
