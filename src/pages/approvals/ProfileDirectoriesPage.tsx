import { ListFiltersBar } from "@/components/admin/ListFiltersBar";
import { Card, CardContent } from "@/components/ui/card";
import { filterSelectClassName } from "@/lib/adminFilters";
import { rowMatchesSearch } from "@/lib/listQuery";
import { cn } from "@/lib/utils";
import {
  useGetOrganizerProfilesQuery,
  useGetVendorProfilesQuery,
} from "@/services/adminApi";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Calendar, MapPin, Star, Store } from "lucide-react";

type Kind = "vendor" | "organizer";

const COPY: Record<
  Kind,
  { title: string; kicker: string; blurb: string; path: string; empty: string }
> = {
  vendor: {
    kicker: "Approvals",
    title: "Vendor profiles",
    blurb:
      "Marketplace vendors from the admin directory. Open a card for the same dossier-style detail view used for talent.",
    path: "GET /api/v1/admin/profiles/vendors",
    empty: "No vendor profiles match your filters.",
  },
  organizer: {
    kicker: "Approvals",
    title: "Organizer profiles",
    blurb:
      "Event organizers from the admin directory. Pair with finance KYC when you need document-level review.",
    path: "GET /api/v1/admin/profiles/organizers",
    empty: "No organizer profiles match your filters.",
  },
};

const HERO_VENDOR =
  "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80&auto=format&fit=crop";
const HERO_ORGANIZER =
  "https://images.unsplash.com/photo-1540575467063-27a8943169da?w=800&q=80&auto=format&fit=crop";

function statusTone(s: string | undefined) {
  if (!s) return "text-ink-60 font-extrabold";
  const u = s.toLowerCase();
  if (u.includes("pending") || u.includes("review"))
    return "text-amber font-extrabold";
  if (
    u.includes("available") ||
    u.includes("active") ||
    u.includes("approved") ||
    u.includes("verified")
  )
    return "text-mint font-extrabold";
  if (u.includes("reject") || u.includes("suspend"))
    return "text-coral font-extrabold";
  return "text-ink-60 font-extrabold";
}

function ProfileDirectoryBody({ kind }: { kind: Kind }) {
  const vendorQ = useGetVendorProfilesQuery(undefined, {
    skip: kind !== "vendor",
  });
  const organizerQ = useGetOrganizerProfilesQuery(undefined, {
    skip: kind !== "organizer",
  });
  const { data, isLoading } = kind === "vendor" ? vendorQ : organizerQ;
  const c = COPY[kind];

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | string>("all");

  const statusOptions = useMemo(() => {
    const set = new Set<string>();
    for (const row of data ?? []) {
      if (row.status) set.add(row.status);
    }
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    return (data ?? []).filter((row) => {
      if (status !== "all" && (row.status ?? "") !== status) return false;
      return rowMatchesSearch(search, [
        row.id,
        row.displayName,
        row.email ?? "",
        row.linkedUserId ?? "",
        row.slug ?? "",
        row.city ?? "",
        row.country ?? "",
        row.status ?? "",
        row.bio ?? "",
        row.coverageArea ?? "",
      ]);
    });
  }, [data, search, status]);

  const heroFallback = kind === "vendor" ? HERO_VENDOR : HERO_ORGANIZER;
  const KindIcon = kind === "vendor" ? Store : Building2;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-40">
          {c.kicker}
        </p>
        <h1 className="text-3xl font-extrabold text-ink">{c.title}</h1>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-ink-60">
          {c.blurb}
        </p>
        <p className="mt-2 font-mono text-[12px] text-ink-50">{c.path}</p>
      </div>

      <Card className="rounded-3xl border-ink-10 shadow-card-sm">
        <CardContent className="p-6">
          <ListFiltersBar
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search name, email, slug, city, bio, id…"
            className="mb-4"
          >
            <select
              className={filterSelectClassName()}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All statuses</option>
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </ListFiltersBar>
          {isLoading ? <p className="text-sm text-ink-60">Loading…</p> : null}
          {!isLoading && filtered.length === 0 ? (
            <p className="mb-3 text-sm font-semibold text-ink-60">{c.empty}</p>
          ) : null}
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((row) => (
              <Link
                key={row.id}
                to={`/approvals/${kind}s/${row.id}`}
                className="group block"
              >
                <Card className="h-full overflow-hidden rounded-3xl border-ink-10 shadow-card-sm transition-all hover:-translate-y-0.5 hover:border-coral/35 hover:shadow-card-md">
                  <div className="relative h-40 bg-ink-5">
                    <img
                      src={row.profileImageUrl ?? heroFallback}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[11px] font-extrabold uppercase tracking-wide text-white/80">
                          {kind === "vendor" ? "Business" : "Organization"}
                        </p>
                        <p className="truncate text-xl font-extrabold text-white">
                          {row.displayName}
                        </p>
                        {row.slug ? (
                          <p className="truncate font-mono text-[12px] font-semibold text-white/85">
                            {row.slug}
                          </p>
                        ) : null}
                      </div>
                      {row.status ? (
                        <span
                          className={cn(
                            "shrink-0 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide shadow-card-sm",
                            statusTone(row.status),
                          )}
                        >
                          {row.status}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <CardContent className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      {row.coverageArea ? (
                        <span className="inline-flex max-w-full items-center gap-1 truncate rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-bold text-ink-60">
                          <MapPin size={12} className="shrink-0 text-coral" />
                          <span className="truncate">{row.coverageArea}</span>
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 rounded-full bg-ink-5 px-2.5 py-1 text-[11px] font-bold text-ink-60">
                        <KindIcon size={12} className="text-coral" />
                        {kind === "vendor" ? "Vendor" : "Organizer"}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-[13px] text-ink-60">
                      {row.bio?.trim() ||
                        "No bio on this row — open the dossier for full details."}
                    </p>
                    <div className="flex flex-wrap gap-3 text-[12px] font-semibold text-ink-60">
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={14} className="text-coral" />
                        {[row.city, row.country].filter(Boolean).join(", ") ||
                          "—"}
                      </span>
                      {row.updatedAt ? (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14} className="text-coral" />
                          {new Date(row.updatedAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between rounded-2xl border border-ink-10 bg-surface-tint px-3 py-2">
                      <span className="inline-flex items-center gap-2 text-[12px] font-bold text-ink-60">
                        <Star size={14} className="text-coral" />
                        Rating
                      </span>
                      <span className="font-mono text-[13px] font-extrabold text-ink">
                        {row.ratingAverage !== undefined
                          ? `${row.ratingAverage.toFixed(1)} ★`
                          : "—"}
                      </span>
                    </div>
                    <p className="text-center text-[11px] font-extrabold uppercase tracking-wide text-coral">
                      View dossier →
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function VendorProfilesPage() {
  return <ProfileDirectoryBody kind="vendor" />;
}

export function OrganizerProfilesPage() {
  return <ProfileDirectoryBody kind="organizer" />;
}
