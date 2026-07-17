import { verifyToken } from '@clerk/backend';

/**
 * Error carrying an HTTP status so route handlers can map failures to the
 * status contract (200 / 400 / 401) without leaking internals.
 */
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const BEARER_PREFIX = 'Bearer ';

/**
 * Verify the request's `Authorization: Bearer <clerk-jwt>` header and return the
 * authenticated Clerk user id (`sub`). Throws `HttpError(401)` on any failure.
 */
export async function requireUser(req: Request): Promise<string> {
  const header = req.headers.get('authorization');
  if (!header || !header.startsWith(BEARER_PREFIX)) {
    throw new HttpError(401, 'Missing or malformed Authorization header');
  }

  const token = header.slice(BEARER_PREFIX.length).trim();
  if (!token) {
    throw new HttpError(401, 'Missing bearer token');
  }

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    throw new HttpError(500, 'CLERK_SECRET_KEY is not configured');
  }

  let sub: string | undefined;
  try {
    const payload = await verifyToken(token, { secretKey });
    sub = payload.sub;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  if (!sub) {
    throw new HttpError(401, 'Token is missing a subject claim');
  }
  return sub;
}

/** Map a thrown error to a JSON Response using its HTTP status contract. */
export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
