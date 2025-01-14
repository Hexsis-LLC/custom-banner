import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';

import * as schema from '../drizzle/schemas';

export const client = createClient({
  url: process.env.TURSO_URL as string,
	authToken: process.env.TURSO_AUTH_TOKEN as string,
});

export const db = drizzle(client, { schema });