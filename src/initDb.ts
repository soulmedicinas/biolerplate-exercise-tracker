import path from 'path';
import fs from 'fs';
import { Database, RunResult } from 'sqlite3';
import util from 'util';

const DB_PATH = path.join(__dirname, '../db.db');
const DB_SQL_PATH = path.join(__dirname, '../initDb.sql');

const promisifySQLite3 = () => {
  const db = new Database(DB_PATH);

  const SQL3 = {
    ...db,
    run(sql: string, ...params: any) {
      return new Promise((resolve, reject) => {
        db.run(sql, ...params, (runResult: RunResult, err: Error | null) => {
          if (err) {
            reject(err);
          } else {
            resolve(runResult);
          }
        });
      });
    },
    get: util.promisify(db.get.bind(db)),
    all: util.promisify(db.all.bind(db)),
    exec: util.promisify(db.exec.bind(db)),
  };

  return SQL3;
};

const runInitSqlQuery = async (SQL3: any) => {
  const initSQL = fs.readFileSync(DB_SQL_PATH, 'utf-8');
  await SQL3.exec(initSQL);
};

export const initDb = async () => {
  const db = promisifySQLite3();
  await runInitSqlQuery(db);

  console.log('Database initialized');
  return db;
};
