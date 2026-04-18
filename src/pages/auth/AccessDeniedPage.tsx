import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';

export function AccessDeniedPage() {
  return (
    <div className="min-h-dvh bg-surface-tint px-6 py-20">
      <div className="mx-auto max-w-lg rounded-3xl border border-ink-10 bg-white p-10 text-center shadow-card-lg">
        <h1 className="text-3xl font-extrabold text-ink">Access denied</h1>
        <p className="mt-3 text-[15px] text-ink-60">
          This area is restricted to platform administrators. If you believe this is a mistake, contact your
          project owner.
        </p>
        <Link to="/login" className="mt-8 inline-block">
          <Button type="button" variant="dark" size="lg">
            Return to sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}
