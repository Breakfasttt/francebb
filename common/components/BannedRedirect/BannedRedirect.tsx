"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function BannedRedirect({ isBanned }: { isBanned: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isBanned && pathname !== "/banned") {
      router.push("/banned");
    }
  }, [isBanned, pathname, router]);

  return null;
}
