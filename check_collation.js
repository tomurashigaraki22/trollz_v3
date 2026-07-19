const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host: '57.131.33.181', user: 'admin', password: 'Pityboy@22', database: 'trollzv3'});
  const [rows] = await c.query("SHOW FULL COLUMNS FROM users LIKE 'email'");
  console.log(rows);
  c.end();
}
main();
