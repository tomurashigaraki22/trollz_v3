const bcrypt = require("bcryptjs");

async function test() {
  const plain = "password123";
  const hash = await bcrypt.hash(plain, 10);
  console.log("Hash:", hash);
  const isValid = await bcrypt.compare(plain, hash);
  console.log("Is Valid:", isValid);
}
test();
