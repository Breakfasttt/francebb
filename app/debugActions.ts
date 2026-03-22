"use server";

import { prisma } from "@/lib/prisma";

const ROLES = [
  { id: "user_test_superadmin", name: "SuperAdmin Test", role: "SUPERADMIN", email: "superadmin@test.com" },
  { id: "user_test_admin", name: "Admin Test", role: "ADMIN", email: "admin@test.com" },
  { id: "user_test_conseil", name: "Conseil Orga Test", role: "CONSEIL_ORGA", email: "conseil@test.com" },
  { id: "user_test_moderator", name: "Modérateur Test", role: "MODERATOR", email: "modo@test.com" },
  { id: "user_test_orga", name: "Orga Test", role: "ORGA", email: "orga@test.com" },
  { id: "user_test_coach1", name: "Coach 1 Test", role: "COACH", email: "coach1@test.com" },
  { id: "user_test_coach2", name: "Coach 2 Test", role: "COACH", email: "coach2@test.com" },
];

export async function seedMockUsers() {
  if (process.env.NODE_ENV !== "development") return { success: false, message: "Only available in local dev." };
  
  try {
    for (const r of ROLES) {
      await prisma.user.upsert({
        where: { id: r.id },
        update: { role: r.role, name: r.name },
        create: {
          id: r.id,
          name: r.name,
          email: r.email,
          role: r.role,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.name}`
        }
      });
    }
    return { success: true, message: "Mock users seeded successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
