"use client";

import { useEffect } from "react";
import { markTopicAsRead } from "@/app/forum/actions";

export default function MarkAsRead({ topicId }: { topicId: string }) {
  useEffect(() => {
    markTopicAsRead(topicId);
  }, [topicId]);

  return null;
}
