import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';

const pinIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
};

type Props = {
  latitude: number;
  longitude: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onLocationNameSuggest?: (name: string) => void;
  disabled?: boolean;
};

function roundCoord(n: number) {
  return Math.round(n * 1_000_000) / 1_000_000;
}

function MapFlyTo({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, map.getZoom(), { duration: 0.6 });
  }, [center, map]);
  return null;
}

function MapClickHandler({
  onPick,
  disabled,
}: {
  onPick: (lat: number, lng: number) => void;
  disabled?: boolean;
}) {
  useMapEvents({
    click(e) {
      if (disabled) return;
      onPick(roundCoord(e.latlng.lat), roundCoord(e.latlng.lng));
    },
  });
  return null;
}

async function searchNominatim(query: string): Promise<NominatimResult[]> {
  const params = new URLSearchParams({
    q: query,
    format: 'json',
    limit: '5',
    countrycodes: 'sa',
  });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as NominatimResult[];
  return Array.isArray(data) ? data : [];
}

export function TourismAdLocationPicker({
  latitude,
  longitude,
  onCoordinatesChange,
  onLocationNameSuggest,
  disabled,
}: Props) {
  const { t } = useTranslation('operations');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const position: [number, number] = [latitude, longitude];

  const setCoords = useCallback(
    (lat: number, lng: number) => {
      onCoordinatesChange(roundCoord(lat), roundCoord(lng));
    },
    [onCoordinatesChange],
  );

  useEffect(() => {
    if (!search.trim() || search.trim().length < 3) {
      setResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const rows = await searchNominatim(search.trim());
        setResults(rows);
        setShowResults(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  function pickResult(row: NominatimResult) {
    const lat = roundCoord(Number(row.lat));
    const lng = roundCoord(Number(row.lon));
    setCoords(lat, lng);
    onLocationNameSuggest?.(row.display_name.split(',')[0]?.trim() ?? row.display_name);
    setSearch('');
    setResults([]);
    setShowResults(false);
  }

  const lat = roundCoord(latitude).toFixed(6);
  const lng = roundCoord(longitude).toFixed(6);

  return (
    <div className="space-y-3">
      <div ref={wrapRef} className="relative">
        <label className="flex flex-col gap-1 text-[12px] font-semibold text-ink-60">
          {t('tourismAds.locationPicker.searchLabel')}
          <input
            type="text"
            disabled={disabled}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder={t('tourismAds.locationPicker.searchPlaceholder')}
            className="h-11 rounded-xl border border-ink-10 bg-white px-3 text-[14px] text-ink disabled:opacity-50"
          />
        </label>
        {searching ? <p className="mt-1 text-[11px] text-ink-40">{t('tourismAds.locationPicker.searching')}</p> : null}
        {showResults && results.length > 0 ? (
          <ul className="absolute z-[1000] mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-ink-10 bg-white shadow-lg">
            {results.map((row) => (
              <li key={row.place_id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-[13px] text-ink hover:bg-surface-tint"
                  onClick={() => pickResult(row)}
                >
                  {row.display_name}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink-10 [&_.leaflet-container]:z-0">
        <MapContainer
          center={position}
          zoom={11}
          className="h-[320px] w-full"
          scrollWheelZoom={!disabled}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapFlyTo center={position} />
          <MapClickHandler onPick={setCoords} disabled={disabled} />
          <Marker
            position={position}
            icon={pinIcon}
            draggable={!disabled}
            eventHandlers={{
              dragend: (e) => {
                const { lat: markerLat, lng: markerLng } = e.target.getLatLng();
                setCoords(markerLat, markerLng);
              },
            }}
          />
        </MapContainer>
      </div>

      <p className="font-mono text-[11px] text-ink-40">
        {t('tourismAds.locationPicker.coordsHint', { lat, lng })}
      </p>
      <p className="text-[11px] text-ink-40">
        <Trans
          ns="operations"
          i18nKey="tourismAds.locationPicker.nominatimHint"
          components={{
            link: (
              <a
                href="https://nominatim.org/release-docs/develop/api/Search/"
                target="_blank"
                rel="noreferrer"
                className="text-coral hover:underline"
              />
            ),
          }}
        />
      </p>
    </div>
  );
}
