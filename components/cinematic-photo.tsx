import Image, { type StaticImageData } from 'next/image';
import horizonImage from '@/public/cinematic/generated/human-home-readiness-v1.png';
import homeImage from '@/public/cinematic/generated/human-home-readiness-v1.png';
import mobilityImage from '@/public/cinematic/generated/human-auto-readiness-v1.png';
import businessImage from '@/public/cinematic/generated/human-business-readiness-v1.png';
import indigenousImage from '@/public/cinematic/generated/indigenous-couple-v1.png';
import pacificImage from '@/public/cinematic/generated/pacific-islander-family-v1.png';
import olderImage from '@/public/cinematic/generated/older-white-couple-v1.png';
import multiracialImage from '@/public/cinematic/generated/multiracial-family-v1.png';
import blackCoupleImage from '@/public/cinematic/generated/black-couple-v1.png';
import abstractHorizonImage from '@/public/cinematic/generated/new850-horizon-v2.png';
import abstractMobilityImage from '@/public/cinematic/generated/mobility-future-v2.png';

export type CinematicPhotoVariant = 'horizon' | 'home' | 'mobility' | 'business' | 'indigenous' | 'pacific' | 'older' | 'multiracial' | 'black-couple' | 'abstract-horizon' | 'abstract-mobility';

const photos: Record<CinematicPhotoVariant, StaticImageData> = {
  horizon: horizonImage,
  home: homeImage,
  mobility: mobilityImage,
  business: businessImage,
  indigenous: indigenousImage,
  pacific: pacificImage,
  older: olderImage,
  multiracial: multiracialImage,
  'black-couple': blackCoupleImage,
  'abstract-horizon': abstractHorizonImage,
  'abstract-mobility': abstractMobilityImage
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
