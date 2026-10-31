/**
 * GET /api/v1/applications : applications qui ont accès au compte du coach (carte 120), avec sa session sur le hub.
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const GET = forwardToAuth;
