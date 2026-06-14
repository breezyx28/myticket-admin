import { Button } from '@/components/ui/Button';
import { getApiErrorMessage } from '@/lib/apiError';
import { notifyError, notifySuccess } from '@/lib/notify';
import { PROFILE_IMAGE_ACCEPT, PROFILE_IMAGE_MAX_BYTES } from '@/schemas/adminSelf.schema';
import { useUploadAdminProfileImageMutation } from '@/services/adminApi';
import { Camera } from '@phosphor-icons/react';
import { useRef, useState } from 'react';

type ProfileAvatarUploadProps = {
  avatarUrl?: string;
  displayName: string;
  onUploaded: (avatarUrl: string, syncedProfiles?: string[]) => void;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  return (parts[0]?.slice(0, 2) ?? 'AD').toUpperCase();
}

function validateProfileImage(file: File): string | null {
  const allowed = PROFILE_IMAGE_ACCEPT.split(',');
  if (file.type && !allowed.includes(file.type)) {
    return 'Use JPEG, PNG, GIF, or WebP.';
  }
  if (file.size > PROFILE_IMAGE_MAX_BYTES) {
    return 'Image must be 4 MB or smaller.';
  }
  return null;
}

export function ProfileAvatarUpload({
  avatarUrl,
  displayName,
  onUploaded,
}: ProfileAvatarUploadProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [syncNote, setSyncNote] = useState<string | null>(null);
  const [upload, { isLoading }] = useUploadAdminProfileImageMutation();

  const shownUrl = previewUrl ?? avatarUrl;
  const initials = initialsFromName(displayName);

  async function onFileSelected(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    const validationError = validateProfileImage(file);
    if (validationError) {
      notifyError(validationError);
      if (fileRef.current) fileRef.current.value = '';
      return;
    }

    const localPreview = URL.createObjectURL(file);
    setPreviewUrl(localPreview);
    setSyncNote(null);

    try {
      const result = await upload(file).unwrap();
      onUploaded(result.avatarUrl, result.syncedProfiles);
      setPreviewUrl(null);
      if (result.syncedProfiles?.length) {
        setSyncNote(`Synced to ${result.syncedProfiles.join(', ')} profiles.`);
      }
      notifySuccess('Profile photo updated.');
    } catch (err) {
      setPreviewUrl(null);
      notifyError(getApiErrorMessage(err, 'Could not upload profile photo.'));
    } finally {
      URL.revokeObjectURL(localPreview);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="relative shrink-0">
        <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[2rem] border border-ink-10 bg-surface-tint shadow-[0_20px_40px_-15px_rgba(0,0,0,0.06)]">
          {shownUrl ? (
            <img src={shownUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-extrabold tracking-tight text-ink-40">{initials}</span>
          )}
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[2px]">
              <span className="h-8 w-8 animate-pulse rounded-full border-2 border-coral/30 border-t-coral" />
            </div>
          ) : null}
        </div>
      </div>

      <div className="min-w-0 flex-1 space-y-3">
        <div>
          <p className="text-[15px] font-extrabold text-ink">Profile photo</p>
          <p className="mt-1 max-w-[42ch] text-[13px] leading-relaxed text-ink-60">
            Uploads to{' '}
            <span className="font-mono text-[12px] text-ink">POST /api/v1/admin/me/profile-image</span>. JPEG, PNG,
            GIF, or WebP up to 4 MB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={isLoading}
            onClick={() => fileRef.current?.click()}
          >
            <Camera size={16} weight="bold" className="mr-1.5" />
            {shownUrl ? 'Replace photo' : 'Upload photo'}
          </Button>
        </div>
        {syncNote ? <p className="text-[12px] font-semibold text-ink-60">{syncNote}</p> : null}
        <input
          ref={fileRef}
          type="file"
          accept={PROFILE_IMAGE_ACCEPT}
          className="hidden"
          disabled={isLoading}
          onChange={(e) => void onFileSelected(e.target.files)}
        />
      </div>
    </div>
  );
}
