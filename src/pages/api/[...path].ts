import type { APIRoute } from "astro";

import { handleApiRequest } from "@/api/routes/router";

export const prerender = false;

const handler: APIRoute = async (context) => {
  const locals = context.locals as typeof context.locals & { runtime: { env: Env } };
  return handleApiRequest(context.request, locals.runtime.env);
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const PUT = handler;
export const DELETE = handler;
