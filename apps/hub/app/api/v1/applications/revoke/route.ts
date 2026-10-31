/**
 * POST /api/v1/applications/revoke : le coach retire l'accès d'une application à son compte (carte 120).
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const POST = forwardToAuth;
