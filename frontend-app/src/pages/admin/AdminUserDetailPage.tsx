import { type JSX } from "react";
import { useParams } from "react-router";

export default function AdminUserDetailPage(): JSX.Element {
  const { userId } = useParams();
  return (
    <div className="min-h-0 flex-1 overflow-auto px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-bold text-text-primary">User {userId}</h1>
        <p className="mt-2 text-text-secondary">
          Support timeline and safe impersonation placeholder (read-only by default, superadmin audited).
        </p>
      </div>
    </div>
  );
}

