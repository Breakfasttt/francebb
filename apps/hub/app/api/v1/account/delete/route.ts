/**
 * POST /api/v1/account/delete : le coach demande la suppression de son compte (carte 123), avec sa session sur le hub.
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const POST = forwardToAuth;
