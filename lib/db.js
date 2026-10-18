import { neon } from "@neondatabase/serverless";
let client=null;
export function databaseAvailable() {return Boolean(process.env.DATABASE_URL);}
export function getSql() {
  if (!databaseAvailable()) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!client) client=neon(process.env.DATABASE_URL);
  return client;
}
