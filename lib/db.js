import mysql from "mysql2/promise";

// Hardcoded per explicit instruction (not read from env). This means these
// credentials live in source/git history — rotate the VPS `admin` password
// if this repo is ever made public or shared beyond the team.
const DB_CONFIG = {
  host: "57.131.33.181",
  port: 3306,
  user: "admin",
  password: "Pityboy@22",
  database: "trollzv3",
};

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      ...DB_CONFIG,
      waitForConnections: true,
      connectionLimit: 10,
    });
  }
  return pool;
}

export async function query(sql, params) {
  // Plain query(), not execute() — mysql2's real prepared statements don't
  // support placeholders inside LIMIT/OFFSET on this server, which every
  // paginated query here needs. query() still parameterizes/escapes safely,
  // just without statement caching.
  const [rows] = await getPool().query(sql, params);
  return rows;
}

// For multi-statement writes that must succeed or fail together (e.g.
// creating an order + its line items + decrementing stock).
export async function withTransaction(callback) {
  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();
    const result = await callback(async (sql, params) => {
      const [rows] = await conn.query(sql, params);
      return rows;
    });
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
