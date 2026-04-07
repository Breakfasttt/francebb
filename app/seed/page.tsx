"use client";

import { useEffect, useState } from "react";
import { getModerationSummaryCounts } from "../moderation/actions"; // Just to check connection
import { prisma } from "@/lib/prisma"; // This won't work on client
// Actually I need a server action
import { seedBBPusherAction } from "./actions";

export default function SeedPage() {
  const [status, setStatus] = useState("Idle");

  useEffect(() => {
    async function runSeed() {
      setStatus("Seeding...");
      const res = await seedBBPusherAction();
      if (res.success) {
        setStatus("Success: " + res.message);
      } else {
        setStatus("Error: " + res.error);
      }
    }
    runSeed();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Seeder</h1>
      <p>Status: {status}</p>
    </div>
  );
}
