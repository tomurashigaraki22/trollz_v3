const bcrypt = require("bcryptjs");

async function test() {
  const plain = "password123";
  const hash = await bcrypt.hash(plain, 10);
  
  const hash2y = hash.replace(/^\$2[ab]\$/, "$2y$");
  console.log("hash 2b:", hash);
  console.log("hash 2y:", hash2y);
  
  const res2b = await bcrypt.compare(plain, hash);
  console.log("compare with 2b:", res2b);

  try {
    const res2y = await bcrypt.compare(plain, hash2y);
    console.log("compare with 2y:", res2y);
  } catch(e) {
    console.error("compare 2y threw:", e.message);
  }
}
test();
