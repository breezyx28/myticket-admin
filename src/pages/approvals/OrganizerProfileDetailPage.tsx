import { DirectoryProfileDetailView } from "@/pages/approvals/components/DirectoryProfileDetailView";
import { useGetOrganizerProfilesQuery } from "@/services/adminApi";
import { Link, useParams } from "react-router-dom";

export function OrganizerProfileDetailPage() {
  const { id = "" } = useParams();
  const { data, isLoading } = useGetOrganizerProfilesQuery();

  if (isLoading) return <p className="text-ink-60">Loading…</p>;

  const row = data?.find((r) => String(r.id) === String(id));

  if (!row) {
    return (
      <div className="rounded-3xl border border-ink-10 bg-white p-8">
        <p className="font-semibold text-ink">Organizer profile not found.</p>
        <Link
          to="/approvals/organizers"
          className="mt-4 inline-block font-bold text-coral hover:underline"
        >
          Back to organizers
        </Link>
      </div>
    );
  }

  return <DirectoryProfileDetailView kind="organizer" row={row} />;
}
