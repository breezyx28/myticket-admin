import type { CreateTourismAdInput, TourismAd, TourismAdStatus } from '@/schemas/tourismAd.schema';

const TERMINAL_STATUSES: TourismAdStatus[] = ['rejected', 'withdrawn', 'archived'];

export function canEditTourismAd(ad: Pick<TourismAd, 'status'>): boolean {
  return !TERMINAL_STATUSES.includes(ad.status);
}

export function canArchiveTourismAd(ad: Pick<TourismAd, 'status'>): boolean {
  return !TERMINAL_STATUSES.includes(ad.status);
}

function toDatetimeLocalValue(iso: string | null | undefined): string | null {
  if (!iso?.trim()) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function tourismAdToFormValues(ad: TourismAd): CreateTourismAdInput {
  return {
    locationName: ad.locationName,
    latitude: Number(ad.latitude),
    longitude: Number(ad.longitude),
    description: ad.description,
    openingHours: ad.openingHours,
    services: ad.services,
    contact: ad.contact,
    mediaLinks: ad.mediaLinks,
    galleryUrls: ad.galleryUrls.length > 0 ? ad.galleryUrls : [''],
    visibilityStartsAt: toDatetimeLocalValue(ad.visibilityStartsAt),
    visibilityEndsAt: toDatetimeLocalValue(ad.visibilityEndsAt),
  };
}
