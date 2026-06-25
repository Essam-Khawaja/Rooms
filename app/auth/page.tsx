import { AuthClient } from "@/components/auth/AuthClient";
import { Suspense } from "react";

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center text-text-muted">
          Loading...
        </div>
      }
    >
      <AuthClient />
    </Suspense>
  );
}
