import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

import { handleApiRequest } from "@/api/routes/router";

export const prerender = false;

const handler: APIRoute = async (context) => handleApiRequest(context.request, env);

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
