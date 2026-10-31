/**
 * POST /api/v1/account/delete/cancel : le coach annule la suppression de son compte pendant le délai de grâce (carte 123).
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const POST = forwardToAuth;
