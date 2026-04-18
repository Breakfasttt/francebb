"use client";

import { useEffect, useState } from "react";
import { getModerationSummaryCounts } from "../moderation/actions"; // Just to check connection
import { prisma } from "@/lib/prisma"; // This won't work on client
// Actually I need a server action
export default function SeedPage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Page de Seed</h1>
      <p>Aucun script de seed spécifié.</p>
    </div>
  );
}
      <h1>Seeder</h1>
      <p>Status: {status}</p>
    </div>
  );
}
