"use client";

import { useAuth } from "@/lib/hooks/useAuth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// export const dynamic = 'force-dynamic';

export default function RootPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else {
        router.push(user.role === "admin" ? "/admin" : "/pos");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}
