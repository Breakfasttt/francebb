"use client";

import { useEffect } from "react";
import { markTopicAsRead } from "@/app/forum/actions";

export default function MarkAsRead({ topicId }: { topicId: string }) {
  useEffect(() => {
    markTopicAsRead(topicId);

    // Force scroll to hash if present with robust retry logic
    const hash = window.location.hash;
    if (hash) {
      const id = hash.replace("#", "");
      let attempts = 0;
      const maxAttempts = 20; // 2 seconds total

      const scrollInterval = setInterval(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "auto", block: "start" });
          clearInterval(scrollInterval);
        }
        attempts++;
        if (attempts >= maxAttempts) clearInterval(scrollInterval);
      }, 100);

      return () => clearInterval(scrollInterval);
    }
  }, [topicId]);

  return null;
}
