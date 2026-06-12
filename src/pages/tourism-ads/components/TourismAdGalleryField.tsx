import { Button } from '@/components/ui/Button';
import { ImagePlus, Link2, Upload } from 'lucide-react';

type Props = {
  urls: string[];
  onChange: (next: string[]) => void;
  disabled?: boolean;
  error?: string;
};

export function TourismAdGalleryField({ urls, onChange, disabled, error }: Props) {
  function addUrl() {
    onChange([...urls, '']);
  }

  function updateUrl(index: number, value: string) {
    const next = [...urls];
    next[index] = value;
    onChange(next);
  }

  function removeUrl(index: number) {
    onChange(urls.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addUrl}>
          <Link2 size={14} className="mr-1.5" />
          Add image URL
        </Button>
        <Button type="button" variant="ghost" size="sm" disabled title="Pending API: POST /api/v1/admin/uploads">
          <Upload size={14} className="mr-1.5" />
          Upload file (pending API)
        </Button>
      </div>
      <p className="text-[12px] text-ink-60">
        File upload will use <span className="font-mono text-ink">POST /api/v1/admin/uploads</span> when available.
        Paste public image URLs for now.
      </p>
      {urls.length === 0 ? (
        <button
          type="button"
          disabled={disabled}
          onClick={addUrl}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink-10 bg-surface-tint/30 px-6 py-10 text-ink-60 transition hover:border-coral/40 hover:bg-coral/5 disabled:opacity-50"
        >
          <ImagePlus size={28} strokeWidth={1.5} />
          <span className="text-[13px] font-semibold">Add gallery image URLs</span>
        </button>
      ) : (
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="url"
                disabled={disabled}
                value={url}
                onChange={(e) => updateUrl(index, e.target.value)}
                placeholder="https://cdn.example/image.jpg"
                className="h-11 flex-1 rounded-xl border border-ink-10 bg-white px-3 text-[14px] text-ink disabled:opacity-50"
              />
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeUrl(index)}>
                Remove
              </Button>
              {url ? (
                <img
                  src={url}
                  alt=""
                  className="h-14 w-20 rounded-lg border border-ink-10 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      )}
      {error ? <p className="text-[12px] font-semibold text-coral">{error}</p> : null}
    </div>
  );
}
