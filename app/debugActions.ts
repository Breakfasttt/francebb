"use server";

import { prisma } from "@/lib/prisma";

const ROLES = [
  { id: "user_test_superadmin", name: "SuperAdmin Test", role: "SUPERADMIN", email: "superadmin@test.com" },
  { id: "user_test_admin", name: "Admin Test", role: "ADMIN", email: "admin@test.com" },
  { id: "user_test_moderator", name: "Modérateur Test", role: "MODERATOR", email: "modo@test.com" },
  { id: "user_test_rtc", name: "RTC Test", role: "RTC", email: "rtc@test.com" },
  { id: "user_test_chefligue", name: "Chef Ligue Test", role: "CHEF_LIGUE", email: "chefligue@test.com" },
  { id: "user_test_coach1", name: "Coach 1 Test", role: "COACH", email: "coach1@test.com" },
];

export async function seedMockUsers() {
  if (process.env.NODE_ENV !== "development") return { success: false, message: "Only available in local dev." };
  
  try {
    const baseRolesData = [
      { name: "SUPERADMIN", label: "Super Admin", power: 100, isBaseRole: true },
      { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true },
      { name: "MODERATOR", label: "Modérateur", power: 70, isBaseRole: true },
      { name: "RTC", label: "RTC", power: 50, isBaseRole: true },
      { name: "CHEF_LIGUE", label: "Chef de ligue", power: 40, isBaseRole: true },
      { name: "COACH", label: "Coach", power: 10, isBaseRole: true },
    ];

    for (const roleDef of baseRolesData) {
      await prisma.roleConfig.upsert({
        where: { name: roleDef.name },
        update: { label: roleDef.label, power: roleDef.power, isBaseRole: roleDef.isBaseRole },
        create: roleDef
      });
    }

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
    return { success: true, message: "Roles & Mock users seeded successfully!" };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
