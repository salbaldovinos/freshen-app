import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { errorResponse, requireUser } from '../../lib/auth';
import { applyBatch, uploadBatchSchema } from '../../lib/syncUpload';
import * as schema from '../../db/schema';

export async function POST(request: Request): Promise<Response> {
  let userId: string;
  try {
    userId = await requireUser(request);
  } catch (err) {
    return errorResponse(err);
  }

  const body = await request.json().catch(() => null);
  const parsed = uploadBatchSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid sync batch' }, { status: 400 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle(pool, { schema });
    await applyBatch(db, userId, parsed.data.operations);
    return Response.json({}, { status: 200 });
  } finally {
    await pool.end();
  }
}
