import { describe, expect, it } from 'vitest';
import { canArchiveTourismAd, canEditTourismAd, tourismAdToFormValues } from '@/lib/tourismAdFormValues';
import type { TourismAd } from '@/schemas/tourismAd.schema';

const baseAd: TourismAd = {
  id: 'ta-1',
  source: 'admin',
  status: 'published',
  locationName: 'Riyadh Park',
  latitude: '24.7136',
  longitude: '46.6753',
  description: 'A long enough description for the tourism ad listing in the admin panel.',
  openingHours: {
    mon: { closed: false, opens: '09:00', closes: '18:00' },
    tue: { closed: false, opens: '09:00', closes: '18:00' },
    wed: { closed: false, opens: '09:00', closes: '18:00' },
    thu: { closed: false, opens: '09:00', closes: '18:00' },
    fri: { closed: false, opens: '14:00', closes: '22:00' },
    sat: { closed: false, opens: '09:00', closes: '22:00' },
    sun: { closed: true },
  },
  services: ['Tours'],
  contact: { phone: '+966500000000' },
  mediaLinks: [],
  galleryUrls: ['https://example.com/a.jpg'],
  isPinned: false,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('tourismAdFormValues', () => {
  it('allows edit for active statuses', () => {
    expect(canEditTourismAd({ status: 'published' })).toBe(true);
    expect(canEditTourismAd({ status: 'archived' })).toBe(false);
  });

  it('allows archive except terminal statuses', () => {
    expect(canArchiveTourismAd({ status: 'draft' })).toBe(true);
    expect(canArchiveTourismAd({ status: 'archived' })).toBe(false);
  });

  it('maps API ad to form values', () => {
    const values = tourismAdToFormValues({
      ...baseAd,
      visibilityStartsAt: '2026-06-10T14:30:00.000Z',
    });
    expect(values.locationName).toBe('Riyadh Park');
    expect(values.latitude).toBeCloseTo(24.7136);
    expect(values.visibilityStartsAt).toMatch(/^2026-06-10T\d{2}:30$/);
  });
});
