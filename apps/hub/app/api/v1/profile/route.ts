/**
 * GET et PATCH /api/v1/profile : profil du coach (carte 119), traité par le plugin du passeport (lib/passportPlugin.ts).
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const GET = forwardToAuth;
export const PATCH = forwardToAuth;
