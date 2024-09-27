import path from 'path';
import fs from 'fs';
import { Database } from 'sqlite3';
import { AsyncDatabase } from 'promised-sqlite3';

const DB_PATH = path.join(__dirname, '../db.db');
const DB_SQL_PATH = path.join(__dirname, '../initDb.sql');

const promisifySQLite3 = () => {
  const db = new AsyncDatabase(new Database(DB_PATH));
  return db;
};

const runInitSqlQuery = async (SQL3: any) => {
  const initSQL = fs.readFileSync(DB_SQL_PATH, 'utf-8');
  await SQL3.exec(initSQL);
};

export const initDb = async () => {
  const db = promisifySQLite3();
  await runInitSqlQuery(db);
  console.log('Database initialized');
};

export const getDB = () => {
  return promisifySQLite3();
};
