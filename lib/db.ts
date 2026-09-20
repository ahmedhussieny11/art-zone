import mysql, { type Pool, type ResultSetHeader, type RowDataPacket } from "mysql2/promise";

let pool: Pool | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getPool(): Pool {
  if (pool) return pool;

  pool = mysql.createPool({
    host: requireEnv("MYSQL_HOST"),
    port: Number(process.env.MYSQL_PORT || "3306"),
    user: requireEnv("MYSQL_USER"),
    password: requireEnv("MYSQL_PASSWORD"),
    database: requireEnv("MYSQL_DATABASE"),
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    timezone: "Z",
  });

  return pool;
}

type QueryParams = Record<string, string | number | boolean | null> | Array<string | number | boolean | null>;

export async function query<T extends RowDataPacket[]>(
  sql: string,
  params?: QueryParams
): Promise<T> {
  const [rows] = await getPool().execute<T>(sql, params as never);
  return rows;
}

export async function execute(sql: string, params?: QueryParams): Promise<ResultSetHeader> {
  const [result] = await getPool().execute<ResultSetHeader>(sql, params as never);
  return result;
}

export function toMysqlDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return new Date().toISOString().slice(0, 23).replace("T", " ");
  }
  return d.toISOString().slice(0, 23).replace("T", " ");
}

export function fromMysqlDateTime(value: Date | string): string {
  if (value instanceof Date) return value.toISOString();
  const normalized = value.includes("T") ? value : value.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

export function parseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}
