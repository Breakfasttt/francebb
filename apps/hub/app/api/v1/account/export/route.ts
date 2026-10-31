/**
 * GET /api/v1/account/export : fichier JSON de toutes les données du coach (carte 125), avec sa session sur le hub.
 */
import { forwardToAuth } from "@/lib/forwardToAuth";

export const GET = forwardToAuth;
