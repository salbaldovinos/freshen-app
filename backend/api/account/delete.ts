import { createClerkClient } from '@clerk/backend';
import { del, list } from '@vercel/blob';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { errorResponse, requireUser } from '../../lib/auth.js';
import { births, breedingRecords, users } from '../../db/schema.js';
import * as schema from '../../db/schema.js';

export async function POST(request: Request): Promise<Response> {
  let userId: string;
  try {
    userId = await requireUser(request);
  } catch (err) {
    return errorResponse(err);
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

  // 1. Remove the user's photos from Vercel Blob.
  const { blobs } = await list({ prefix: `${userId}/`, token: blobToken });
  if (blobs.length > 0) {
    await del(
      blobs.map((blob) => blob.url),
      { token: blobToken },
    );
  }

  // 2. Remove the user's rows from Neon (births first, then records, then user).
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle(pool, { schema });
    await db.delete(births).where(eq(births.userId, userId));
    await db.delete(breedingRecords).where(eq(breedingRecords.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  } finally {
    await pool.end();
  }

  // 3. Remove the Clerk account.
  const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
  await clerk.users.deleteUser(userId);

  return Response.json({}, { status: 200 });
}
