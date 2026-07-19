const mysql = require('mysql2/promise');
async function main() {
  const c = await mysql.createConnection({host: '57.131.33.181', user: 'admin', password: 'Pityboy@22', database: 'trollzv3'});
  const [rows] = await c.query('DESCRIBE users');
  console.log(rows);
  const [users] = await c.query('SELECT id, email, password FROM users ORDER BY id DESC LIMIT 5');
  console.log(users);
  c.end();
}
main();
