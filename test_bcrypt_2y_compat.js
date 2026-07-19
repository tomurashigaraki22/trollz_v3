const bcrypt = require("bcryptjs");

async function test() {
  const plain = "password123";
  const hash = await bcrypt.hash(plain, 10);
  
  const hash2y = hash.replace(/^\$2a\$/, "$2y$");
  console.log("hash 2a:", hash);
  console.log("hash 2y:", hash2y);
  
  const res2a = await bcrypt.compare(plain, hash);
  console.log("compare with 2a:", res2a);

  try {
    const res2y = await bcrypt.compare(plain, hash2y);
    console.log("compare with 2y:", res2y);
  } catch(e) {
    console.error("compare 2y threw:", e.message);
  }
}
test();
