import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
import { errorResponse, requireUser } from '../../lib/auth';

export async function POST(request: Request): Promise<Response> {
  let userId: string;
  try {
    userId = await requireUser(request);
  } catch (err) {
    return errorResponse(err);
  }

  const body = (await request.json().catch(() => null)) as { recordId?: unknown } | null;
  const recordId = body?.recordId;
  if (typeof recordId !== 'string' || recordId.length === 0) {
    return Response.json({ error: 'recordId is required' }, { status: 400 });
  }

  // Pathname is derived from the authenticated user id (never client-supplied),
  // so the client can only ever write under its own prefix.
  const pathname = `${userId}/breeding/${recordId}/${Date.now()}.jpg`;

  const clientToken = await generateClientTokenFromReadWriteToken({
    token: process.env.BLOB_READ_WRITE_TOKEN,
    pathname,
    allowedContentTypes: ['image/jpeg'],
  });

  return Response.json({ token: clientToken, pathname }, { status: 200 });
}
