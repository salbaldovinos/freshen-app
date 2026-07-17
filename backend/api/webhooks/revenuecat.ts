import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { users } from '../../db/schema';
import * as schema from '../../db/schema';

const PAID_EVENTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'UNCANCELLATION']);
const FREE_EVENTS = new Set(['EXPIRATION']);

interface RevenueCatEvent {
  type?: string;
  app_user_id?: string;
}

export async function POST(request: Request): Promise<Response> {
  if (request.headers.get('authorization') !== process.env.REVENUECAT_WEBHOOK_AUTH) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { event?: RevenueCatEvent } | null;
  const event = body?.event;
  if (!event?.type || !event.app_user_id) {
    return Response.json({ error: 'Invalid event' }, { status: 400 });
  }

  const tier = PAID_EVENTS.has(event.type) ? 'paid' : FREE_EVENTS.has(event.type) ? 'free' : null;

  // Unrelated event types are acknowledged without a tier change.
  if (tier === null) {
    return Response.json({}, { status: 200 });
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const db = drizzle(pool, { schema });
    await db
      .insert(users)
      .values({ id: event.app_user_id, tier })
      .onConflictDoUpdate({ target: users.id, set: { tier } });
    return Response.json({}, { status: 200 });
  } finally {
    await pool.end();
  }
}
