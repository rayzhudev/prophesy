"use client";

import { AdminProvider } from "./providers";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ADMIN_HANDLES } from "@/config/admin";
import Navigation from "@/components/Navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (ready && !authenticated) {
      router.push("/");
      return;
    }

    if (ready && authenticated && user?.twitter?.username) {
      const isAdmin = ADMIN_HANDLES.includes(user.twitter.username);
      if (!isAdmin) {
        router.push("/");
      }
    }
  }, [ready, authenticated, user, router]);

  // Show nothing while checking authentication
  if (!ready || !authenticated || !user?.twitter?.username) {
    return null;
  }

  // Check if user is admin
  const isAdmin = ADMIN_HANDLES.includes(user.twitter.username);
  if (!isAdmin) {
    return null;
  }

  return (
    <AdminProvider>
      <div className="flex min-h-screen">
        <Navigation />
        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </AdminProvider>
  );
}
